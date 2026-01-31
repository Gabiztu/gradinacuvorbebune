# Cuvinte de Sus - PWA

A social impact Progressive Web App for parents and teachers to send motivational and supportive messages to children and youth.

## 🌱 Project Overview

**Purpose**: Send encouraging messages to children and students  
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Supabase  
**Platform**: PWA (Installable on mobile and desktop)

## 📁 Project Structure

```
cuvintede/
├── .git/
├── .gitignore
├── vercel.json
├── README.md
└── web/
    ├── app/                    # Next.js 15 App Router pages
    │   ├── layout.tsx         # Root layout
    │   ├── page.tsx           # Garden/Home page
    │   ├── library/           # Message categories
    │   ├── beneficiaries/     # CRUD management
    │   ├── favorites/         # Saved messages
    │   ├── history/           # Sent messages log
    │   ├── message/[id]/      # Message preview & send
    │   └── admin/             # Admin dashboard
    ├── components/
    │   ├── ui/                # Reusable UI components
    │   ├── navigation/        # Bottom navigation
    │   ├── garden/            # Plant evolution
    │   └── messages/          # Message components
    ├── lib/
    │   ├── supabase/          # Supabase client
    │   └── utils.ts           # Utility functions
    ├── hooks/                 # Custom React hooks
    ├── types/                 # TypeScript definitions
    ├── db/
    │   └── schema.sql         # Database schema
    ├── public/
    │   └── manifest.json      # PWA manifest
    └── ...config files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/bun
- Supabase account

### 1. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in Supabase
3. Copy and run the contents of `web/db/schema.sql`
4. Go to **Settings > API** and copy:
   - Project URL
   - anon public key

### 2. Configure Environment

```bash
cd web
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Install Dependencies

```bash
cd web
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📱 PWA Features

- **Installable**: Add to Home Screen on mobile
- **Offline Support**: Works without internet (limited features)
- **Share API**: Native share sheet integration
- **Responsive**: Optimized for mobile devices

## 🎮 Gamification

- **XP System**: +10 XP per message sent
- **Streaks**: Consecutive days tracking
- **Plant Evolution**: Visual growth based on streak:
  - 0 days: Seed
  - 1-2 days: Sprout
  - 3-5 days: Leafy plant
  - 6-9 days: Tall plant
  - 10+ days: Blooming flower

## 📊 Features Implemented

### Phase 1 (Core)
- ✅ Project structure
- ✅ Database schema with RLS
- ✅ Bottom navigation
- ✅ Beneficiaries CRUD
- ✅ Library with 5 categories
- ✅ Message preview & send
- ✅ Web Share API

### Phase 2 (Gamification)
- ✅ XP system
- ✅ Streak tracking
- ✅ Plant evolution component
- ✅ Badge notifications

### Phase 3 (PWA)
- ✅ Manifest.json
- ✅ Responsive design
- ⏳ Service worker (next-pwa config)

### Phase 4 (Admin)
- ⏳ Dashboard UI
- ⏳ Message management
- ⏳ Analytics visualization

## 🎨 Design System

**Primary Color**: Purple (#8B5CF6)  
**Pastel Theme**: Blue, Purple, Orange, Green backgrounds for categories

## 🔒 Security

- Row Level Security (RLS) on all tables
- No PII stored for minors
- GDPR compliant

## 📝 Database Tables

- `profiles`: User accounts and XP data
- `beneficiaries`: Children/students
- `messages`: Message library
- `favorites`: User bookmarked messages
- `history`: Sent messages log
- `analytics_logs`: Anonymous usage stats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ using Next.js and Supabase
