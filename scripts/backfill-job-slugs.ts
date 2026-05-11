/**
 * Script chạy một lần: cập nhật slug cho tất cả jobs từ title.
 * Dùng sau khi chạy migration 20260511000000_add_job_slug.
 *
 * Chạy: npx tsx scripts/backfill-job-slugs.ts
 */

import { config } from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils/slugify";

// Load .env vì script chạy ngoài Next.js context
config();

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Thiếu DATABASE_URL trong .env");
  const parsed = new URL(url);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    port: parseInt(parsed.port, 10),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
    connectionLimit: 3,
  });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function main() {
  const jobs = await prisma.jobs.findMany({ select: { id: true, title: true, slug: true } });

  console.log(`Tìm thấy ${jobs.length} job cần xử lý...\n`);

  const slugMap = new Map<string, number>(); // đếm slug base đã dùng để tránh trùng

  for (const job of jobs) {
    const base = slugify(job.title);

    // Tạo slug duy nhất trong context batch này
    let candidate = base;
    const count = slugMap.get(base) ?? 0;
    if (count > 0) candidate = `${base}-${count + 1}`;
    slugMap.set(base, count + 1);

    // Nếu slug trong DB đã đúng (trùng với candidate) thì bỏ qua
    if (job.slug === candidate) {
      console.log(`  ✓ skip  [${job.id.slice(0, 8)}] "${job.title}" → slug đã đúng`);
      continue;
    }

    // Kiểm tra xem candidate có trùng với job khác trong DB không
    const existing = await prisma.jobs.findFirst({
      where: { slug: candidate, id: { not: job.id } },
      select: { id: true },
    });

    if (existing) {
      // Tìm suffix an toàn
      let suffix = 2;
      while (
        await prisma.jobs.findFirst({
          where: { slug: `${base}-${suffix}`, id: { not: job.id } },
          select: { id: true },
        })
      ) {
        suffix++;
      }
      candidate = `${base}-${suffix}`;
    }

    await prisma.jobs.update({ where: { id: job.id }, data: { slug: candidate } });
    console.log(`  ✎ update [${job.id.slice(0, 8)}] "${job.title}"`);
    console.log(`           ${job.slug}  →  ${candidate}\n`);
  }

  console.log("\nHoàn tất backfill slug.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
