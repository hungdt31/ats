import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { job_channels_channel, job_channels_status } from "@prisma/client";

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

    const { channel, external_url, external_id, status } = body;

    if (!channel || !status) {
      return jsonError(400, "Vui lòng nhập đầy đủ channel và trạng thái.");
    }

    const jobChannel = await prisma.job_channels.upsert({
      where: {
        job_id_channel: {
          job_id: jobId,
          channel: channel as job_channels_channel,
        },
      },
      update: {
        external_url: external_url || null,
        external_id: external_id || null,
        status: status as job_channels_status,
      },
      create: {
        job_id: jobId,
        channel: channel as job_channels_channel,
        external_url: external_url || null,
        external_id: external_id || null,
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
