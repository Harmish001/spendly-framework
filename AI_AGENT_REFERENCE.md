# AI Agent Reference: Spendly Framework

> [!NOTE]
> This file is a comprehensive guide for AI coding agents working on the Spendly repository. It outlines the architecture, technology stack, features, and code locations to ensure consistent and high-quality code generation.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Core Features & Code Locations](#4-core-features--code-locations)
5. [Architecture & Data Flow](#5-architecture--data-flow)
6. [Development Guidelines](#6-development-guidelines)
7. [Deployment](#7-deployment)

---

## 1. Project Overview

**Spendly** is an AI-powered expense tracking application with advanced features for automated expense extraction, password management, and financial analytics.

### Key Capabilities

- 💰 **Expense Tracking**: Manual and AI-powered expense entry
- 📸 **AI Image Processing**: Extract expense data from receipts/screenshots
- 🎤 **Voice Input**: Voice-to-expense conversion using speech recognition
- 🤖 **AI Chatbot**: Conversational expense tracking with Gemini AI
- 🔐 **Password Manager**: Secure password storage with categories
- 📊 **Analytics**: Visual statistics and travel expense tracking
- 📱 **Cross-Platform**: Web and Android (via Capacitor)

---

## 2. Technology Stack

### Core Frameworks

- **Frontend**: React 18.3.1 (via Vite 5.4.1)
- **Language**: TypeScript 5.5.3
- **Styling**: Tailwind CSS 3.4.11 + Shadcn UI (Radix UI primitives)
- **Routing**: React Router DOM 6.26.2
- **State Management**: TanStack Query v5.56.2

### Data & Backend

- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (with OAuth support - Google)
- **Edge Functions**: Supabase Edge Functions (Deno runtime)
  - `process-expense-image`: Image-to-expense extraction
  - `process-voice-expense`: Voice-to-expense extraction
  - `speech-to-text`: Speech recognition

### AI & ML

- **AI Provider**: Google Gemini AI (`@google/generative-ai` 0.24.1)
- **Model**: gemini-1.5-flash
- **Use Cases**:
  - Receipt/image OCR and data extraction
  - Voice transcription processing
  - Conversational expense tracking
  - Expense query and analysis

### Mobile (Android)

- **Runtime**: Capacitor 7.2.0
- **Plugins**:
  - `@capacitor/camera` 7.0.1: Receipt capturing
  - `@capacitor/filesystem` 7.1.1: Local storage
  - `@capacitor/share`: Share intent handling
  - `@capacitor/app` 7.0.1: App lifecycle

### UI Components & Libraries

- **Charts**: Recharts 2.12.7, @nivo/bar, @nivo/pie
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **Date**: date-fns 3.6.0, react-day-picker 8.10.1
- **Notifications**: Sonner 1.5.0
- **Icons**: lucide-react 0.462.0
- **Markdown**: react-markdown 10.1.0

---

## 3. Directory Structure

```text
e:/Projects/Spendly/spendly-framework/
├── android/                          # Native Android project (Capacitor)
├── src/
│   ├── components/
│   │   ├── chatbot/                  # AI Chatbot components
│   │   │   ├── FloatingChatBot.tsx   # Main chatbot UI with conversation
│   │   │   └── FloatingChatButton.tsx # Chatbot trigger button
│   │   ├── expenses/                 # Expense-related components
│   │   │   ├── AIExpenseCapture.tsx  # Image-based expense capture
│   │   │   ├── VoiceExpenseCapture.tsx # Voice-based expense capture
│   │   │   ├── ExpenseForm.tsx       # Manual expense entry form
│   │   │   ├── ExpenseFormSheet.tsx  # Expense form in sheet/drawer
│   │   │   ├── ExpenseSidebar.tsx    # Expense list sidebar
│   │   │   ├── ExpenseFilters.tsx    # Category/date filters
│   │   │   ├── ExpenseModal.tsx      # Expense detail modal
│   │   │   ├── GooglePayImport.tsx   # Google Pay integration
│   │   │   ├── MonthTabs.tsx         # Month selection tabs
│   │   │   └── VoiceDetect.tsx       # Voice detection utility
│   │   ├── passwords/                # Password manager components
│   │   │   ├── PasswordForm.tsx      # Password entry/edit form
│   │   │   └── CategoryManager.tsx   # Password category management
│   │   ├── statistics/               # Analytics components
│   │   │   ├── Analysis.tsx          # Monthly expense analysis
│   │   │   └── StatisticsCharts.tsx  # Chart visualizations
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx            # App header
│   │   │   └── Animation.tsx         # Voice recording animation
│   │   ├── navigation/               # Navigation components
│   │   └── ui/                       # Shadcn UI primitives (49 components)
│   ├── pages/
│   │   ├── LandingPage.tsx           # Public landing page
│   │   ├── Index.tsx                 # Login page
│   │   ├── SignUp.tsx                # Registration page
│   │   ├── Dashboard.tsx             # Main expense dashboard
│   │   ├── Statistics.tsx            # Statistics & charts page
│   │   ├── TravelExpenses.tsx        # Travel-specific expenses
│   │   ├── PasswordManager.tsx       # Password vault page
│   │   └── ChatBotTest.tsx           # Chatbot testing page
│   ├── services/
│   │   ├── GeminiService.ts          # Gemini AI integration
│   │   ├── ExpenseParserService.ts   # Chat & expense extraction service
│   │   ├── GooglePayService.ts       # Google Pay OCR service
│   │   └── ShareReceiver.ts          # Android share intent handler
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts             # Supabase client initialization
│   ├── utils/
│   │   └── AndroidPermissions.ts     # Android permission handling
│   ├── hooks/
│   │   └── use-toast.tsx             # Toast notification hook
│   ├── lib/
│   │   └── utils.ts                  # Utility functions
│   ├── App.tsx                       # Main app with routing
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── supabase/
│   ├── functions/
│   │   ├── process-expense-image/    # Image OCR edge function
│   │   ├── process-voice-expense/    # Voice processing edge function
│   │   └── speech-to-text/           # Speech recognition edge function
│   ├── migrations/
│   │   └── 20250831062442_*.sql      # Database schema (passwords, categories)
│   └── config.toml                   # Supabase configuration
├── public/                           # Static assets
├── Permissions.ts                    # Permission request utilities
├── package.json                      # Dependencies & scripts
├── tailwind.config.ts                # Tailwind configuration
├── vite.config.ts                    # Vite build configuration
├── capacitor.config.ts               # Capacitor configuration
└── vercel.json                       # Vercel deployment config
```

---

## 4. Core Features & Code Locations

### 4.1 Expense Tracking (Core Feature)

#### Manual Expense Entry

- **Location**: `src/components/expenses/ExpenseForm.tsx`
- **Features**:
  - Amount, category, description, date input
  - Category selection with icons
  - Form validation with Zod
- **Database Table**: `expenses`
- **Categories**: investment, food, transport, shopping, loan, medical, travel, bill, houseExpense, others

#### Dashboard

- **Location**: `src/pages/Dashboard.tsx`
- **Features**:
  - Expense list with swipe-to-delete
  - Month/year filtering
  - Category-wise pie chart
  - Total expense calculation
  - Edit/delete functionality
- **Components Used**:
  - `ExpenseSidebar.tsx`: Side panel with expense form
  - `ExpenseFilters.tsx`: Filter by category/date
  - `MonthTabs.tsx`: Month selection

### 4.2 AI-Powered Expense Capture

#### Image-Based Capture

- **Location**: `src/components/expenses/AIExpenseCapture.tsx`
- **Flow**:
  1. User captures/selects receipt image
  2. Image converted to base64
  3. Sent to `process-expense-image` edge function
  4. Gemini AI extracts: amount, category, description, date
  5. Pre-fills expense form for user review
- **Edge Function**: `supabase/functions/process-expense-image/`
- **Supported Sources**: Camera, gallery, shared images (Android)

#### Voice-Based Capture

- **Location**: `src/components/expenses/VoiceExpenseCapture.tsx`
- **Flow**:
  1. User speaks expense details
  2. Browser Speech Recognition API captures audio
  3. Transcription sent to `process-voice-expense` edge function
  4. Gemini AI extracts expense data
  5. Pre-fills expense form
- **Edge Function**: `supabase/functions/process-voice-expense/`
- **Permissions**: Microphone access (Android & Web)
- **Animation**: `src/components/layout/Animation.tsx` (voice recording indicator)

#### Share Intent (Android)

- **Location**: `src/services/ShareReceiver.ts`
- **Features**:
  - Receives shared images from other apps (Google Pay, PhonePe, etc.)
  - Processes via Service Worker cache
  - Automatically extracts expense data
- **Integration**: `src/App.tsx` (handleSharedExpenseImage)

### 4.3 AI Chatbot (Conversational Expense Tracking)

#### Chatbot UI

- **Location**: `src/components/chatbot/FloatingChatBot.tsx`
- **Features**:
  - Conversational interface for expense tracking
  - Natural language expense entry
  - Expense extraction from chat messages
  - Approve/reject extracted expenses
  - Conversation history
  - Query expense data
- **Service**: `src/services/GeminiService.ts`
  - `processMessage()`: Process user messages
  - `queryExpenses()`: Answer questions about expenses
  - Automatic expense extraction from conversation

#### Chat Data Management

- **Location**: `src/services/ExpenseParserService.ts`
- **Database Tables**:
  - `chat_conversations`: Conversation threads
  - `chat_messages`: Individual messages
  - `chat_extracted_expenses`: Expenses extracted from chat
- **Key Methods**:
  - `createConversation()`: Start new chat
  - `addMessage()`: Add user/assistant message
  - `saveExtractedExpenses()`: Save AI-extracted expenses
  - `approveExtractedExpense()`: Add to main expenses table
  - `rejectExtractedExpense()`: Discard extraction

### 4.4 Password Manager

#### Password Vault

- **Location**: `src/pages/PasswordManager.tsx`
- **Features**:
  - Encrypted password storage
  - Category-based organization
  - Search and filter
  - Favorite passwords
  - Copy to clipboard
  - Show/hide passwords
- **Components**:
  - `src/components/passwords/PasswordForm.tsx`: Add/edit passwords
  - `src/components/passwords/CategoryManager.tsx`: Manage categories

#### Database Schema

- **Tables**:
  - `passwords`: Encrypted password entries
    - Fields: title, username, email, password_encrypted, website_url, notes, is_favorite, category_id
  - `password_categories`: Custom categories
    - Fields: name, color, icon
- **Security**: Row Level Security (RLS) enabled
- **Migration**: `supabase/migrations/20250831062442_*.sql`

### 4.5 Statistics & Analytics

#### Statistics Dashboard

- **Location**: `src/pages/Statistics.tsx`
- **Features**:
  - Last 6 months expense trends
  - Monthly amount bar chart
  - Monthly expense count chart
  - Total amount per month
- **Charts**: Recharts (Bar charts)

#### Monthly Analysis

- **Location**: `src/components/statistics/Analysis.tsx`
- **Features**:
  - Detailed monthly breakdown
  - Category-wise analysis
  - Expense trends

#### Travel Expenses

- **Location**: `src/pages/TravelExpenses.tsx`
- **Features**:
  - Travel category filter
  - Month-wise filtering
  - Pie chart visualization
  - Total travel expenses
- **Charts**: @nivo/pie

### 4.6 Authentication

#### Login/Signup

- **Pages**:
  - `src/pages/Index.tsx`: Login page
  - `src/pages/SignUp.tsx`: Registration page
  - `src/pages/LandingPage.tsx`: Public landing page
- **Auth Provider**: Supabase Auth
- **OAuth**: Google Sign-In support
- **Flow**: Handled in `src/App.tsx` (AuthHandler component)

---

## 5. Architecture & Data Flow

### 5.1 AI Processing Pipeline

```
User Input (Image/Voice/Chat)
    ↓
Frontend Component (AIExpenseCapture/VoiceExpenseCapture/FloatingChatBot)
    ↓
Convert to Base64/Transcription
    ↓
Supabase Edge Function (process-expense-image/process-voice-expense)
    ↓
Gemini AI API (gemini-1.5-flash)
    ↓
Extract Structured Data (amount, category, description, date, confidence)
    ↓
Return to Frontend
    ↓
Pre-fill Expense Form / Save to chat_extracted_expenses
    ↓
User Review & Approve
    ↓
Save to expenses table
```

### 5.2 Database Schema

#### Core Tables

- **expenses**: Main expense records
  - user_id, amount, category, description, date, created_at
- **passwords**: Encrypted password storage
  - user_id, category_id, title, username, email, password_encrypted, website_url, notes, is_favorite
- **password_categories**: Password organization
  - user_id, name, color, icon
- **chat_conversations**: Chatbot conversations
  - user_id, title, created_at, updated_at
- **chat_messages**: Chat message history
  - conversation_id, user_id, role, content, expense_extracted
- **chat_extracted_expenses**: AI-extracted expenses from chat
  - message_id, user_id, amount, description, category, confidence, approved, added_to_expenses, expense_id

### 5.3 Service Layer

#### GeminiService (`src/services/GeminiService.ts`)

- **Purpose**: Gemini AI integration
- **Key Methods**:
  - `processMessage(message, history)`: Process chat messages
  - `queryExpenses(question, expenseData)`: Answer expense queries
  - `parseExpenseResponse(response)`: Extract expenses from AI response
- **Model**: gemini-1.5-flash
- **Configuration**: VITE_GEMINI_API_KEY environment variable

#### ExpenseParserService (`src/services/ExpenseParserService.ts`)

- **Purpose**: Chat and expense extraction management
- **Key Methods**:
  - Conversation management (create, get, update, delete)
  - Message handling (add, get)
  - Expense extraction (save, approve, reject)
  - Context retrieval (getRecentExpenses)

#### ShareReceiver (`src/services/ShareReceiver.ts`)

- **Purpose**: Handle Android share intents
- **Flow**:
  1. Register share target in manifest
  2. Receive shared image
  3. Cache via Service Worker
  4. Process with AI
  5. Extract expense data

### 5.4 State Management

- **React Query**: Server state (expenses, passwords, conversations)
- **useState**: Local UI state
- **Custom Events**: Cross-component communication
  - `sharedExpenseProcessed`: Shared image processed
  - `processSharedImage`: Trigger image processing
  - `sharedExpenseImage`: Shared image received

---

## 6. Development Guidelines

### 6.1 Coding Standards

- **Functional Components**: Use React functional components with hooks
- **TypeScript**: Strictly typed, avoid `any`, define interfaces
- **Imports**: Use `@/` alias for absolute imports
- **Error Handling**: Use `sonner` toast for user notifications
- **Styling**: Tailwind CSS with custom gradients
- **Forms**: React Hook Form + Zod validation

### 6.2 Component Patterns

#### Expense Components

```typescript
interface ExpenseData {
  amount: string;
  category: string;
  description: string;
  date?: string;
}

// Callback pattern for expense extraction
onExpenseExtracted: (data: ExpenseData) => void
```

#### AI Service Pattern

```typescript
// Always handle errors gracefully
try {
  const { data, error } = await supabase.functions.invoke("function-name", {
    body: {
      /* payload */
    },
  });
  if (error) throw error;
  // Process data
} catch (error) {
  console.error("Error:", error);
  toast.error("User-friendly message");
}
```

### 6.3 Workflow Commands

| Command                | Description                            |
| :--------------------- | :------------------------------------- |
| `npm run dev`          | Start development server (Vite)        |
| `npm run build`        | Build for production                   |
| `npm run build:dev`    | Build in development mode              |
| `npm run lint`         | Run ESLint                             |
| `npm run preview`      | Preview production build               |
| `npx cap sync android` | Sync web assets to Android             |
| `npx cap open android` | Open Android project in Android Studio |

### 6.4 Environment Variables

- `VITE_GEMINI_API_KEY`: Gemini AI API key
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

### 6.5 Common Tasks

#### Adding a New Feature

1. Create component in appropriate `src/components/` subdirectory
2. Add page in `src/pages/` if needed
3. Update routing in `src/App.tsx`
4. Add database tables in `supabase/migrations/`
5. Create edge functions in `supabase/functions/` if AI processing needed
6. Update this reference document

#### Adding a New Expense Category

1. Update category list in `src/pages/Dashboard.tsx` (categories array)
2. Add icon mapping in `categoryIcons` object
3. Update Gemini AI prompts in `src/services/GeminiService.ts`

#### Creating an Edge Function

1. Create folder in `supabase/functions/`
2. Add `index.ts` with Deno runtime
3. Deploy: `supabase functions deploy function-name`
4. Set secrets: `supabase secrets set KEY=value`

---

## 7. Deployment

### 7.1 Web Deployment

- **Platform**: Vercel (configured in `vercel.json`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Set in Vercel dashboard

### 7.2 Android Deployment

- **Build Process**:
  1. `npm run build` - Build web assets
  2. `npx cap sync android` - Sync to Android
  3. `npx cap open android` - Open in Android Studio
  4. Build APK/AAB in Android Studio
- **GitHub Actions**: Automated builds (check `.github/workflows/`)
- **Configuration**: `capacitor.config.ts`, `android/` directory

### 7.3 Supabase

- **Database**: Managed PostgreSQL
- **Edge Functions**: Deployed via Supabase CLI
- **Migrations**: Applied via `supabase db push`

---

## 8. Key Files Reference

### Critical Files (Do Not Delete)

- `src/App.tsx`: Main routing and app structure
- `src/integrations/supabase/client.ts`: Database connection
- `src/services/GeminiService.ts`: AI integration
- `tailwind.config.ts`: Design system configuration
- `capacitor.config.ts`: Mobile app configuration

### Configuration Files

- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Build configuration
- `eslint.config.js`: Linting rules
- `.env`: Environment variables (not in repo)

---

## 9. Feature Roadmap & TODOs

### Implemented ✅

- ✅ Manual expense tracking
- ✅ AI image-based expense capture
- ✅ Voice expense capture
- ✅ AI chatbot for conversational tracking
- ✅ Password manager with categories
- ✅ Statistics and analytics
- ✅ Travel expense tracking
- ✅ Android share intent support
- ✅ Google OAuth authentication

### Potential Enhancements 🚀

- 🔄 Recurring expenses
- 🔄 Budget limits and alerts
- 🔄 Export to CSV/PDF
- 🔄 Multi-currency support
- 🔄 Receipt storage in cloud
- 🔄 Expense sharing between users
- 🔄 iOS support (Capacitor iOS)

---

**Last Updated**: 2026-02-02  
**Version**: 1.0  
**Maintained By**: Spendly Development Team
