# 🚀 Hono Remix Adapter Template

A modern web application template powered by Remix and Hono, designed to run on Cloudflare Pages.

![sample](sample.png)

## 🛠 Tech Stack

### 🏗 Framework & Runtime
- 🎵 Remix v2.15.0
- ☁️ Cloudflare Pages
- 🔌 Hono Adapter v0.5.2

### 💾 Database & ORM
- 🐘 Supabase (PostgreSQL)
- 🌊 Drizzle ORM
- 🔄 Database Migrations

### 🎨 UI/UX Libraries
- ⚛️ React v18.2.0
- 🎭 Tailwind CSS
- 🎯 Shadcn UI - Beautiful and accessible components
- 🎯 Radix UI Components
- 🎪 Lucide React Icons
- ✨ Tailwind CSS Animate

### 🔧 Development Tools
- 📘 TypeScript
- ⚡️ Vite
- 🔍 ESLint
- 💻 Node.js v20+

## 📋 Prerequisites

### PostgreSQL Client (psql) Installation

#### macOS
```bash
# Homebrewを使用する場合
brew install postgresql@14

# または、PostgreSQLクライアントのみをインストールする場合
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

## 🔧 Environment Setup

1. Copy `.dev.vars.example` to `.dev.vars`:
```bash
cp .dev.vars.example .dev.vars
```

2. Update the `DATABASE_URL` in `.dev.vars` with your Supabase PostgreSQL connection string:
```
DATABASE_URL="postgresql://postgres:your-password@your-project.supabase.co:5432/postgres"
```

## 📋 Available Commands

```bash
# Development
pnpm run dev          # 🔥 Start Vite development server
pnpm run preview      # 👀 Preview build with Wrangler

# Build & Deploy
pnpm run build        # 📦 Build Remix application
pnpm run deploy:pages # 🚀 Build and deploy to Cloudflare Pages

# Database Operations
pnpm run db:generate  # 🏗 Generate Drizzle migration files
pnpm run db:migrate  # 🔄 Run Drizzle migrations
pnpm run db:push     # 📤 Push schema changes to database
pnpm run db:seed     # 🌱 Seed database with initial data
pnpm run db:studio   # 🎮 Open Drizzle Studio

# Type Checking & Generation
pnpm run typecheck    # ✅ Run TypeScript type checking
pnpm run typegen      # 🏗 Generate Wrangler types
pnpm run cf-typegen   # ☁️ Generate Cloudflare types

# Others
pnpm run start        # 🌐 Start Wrangler development server
pnpm run lint        # 🔍 Run ESLint code quality checks
pnpm run format      # 🎨 Run Biome code formatting
```

## ✨ Features

- 🎯 Remix v3 Features Enabled
  - 🚀 Single Fetch Optimization
  - 💾 Fetcher Persistence
  - 🛣 Relative Splat Paths
  - 🔄 Lazy Route Discovery
- ☁️ Cloudflare Pages Optimization
- 🔌 Hono Adapter Integration
- 🗃 Database Features
  - 🔄 Automatic migrations with Drizzle
  - 📊 Type-safe database operations
  - 🎮 Database management via Drizzle Studio

## 📋 Requirements

- 💻 Node.js v20 or higher
- 📦 pnpm
- 🐘 Supabase Project (for PostgreSQL database)
- 🛠 PostgreSQL Client (psql)

## 🗃 Database Management

### Migrations

1. Make changes to your schema in `app/schema.ts`
2. Generate migration files:
```bash
pnpm run db:generate
```
3. Apply migrations:
```bash
pnpm run db:migrate
```

### Push Schema Changes
To directly push schema changes without generating migration files:
```bash
pnpm run db:push
```

### Database Studio
To manage your database through a GUI:
```bash
pnpm run db:studio
```

### Seeding Data
To populate your database with initial data:
```bash
pnpm run db:seed
```

Note: Seeding requires the PostgreSQL client (psql) to be installed on your system. See the Prerequisites section for installation instructions.
