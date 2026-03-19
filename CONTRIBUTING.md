# Contributing to WardBulletin

Thank you for your interest in contributing to WardBulletin! This guide will help you set up your development environment safely.

## 🔒 Important Security Notes

- **Never use production databases for development**
- **Never commit actual environment variables to git**
- **Each contributor must create their own Supabase project**

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier is sufficient)

### 1. Fork and Clone the Repository

```bash
git clone https://github.com/yourusername/WardBulletin.git
cd WardBulletin
npm install
```

### 2. Set Up Your Own Supabase Project

**Why?** The production database contains real user data that must remain private.

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (usually 2-3 minutes)
3. Go to Settings → API to get your credentials

### 3. Set Up Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anonymous-key-here
   ```

### 4. Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and execute the schema from `docs/database-schema.sql`
3. This will create all necessary tables and security policies

### 5. Run the Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## 🛠 Development Guidelines

### Code Style

- Follow existing TypeScript conventions
- Use descriptive variable names
- Add comments for complex logic
- Run `npm run lint` before committing

### Testing

```bash
npm run test          # Run unit tests
npm run type-check    # TypeScript validation
```

### Project Structure

```
src/
├── components/       # React components
├── lib/             # Utilities and services
├── pages/           # Page components
├── data/            # Static data (hymns, etc.)
└── types/           # TypeScript type definitions
```

## 🔧 Common Development Tasks

### Adding New Features

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Implement your changes
3. Test thoroughly with your own Supabase instance
4. Submit a pull request

### Working with the Database

- All database interactions go through `src/lib/supabase.ts`
- Use TypeScript interfaces defined in the same file
- Test database changes with sample data only

### UI Components

- We use Tailwind CSS for styling
- Components should be responsive and accessible
- Follow existing patterns for consistency

## 🚨 Security Best Practices

1. **Never commit secrets**:
   - Check `.gitignore` includes all environment files
   - Use `git status` before committing

2. **Database access**:
   - Only connect to your own development database
   - Don't share database credentials
   - Use Row Level Security (RLS) policies

3. **Testing**:
   - Use mock data for testing
   - Don't create real user accounts for testing

## 📝 Pull Request Process

1. Ensure your code follows the style guide
2. Update documentation if needed
3. Test your changes thoroughly
4. Include a clear description of what changed
5. Reference any related issues

## 🆘 Getting Help

- Check existing [GitHub Issues](https://github.com/madofuller/WardBulletin/issues)
- Create a new issue for bugs or feature requests
- Join discussions in the repository

## 📋 Development Checklist

Before submitting a PR, ensure:

- [ ] Code follows existing patterns and style
- [ ] No hardcoded credentials or secrets
- [ ] TypeScript compiles without errors
- [ ] App works with fresh Supabase instance
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)

Thank you for contributing to WardBulletin! 🙏