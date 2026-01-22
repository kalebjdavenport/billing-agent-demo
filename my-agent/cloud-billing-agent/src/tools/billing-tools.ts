import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import {
  transactions,
  filterTransactions,
  getUniqueServices,
  getDateRange as getDataDateRange,
  aggregateByField,
  BillingTransaction,
} from "../data/transactions";
import { queryTransactionsSchema, getBillingSummarySchema } from "./schemas";

// Helper to format transactions as a markdown table
function formatTransactionsTable(txs: BillingTransaction[]): string {
  if (txs.length === 0) {
    return "No transactions found.";
  }

  const header = "| ID | Date | Amount | Service | Status |\n|-----|------|--------|---------|--------|";
  const rows = txs.map(tx =>
    `| ${tx.id} | ${tx.date} | $${tx.amount.toFixed(2)} | ${tx.service} | ${tx.status} |`
  ).join("\n");

  return `${header}\n${rows}`;
}

// Helper to format breakdown as a markdown table
function formatBreakdownTable(breakdown: Record<string, number>): string {
  const header = "| Category | Amount |\n|----------|--------|";
  const rows = Object.entries(breakdown)
    .map(([key, amount]) => `| ${key} | $${amount.toFixed(2)} |`)
    .join("\n");

  return `${header}\n${rows}`;
}

export const queryTransactions = tool(
  "query_transactions",
  "Query billing transactions with optional filters for date range, service, and status. Returns matching transactions.",
  queryTransactionsSchema,
  async (args) => {
    const results = filterTransactions(transactions, {
      start_date: args.start_date,
      end_date: args.end_date,
      service: args.service,
      status: args.status,
    });

    const markdown = `**${results.length} transaction${results.length !== 1 ? 's' : ''} found**\n\n${formatTransactionsTable(results)}`;

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
    };
  }
);

export const getBillingSummary = tool(
  "get_billing_summary",
  "Get aggregated billing totals for a date range, optionally grouped by service, month, or status.",
  getBillingSummarySchema,
  async (args) => {
    const filtered = filterTransactions(transactions, {
      start_date: args.start_date,
      end_date: args.end_date,
    });

    const total = filtered.reduce((sum: number, tx) => sum + tx.amount, 0);
    const breakdown = args.group_by ? aggregateByField(filtered, args.group_by) : undefined;

    let markdown = `**Total: $${(Math.round(total * 100) / 100).toFixed(2)}**\n\n`;
    markdown += `Based on ${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`;

    if (breakdown && Object.keys(breakdown).length > 0) {
      markdown += `\n\n**Breakdown by ${args.group_by}:**\n\n${formatBreakdownTable(breakdown)}`;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
    };
  }
);

export const listServices = tool(
  "list_services",
  "List all unique services available in the billing data.",
  {},
  async () => {
    const services = getUniqueServices(transactions);

    const markdown = `**Available Services (${services.length}):**\n\n${services.map(s => `- ${s}`).join('\n')}`;

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
    };
  }
);

export const getDateRange = tool(
  "get_date_range",
  "Get the date range of available billing data (earliest and latest dates).",
  {},
  async () => {
    const range = getDataDateRange(transactions);

    const markdown = `**Data Range:**\n\n| | Date |\n|--|------|\n| Earliest | ${range.earliest} |\n| Latest | ${range.latest} |`;

    return {
      content: [
        {
          type: "text" as const,
          text: markdown,
        },
      ],
    };
  }
);
