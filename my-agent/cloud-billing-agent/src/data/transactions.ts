export interface BillingTransaction {
  id: string;
  date: string;
  amount: number;
  service: string;
  status: "processed" | "pending";
}

export const transactions: BillingTransaction[] = [
  // ============================================
  // 2024 DATA (Original validation data)
  // ============================================

  // January 2024 - Total: $507.50 (for "last month" validation)
  // EC2 in Jan = $150.00
  { id: "tx_101", date: "2024-01-05", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_102", date: "2024-01-15", amount: 45.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_103", date: "2024-01-20", amount: 12.00, service: "Networking", status: "processed" },
  { id: "tx_104", date: "2024-01-25", amount: 300.00, service: "Database (RDS)", status: "processed" },

  // February 2024
  // Feb 14th = $100.00 (RDS) - for specific date validation
  { id: "tx_105", date: "2024-02-14", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_106", date: "2024-02-20", amount: 75.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_107", date: "2024-02-28", amount: 50.00, service: "Storage (S3)", status: "pending" },

  // March-December 2024 (historical data)
  { id: "tx_108", date: "2024-03-10", amount: 125.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_109", date: "2024-04-15", amount: 89.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_110", date: "2024-05-20", amount: 67.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_111", date: "2024-06-12", amount: 145.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_112", date: "2024-07-08", amount: 32.00, service: "Networking", status: "processed" },
  { id: "tx_113", date: "2024-08-22", amount: 210.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_114", date: "2024-09-18", amount: 55.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_115", date: "2024-10-05", amount: 180.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_116", date: "2024-11-14", amount: 95.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_117", date: "2024-12-20", amount: 42.00, service: "Networking", status: "processed" },

  // ============================================
  // 2025-2026 DATA
  // ============================================

  // February 2025
  // Feb 14th = $100.00 (RDS) - specific date validation (2025 version)
  { id: "tx_210", date: "2025-02-14", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_211", date: "2025-02-20", amount: 60.00, service: "Storage (S3)", status: "processed" },

  // October-November 2025
  { id: "tx_214", date: "2025-10-10", amount: 30.00, service: "Networking", status: "processed" },
  { id: "tx_212", date: "2025-11-15", amount: 90.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_213", date: "2025-11-28", amount: 45.00, service: "Database (RDS)", status: "processed" },

  // December 2025 - Total: $507.50 (alternative "last month" validation)
  { id: "tx_201", date: "2025-12-05", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_202", date: "2025-12-15", amount: 45.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_203", date: "2025-12-28", amount: 12.00, service: "Networking", status: "processed" },
  { id: "tx_204", date: "2025-12-10", amount: 300.00, service: "Database (RDS)", status: "processed" },

  // January 2026 - EC2 Total: $150.00, Pending: $50.00
  { id: "tx_205", date: "2026-01-02", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_206", date: "2026-01-10", amount: 50.00, service: "Storage (S3)", status: "pending" },
  { id: "tx_207", date: "2026-01-15", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_208", date: "2026-01-18", amount: 65.00, service: "Networking", status: "processed" },
  { id: "tx_209", date: "2026-01-20", amount: 85.00, service: "Storage (S3)", status: "processed" },
];

export interface FilterOptions {
  start_date?: string;
  end_date?: string;
  service?: string;
  status?: "processed" | "pending";
}

export function filterTransactions(
  data: BillingTransaction[],
  filters: FilterOptions
): BillingTransaction[] {
  return data.filter((tx) => {
    if (filters.start_date && tx.date < filters.start_date) return false;
    if (filters.end_date && tx.date > filters.end_date) return false;
    if (filters.service && !tx.service.toLowerCase().includes(filters.service.toLowerCase())) return false;
    if (filters.status && tx.status !== filters.status) return false;
    return true;
  });
}

export function getUniqueServices(data: BillingTransaction[]): string[] {
  return [...new Set(data.map((tx) => tx.service))];
}

export function getDateRange(data: BillingTransaction[]): { earliest: string; latest: string } {
  const dates = data.map((tx) => tx.date).sort();
  return {
    earliest: dates[0],
    latest: dates[dates.length - 1],
  };
}

export function aggregateByField(
  data: BillingTransaction[],
  field: "service" | "month" | "status"
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const tx of data) {
    let key: string;
    if (field === "service") {
      key = tx.service;
    } else if (field === "month") {
      key = tx.date.substring(0, 7); // YYYY-MM
    } else {
      key = tx.status;
    }

    result[key] = (result[key] || 0) + tx.amount;
  }

  return result;
}
