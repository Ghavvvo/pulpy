# Pulpy - Digital Business Card Platform

A modern, customizable digital business card platform built with React, TypeScript, and Supabase.

## 🚀 Quick Start

**New to this project?** Start here: [QUICKSTART.md](./QUICKSTART.md)

Already set up? Jump to [Development](#development)

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 10 minutes
- **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)** - Detailed Supabase configuration
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Overview of the Supabase integration
- **[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)** - Track your setup progress
- **[SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)** - Original integration specifications

## ✨ Features

- 🎨 Customizable digital business cards
- 👤 Two card styles: Professional and Social Media
- 🔗 Social media link management
- 🖼️ Custom avatars and cover images
- 📱 Fully responsive design
- 🔐 Secure authentication with Supabase
- 💾 Real-time data persistence
- 🌐 Public profile pages
- 📊 Subscription management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Context API
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier works)
- Git

## 🏃 Development

### First Time Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd pulpy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow [QUICKSTART.md](./QUICKSTART.md) for complete setup
   - Or see [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) for details

4. **Configure environment variables**
   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   
   # Edit .env.local with your Supabase credentials
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🗄️ Database Schema

The application uses three main tables:

- **profiles** - User profile information
- **social_links** - Social media links for each user
- **subscriptions** - Subscription and plan management

See [supabase-setup.sql](./supabase-setup.sql) for the complete schema.

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📦 Project Structure

```
pulpy/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   ├── pages/          # Page components
│   └── assets/         # Static assets
├── public/             # Public static files
├── supabase-setup.sql  # Database schema
└── docs/               # Documentation files
```

## 🧪 Testing

After setup, test these features:

1. ✅ User registration and login
2. ✅ Profile editing and customization
3. ✅ Social link management
4. ✅ Image uploads (avatar/cover)
5. ✅ Public profile viewing
6. ✅ Card style switching

See [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for detailed testing scenarios.

## 🚀 Deployment

### Deploy to Vercel/Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting platform

3. Set environment variables in your hosting dashboard

### Important for Production

- ✅ Enable email confirmation in Supabase
- ✅ Configure custom SMTP (optional)
- ✅ Set up proper error tracking
- ✅ Enable rate limiting
- ✅ Configure backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

- Check the [documentation files](./QUICKSTART.md)
- Review [troubleshooting guide](./SUPABASE_SETUP_GUIDE.md#troubleshooting)
- Check Supabase Dashboard logs
- Visit Supabase Discord community

## 🎯 Roadmap

- [ ] Profile analytics and view tracking
- [ ] Payment integration for premium plans
- [ ] Custom domains for profiles
- [ ] Advanced theme customization
- [ ] Email notifications
- [ ] QR code generation
- [ ] Contact forms

---

## Project info

**URL**: https://lovable.dev/projects/91ce478f-6dcf-4a50-9b04-d3ff23e5be52

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/91ce478f-6dcf-4a50-9b04-d3ff23e5be52) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/91ce478f-6dcf-4a50-9b04-d3ff23e5be52) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
