#!/usr/bin/env bash
# Sequential in-place source swap. Keeps this checkout's node_modules.
set -u
set -o pipefail
set +e

ROOT="/workspace"
RESULTS="$ROOT/tests/print/results"
PORT=5180
HARNESS_BRANCH="$(git -C "$ROOT" branch --show-current)"
SOURCE_DIRS=(src/components src/index.css src/lib src/pages src/i18n src/hooks src/data src/types)
HARNESS_FILES=(
  src/lib/supabase.test-stub.ts
  src/print-test-entry.tsx
  print-test.html
  vite.config.ts
)

BRANCHES=(
  "main|main"
  "cursor/print-layout-fixes-f7ea|cursor-print-layout-fixes-f7ea"
  "cursor/pdf-qr-fixes-aaec|cursor-pdf-qr-fixes-aaec"
  "cursor/public-page-performance-e836|cursor-public-page-performance-e836"
)

mkdir -p "$RESULTS/artifacts"
cd "$ROOT"

restore_tree() {
  # Restore app source only. Never reset tests/print/results — those are the
  # per-branch artifacts we commit after each run.
  git checkout "$HARNESS_BRANCH" -- src print-test.html vite.config.ts public/test-fixtures \
    >/dev/null 2>&1 || true
  git checkout "$HARNESS_BRANCH" -- "${HARNESS_FILES[@]}" >/dev/null 2>&1 || true
}

kill_port() {
  local pids
  pids="$(ss -ltnp 2>/dev/null | awk -v p=":$PORT" '$4 ~ p {print}' | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u || true)"
  if [ -n "${pids:-}" ]; then
    kill $pids 2>/dev/null || true
    sleep 1
    kill -9 $pids 2>/dev/null || true
  fi
  pkill -f "vite --port $PORT" 2>/dev/null || true
}

push_with_retry() {
  local delay=4
  local i
  for i in 1 2 3 4; do
    if git push -u origin "$HARNESS_BRANCH"; then
      return 0
    fi
    echo "push failed (attempt $i), retrying in ${delay}s"
    sleep "$delay"
    delay=$((delay * 2))
  done
  return 1
}

commit_progress() {
  local msg="$1"
  git checkout "$HARNESS_BRANCH" >/dev/null 2>&1 || true
  restore_tree
  git add \
    tests/print/analyze_pdf.py \
    tests/print/complete-matrix.ts \
    tests/print/build-comparison.ts \
    tests/print/run-all-branches-simple.sh \
    tests/print/results/COMPARISON.md \
    src/print-test-entry.tsx \
    src/lib/supabase.test-stub.ts \
    vite.config.ts \
    public/test-fixtures \
    tests/print/fixtures
  if git diff --cached --quiet; then
    echo "  (no commit: nothing staged)"
    return 0
  fi
  git commit -m "$msg"
  push_with_retry || echo "  warning: push failed after retries"
}

read_font_scales() {
  python3 - <<'PY'
import re, pathlib
p = pathlib.Path("src/components/PrintPreviewModal.tsx")
if not p.exists():
    print("1,1.15,1.25")
    raise SystemExit
text = p.read_text()
vals = re.findall(r"value:\s*([0-9.]+)", text)
print(",".join(vals[:3]) if len(vals) >= 3 else "1,1.15,1.25")
PY
}

deps_differ() {
  python3 - "$1" <<'PY'
import json, subprocess, sys
branch = sys.argv[1]
ours = json.load(open("package.json"))
theirs = json.loads(subprocess.check_output(["git", "show", f"origin/{branch}:package.json"]))
print("yes" if ours.get("dependencies") != theirs.get("dependencies") or ours.get("devDependencies") != theirs.get("devDependencies") else "no")
PY
}

echo "=== Sequential print matrix on $HARNESS_BRANCH ==="

