import { z } from "zod";

// Date validation with format check and validity check
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => !isNaN(Date.parse(date)), "Invalid date value");

export const queryTransactionsSchema = {
  start_date: dateSchema.optional().describe("Start date in YYYY-MM-DD format"),
  end_date: dateSchema.optional().describe("End date in YYYY-MM-DD format"),
  service: z.string().optional().describe("Filter by service name (partial match)"),
  status: z.enum(["processed", "pending"]).optional().describe("Filter by transaction status"),
};

export const getBillingSummarySchema = {
  start_date: dateSchema.optional().describe("Start date in YYYY-MM-DD format"),
  end_date: dateSchema.optional().describe("End date in YYYY-MM-DD format"),
  group_by: z.enum(["service", "month", "status"]).optional().describe("Group results by field"),
};

export type QueryTransactionsInput = z.infer<z.ZodObject<typeof queryTransactionsSchema>>;
export type GetBillingSummaryInput = z.infer<z.ZodObject<typeof getBillingSummarySchema>>;
