# Cloud Billing Agent

An AI-powered billing assistant built with Next.js and the Claude Agent SDK. Chat with an intelligent agent to query and analyze your AWS cloud spending.

## How the Agent Works

The billing agent follows an agentic loop pattern—gathering context, taking actions, and validating results before responding. Here's the flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER QUERY                                      │
│                    "What was my EC2 spend last month?"                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. GATHER CONTEXT                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Agent receives query + system prompt with guidelines                 │    │
│  │ Determines which tools are needed to answer                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Files: lib/agent/constants.ts (SYSTEM_PROMPT)                              │
│         lib/agent/index.ts (runAgentQuery)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. TAKE ACTION (Tool Calls)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Agent calls billing tools via MCP server:                            │    │
│  │   • query_transactions - Filter by date/service/status               │    │
│  │   • get_billing_summary - Aggregate totals with breakdowns           │    │
│  │   • list_services - Available service types                          │    │
│  │   • get_date_range - Data boundaries                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Files: my-agent/cloud-billing-agent/src/tools/billing-tools.ts             │
│         my-agent/cloud-billing-agent/src/tools/server.ts                    │
│         my-agent/cloud-billing-agent/src/data/transactions.ts               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. VALIDATE & LOOP                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Agent evaluates tool results:                                        │    │
│  │   ✓ Sufficient data? → Formulate response                           │    │
│  │   ✗ Need more info?  → Call another tool (max 5 turns)              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Config: maxTurns: 5 in lib/agent/index.ts                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. RESPOND                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Agent streams final response with:                                   │    │
│  │   • Direct answer with data                                          │    │
│  │   • Formatted tables (max 8 rows displayed)                          │    │
│  │   • Suggested follow-up question                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Files: components/MessageList.tsx (renders markdown + tool calls)          │
│         app/api/agent/route.ts (SSE streaming)                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Verbosity & Transparency

The agent is designed to be **transparent but concise**:

| Aspect | Behavior |
|--------|----------|
| **Tool Calls** | Displayed in real-time with expandable parameters. Users see exactly which tools are called and with what inputs. |
| **Reasoning** | The agent does NOT verbalize intermediate thinking. It calls tools silently and only speaks when delivering the final answer. |
| **Results** | Tool outputs are shown in collapsible cards with status indicators (running → done). |
| **Follow-ups** | After answering, suggests one relevant follow-up question to guide exploration. |

**Why this level of verbosity?**
- **Transparent**: Users can verify the agent is using real data (tool calls are visible)
- **Not chatty**: No "Let me think about that..." or "I'm now going to..." filler
- **Data-focused**: Responses lead with numbers and tables, not explanations

The UI shows the agent's work through tool call cards rather than verbose text, keeping the conversation clean while maintaining full auditability.

## Features

- Interactive chat interface for billing queries
- Real-time streaming responses via Server-Sent Events
- **Hybrid mode**: Tools by default, code generation on request
- Automated validation test suite with multiple test suites
- Support for AWS billing data queries (EC2, RDS, S3, Lambda, CloudWatch, etc.)
- Tool-based architecture for accurate data retrieval
- Prompt injection defense

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

## Billing Tools

The agent uses four MCP tools to query billing data. Each tool is designed for reliability with input validation, result metadata, and helpful error guidance.

### `query_transactions`

Query individual transactions with optional filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `string` | Start date (YYYY-MM-DD format, validated) |
| `end_date` | `string` | End date (YYYY-MM-DD format, validated) |
| `service` | `string` | Filter by service name (partial match) |
| `status` | `"processed" \| "pending"` | Filter by transaction status |

**Returns:** Transaction table (max 8 rows displayed) with summary metadata showing total count and amount.

**Empty results:** Shows available data range and service names to help refine the query.

---

### `get_billing_summary`

Get aggregated totals with optional grouping.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `string` | Start date (YYYY-MM-DD format, validated) |
| `end_date` | `string` | End date (YYYY-MM-DD format, validated) |
| `group_by` | `"service" \| "month" \| "status"` | Optional breakdown dimension |

**Returns:** Total amount, transaction count, and breakdown table if grouped.

---

### `list_services`

Discover available service names for filtering.

**Returns:** List of all unique services in the billing data (e.g., "Compute (EC2)", "Database (RDS)", "Storage (S3)").

---

### `get_date_range`

Understand data boundaries before querying.

**Returns:** Earliest and latest transaction dates, plus total transaction count.

---

### Tool Reliability Features

| Feature | Implementation |
|---------|----------------|
| **Input Validation** | Dates validated with regex (`YYYY-MM-DD`) and parsed to ensure validity |
| **Result Metadata** | Every response includes transaction counts and totals for verification |
| **Empty Result Guidance** | When no data matches, tools show available date ranges and services |
| **Truncation Transparency** | Tables show max 8 rows with count/total of hidden rows |

```
my-agent/cloud-billing-agent/src/tools/
├── schemas.ts        # Zod schemas with date validation
├── billing-tools.ts  # Tool implementations with metadata
└── server.ts         # MCP server configuration
```

## Data Context

Billing data spans January 2025 through January 2026. The agent can query:
- Transaction history by date range
- Spending by service (EC2, RDS, S3, etc.)
- Pending charges
- Monthly summaries and breakdowns

## Hybrid Mode: Tools + Code Generation

The agent operates in **hybrid mode**—using tools by default for fast, reliable responses, but generating JavaScript code when users ask for transparency.

| User Request | Agent Behavior |
|--------------|----------------|
| "What was my EC2 spend?" | Uses `query_transactions` tool → returns data table |
| "How did you calculate that?" | Generates JavaScript code showing the logic |
| "Show me code to find pending charges" | Generates filter/reduce code |

### Example Code Generation

When a user asks "show me code to calculate EC2 spend", the agent generates:

```javascript
transactions
  .filter(tx => tx.service.includes('EC2'))
  .reduce((sum, tx) => sum + tx.amount, 0)
```

This hybrid approach provides:
- **Speed**: Tools execute instantly for common queries
- **Transparency**: Users can see exactly how calculations work
- **Education**: Users learn the data model and can modify code

## Validation Test Suites

The agent includes a comprehensive validation system with 15 tests organized into 4 suites:

| Suite | Tests | Description | Exit Code |
|-------|-------|-------------|-----------|
| `core` | 7 | Basic tool functionality | Fails build if any fail |
| `codegen` | 1 | Code generation feature | Fails build if fails |
| `security` | 4 | Prompt injection defense | Fails build if any fail |
| `boundaries` | 3 | System limits and edge cases | Does not fail build |

### Running Tests

**Web UI:**
Navigate to `/validate` to run all tests with visual progress.

**CLI (standalone agent):**
```bash
cd my-agent/cloud-billing-agent

# Run all tests
npx tsx tests/verify.ts

# Run specific suite
npx tsx tests/verify.ts core
npx tsx tests/verify.ts security
npx tsx tests/verify.ts boundaries

# Show help
npx tsx tests/verify.ts --help
```

### Test Categories

**Core Tests** — Must pass. Validates each tool works correctly:
- Query by date, service, status
- Monthly totals and breakdowns
- List services, get date range

**Codegen Tests** — Must pass. Validates hybrid mode:
- Code generation produces filter/reduce patterns

**Security Tests** — Must pass. Validates prompt injection defense:
- Rejects jokes, recipes, general knowledge, coding help
- Always redirects to billing topics

**Boundary Tests** — May fail. Defines system limits:
- Data before available range (pre-Jan 2025)
- Predictions not supported
- Services not in data (e.g., DynamoDB)

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
