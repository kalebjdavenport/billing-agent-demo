# Cloud Billing Agent

An AI-powered billing assistant built with Next.js and the Claude Agent SDK. Chat with an intelligent agent to query and analyze your AWS cloud spending.

## Features

- Interactive chat interface for billing queries
- Real-time streaming responses via Server-Sent Events
- Automated validation test suite
- Support for AWS billing data queries (EC2, RDS, S3, Lambda, CloudWatch, etc.)
- Tool-based architecture for accurate data retrieval

## Prerequisites

- Node.js 20+
- Anthropic API key

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your API key:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Available Routes

- `/` - Main chat interface
- `/validate` - Automated validation test runner

## Project Structure

```
├── app/                    # Next.js app router
│   ├── api/agent/         # Agent streaming API endpoint
│   ├── api/validate/      # Validation test API endpoint
│   └── validate/          # Validation test UI page
├── components/            # React UI components
│   ├── Chat.tsx          # Main chat container
│   ├── ChatInput.tsx     # Message input with keyboard shortcuts
│   ├── MessageList.tsx   # Message display with markdown
│   └── validation/       # Validation test components
├── hooks/                 # Custom React hooks
│   ├── useAgentStream.ts # SSE stream handling for chat
│   └── useValidationStream.ts
├── lib/agent/            # Agent configuration
│   ├── constants.ts      # Shared prompts and config
│   ├── types.ts          # TypeScript definitions
│   └── validation.ts     # Test runner logic
└── my-agent/             # Standalone agent package
    └── cloud-billing-agent/
```

## Data Context

Billing data spans January 2025 through January 2026. The agent can query:
- Transaction history by date range
- Spending by service (EC2, RDS, S3, etc.)
- Pending charges
- Monthly summaries and breakdowns

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run lint` - Run ESLint

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) - AI agent framework
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [Vitest](https://vitest.dev/) - Testing framework
