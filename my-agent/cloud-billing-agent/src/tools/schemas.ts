import { z } from "zod";

export const queryTransactionsSchema = {
  start_date: z.string().optional().describe("Start date in YYYY-MM-DD format"),
  end_date: z.string().optional().describe("End date in YYYY-MM-DD format"),
  service: z.string().optional().describe("Filter by service name (partial match)"),
  status: z.enum(["processed", "pending"]).optional().describe("Filter by transaction status"),
};

export const getBillingSummarySchema = {
  start_date: z.string().optional().describe("Start date in YYYY-MM-DD format"),
  end_date: z.string().optional().describe("End date in YYYY-MM-DD format"),
  group_by: z.enum(["service", "month", "status"]).optional().describe("Group results by field"),
};

export type QueryTransactionsInput = z.infer<z.ZodObject<typeof queryTransactionsSchema>>;
export type GetBillingSummaryInput = z.infer<z.ZodObject<typeof getBillingSummarySchema>>;