for spec in "${BRANCHES[@]}"; do
  BRANCH="${spec%%|*}"
  SLUG="${spec##*|}"
  echo ""
  echo "## $BRANCH ($SLUG)"

  kill_port
  restore_tree

  if ! git fetch origin "$BRANCH"; then
    echo "  FAILED to fetch $BRANCH"
    continue
  fi

  existing=()
  for d in "${SOURCE_DIRS[@]}"; do
    if git ls-tree -d --name-only "origin/$BRANCH" "$d" >/dev/null 2>&1; then
      existing+=("$d")
    fi
  done
  echo "  checkout ${existing[*]}"
  for d in "${existing[@]}"; do
    git checkout "origin/$BRANCH" -- "$d" || echo "  skip $d"
  done

  git checkout "$HARNESS_BRANCH" -- "${HARNESS_FILES[@]}"
  # Keep our QR-enabled fixtures even if a branch also ships public fixtures.
  git checkout "$HARNESS_BRANCH" -- public/test-fixtures tests/print/fixtures >/dev/null 2>&1 || true

  if [ "$(deps_differ "$BRANCH")" = "yes" ]; then
    echo "  package.json deps differ — running npm ci"
    git checkout "origin/$BRANCH" -- package.json package-lock.json
    npm ci --legacy-peer-deps || echo "  npm ci failed; keeping current node_modules"
    git checkout "$HARNESS_BRANCH" -- package.json package-lock.json
  else
    echo "  deps match; keeping node_modules"
  fi

  FONT_SCALES="$(read_font_scales)"
  echo "  FONT_SCALES=$FONT_SCALES"

  kill_port
  VITE_PRINT_TEST=true npx vite --port "$PORT" --strictPort --host 127.0.0.1 \
    > "/tmp/vite-$SLUG.log" 2>&1 &
  VITE_PID=$!

  READY=0
  for _ in $(seq 1 60); do
    if curl -sf "http://127.0.0.1:$PORT/print-test.html" >/dev/null 2>&1; then
      READY=1
      break
    fi
    if ! kill -0 "$VITE_PID" 2>/dev/null; then
      break
    fi
    sleep 1
  done

  if [ "$READY" != 1 ]; then
    echo "  SERVER FAILED"
    tail -40 "/tmp/vite-$SLUG.log" || true
    kill "$VITE_PID" 2>/dev/null || true
    restore_tree
    continue
  fi
  echo "  server ready (pid $VITE_PID)"

  set +e
  BRANCH="$SLUG" PORT="$PORT" OUTPUT_DIR="$RESULTS" FONT_SCALES="$FONT_SCALES" \
    NODE_PATH="$ROOT/tests/print/node_modules${NODE_PATH:+:$NODE_PATH}" \
    npx tsx tests/print/complete-matrix.ts
  MATRIX_STATUS=$?
  set -e

  kill "$VITE_PID" 2>/dev/null || true
  wait "$VITE_PID" 2>/dev/null || true
  kill_port

  tag=""
  [ "$SLUG" = "main" ] && tag="main"
  [ "$SLUG" = "cursor-print-layout-fixes-f7ea" ] && tag="173"
  [ "$SLUG" = "cursor-pdf-qr-fixes-aaec" ] && tag="171"
  [ "$SLUG" = "cursor-public-page-performance-e836" ] && tag="174"
  if [ -n "$tag" ]; then
    for fixture in special-musical-number bishops-exact-case; do
      src="$RESULTS/${SLUG}_${fixture}_Extra-Large"
      if [ -d "$src" ]; then
        cp -f "$src/page-1.png" "$RESULTS/artifacts/${tag}-${fixture}-ExtraLarge-page-1.png" 2>/dev/null || true
        cp -f "$src/page-2.png" "$RESULTS/artifacts/${tag}-${fixture}-ExtraLarge-page-2.png" 2>/dev/null || true
      fi
    done
  fi

  restore_tree
  NODE_PATH="$ROOT/tests/print/node_modules${NODE_PATH:+:$NODE_PATH}" npx tsx tests/print/build-comparison.ts || true
  commit_progress "test: print matrix results for ${BRANCH}"
  echo "  branch $BRANCH done (matrix exit $MATRIX_STATUS)"
done

restore_tree
NODE_PATH="$ROOT/tests/print/node_modules${NODE_PATH:+:$NODE_PATH}" npx tsx tests/print/build-comparison.ts || true
commit_progress "docs: print regression COMPARISON.md"
echo ""
echo "=== done ==="
echo "Comparison: $RESULTS/COMPARISON.md"
