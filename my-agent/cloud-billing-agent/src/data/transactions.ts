export interface BillingTransaction {
  id: string;
  date: string;
  amount: number;
  service: string;
  status: "processed" | "pending";
}

export const transactions: BillingTransaction[] = [
  // ============================================
  // 2025 DATA - Full Year Coverage
  // ============================================

  // January 2025 - Total: $895.00
  { id: "tx_001", date: "2025-01-02", amount: 188.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_002", date: "2025-01-05", amount: 142.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_003", date: "2025-01-08", amount: 62.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_004", date: "2025-01-12", amount: 35.00, service: "CloudWatch", status: "processed" },
  { id: "tx_005", date: "2025-01-15", amount: 98.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_006", date: "2025-01-18", amount: 25.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_007", date: "2025-01-22", amount: 175.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_008", date: "2025-01-26", amount: 52.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_009", date: "2025-01-30", amount: 118.00, service: "Database (RDS)", status: "processed" },

  // February 2025 - Total: $873.00
  { id: "tx_010", date: "2025-02-02", amount: 205.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_011", date: "2025-02-06", amount: 78.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_012", date: "2025-02-10", amount: 165.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_013", date: "2025-02-14", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_014", date: "2025-02-17", amount: 85.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_015", date: "2025-02-20", amount: 60.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_016", date: "2025-02-24", amount: 42.00, service: "API Gateway", status: "processed" },
  { id: "tx_017", date: "2025-02-28", amount: 138.00, service: "Compute (EC2)", status: "processed" },

  // March 2025 - Total: $786.00
  { id: "tx_018", date: "2025-03-03", amount: 195.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_019", date: "2025-03-07", amount: 125.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_020", date: "2025-03-11", amount: 55.00, service: "ElastiCache", status: "processed" },
  { id: "tx_021", date: "2025-03-15", amount: 72.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_022", date: "2025-03-19", amount: 38.00, service: "CloudWatch", status: "processed" },
  { id: "tx_023", date: "2025-03-23", amount: 105.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_024", date: "2025-03-27", amount: 28.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_025", date: "2025-03-31", amount: 168.00, service: "Compute (EC2)", status: "processed" },

  // April 2025 - Total: $837.00
  { id: "tx_026", date: "2025-04-02", amount: 148.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_027", date: "2025-04-06", amount: 82.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_028", date: "2025-04-10", amount: 215.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_029", date: "2025-04-14", amount: 45.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_030", date: "2025-04-18", amount: 92.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_031", date: "2025-04-22", amount: 22.00, service: "API Gateway", status: "processed" },
  { id: "tx_032", date: "2025-04-26", amount: 175.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_033", date: "2025-04-30", amount: 58.00, service: "ElastiCache", status: "processed" },

  // May 2025 - Total: $933.00, includes pending
  { id: "tx_034", date: "2025-05-03", amount: 228.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_035", date: "2025-05-07", amount: 95.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_036", date: "2025-05-11", amount: 162.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_037", date: "2025-05-15", amount: 48.00, service: "CloudWatch", status: "processed" },
  { id: "tx_038", date: "2025-05-19", amount: 115.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_039", date: "2025-05-23", amount: 32.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_040", date: "2025-05-27", amount: 185.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_041", date: "2025-05-31", amount: 68.00, service: "CloudFront (CDN)", status: "pending" },

  // June 2025 - Total: $931.00
  { id: "tx_042", date: "2025-06-02", amount: 198.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_043", date: "2025-06-06", amount: 145.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_044", date: "2025-06-10", amount: 75.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_045", date: "2025-06-14", amount: 52.00, service: "ElastiCache", status: "processed" },
  { id: "tx_046", date: "2025-06-18", amount: 88.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_047", date: "2025-06-22", amount: 35.00, service: "API Gateway", status: "processed" },
  { id: "tx_048", date: "2025-06-26", amount: 210.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_049", date: "2025-06-30", amount: 128.00, service: "Database (RDS)", status: "processed" },

  // July 2025 - Total: $957.00
  { id: "tx_050", date: "2025-07-03", amount: 242.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_051", date: "2025-07-07", amount: 88.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_052", date: "2025-07-11", amount: 175.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_053", date: "2025-07-15", amount: 42.00, service: "CloudWatch", status: "processed" },
  { id: "tx_054", date: "2025-07-19", amount: 125.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_055", date: "2025-07-23", amount: 28.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_056", date: "2025-07-27", amount: 195.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_057", date: "2025-07-31", amount: 62.00, service: "CloudFront (CDN)", status: "processed" },

  // August 2025 - Total: $922.00
  { id: "tx_058", date: "2025-08-02", amount: 185.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_059", date: "2025-08-06", amount: 105.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_060", date: "2025-08-10", amount: 225.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_061", date: "2025-08-14", amount: 58.00, service: "ElastiCache", status: "processed" },
  { id: "tx_062", date: "2025-08-18", amount: 98.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_063", date: "2025-08-22", amount: 38.00, service: "API Gateway", status: "processed" },
  { id: "tx_064", date: "2025-08-26", amount: 168.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_065", date: "2025-08-30", amount: 45.00, service: "CloudWatch", status: "processed" },

  // September 2025 - Total: $1,050.00, includes pending
  { id: "tx_066", date: "2025-09-03", amount: 255.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_067", date: "2025-09-07", amount: 118.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_068", date: "2025-09-11", amount: 192.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_069", date: "2025-09-15", amount: 72.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_070", date: "2025-09-19", amount: 135.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_071", date: "2025-09-23", amount: 25.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_072", date: "2025-09-27", amount: 188.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_073", date: "2025-09-30", amount: 65.00, service: "ElastiCache", status: "pending" },

  // October 2025 - Total: $888.00
  { id: "tx_074", date: "2025-10-02", amount: 215.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_075", date: "2025-10-06", amount: 158.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_076", date: "2025-10-10", amount: 30.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_077", date: "2025-10-14", amount: 92.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_078", date: "2025-10-18", amount: 48.00, service: "CloudWatch", status: "processed" },
  { id: "tx_079", date: "2025-10-22", amount: 112.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_080", date: "2025-10-26", amount: 178.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_081", date: "2025-10-30", amount: 55.00, service: "API Gateway", status: "processed" },

  // November 2025 - Total: $855.00
  { id: "tx_082", date: "2025-11-03", amount: 235.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_083", date: "2025-11-07", amount: 145.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_084", date: "2025-11-11", amount: 85.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_085", date: "2025-11-15", amount: 90.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_086", date: "2025-11-19", amount: 68.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_087", date: "2025-11-23", amount: 125.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_088", date: "2025-11-28", amount: 45.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_089", date: "2025-11-30", amount: 62.00, service: "ElastiCache", status: "processed" },

  // December 2025 - Total: $1,127.50, includes pending
  { id: "tx_090", date: "2025-12-02", amount: 248.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_091", date: "2025-12-05", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_092", date: "2025-12-08", amount: 172.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_093", date: "2025-12-12", amount: 98.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_094", date: "2025-12-15", amount: 45.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_095", date: "2025-12-18", amount: 52.00, service: "CloudWatch", status: "processed" },
  { id: "tx_096", date: "2025-12-21", amount: 138.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_097", date: "2025-12-24", amount: 35.00, service: "API Gateway", status: "processed" },
  { id: "tx_098", date: "2025-12-28", amount: 12.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_099", date: "2025-12-30", amount: 102.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_100", date: "2025-12-31", amount: 75.00, service: "ElastiCache", status: "processed" },

  // ============================================
  // 2026 DATA - January (current month)
  // ============================================

  // January 2026 - Month to date
  { id: "tx_101", date: "2026-01-02", amount: 195.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_102", date: "2026-01-05", amount: 165.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_103", date: "2026-01-08", amount: 82.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_104", date: "2026-01-10", amount: 45.00, service: "CloudWatch", status: "processed" },
  { id: "tx_105", date: "2026-01-12", amount: 110.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_106", date: "2026-01-15", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_107", date: "2026-01-18", amount: 58.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_108", date: "2026-01-20", amount: 180.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_109", date: "2026-01-22", amount: 75.00, service: "Storage (S3)", status: "pending" },
];

// ============================================
// Summary Statistics (for reference):
// - Data range: January 2025 - January 2026
// - Total 2025: ~$10,980
// - January 2026 MTD: ~$1,010
// - Pending charges: 2 transactions (Sep 2025: $65, Jan 2026: $75)
// - Services: EC2, RDS, S3, Lambda, CloudWatch, VPC, CloudFront, API Gateway, ElastiCache
// ============================================

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
