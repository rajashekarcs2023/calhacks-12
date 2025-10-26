# CivicMind - Talk to Your City

A futuristic civic engagement platform that makes city data accessible through natural language conversations.

## Features

- **Natural Language Queries**: Ask questions about 311 requests, budgets, and events in plain English
- **Visual Answers**: Get responses as interactive tables, charts, and maps
- **Sentiment Analysis**: Track public mood and citizen feedback in real-time
- **Voice Interface**: Use voice commands to query civic data (browser-based)
- **Secure by Design**: Row Level Security, parameterized queries, and whitelisted operations
- **Mock Mode**: Works out-of-the-box with realistic mock data when APIs aren't configured

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS v4, shadcn/ui
- **Charts**: Recharts
- **AI**: Vercel AI SDK (OpenAI, Anthropic, Google Gemini)
- **Deployment**: Vercel

## Getting Started

### 1. Run Database Scripts

Execute the SQL scripts in order from the `scripts/` folder in your Supabase SQL editor:

1. `001_create_tables.sql` - Creates all database tables
2. `002_enable_rls.sql` - Enables Row Level Security
3. `003_create_query_functions.sql` - Creates safe query functions
4. `004_seed_data.sql` - Seeds demo data

### 2. Environment Variables

The following environment variables are already configured in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

Optional (for enhanced features):
- `LLM_PROVIDER` - AI provider: `openai`, `anthropic`, or `google` (default: openai)
- `LLM_API_KEY` - API key for your chosen LLM provider

### 3. Deploy

This project is ready to deploy on Vercel. The environment variables are already configured.

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes (query, feedback, mood, workflow, etc.)
│   ├── pulse/            # City Pulse dashboard
│   ├── datasets/         # Dataset explorer
│   ├── about/            # About page
│   └── page.tsx          # Chat interface (home)
├── components/           # React components
├── lib/
│   ├── supabase/         # Supabase client utilities
│   ├── nl2sql.ts         # Natural language to SQL parser
│   ├── workflows.ts      # Department workflow definitions
│   ├── ai-workflow-engine.ts  # AI-powered workflow execution
│   └── types.ts          # TypeScript types
├── hooks/                # Custom React hooks
└── scripts/              # Database SQL scripts
\`\`\`

## Usage

### Chat Interface

Ask questions like:
- "Show unresolved potholes this week in Downtown"
- "Top 3 complaint types this month"
- "Compare 2024 budget: Education vs Public Safety"
- "Public hearings next week in North district"

### City Pulse

View real-time sentiment analysis, complaint trends, and submit citizen feedback.

### Voice Commands

Click the microphone button to use voice input. The system uses browser-based Web Speech API for voice recognition.

### Department Workflows

The system automatically detects service requests and triggers department-specific workflows:
- **Public Works**: Pothole repairs, street maintenance
- **Parking**: Ticket disputes, permit applications
- **Social Services**: Benefits eligibility, housing assistance
- **Legal**: Court dates, legal aid
- **Elections**: Voter registration, polling locations
- **DMV**: License renewals, vehicle registration
- **City Council**: Meeting schedules, public comments
- **Legislation**: Policy explanations, bill tracking

## Mock Mode

When Supabase is not configured, the app runs in Mock Mode with realistic demo data. A badge appears in the header to indicate this state.

## Security

- All database queries use parameterized functions (no SQL injection)
- Row Level Security (RLS) controls data access
- Whitelisted query patterns only
- No arbitrary SQL execution
- Public data is read-only for anonymous users

## License

MIT
