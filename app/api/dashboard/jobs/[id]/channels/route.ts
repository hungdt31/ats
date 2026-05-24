import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { job_channels_channel, job_channels_status } from "@prisma/client";
import { upsertJobChannelSchema } from "@/lib/validators/job-channels";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;

    const channels = await prisma.job_channels.findMany({
      where: { job_id: jobId },
    });

    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      select: { title: true },
    });

    return NextResponse.json({
      success: true,
      data: { channels, job },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/jobs/[id]/channels] Error:", error);
    return jsonError(500, "Không thể tải danh sách channels.");
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền cập nhật channels.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;
    const body = await request.json();
    const parsed = upsertJobChannelSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
      return jsonError(422, first, parsed.error.flatten().fieldErrors);
    }

    const { channel, status, external_url, external_id } = parsed.data;

    const jobChannel = await prisma.job_channels.upsert({
      where: {
        job_id_channel: {
          job_id: jobId,
          channel: channel as job_channels_channel,
        },
      },
      update: {
        external_url,
        external_id,
        status: status as job_channels_status,
      },
      create: {
        job_id: jobId,
        channel: channel as job_channels_channel,
        external_url,
        external_id,
        status: status as job_channels_status,
      },
    });

    return NextResponse.json({
      success: true,
      data: jobChannel,
    });
  } catch (error) {
    console.error("[POST /api/dashboard/jobs/[id]/channels] Error:", error);
    return jsonError(500, "Không thể lưu thông tin channel.");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền cập nhật channels.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel");

    if (!channel) {
      return jsonError(400, "Thiếu thông tin kênh cần xóa.");
    }

    await prisma.job_channels.delete({
      where: {
        job_id_channel: {
          job_id: jobId,
          channel: channel as job_channels_channel,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa kênh tuyển dụng thành công.",
    });
  } catch (error) {
    console.error("[DELETE /api/dashboard/jobs/[id]/channels] Error:", error);
    return jsonError(500, "Không thể xóa kênh tuyển dụng.");
  }
}

