import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const { id: applicationId } = await props.params;

    const [application, interviewers] = await Promise.all([
      prisma.applications.findUnique({
        where: { id: applicationId },
        include: {
          users: true,
          jobs: true,
          application_status_history: {
            include: {
              users: { select: { fullName: true, email: true } },
            },
            orderBy: { changed_at: "desc" },
          },
          interviews: {
            include: {
              interview_evaluators: {
                include: {
                  users: { select: { fullName: true, email: true } },
                },
              },
              interview_scores: {
                include: {
                  users: { select: { fullName: true, email: true } },
                },
              },
              interview_results: {
                include: {
                  users: { select: { fullName: true, email: true } },
                },
              },
            },
            orderBy: { scheduled_at: "desc" },
          },
          email_logs: {
            orderBy: { created_at: "desc" },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: { in: ["admin", "hr", "interviewer"] } },
        select: { id: true, fullName: true, email: true },
      }),
    ]);

    if (!application) {
      return jsonError(404, "Không tìm thấy đơn ứng tuyển.");
    }

    return NextResponse.json({
      success: true,
      data: { application, interviewers },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/applications/[id]] Error:", error);
    return jsonError(500, "Không thể tải thông tin đơn ứng tuyển.");
  }
}
