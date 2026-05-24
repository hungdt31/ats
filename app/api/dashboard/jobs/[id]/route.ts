import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { jobs_status } from "@prisma/client";
import { uniqueSlug } from "@/lib/utils/slugify";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;

    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng.");
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/jobs/[id]] Error:", error);
    return jsonError(500, "Không thể tải tin tuyển dụng.");
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr" && session.user.role !== "interviewer")) {
    return jsonError(401, "Bạn không có quyền cập nhật tin tuyển dụng.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;
    const body = await request.json();

    const existingJob = await prisma.jobs.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!existingJob) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng.");
    }

    // Nếu không phải Admin, và tin tuyển dụng không phải là Draft hoặc Pending, cấm cập nhật
    const existingStatus: string = existingJob.status;
    if (session.user.role !== "admin" && existingStatus !== "draft" && existingStatus !== "pending") {
      return jsonError(403, "Bạn không có quyền sửa đổi tin tuyển dụng đã phê duyệt hoặc đóng.");
    }

    const {
      title,
      description,
      requirements,
      benefits,
      location,
      department,
      salary_min,
      salary_max,
      employment_type,
      required_skills,
      headcount,
      status,
      expires_at,
    } = body;

    if (!title || !description) {
      return jsonError(400, "Vui lòng nhập đầy đủ tiêu đề và mô tả công việc.");
    }

    // Tái sinh slug khi title thay đổi (bỏ qua slug hiện tại của chính job này)
    const slug = await uniqueSlug(title, async (s) => {
      const existing = await prisma.jobs.findUnique({ where: { slug: s }, select: { id: true } });
      return !!existing && existing.id !== jobId;
    });

    // Chỉ Admin mới được chọn các trạng thái khác, HR/Interviewer cập nhật chỉ được chọn draft hoặc pending
    let finalStatus: string = status || existingJob.status;
    if (session.user.role !== "admin") {
      if (finalStatus !== "draft" && finalStatus !== "pending") {
        finalStatus = "pending";
      }
    }

    const updateData: any = {
      title,
      slug,
      description,
      requirements: requirements || null,
      benefits: benefits || null,
      location: location || null,
      department: department || null,
      salary_min: salary_min ? parseInt(salary_min, 10) : null,
      salary_max: salary_max ? parseInt(salary_max, 10) : null,
      employment_type: employment_type || "full_time",
      required_skills: required_skills ? (required_skills as any) : undefined,
      headcount: headcount ? parseInt(headcount, 10) : 1,
      status: finalStatus as jobs_status,
      expires_at: expires_at ? new Date(expires_at) : null,
    };

    if (finalStatus === "active" && existingJob.status !== "active") {
      updateData.published_at = new Date();
    } else if (finalStatus !== "active" && finalStatus !== "pending") {
      // Nếu chuyển hẳn sang draft/closed/archived (không phải pending), clear published_at
      updateData.published_at = null;
    }

    const job = await prisma.jobs.update({
      where: { id: jobId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("[PUT /api/dashboard/jobs/[id]] Error:", error);
    return jsonError(500, "Không thể cập nhật tin tuyển dụng.");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr" && session.user.role !== "interviewer")) {
    return jsonError(401, "Bạn không có quyền xóa tin tuyển dụng.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;

    const existingJob = await prisma.jobs.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!existingJob) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng.");
    }

    // Phân quyền xóa:
    // Admin có thể xóa hết công việc.
    // Các role còn lại chỉ xóa được các công việc nháp (draft), đang duyệt (pending)
    const existingStatus: string = existingJob.status;
    if (session.user.role !== "admin") {
      if (existingStatus !== "draft" && existingStatus !== "pending") {
        return jsonError(403, "Bạn chỉ được phép xóa tin tuyển dụng ở trạng thái Nháp hoặc Chờ duyệt.");
      }
    }

    // Thực hiện dọn dẹp các liên kết trong $transaction
    await prisma.$transaction(async (tx) => {
      // 1. Tìm các applications liên quan đến job
      const apps = await tx.applications.findMany({
        where: { job_id: jobId },
        select: { id: true },
      });
      const appIds = apps.map((a) => a.id);

      if (appIds.length > 0) {
        // 2. Xóa interview_scores của các interviews thuộc applications
        const interviews = await tx.interviews.findMany({
          where: { application_id: { in: appIds } },
          select: { id: true },
        });
        const interviewIds = interviews.map((i) => i.id);

        if (interviewIds.length > 0) {
          await tx.interview_scores.deleteMany({
            where: { interview_id: { in: interviewIds } },
          });
        }

        // 3. Xóa interviews
        await tx.interviews.deleteMany({
          where: { application_id: { in: appIds } },
        });

        // 4. Xóa email_logs
        await tx.email_logs.deleteMany({
          where: { application_id: { in: appIds } },
        });

        // 5. Xóa application_status_history
        await tx.application_status_history.deleteMany({
          where: { application_id: { in: appIds } },
        });

        // 6. Xóa applications
        await tx.applications.deleteMany({
          where: { job_id: jobId },
        });
      }

      // 7. Xóa job_channels
      await tx.job_channels.deleteMany({
        where: { job_id: jobId },
      });

      // 8. Xóa job chính
      await tx.jobs.delete({
        where: { id: jobId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa tin tuyển dụng thành công.",
    });
  } catch (error) {
    console.error("[DELETE /api/dashboard/jobs/[id]] Error:", error);
    return jsonError(500, "Không thể xóa tin tuyển dụng.");
  }
}
