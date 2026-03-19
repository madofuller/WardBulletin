# WardBulletin

A modern, customizable bulletin creation tool for LDS wards and branches. Create beautiful, professional bulletins with ease.

## ✨ Features

- **Beautiful Templates**: Professional, customizable bulletin layouts
- **Real-time Editing**: See changes as you type
- **Print & Share**: High-quality PDF export and shareable links
- **Hymn Integration**: Built-in LDS hymn database
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Secure**: User authentication and data protection

## 🚀 Quick Start

### For Users

Visit the live application to start creating bulletins immediately - no setup required!

### For Contributors

Want to contribute to the project? See our [Contributing Guide](CONTRIBUTING.md) for complete setup instructions.

**Quick setup for contributors:**

1. Fork the repository and clone it
2. Create your own Supabase project (required for development)
3. Set up environment variables from `.env.example`
4. Run the database schema from `docs/database-schema.sql`
5. Start developing!

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── lib/                # Utilities and services
├── types/              # TypeScript type definitions
└── data/               # Static data (hymns, songs)
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📖 Documentation

- [Contributing Guide](CONTRIBUTING.md) - How to set up and contribute to the project
- [Database Schema](docs/database-schema.sql) - Complete database setup for contributors

## 🔒 Security & Privacy

- User data is encrypted and secure
- Contributors work with their own isolated database instances
- No production data is shared with contributors
- Environment variables are never committed to version control

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📞 Support

- [GitHub Issues](https://github.com/madofuller/MyWardBulletin/issues) - Bug reports and feature requests
- [Discussions](https://github.com/madofuller/MyWardBulletin/discussions) - Questions and community discussion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for LDS wards and branches worldwide
