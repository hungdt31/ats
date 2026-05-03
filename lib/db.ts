import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Thiếu DATABASE_URL trong môi trường (.env)");
  }

  // Parse URL để kiểm soát từng tham số kết nối
  const parsed = new URL(url);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    port: parseInt(parsed.port, 10),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace(/^\//, ""),
    // Aiven dùng CA cert riêng → bỏ qua verify để tránh SSL handshake timeout
    ssl: { rejectUnauthorized: false },
    connectionLimit: 3,
    connectTimeout: 10000,
    acquireTimeout: 15000,
    idleTimeout: 60,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
