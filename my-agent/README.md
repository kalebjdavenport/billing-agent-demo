# Cloud Billing Agent

This directory contains the Cloud Billing Agent, integrated into the Next.js application.

## Structure

```
my-agent/
└── cloud-billing-agent/
    ├── src/
    │   ├── tools/
    │   │   ├── billing-tools.ts   # Tool implementations (query_transactions, get_billing_summary, etc.)
    │   │   ├── schemas.ts         # Zod schemas for tool inputs
    │   │   └── server.ts          # MCP server configuration
    │   └── data/
    │       └── transactions.ts    # Mock billing transaction data
    └── tsconfig.json
```

## Available Tools

The billing agent provides these MCP tools:

- **query_transactions** - Query billing transactions with optional filters (date range, service, status)
- **get_billing_summary** - Get aggregated billing totals, optionally grouped by service/month/status
- **list_services** - List all unique services in the billing data
- **get_date_range** - Get the date range of available billing data

## Integration with Next.js

The billing server is exported from `my-agent/cloud-billing-agent/src/tools/server.ts` and can be imported into the main application:

```typescript
// In lib/agent/index.ts
import { billingServer } from '../../my-agent/cloud-billing-agent/src/tools/server';
```

## Running Standalone

The agent can also be run standalone for testing:

```bash
cd my-agent/cloud-billing-agent
npm install
npx tsx src/tools/server.ts
```
