import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/db";
import { jsonError } from "../../../../lib/http/json-response";
import { registerSchema } from "../../../../lib/validators/auth";

/**
 * Đăng ký user mới — role mặc định `candidate`, provider `local`.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Dữ liệu không hợp lệ", parsed.error.flatten().fieldErrors);
  }

  const { email, password, fullName, phone: phoneRaw } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return jsonError(409, "Email đã được đăng ký");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const phone = phoneRaw?.trim() ? phoneRaw.trim() : undefined;

  try {
    await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        phone: phone ?? null,
        role: "candidate",
        provider: "local",
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "Email đã được đăng ký");
    }
    throw e;
  }

  return NextResponse.json(
    { success: true, data: { message: "Đăng ký thành công" } } as const,
    { status: 201 }
  );
}
