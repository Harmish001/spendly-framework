# Spendly — Next.js Migration

This folder contains the full Next.js 14 migration of the Spendly framework.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: Passport.js Local Strategy + JWT Cookie (via `jose`)
- **Data Fetching**: React Query (`@tanstack/react-query`)
- **UI**: Tailwind CSS + Shadcn/ui (same as original)

## How to Use This Migration

### 1. Copy Files to `spendly-nextjs/`
The `spendly-nextjs/` directory was scaffolded at `E:\Projects\Spendly\spendly-nextjs`. Copy the contents of this folder into it:

```bash
# From E:\Projects\Spendly\
xcopy /E /I spendly-framework\nextjs-migration\* spendly-nextjs\
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Fill in MONGODB_URI and SESSION_SECRET
```

### 3. Copy UI Components from Original Repo
The UI components are reusable as-is — just need `'use client'` added and imports updated:
```bash
# Copy shared UI
xcopy /E /I spendly-framework\src\components\ui\* spendly-nextjs\components\ui\
xcopy /E /I spendly-framework\src\components\expenses\* spendly-nextjs\components\expenses\
xcopy /E /I spendly-framework\src\components\layout\* spendly-nextjs\components\layout\
xcopy /E /I spendly-framework\src\components\passwords\* spendly-nextjs\components\passwords\
xcopy /E /I spendly-framework\src\components\todos\* spendly-nextjs\components\todos\
xcopy /E /I spendly-framework\src\components\statistics\* spendly-nextjs\components\statistics\
xcopy /E /I spendly-framework\src\constants\* spendly-nextjs\lib\constants\

# Copy pages as app router pages
# See MIGRATION_PLAN.md for the mapping
```

### 4. Data Migration
1. Export Supabase tables to `scripts/migration-data/` as JSON files:
   - `profiles.json`, `expenses.json`, `todos.json`, `passwords.json`, `password_categories.json`
2. Run:
```bash
npx ts-node --project tsconfig.json scripts/migrate-supabase-to-mongo.ts
```

### 5. Run Dev Server
```bash
npm run dev
```

## File Structure

```
nextjs-migration/
├── app/
│   ├── layout.tsx              # Root layout with Providers
│   ├── providers.tsx           # QueryClient + Toaster
│   ├── globals.css             # (copy from original index.css)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── signup/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── expenses/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── todos/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── passwords/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── password-categories/
│           ├── route.ts
│           └── [id]/route.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useExpenses.ts
│   ├── useTodos.ts
│   └── usePasswords.ts
├── lib/
│   ├── mongodb.ts              # Singleton DB connection
│   ├── auth.ts                 # Passport + session middleware
│   ├── api-auth.ts             # JWT auth guard for API routes
│   └── models/
│       ├── User.ts
│       ├── Expense.ts
│       ├── Todo.ts
│       ├── Password.ts
│       └── PasswordCategory.ts
├── middleware.ts               # Route protection
├── next.config.ts
└── scripts/
    └── migrate-supabase-to-mongo.ts

## Remaining Work (Pages)
Pages must be migrated one-by-one from `src/pages/` to `app/*/page.tsx`:
- Replace `useNavigate` → `useRouter` from `next/navigation`
- Replace `useSearchParams` from `react-router-dom` → `next/navigation`
- Replace `supabase.from(...)` → corresponding React Query hook
- Add `'use client'` directive at top of each page
- Remove Capacitor imports and Chatbot imports
```

## ⚠️ Important Notes

1. **Password Reset Required**: Existing users CANNOT log in after migration — Supabase password hashes are not portable. Implement a "Forgot Password" email flow before going live.

2. **The `spendly-nextjs/` project** already has all dependencies installed (`npm install` was run during scaffolding). You just need to add `.env.local` and copy these files.
