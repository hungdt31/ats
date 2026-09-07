import "dotenv/config";
import * as bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Thiếu DATABASE_URL trong .env");
  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 12);
  
  const usersToCreate = [
    { email: "admin2@ats.local", fullName: "Admin 2", role: "admin" as const },
    { email: "hr2@ats.local", fullName: "HR Manager 2", role: "hr" as const },
    { email: "interviewer2@ats.local", fullName: "Interviewer 2", role: "interviewer" as const },
  ];

  console.log("Đang tạo thêm tài khoản...");

  for (const u of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        role: u.role,
        isActive: true,
        passwordHash,
        provider: "local",
      },
      create: {
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        isActive: true,
        passwordHash,
        provider: "local",
      },
    });
    console.log(`- Đã lưu: ${user.email} (role: ${user.role}, password: Password@123)`);
  }

  console.log("Hoàn tất tạo tài khoản!");
}

main()
  .catch((e) => {
    console.error("Lỗi khi chạy script:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
