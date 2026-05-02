import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http/json-response";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Bạn chưa đăng nhập");
  }

  try {
    const files = await prisma.files.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: { files } });
  } catch (e) {
    console.error("[GET /api/candidate/files]", e);
    return jsonError(500, "Lỗi máy chủ khi lấy danh sách tệp tin");
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Bạn chưa đăng nhập");
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const { file_name, file_url, file_type, appwrite_id } = body;
  if (!file_name || !file_url) {
    return jsonError(400, "Vui lòng nhập đầy đủ tên tệp và link tệp");
  }

  try {
    const file = await prisma.files.create({
      data: {
        user_id: session.user.id,
        file_name,
        file_url,
        file_type: file_type || "cv",
        appwrite_id: appwrite_id || null,
      },
    });

    return NextResponse.json({ success: true, data: { file } }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/candidate/files]", e);
    return jsonError(500, "Lỗi máy chủ khi tạo mới tệp tin");
  }
}
