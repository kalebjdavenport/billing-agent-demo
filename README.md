# Cloud Billing Agent

An AI-powered billing assistant built with Next.js and the Claude Agent SDK. Query and analyze your AWS cloud spending through natural language.

## How It Works

The agent follows an agentic loop pattern:

```
┌────────────────────────────────────────────────────────────────────┐
│  USER QUERY: "What was my EC2 spend last month?"                   │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  1. GATHER CONTEXT                                                 │
│     • Agent receives query + SYSTEM_PROMPT with guidelines         │
│     • Determines which tools are needed                            │
│     → lib/agent/constants.ts, lib/agent/index.ts                   │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  2. TAKE ACTION                                                    │
│     • Calls MCP billing tools:                                     │
│       - query_transactions: filter by date/service/status          │
│       - get_billing_summary: aggregated totals with grouping       │
│       - list_services: available service types                     │
│       - get_date_range: data boundaries                            │
│     → my-agent/cloud-billing-agent/src/tools/                      │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  3. VALIDATE & LOOP                                                │
│     • Sufficient data? → Continue to respond                       │
│     • Need more info? → Call another tool (max 5 turns)  ──┐       │
│     → lib/agent/index.ts (maxTurns: 5)                     │       │
└────────────────────────────────────────────────────────────│───────┘
                                 │                           │
                                 ▼                           │
┌────────────────────────────────────────────────────────────│───────┐
│  4. RESPOND                                                │       │
│     • Stream response with data and formatted tables       │       │
│     • Suggest one follow-up question                       │       │
│     → components/MessageList.tsx, app/api/agent/route.ts   │       │
└────────────────────────────────────────────────────────────────────┘
                                                             │
                              ▲_______________________________│
```

## Features

- Natural language billing queries with real-time streaming
- Tool calls displayed with expandable parameters
- Responses lead with data, suggest follow-ups
- Prompt injection defense

## Setup

```bash
cp .env.example .env.local  # Add your Anthropic API key
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Prerequisites:** Node.js 20+, Anthropic API key

## Project Structure

```
app/                    # Next.js app router + API endpoints
components/             # React UI (Chat, MessageList, validation)
hooks/                  # useAgentStream, useValidationStream
lib/agent/              # Agent config, prompts, types
my-agent/               # Standalone MCP billing tools package
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Validation

Automated test suites verify agent behavior:

- **core** - Basic tool functionality
- **security** - Prompt injection defense
- **boundaries** - Edge cases and system limits

Run via web UI at `/validate` or CLI:
```bash
npx tsx my-agent/cloud-billing-agent/tests/verify.ts [suite]
```

## Tech Stack

[Next.js 16](https://nextjs.org/) | [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) | [Tailwind CSS 4](https://tailwindcss.com/) | [Vitest](https://vitest.dev/)
