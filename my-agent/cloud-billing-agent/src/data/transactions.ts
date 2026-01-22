export interface BillingTransaction {
  id: string;
  date: string;
  amount: number;
  service: string;
  status: "processed" | "pending";
}

export const transactions: BillingTransaction[] = [
  // ============================================
  // 2024 DATA
  // ============================================

  // January 2024 - Total: $507.50 (for "last month" validation)
  { id: "tx_101", date: "2024-01-03", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_102", date: "2024-01-05", amount: 45.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_103", date: "2024-01-08", amount: 12.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_104", date: "2024-01-12", amount: 300.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_105", date: "2024-01-15", amount: 85.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_106", date: "2024-01-18", amount: 42.00, service: "CloudWatch", status: "processed" },
  { id: "tx_107", date: "2024-01-22", amount: 120.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_108", date: "2024-01-25", amount: 35.00, service: "API Gateway", status: "processed" },
  { id: "tx_109", date: "2024-01-28", amount: 68.00, service: "Storage (S3)", status: "processed" },

  // February 2024
  { id: "tx_110", date: "2024-02-02", amount: 175.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_111", date: "2024-02-05", amount: 92.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_112", date: "2024-02-08", amount: 28.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_113", date: "2024-02-14", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_114", date: "2024-02-17", amount: 55.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_115", date: "2024-02-20", amount: 75.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_116", date: "2024-02-23", amount: 38.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_117", date: "2024-02-28", amount: 50.00, service: "Storage (S3)", status: "pending" },

  // March 2024
  { id: "tx_118", date: "2024-03-03", amount: 165.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_119", date: "2024-03-06", amount: 125.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_120", date: "2024-03-10", amount: 45.00, service: "ElastiCache", status: "processed" },
  { id: "tx_121", date: "2024-03-14", amount: 88.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_122", date: "2024-03-18", amount: 32.00, service: "CloudWatch", status: "processed" },
  { id: "tx_123", date: "2024-03-22", amount: 110.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_124", date: "2024-03-26", amount: 22.00, service: "API Gateway", status: "processed" },
  { id: "tx_125", date: "2024-03-30", amount: 195.00, service: "Compute (EC2)", status: "processed" },

  // April 2024
  { id: "tx_126", date: "2024-04-02", amount: 89.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_127", date: "2024-04-05", amount: 52.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_128", date: "2024-04-09", amount: 140.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_129", date: "2024-04-12", amount: 28.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_130", date: "2024-04-15", amount: 95.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_131", date: "2024-04-19", amount: 18.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_132", date: "2024-04-23", amount: 220.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_133", date: "2024-04-27", amount: 67.00, service: "Storage (S3)", status: "processed" },

  // May 2024
  { id: "tx_134", date: "2024-05-01", amount: 185.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_135", date: "2024-05-04", amount: 67.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_136", date: "2024-05-08", amount: 115.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_137", date: "2024-05-12", amount: 42.00, service: "ElastiCache", status: "processed" },
  { id: "tx_138", date: "2024-05-16", amount: 78.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_139", date: "2024-05-20", amount: 25.00, service: "API Gateway", status: "processed" },
  { id: "tx_140", date: "2024-05-24", amount: 155.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_141", date: "2024-05-28", amount: 38.00, service: "CloudWatch", status: "processed" },

  // June 2024
  { id: "tx_142", date: "2024-06-02", amount: 145.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_143", date: "2024-06-06", amount: 198.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_144", date: "2024-06-10", amount: 72.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_145", date: "2024-06-14", amount: 35.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_146", date: "2024-06-18", amount: 88.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_147", date: "2024-06-22", amount: 15.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_148", date: "2024-06-26", amount: 210.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_149", date: "2024-06-30", amount: 55.00, service: "ElastiCache", status: "processed" },

  // July 2024
  { id: "tx_150", date: "2024-07-03", amount: 178.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_151", date: "2024-07-08", amount: 32.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_152", date: "2024-07-11", amount: 142.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_153", date: "2024-07-15", amount: 65.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_154", date: "2024-07-19", amount: 95.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_155", date: "2024-07-23", amount: 28.00, service: "API Gateway", status: "processed" },
  { id: "tx_156", date: "2024-07-27", amount: 185.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_157", date: "2024-07-31", amount: 48.00, service: "CloudWatch", status: "processed" },

  // August 2024
  { id: "tx_158", date: "2024-08-02", amount: 210.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_159", date: "2024-08-06", amount: 82.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_160", date: "2024-08-10", amount: 165.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_161", date: "2024-08-14", amount: 42.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_162", date: "2024-08-18", amount: 72.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_163", date: "2024-08-22", amount: 25.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_164", date: "2024-08-26", amount: 135.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_165", date: "2024-08-30", amount: 58.00, service: "ElastiCache", status: "processed" },

  // September 2024
  { id: "tx_166", date: "2024-09-03", amount: 192.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_167", date: "2024-09-07", amount: 55.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_168", date: "2024-09-11", amount: 168.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_169", date: "2024-09-15", amount: 38.00, service: "CloudWatch", status: "processed" },
  { id: "tx_170", date: "2024-09-18", amount: 105.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_171", date: "2024-09-22", amount: 22.00, service: "API Gateway", status: "processed" },
  { id: "tx_172", date: "2024-09-26", amount: 175.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_173", date: "2024-09-30", amount: 45.00, service: "Storage (S3)", status: "pending" },

  // October 2024
  { id: "tx_174", date: "2024-10-02", amount: 180.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_175", date: "2024-10-05", amount: 225.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_176", date: "2024-10-09", amount: 78.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_177", date: "2024-10-13", amount: 52.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_178", date: "2024-10-17", amount: 88.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_179", date: "2024-10-21", amount: 18.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_180", date: "2024-10-25", amount: 145.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_181", date: "2024-10-29", amount: 62.00, service: "ElastiCache", status: "processed" },

  // November 2024
  { id: "tx_182", date: "2024-11-02", amount: 198.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_183", date: "2024-11-06", amount: 95.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_184", date: "2024-11-10", amount: 68.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_185", date: "2024-11-14", amount: 115.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_186", date: "2024-11-18", amount: 32.00, service: "API Gateway", status: "processed" },
  { id: "tx_187", date: "2024-11-22", amount: 185.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_188", date: "2024-11-26", amount: 42.00, service: "CloudWatch", status: "processed" },
  { id: "tx_189", date: "2024-11-30", amount: 155.00, service: "Compute (EC2)", status: "processed" },

  // December 2024
  { id: "tx_190", date: "2024-12-03", amount: 42.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_191", date: "2024-12-07", amount: 212.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_192", date: "2024-12-11", amount: 135.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_193", date: "2024-12-15", amount: 85.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_194", date: "2024-12-18", amount: 48.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_195", date: "2024-12-20", amount: 92.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_196", date: "2024-12-24", amount: 28.00, service: "API Gateway", status: "processed" },
  { id: "tx_197", date: "2024-12-28", amount: 165.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_198", date: "2024-12-31", amount: 75.00, service: "ElastiCache", status: "pending" },

  // ============================================
  // 2025 DATA
  // ============================================

  // January 2025
  { id: "tx_201", date: "2025-01-02", amount: 188.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_202", date: "2025-01-05", amount: 142.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_203", date: "2025-01-08", amount: 62.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_204", date: "2025-01-12", amount: 35.00, service: "CloudWatch", status: "processed" },
  { id: "tx_205", date: "2025-01-15", amount: 98.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_206", date: "2025-01-18", amount: 25.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_207", date: "2025-01-22", amount: 175.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_208", date: "2025-01-26", amount: 52.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_209", date: "2025-01-30", amount: 118.00, service: "Database (RDS)", status: "processed" },

  // February 2025
  { id: "tx_210", date: "2025-02-02", amount: 205.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_211", date: "2025-02-06", amount: 78.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_212", date: "2025-02-10", amount: 165.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_213", date: "2025-02-14", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_214", date: "2025-02-17", amount: 85.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_215", date: "2025-02-20", amount: 60.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_216", date: "2025-02-24", amount: 42.00, service: "API Gateway", status: "processed" },
  { id: "tx_217", date: "2025-02-28", amount: 138.00, service: "Compute (EC2)", status: "processed" },

  // March 2025
  { id: "tx_218", date: "2025-03-03", amount: 195.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_219", date: "2025-03-07", amount: 125.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_220", date: "2025-03-11", amount: 55.00, service: "ElastiCache", status: "processed" },
  { id: "tx_221", date: "2025-03-15", amount: 72.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_222", date: "2025-03-19", amount: 38.00, service: "CloudWatch", status: "processed" },
  { id: "tx_223", date: "2025-03-23", amount: 105.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_224", date: "2025-03-27", amount: 28.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_225", date: "2025-03-31", amount: 168.00, service: "Compute (EC2)", status: "processed" },

  // April 2025
  { id: "tx_226", date: "2025-04-02", amount: 148.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_227", date: "2025-04-06", amount: 82.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_228", date: "2025-04-10", amount: 215.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_229", date: "2025-04-14", amount: 45.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_230", date: "2025-04-18", amount: 92.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_231", date: "2025-04-22", amount: 22.00, service: "API Gateway", status: "processed" },
  { id: "tx_232", date: "2025-04-26", amount: 175.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_233", date: "2025-04-30", amount: 58.00, service: "ElastiCache", status: "processed" },

  // May 2025
  { id: "tx_234", date: "2025-05-03", amount: 228.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_235", date: "2025-05-07", amount: 95.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_236", date: "2025-05-11", amount: 162.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_237", date: "2025-05-15", amount: 48.00, service: "CloudWatch", status: "processed" },
  { id: "tx_238", date: "2025-05-19", amount: 115.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_239", date: "2025-05-23", amount: 32.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_240", date: "2025-05-27", amount: 185.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_241", date: "2025-05-31", amount: 68.00, service: "CloudFront (CDN)", status: "pending" },

  // June 2025
  { id: "tx_242", date: "2025-06-02", amount: 198.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_243", date: "2025-06-06", amount: 145.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_244", date: "2025-06-10", amount: 75.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_245", date: "2025-06-14", amount: 52.00, service: "ElastiCache", status: "processed" },
  { id: "tx_246", date: "2025-06-18", amount: 88.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_247", date: "2025-06-22", amount: 35.00, service: "API Gateway", status: "processed" },
  { id: "tx_248", date: "2025-06-26", amount: 210.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_249", date: "2025-06-30", amount: 128.00, service: "Database (RDS)", status: "processed" },

  // July 2025
  { id: "tx_250", date: "2025-07-03", amount: 242.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_251", date: "2025-07-07", amount: 88.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_252", date: "2025-07-11", amount: 175.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_253", date: "2025-07-15", amount: 42.00, service: "CloudWatch", status: "processed" },
  { id: "tx_254", date: "2025-07-19", amount: 125.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_255", date: "2025-07-23", amount: 28.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_256", date: "2025-07-27", amount: 195.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_257", date: "2025-07-31", amount: 62.00, service: "CloudFront (CDN)", status: "processed" },

  // August 2025
  { id: "tx_258", date: "2025-08-02", amount: 185.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_259", date: "2025-08-06", amount: 105.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_260", date: "2025-08-10", amount: 225.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_261", date: "2025-08-14", amount: 58.00, service: "ElastiCache", status: "processed" },
  { id: "tx_262", date: "2025-08-18", amount: 98.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_263", date: "2025-08-22", amount: 38.00, service: "API Gateway", status: "processed" },
  { id: "tx_264", date: "2025-08-26", amount: 168.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_265", date: "2025-08-30", amount: 45.00, service: "CloudWatch", status: "processed" },

  // September 2025
  { id: "tx_266", date: "2025-09-03", amount: 255.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_267", date: "2025-09-07", amount: 118.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_268", date: "2025-09-11", amount: 192.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_269", date: "2025-09-15", amount: 72.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_270", date: "2025-09-19", amount: 135.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_271", date: "2025-09-23", amount: 25.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_272", date: "2025-09-27", amount: 188.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_273", date: "2025-09-30", amount: 65.00, service: "ElastiCache", status: "pending" },

  // October 2025
  { id: "tx_274", date: "2025-10-02", amount: 215.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_275", date: "2025-10-06", amount: 158.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_276", date: "2025-10-10", amount: 30.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_277", date: "2025-10-14", amount: 92.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_278", date: "2025-10-18", amount: 48.00, service: "CloudWatch", status: "processed" },
  { id: "tx_279", date: "2025-10-22", amount: 112.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_280", date: "2025-10-26", amount: 178.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_281", date: "2025-10-30", amount: 55.00, service: "API Gateway", status: "processed" },

  // November 2025
  { id: "tx_282", date: "2025-11-03", amount: 235.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_283", date: "2025-11-07", amount: 145.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_284", date: "2025-11-11", amount: 85.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_285", date: "2025-11-15", amount: 90.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_286", date: "2025-11-19", amount: 68.00, service: "CloudFront (CDN)", status: "processed" },
  { id: "tx_287", date: "2025-11-23", amount: 125.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_288", date: "2025-11-28", amount: 45.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_289", date: "2025-11-30", amount: 62.00, service: "ElastiCache", status: "processed" },

  // December 2025 - Total: $507.50 (for validation)
  { id: "tx_290", date: "2025-12-02", amount: 248.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_291", date: "2025-12-05", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_292", date: "2025-12-08", amount: 172.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_293", date: "2025-12-10", amount: 300.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_294", date: "2025-12-12", amount: 98.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_295", date: "2025-12-15", amount: 45.50, service: "Storage (S3)", status: "processed" },
  { id: "tx_296", date: "2025-12-18", amount: 52.00, service: "CloudWatch", status: "processed" },
  { id: "tx_297", date: "2025-12-21", amount: 138.00, service: "Lambda Functions", status: "processed" },
  { id: "tx_298", date: "2025-12-24", amount: 35.00, service: "API Gateway", status: "processed" },
  { id: "tx_299", date: "2025-12-28", amount: 12.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_300", date: "2025-12-31", amount: 195.00, service: "Compute (EC2)", status: "pending" },

  // ============================================
  // 2026 DATA
  // ============================================

  // January 2026 - EC2 Total: $150.00, Pending: $50.00 (for validation)
  { id: "tx_301", date: "2026-01-02", amount: 150.00, service: "Compute (EC2)", status: "processed" },
  { id: "tx_302", date: "2026-01-04", amount: 165.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_303", date: "2026-01-07", amount: 82.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_304", date: "2026-01-10", amount: 50.00, service: "Storage (S3)", status: "pending" },
  { id: "tx_305", date: "2026-01-12", amount: 48.00, service: "CloudWatch", status: "processed" },
  { id: "tx_306", date: "2026-01-15", amount: 100.00, service: "Database (RDS)", status: "processed" },
  { id: "tx_307", date: "2026-01-18", amount: 65.00, service: "Networking (VPC)", status: "processed" },
  { id: "tx_308", date: "2026-01-20", amount: 85.00, service: "Storage (S3)", status: "processed" },
  { id: "tx_309", date: "2026-01-22", amount: 118.00, service: "Lambda Functions", status: "processed" },
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
