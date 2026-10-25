#!/bin/bash
set -e

# Full matrix cross-branch print regression test
# Tests all branches, fixtures, and font modes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/workspace"
RESULTS_DIR="$WORKSPACE/tests/print/results"
TEMP_DIR="/tmp/print-test-branches"

BRANCHES=(
  "main"
  "cursor/print-layout-fixes-f7ea"
  "cursor/pdf-qr-fixes-aaec"
  "cursor/public-page-performance-e836"
)

echo "=== Print Regression: Cross-Branch Full Matrix ==="
echo ""

# Clean up old worktrees
cd "$WORKSPACE"
git worktree prune

# Create results directory
mkdir -p "$RESULTS_DIR"

# Test each branch
for branch in "${BRANCHES[@]}"; do
  branch_slug="${branch//\//-}"
  worktree_path="$TEMP_DIR/$branch_slug"
  port=$((5173 + $(echo "$branch_slug" | cksum | cut -d' ' -f1) % 100))
  
  echo "## Setting up $branch (port $port) ##"
  
  # Remove old worktree
  rm -rf "$worktree_path"
  
  # Create worktree
  git worktree add "$worktree_path" "$branch" || {
    echo "  ⚠️  Failed to create worktree for $branch"
    continue
  }
  
  # Copy test infrastructure
  echo "  Copying test files..."
  mkdir -p "$worktree_path/tests/print"
  mkdir -p "$worktree_path/public"
  mkdir -p "$worktree_path/src/lib"
  
  cp -r "$WORKSPACE/tests/print/fixtures" "$worktree_path/tests/print/" || true
  cp -r "$WORKSPACE/public/test-fixtures" "$worktree_path/public/" || true
  cp "$WORKSPACE/src/lib/supabase.test-stub.ts" "$worktree_path/src/lib/" || true
  cp "$WORKSPACE/src/print-test-entry.tsx" "$worktree_path/src/" || true
  cp "$WORKSPACE/print-test.html" "$worktree_path/" || true
  cp "$WORKSPACE/vite.config.ts" "$worktree_path/" || true
  
  # Install dependencies (if needed)
  if [ ! -d "$worktree_path/node_modules" ] || [ "$worktree_path/package.json" -nt "$worktree_path/node_modules" ]; then
    echo "  Installing dependencies..."
    cd "$worktree_path"
    npm ci --legacy-peer-deps --silent || {
      echo "  ⚠️  npm ci failed, trying npm install..."
      npm install --legacy-peer-deps --silent || echo "  ⚠️  Dependency install failed"
    }
  fi
  
  # Start dev server
  echo "  Starting dev server on port $port..."
  cd "$worktree_path"
  VITE_PRINT_TEST=true PORT=$port npm run dev > "$TEMP_DIR/$branch_slug-server.log" 2>&1 &
  server_pid=$!
  echo $server_pid > "$TEMP_DIR/$branch_slug-server.pid"
  
  # Wait for server to be ready
  echo "  Waiting for server..."
  for i in {1..30}; do
    if curl -s "http://localhost:$port/" > /dev/null 2>&1; then
      echo "  ✓ Server ready"
      break
    fi
    sleep 1
  done
  
  # Run tests
  echo "  Running test matrix..."
  cd "$WORKSPACE/tests/print"
  BRANCH_NAME="$branch" PORT="$port" npx tsx run-full-matrix.ts || {
    echo "  ⚠️  Tests failed for $branch"
  }
  
  # Stop server
  if [ -f "$TEMP_DIR/$branch_slug-server.pid" ]; then
    kill $(cat "$TEMP_DIR/$branch_slug-server.pid") 2>/dev/null || true
    rm "$TEMP_DIR/$branch_slug-server.pid"
  fi
  
  echo ""
done

# Clean up
echo "Cleaning up..."
cd "$WORKSPACE"
git worktree prune
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Cross-branch testing complete!"
echo "Results: $RESULTS_DIR/COMPARISON.md"
