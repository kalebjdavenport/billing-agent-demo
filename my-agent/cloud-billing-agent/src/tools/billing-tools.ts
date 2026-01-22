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

// Maximum rows to display before truncating (all data is still fetched internally)
const MAX_TABLE_ROWS = 8;

// Helper to format transactions as a markdown table (with truncation)
function formatTransactionsTable(txs: BillingTransaction[]): string {
  if (txs.length === 0) {
    return "No transactions found.";
  }

  const header = "| ID | Date | Amount | Service | Status |\n|-----|------|--------|---------|--------|";
  const displayTxs = txs.slice(0, MAX_TABLE_ROWS);
  const remaining = txs.length - displayTxs.length;

  const rows = displayTxs.map(tx =>
    `| ${tx.id} | ${tx.date} | $${tx.amount.toFixed(2)} | ${tx.service} | ${tx.status} |`
  ).join("\n");

  let table = `${header}\n${rows}`;

  if (remaining > 0) {
    // Calculate total of remaining transactions
    const remainingTotal = txs.slice(MAX_TABLE_ROWS).reduce((sum, tx) => sum + tx.amount, 0);
    table += `\n\n*... and ${remaining} more transaction${remaining !== 1 ? 's' : ''} ($${remainingTotal.toFixed(2)} additional)*`;
  }

  return table;
}

// Maximum categories to display before truncating
const MAX_BREAKDOWN_ROWS = 12;

// Helper to format breakdown as a markdown table (with truncation)
function formatBreakdownTable(breakdown: Record<string, number>): string {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]); // Sort by amount descending
  const header = "| Category | Amount |\n|----------|--------|";

  const displayEntries = entries.slice(0, MAX_BREAKDOWN_ROWS);
  const remaining = entries.length - displayEntries.length;

  const rows = displayEntries
    .map(([key, amount]) => `| ${key} | $${amount.toFixed(2)} |`)
    .join("\n");

  let table = `${header}\n${rows}`;

  if (remaining > 0) {
    const remainingTotal = entries.slice(MAX_BREAKDOWN_ROWS).reduce((sum, [, amount]) => sum + amount, 0);
    table += `\n| *... ${remaining} more* | *$${remainingTotal.toFixed(2)}* |`;
  }

  return table;
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
