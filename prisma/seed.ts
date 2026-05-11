import "dotenv/config";

import * as bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils/slugify";

/**
 * Prisma 7 yêu cầu driver adapter khi instantiate PrismaClient.
 * Seed này tạo dữ liệu mẫu đủ để test landing `/`, `/jobs`, auth + pipeline ATS cơ bản.
 */
function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Thiếu DATABASE_URL trong .env");
  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 12);

  // Users (upsert theo email để chạy seed nhiều lần an toàn)
  const admin = await prisma.user.upsert({
    where: { email: "admin@ats.local" },
    update: { fullName: "Admin", role: "admin", isActive: true, passwordHash, provider: "local" },
    create: { email: "admin@ats.local", fullName: "Admin", role: "admin", isActive: true, passwordHash, provider: "local" },
  });

  const hr = await prisma.user.upsert({
    where: { email: "hr@ats.local" },
    update: { fullName: "HR Manager", role: "hr", isActive: true, passwordHash, provider: "local" },
    create: { email: "hr@ats.local", fullName: "HR Manager", role: "hr", isActive: true, passwordHash, provider: "local" },
  });

  const interviewer = await prisma.user.upsert({
    where: { email: "interviewer@ats.local" },
    update: { fullName: "Interviewer", role: "interviewer", isActive: true, passwordHash, provider: "local" },
    create: { email: "interviewer@ats.local", fullName: "Interviewer", role: "interviewer", isActive: true, passwordHash, provider: "local" },
  });

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@ats.local" },
    update: { fullName: "Ứng viên Demo", role: "candidate", isActive: true, passwordHash, provider: "local" },
    create: { email: "candidate@ats.local", fullName: "Ứng viên Demo", role: "candidate", isActive: true, passwordHash, provider: "local" },
  });

  // Candidate profile (1-1)
  await prisma.candidate_profiles.upsert({
    where: { user_id: candidate.id },
    update: {
      title: "Fullstack Engineer",
      location: "Hà Nội",
      years_experience: 3,
      skills: ["Next.js", "TypeScript", "Prisma", "MySQL"],
      education: [{ degree: "Cử nhân CNTT", school: "ĐH Bách Khoa", graduation_year: 2022 }],
      linkedin_url: "https://www.linkedin.com/",
      github_url: "https://github.com/",
    },
    create: {
      user_id: candidate.id,
      title: "Fullstack Engineer",
      location: "Hà Nội",
      years_experience: 3,
      skills: ["Next.js", "TypeScript", "Prisma", "MySQL"],
      education: [{ degree: "Cử nhân CNTT", school: "ĐH Bách Khoa", graduation_year: 2022 }],
      linkedin_url: "https://www.linkedin.com/",
      github_url: "https://github.com/",
    },
  });

  // Jobs
  const now = new Date();
  const job1Title = "Senior Backend Engineer (Node.js)";
  const job1 = await prisma.jobs.create({
    data: {
      created_by: hr.id,
      title: job1Title,
      slug: slugify(job1Title),
      description: "Xây dựng API hiệu năng cao cho hệ thống ATS.\n\n- Node.js/TypeScript\n- Prisma/MySQL\n- Clean Architecture",
      requirements: "- 3+ năm kinh nghiệm\n- Có kinh nghiệm với Next.js/Node.js\n- Biết CI/CD là lợi thế",
      benefits:
        "- Thưởng hiệu suất theo quý\n- Bảo hiểm sức khỏe mở rộng\n- 14 ngày phép/năm\n- Hỗ trợ học tập 10 triệu/năm",
      location: "Hà Nội",
      department: "Engineering",
      category: "Backend",
      salary_min: 35000000,
      salary_max: 60000000,
      employment_type: "full_time",
      required_skills: ["Node.js", "TypeScript", "MySQL", "Prisma"],
      headcount: 2,
      status: "active",
      published_at: now,
    },
  });

  const job2Title = "Frontend Engineer (React/Next.js)";
  const job2 = await prisma.jobs.create({
    data: {
      created_by: hr.id,
      title: job2Title,
      slug: slugify(job2Title),
      description: "Phát triển UI/UX cho portal tuyển dụng.\n\n- Next.js App Router\n- Tailwind + shadcn/ui\n- React Hook Form + Zod",
      requirements: "- 2+ năm React\n- Biết tối ưu performance\n- Biết design system là lợi thế",
      benefits:
        "- Môi trường hybrid linh hoạt\n- MacBook và màn hình rời\n- Company trip hàng năm\n- Review lương 2 lần/năm",
      location: "Hồ Chí Minh",
      department: "Engineering",
      category: "Frontend",
      salary_min: 25000000,
      salary_max: 45000000,
      employment_type: "full_time",
      required_skills: ["React", "Next.js", "TailwindCSS"],
      headcount: 1,
      status: "active",
      published_at: now,
    },
  });

  // Thêm 8 job active để đủ tổng 10 jobs demo
  const extraJobs = await prisma.jobs.createMany({
    data: [
      {
        created_by: hr.id,
        title: "QA Engineer (Manual/Automation)",
        slug: slugify("QA Engineer (Manual/Automation)"),
        description: "Đảm bảo chất lượng hệ thống ATS qua test plan, test case và automation.",
        requirements: "- 2+ năm QA\n- Biết API testing\n- Ưu tiên có automation",
        benefits: "- Bảo hiểm full lương\n- Hỗ trợ chứng chỉ ISTQB",
        location: "Đà Nẵng",
        department: "Engineering",
        category: "QA",
        salary_min: 18000000,
        salary_max: 32000000,
        employment_type: "full_time",
        required_skills: ["Testing", "Postman", "Playwright"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "DevOps Engineer (AWS)",
        slug: slugify("DevOps Engineer (AWS)"),
        description: "Thiết kế hạ tầng cloud, CI/CD và tối ưu hiệu năng hệ thống.",
        requirements: "- Kinh nghiệm AWS\n- Docker/K8s\n- CI/CD",
        benefits: "- On-call allowance\n- Làm việc hybrid",
        location: "Hà Nội",
        department: "Engineering",
        category: "DevOps",
        salary_min: 35000000,
        salary_max: 55000000,
        employment_type: "full_time",
        required_skills: ["AWS", "Docker", "Kubernetes", "GitHub Actions"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "Product Designer (UI/UX)",
        slug: slugify("Product Designer (UI/UX)"),
        description: "Thiết kế trải nghiệm người dùng cho portal tuyển dụng và dashboard nội bộ.",
        requirements: "- Thành thạo Figma\n- Tư duy UX\n- Có portfolio",
        benefits: "- Work from home 2 ngày/tuần\n- Quỹ học tập",
        location: "Hồ Chí Minh",
        department: "Product",
        category: "Design",
        salary_min: 22000000,
        salary_max: 40000000,
        employment_type: "full_time",
        required_skills: ["Figma", "Design System", "UX Research"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "Data Analyst (Recruitment)",
        slug: slugify("Data Analyst (Recruitment)"),
        description: "Phân tích dữ liệu tuyển dụng, xây dashboard KPI và tối ưu funnel tuyển dụng.",
        requirements: "- SQL tốt\n- Kinh nghiệm BI\n- Tư duy số liệu",
        benefits: "- Flexible time\n- Performance bonus",
        location: "Hà Nội",
        department: "Data",
        category: "Analytics",
        salary_min: 20000000,
        salary_max: 38000000,
        employment_type: "full_time",
        required_skills: ["SQL", "Power BI", "Python"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "Technical Recruiter",
        slug: slugify("Technical Recruiter"),
        description: "Phụ trách sourcing, screening và phối hợp team kỹ thuật trong tuyển dụng.",
        requirements: "- Kinh nghiệm tuyển IT\n- Giao tiếp tốt",
        benefits: "- KPI bonus theo tháng\n- Team building",
        location: "Hồ Chí Minh",
        department: "HR",
        category: "Recruitment",
        salary_min: 18000000,
        salary_max: 30000000,
        employment_type: "full_time",
        required_skills: ["Sourcing", "Interview", "Recruitment"],
        headcount: 2,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "Project Manager (Software)",
        slug: slugify("Project Manager (Software)"),
        description: "Quản lý tiến độ dự án ATS, điều phối team kỹ thuật và stakeholder.",
        requirements: "- 3+ năm PM\n- Agile/Scrum\n- Risk management",
        benefits: "- Review lương định kỳ\n- Bảo hiểm sức khỏe cao cấp",
        location: "Đà Nẵng",
        department: "Project",
        category: "Management",
        salary_min: 30000000,
        salary_max: 50000000,
        employment_type: "full_time",
        required_skills: ["Agile", "Scrum", "Communication"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "Part-time Content Marketing",
        slug: slugify("Part-time Content Marketing"),
        description: "Sản xuất nội dung tuyển dụng, truyền thông thương hiệu nhà tuyển dụng.",
        requirements: "- Viết tốt\n- Hiểu social media\n- Có tư duy sáng tạo",
        benefits: "- Làm việc linh hoạt\n- Hỗ trợ công cụ làm việc",
        location: "Remote",
        department: "Marketing",
        category: "Content",
        salary_min: 8000000,
        salary_max: 15000000,
        employment_type: "part_time",
        required_skills: ["Content Writing", "Social Media"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
      {
        created_by: hr.id,
        title: "Contract Mobile Developer (React Native)",
        slug: slugify("Contract Mobile Developer (React Native)"),
        description: "Phát triển app mobile cho candidate portal theo hợp đồng 6 tháng.",
        requirements: "- React Native\n- Kinh nghiệm release app\n- API integration",
        benefits: "- Hợp đồng rõ ràng\n- Thanh toán đúng hạn",
        location: "Hà Nội",
        department: "Engineering",
        category: "Mobile",
        salary_min: 25000000,
        salary_max: 45000000,
        employment_type: "contract",
        required_skills: ["React Native", "TypeScript", "REST API"],
        headcount: 1,
        status: "active",
        published_at: now,
      },
    ],
  });
  console.log(`Created extra jobs: ${extraJobs.count}`);

  // Channels
  await prisma.job_channels.createMany({
    data: [
      { job_id: job1.id, channel: "website", status: "posted", posted_at: now, external_url: `/jobs/${job1.slug}` },
      { job_id: job1.id, channel: "linkedin", status: "pending" },
      { job_id: job2.id, channel: "website", status: "posted", posted_at: now, external_url: `/jobs/${job2.slug}` },
    ],
    skipDuplicates: true,
  });

  // Application (candidate apply job1)
  const app = await prisma.applications.upsert({
    where: { job_id_candidate_id: { job_id: job1.id, candidate_id: candidate.id } },
    update: { status: "screening", cv_file_url: "https://example.com/cv.pdf", cv_filename: "cv-demo.pdf" },
    create: {
      job_id: job1.id,
      candidate_id: candidate.id,
      cv_file_url: "https://example.com/cv.pdf",
      cv_filename: "cv-demo.pdf",
      cover_letter: "Em quan tâm vị trí này và mong muốn trao đổi thêm.",
      status: "screening",
      source_channel: "website",
    },
  });

  // Status history (manual seed, vì trigger ở DB có thể có/không)
  await prisma.application_status_history.createMany({
    data: [
      {
        application_id: app.id,
        changed_by: candidate.id,
        from_status: null,
        to_status: "applied",
        note: "Nộp đơn",
      },
      {
        application_id: app.id,
        changed_by: hr.id,
        from_status: "applied",
        to_status: "screening",
        note: "Sàng lọc hồ sơ",
      },
    ],
    skipDuplicates: true,
  });

  // Interview
  const interview = await prisma.interviews.create({
    data: {
      application_id: app.id,
      interviewer_id: interviewer.id,
      scheduled_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      duration_minutes: 60,
      type: "video",
      status: "scheduled",
      meeting_link: "https://meet.google.com/",
      notes: "Chuẩn bị hỏi về kiến trúc, DB, và Next.js.",
    },
  });

  // Scorecard (demo)
  await prisma.interview_scores.upsert({
    where: { interview_id_evaluator_id: { interview_id: interview.id, evaluator_id: interviewer.id } },
    update: {
      technical_score: 4,
      communication_score: 4,
      cultural_fit_score: 4,
      overall_score: 4,
      strengths: "Giải thích rõ ràng, tư duy hệ thống tốt.",
      weaknesses: "Cần cải thiện về tối ưu query phức tạp.",
      feedback: "Ứng viên phù hợp, đề xuất vòng tiếp theo.",
      result: "hold",
      is_final: false,
    },
    create: {
      interview_id: interview.id,
      evaluator_id: interviewer.id,
      technical_score: 4,
      communication_score: 4,
      cultural_fit_score: 4,
      overall_score: 4,
      strengths: "Giải thích rõ ràng, tư duy hệ thống tốt.",
      weaknesses: "Cần cải thiện về tối ưu query phức tạp.",
      feedback: "Ứng viên phù hợp, đề xuất vòng tiếp theo.",
      result: "hold",
      is_final: false,
    },
  });

  // Email logs (demo)
  await prisma.email_logs.createMany({
    data: [
      {
        application_id: app.id,
        recipient_id: candidate.id,
        sender_id: hr.id,
        subject: "Mời phỏng vấn vòng 1",
        type: "invite",
        status: "sent",
        sent_at: now,
      },
      {
        application_id: app.id,
        recipient_id: candidate.id,
        sender_id: null,
        subject: "Nhắc lịch phỏng vấn",
        type: "reminder",
        status: "pending",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed done.");
  console.log("Login accounts:");
  console.log(`- admin@ats.local / Password@123 (id=${admin.id})`);
  console.log("- hr@ats.local / Password@123");
  console.log("- interviewer@ats.local / Password@123");
  console.log("- candidate@ats.local / Password@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

