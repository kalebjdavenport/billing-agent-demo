import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import {
  queryTransactions,
  getBillingSummary,
  listServices,
  getDateRange,
} from "./billing-tools";

export const billingServer = createSdkMcpServer({
  name: "billing",
  version: "1.0.0",
  tools: [queryTransactions, getBillingSummary, listServices, getDateRange],
});
