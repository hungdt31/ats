import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "candidate") {
    return jsonError(401, "Bạn phải đăng nhập với tư cách ứng viên để truy cập.");
  }

  try {
    const candidateId = session.user.id;

    // Get basic user info + candidate profile
    const user = await prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        candidate_profiles: true,
      },
    });

    if (!user) {
      return jsonError(404, "Không tìm thấy thông tin tài khoản.");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        profile: user.candidate_profiles,
      },
    });
  } catch (error) {
    console.error("[GET /api/candidate/profile] Error:", error);
    return jsonError(500, "Không thể tải thông tin hồ sơ cá nhân.");
  }
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || session.user.role !== "candidate") {
    return jsonError(401, "Bạn phải đăng nhập với tư cách ứng viên để thực hiện.");
  }

  try {
    const candidateId = session.user.id;
    const body = await req.json();

    const {
      fullName,
      phone,
      title,
      bio,
      location,
      years_experience,
      linkedin_url,
      github_url,
    } = body;

    // Update the core user table
    await prisma.user.update({
      where: { id: candidateId },
      data: {
        fullName: fullName || undefined,
        phone: phone || null,
      },
    });

    // Upsert candidate_profiles
    const profile = await prisma.candidate_profiles.upsert({
      where: { user_id: candidateId },
      update: {
        title: title || null,
        bio: bio || null,
        location: location || null,
        years_experience: Number(years_experience) || 0,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null,
      },
      create: {
        user_id: candidateId,
        title: title || null,
        bio: bio || null,
        location: location || null,
        years_experience: Number(years_experience) || 0,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error("[POST /api/candidate/profile] Error:", error);
    return jsonError(500, "Không thể cập nhật hồ sơ cá nhân.");
  }
}
