import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 (engine "client") bắt buộc dùng driver adapter cho MySQL/MariaDB.
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/mysql
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  let url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Thiếu DATABASE_URL trong môi trường (.env)");
  }

  // Tối ưu hóa connectionLimit và poolTimeout cho môi trường serverless (Vercel)
  if (!url.includes("connectionLimit") && !url.includes("connection_limit")) {
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}connectionLimit=3&connection_limit=3&poolTimeout=15&pool_timeout=15`;
  }

  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache client trên toàn bộ các môi trường (kể cả Production trên Vercel) để tránh tràn kết nối
globalForPrisma.prisma = prisma;
