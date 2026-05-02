import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http/json-response";
import { storage, BUCKET_ID } from "@/lib/appwrite";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Bạn chưa đăng nhập");
  }

  const { id } = await params;

  try {
    const file = await prisma.files.findUnique({
      where: { id },
    });

    if (!file) {
      return jsonError(404, "Không tìm thấy tệp tin");
    }

    if (file.user_id !== session.user.id) {
      return jsonError(403, "Bạn không có quyền xóa tệp tin này");
    }

    // Attempt to delete from Appwrite too, if applicable
    if (file.appwrite_id && BUCKET_ID) {
      try {
        await storage.deleteFile(BUCKET_ID, file.appwrite_id);
      } catch (err) {
        console.warn("[Appwrite deleteFile warning]", err);
      }
    }

    await prisma.files.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: "Xóa tệp thành công" } });
  } catch (e) {
    console.error(`[DELETE /api/candidate/files/${id}]`, e);
    return jsonError(500, "Lỗi máy chủ khi xóa tệp tin");
  }
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Bạn chưa đăng nhập");
  }

  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const { file_name, file_type } = body;
  if (!file_name) {
    return jsonError(400, "Tên file không được để trống");
  }

  try {
    const file = await prisma.files.findUnique({
      where: { id },
    });

    if (!file) {
      return jsonError(404, "Không tìm thấy tệp tin");
    }

    if (file.user_id !== session.user.id) {
      return jsonError(403, "Bạn không có quyền sửa tệp tin này");
    }

    const updated = await prisma.files.update({
      where: { id },
      data: {
        file_name,
        file_type: file_type || file.file_type,
      },
    });

    return NextResponse.json({ success: true, data: { file: updated } });
  } catch (e) {
    console.error(`[PUT /api/candidate/files/${id}]`, e);
    return jsonError(500, "Lỗi máy chủ khi sửa tệp tin");
  }
}
