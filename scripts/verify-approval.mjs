import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const PASSWORD = "Password@123";
const CANDIDATE_EMAIL = "candidate@ats.local";
const HR_EMAIL = "hr@ats.local";
const ADMIN_EMAIL = "admin@ats.local";
const SESSION_COOKIE_NAME = "ats_session";

function extractSessionCookie(res) {
  const getter = res.headers.getSetCookie?.bind(res.headers);
  const chunks = getter ? getter() : [];
  const fallback = res.headers.get("set-cookie");
  const lines = chunks.length ? chunks : fallback ? [fallback] : [];
  for (const line of lines) {
    const m = line.match(new RegExp(`^${SESSION_COOKIE_NAME}=([^;]+)`));
    if (m) return `${SESSION_COOKIE_NAME}=${m[1]}`;
  }
  return "";
}

async function fetchJson(method, pathname, { cookie = "", body } = {}) {
  const headers = { Accept: "application/json" };
  if (cookie) headers.Cookie = cookie;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE_URL}${pathname}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { res, json };
}

async function main() {
  console.log("=== VERIFYING JOB APPROVAL FLOW ===");
  
  // 1. Login HR
  console.log("\n1. Logging in as HR...");
  const hrLogin = await fetchJson("POST", "/api/auth/login", {
    body: { email: HR_EMAIL, password: PASSWORD }
  });
  if (hrLogin.res.status !== 200) {
    throw new Error(`HR Login failed: ${JSON.stringify(hrLogin.json)}`);
  }
  const hrCookie = extractSessionCookie(hrLogin.res);
  console.log("HR Logged in successfully.");

  // 2. HR creates a new job (status = active)
  console.log("\n2. HR creating a new job...");
  const jobTitle = `Test Job Approval Flow ${Date.now()}`;
  const hrCreateJob = await fetchJson("POST", "/api/dashboard/jobs", {
    cookie: hrCookie,
    body: {
      title: jobTitle,
      description: "This is a test job description for verifying admin approval flow.",
      status: "active",
      employment_type: "full_time",
      headcount: "1"
    }
  });
  if (hrCreateJob.res.status !== 200) {
    throw new Error(`HR Create job failed: ${JSON.stringify(hrCreateJob.json)}`);
  }
  const createdJob = hrCreateJob.json.data;
  console.log(`Job created: "${createdJob.title}" (ID: ${createdJob.id}, status: ${createdJob.status})`);
  if (createdJob.status !== "pending") {
    throw new Error("Created job status should be pending!");
  }

  // 3. Verify public jobs list (the job should not be visible)
  console.log("\n3. Verifying job is NOT visible on public jobs list...");
  const publicJobs = await fetchJson("GET", "/api/jobs");
  const foundInPublic = publicJobs.json.data.jobs.some(j => j.id === createdJob.id);
  console.log(`Job found in public list? ${foundInPublic}`);
  if (foundInPublic) {
    throw new Error("Job should not be visible to public before approval!");
  }

  // 4. Verify public job detail (should return 404 or not found)
  console.log("\n4. Verifying job details return 404/not found...");
  const publicDetail = await fetchJson("GET", `/api/jobs/${createdJob.slug}`);
  console.log(`Public details status: ${publicDetail.res.status}`);
  if (publicDetail.res.status !== 404) {
    throw new Error(`Public detail should return 404, got ${publicDetail.res.status}`);
  }

  // 5. Login Admin
  console.log("\n5. Logging in as Admin...");
  const adminLogin = await fetchJson("POST", "/api/auth/login", {
    body: { email: ADMIN_EMAIL, password: PASSWORD }
  });
  if (adminLogin.res.status !== 200) {
    throw new Error(`Admin Login failed: ${JSON.stringify(adminLogin.json)}`);
  }
  const adminCookie = extractSessionCookie(adminLogin.res);
  console.log("Admin Logged in successfully.");

  // 6. Admin approves the job
  console.log(`\n6. Admin approving job (ID: ${createdJob.id})...`);
  const approveJob = await fetchJson("POST", `/api/dashboard/jobs/${createdJob.id}/approve`, {
    cookie: adminCookie
  });
  if (approveJob.res.status !== 200) {
    throw new Error(`Admin approve job failed: ${JSON.stringify(approveJob.json)}`);
  }
  console.log(`Job approved: status = ${approveJob.json.data.status}`);
  if (approveJob.json.data.status !== "active") {
    throw new Error("Job status should be active after approval!");
  }

  // 7. Verify public jobs list again (should be visible now)
  console.log("\n7. Verifying job is visible on public jobs list after approval...");
  const publicJobsAfter = await fetchJson("GET", "/api/jobs");
  const foundInPublicAfter = publicJobsAfter.json.data.jobs.some(j => j.id === createdJob.id);
  console.log(`Job found in public list? ${foundInPublicAfter}`);
  if (!foundInPublicAfter) {
    throw new Error("Job should be visible to public after approval!");
  }

  // 8. Verify public job detail after approval (should return 200)
  console.log("\n8. Verifying job details return 200...");
  const publicDetailAfter = await fetchJson("GET", `/api/jobs/${createdJob.slug}`);
  console.log(`Public details status: ${publicDetailAfter.res.status}`);
  if (publicDetailAfter.res.status !== 200) {
    throw new Error(`Public detail should return 200, got ${publicDetailAfter.res.status}`);
  }

  // 9. HR creates a new job (status = draft)
  console.log("\n9. HR creating a draft job...");
  const draftJobTitle = `Test Draft Job ${Date.now()}`;
  const hrCreateDraftJob = await fetchJson("POST", "/api/dashboard/jobs", {
    cookie: hrCookie,
    body: {
      title: draftJobTitle,
      description: "This is a draft job description.",
      status: "draft",
      employment_type: "full_time",
      headcount: "1"
    }
  });
  if (hrCreateDraftJob.res.status !== 200) {
    throw new Error(`HR Create draft job failed: ${JSON.stringify(hrCreateDraftJob.json)}`);
  }
  const draftJob = hrCreateDraftJob.json.data;
  console.log(`Draft Job created: "${draftJob.title}" (ID: ${draftJob.id}, status: ${draftJob.status})`);
  if (draftJob.status !== "draft") {
    throw new Error("Created job status should be draft!");
  }

  // 10. HR fetches dashboard jobs list (should see the draft job)
  console.log("\n10. Verifying HR can view the draft job in dashboard list...");
  const hrDashboardJobs = await fetchJson("GET", "/api/dashboard/jobs", { cookie: hrCookie });
  const foundInHrDashboard = hrDashboardJobs.json.data.some(j => j.id === draftJob.id);
  console.log(`Draft job found in HR dashboard? ${foundInHrDashboard}`);
  if (!foundInHrDashboard) {
    throw new Error("HR should see the draft job in their dashboard list!");
  }

  // 11. Admin fetches dashboard jobs list (should NOT see the draft job)
  console.log("\n11. Verifying Admin CANNOT view the draft job in dashboard list...");
  const adminDashboardJobs = await fetchJson("GET", "/api/dashboard/jobs", { cookie: adminCookie });
  const foundInAdminDashboard = adminDashboardJobs.json.data.some(j => j.id === draftJob.id);
  console.log(`Draft job found in Admin dashboard? ${foundInAdminDashboard}`);
  if (foundInAdminDashboard) {
    throw new Error("Admin should NOT see the draft job in their dashboard list!");
  }

  // 12. Admin tries to fetch the draft job list by querying status=draft explicitly (should return empty or no draft jobs)
  console.log("\n12. Verifying Admin querying status=draft explicitly returns no draft jobs...");
  const adminDraftQuery = await fetchJson("GET", "/api/dashboard/jobs?status=draft", { cookie: adminCookie });
  const foundInAdminDraftQuery = adminDraftQuery.json.data.some(j => j.id === draftJob.id);
  console.log(`Draft job found in Admin draft query? ${foundInAdminDraftQuery}`);
  if (foundInAdminDraftQuery) {
    throw new Error("Admin should NOT see the draft job when filtering status=draft!");
  }

  // 13. HR deletes their draft job
  console.log("\n13. Verifying HR can delete their draft job...");
  const hrDeleteDraft = await fetchJson("DELETE", `/api/dashboard/jobs/${draftJob.id}`, { cookie: hrCookie });
  console.log(`HR delete draft status: ${hrDeleteDraft.res.status}`);
  if (hrDeleteDraft.res.status !== 200) {
    throw new Error(`HR should be able to delete their draft job, got status ${hrDeleteDraft.res.status}`);
  }

  // 14. HR tries to delete the active job (created and approved in step 2 & 6)
  console.log("\n14. Verifying HR CANNOT delete an active job...");
  const hrDeleteActive = await fetchJson("DELETE", `/api/dashboard/jobs/${createdJob.id}`, { cookie: hrCookie });
  console.log(`HR delete active status (should be 403): ${hrDeleteActive.res.status}`);
  if (hrDeleteActive.res.status !== 403) {
    throw new Error(`HR should NOT be able to delete an active job, expected 403 but got ${hrDeleteActive.res.status}`);
  }

  // 15. Admin deletes the active job
  console.log("\n15. Verifying Admin can delete an active job...");
  const adminDeleteActive = await fetchJson("DELETE", `/api/dashboard/jobs/${createdJob.id}`, { cookie: adminCookie });
  console.log(`Admin delete active status: ${adminDeleteActive.res.status}`);
  if (adminDeleteActive.res.status !== 200) {
    throw new Error(`Admin should be able to delete any job, got status ${adminDeleteActive.res.status}`);
  }

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

main().catch(err => {
  console.error("\n[TEST FAILED]:", err.message);
  process.exit(1);
});
