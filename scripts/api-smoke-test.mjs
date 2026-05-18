#!/usr/bin/env node
/**
 * Smoke test REST API ATS — căn cứ UTC / ITC / ITE trong docs/TestDocument.
 * Dữ liệu mặc định khớp prisma/seed.ts (email *.ats.local, mật khẩu Password@123).
 *
 * Chạy: server đã `npm run dev` hoặc `npm run start`, DB đã migrate + seed.
 *
 * @example
 *   node scripts/api-smoke-test.mjs
 *   ATS_BASE_URL=http://localhost:3000 node scripts/api-smoke-test.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SESSION_COOKIE_NAME = "ats_session";

const BASE_URL = (process.env.ATS_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const PASSWORD = process.env.ATS_SEED_PASSWORD ?? "Password@123";
const CANDIDATE_EMAIL = process.env.ATS_CANDIDATE_EMAIL ?? "candidate@ats.local";
const HR_EMAIL = process.env.ATS_HR_EMAIL ?? "hr@ats.local";
const ADMIN_EMAIL = process.env.ATS_ADMIN_EMAIL ?? "admin@ats.local";

const LOG_DIR = path.resolve(process.cwd(), "docs/TestDocument/logs");
const LOG_FILE =
  process.env.ATS_API_LOG_FILE ??
  path.join(LOG_DIR, `api-smoke-${new Date().toISOString().replace(/[:.]/g, "-")}.log`);

/** @param {Response} res */
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

/** @param {string} cookie */
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
  } catch {
    json = null;
  }
  return { res, json };
}

function ensureLogDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function main() {
  ensureLogDir();
  const lines = [];

  /** @param {string} s */
  const log = (s) => {
    lines.push(s);
    console.log(s);
  };

  log(`=== ATS API Smoke Test ===`);
  log(`Thời điểm: ${new Date().toISOString()}`);
  log(`BASE_URL: ${BASE_URL}`);
  log(`Tham chiếu tài liệu: docs/TestDocument (UTC/ITE); user seed: prisma/seed.ts`);
  log("");

  let pass = 0;
  let fail = 0;

  /** @param {string} id @param {string} title @param {() => Promise<void>} fn */
  const step = async (id, title, fn) => {
    try {
      await fn();
      log(`[PASS] ${id} — ${title}`);
      pass++;
    } catch (e) {
      log(`[FAIL] ${id} — ${title}`);
      log(`       Lý do: ${/** @type {Error} */ (e).message}`);
      fail++;
    }
  };

  const run = async () => {
    let jobsSlug = "";
    let cookieCandidate = "";
    let cookieHr = "";

    await step("PUB-001", "GET /api/jobs — public, 200 + success envelope", async () => {
      const { res, json } = await fetchJson("GET", "/api/jobs");
      if (res.status !== 200) throw new Error(`status ${res.status}, body=${JSON.stringify(json)}`);
      if (!json?.success) throw new Error(`success không true: ${JSON.stringify(json)}`);
      const items = json.data?.jobs ?? json.data?.items ?? json.data;
      if (!Array.isArray(items) || items.length === 0)
        throw new Error("Không có danh sách job (cần seed jobs)");
      jobsSlug = items[0].slug;
      if (!jobsSlug) throw new Error("Thiếu slug job đầu tiên");
    });

    await step("PUB-002", "GET /api/jobs/[slug] — chi tiết job public", async () => {
      if (!jobsSlug) throw new Error("Thiếu slug từ PUB-001");
      const { res, json } = await fetchJson("GET", `/api/jobs/${encodeURIComponent(jobsSlug)}`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      if (!json?.success || !json.data?.slug) throw new Error(JSON.stringify(json));
    });

    await step("AUTH-001", "POST /api/auth/login — sai mật khẩu → 401", async () => {
      const { res, json } = await fetchJson("POST", "/api/auth/login", {
        body: { email: CANDIDATE_EMAIL, password: "__wrong__" },
      });
      if (res.status !== 401) throw new Error(`mong đợi 401, nhận ${res.status}: ${JSON.stringify(json)}`);
    });

    await step("AUTH-002", "POST /api/auth/login — candidate hợp lệ → 200 + cookie", async () => {
      const { res, json } = await fetchJson("POST", "/api/auth/login", {
        body: { email: CANDIDATE_EMAIL, password: PASSWORD },
      });
      if (res.status !== 200) throw new Error(`status ${res.status}: ${JSON.stringify(json)}`);
      if (!json?.success) throw new Error(JSON.stringify(json));
      cookieCandidate = extractSessionCookie(res);
      if (!cookieCandidate) throw new Error("Không nhận được cookie phiên đăng nhập");
    });

    await step("AUTH-003", "GET /api/auth/me — có cookie candidate → 200 + role candidate", async () => {
      const { res, json } = await fetchJson("GET", "/api/auth/me", { cookie: cookieCandidate });
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      if (json?.data?.user?.role !== "candidate") throw new Error(JSON.stringify(json));
    });

    await step("RBAC-001", "GET /api/dashboard/emails — không cookie → 401", async () => {
      const { res } = await fetchJson("GET", "/api/dashboard/emails");
      if (res.status !== 401) throw new Error(`mong đợi 401, nhận ${res.status}`);
    });

    await step(
      "RBAC-002",
      "GET /api/dashboard/emails — candidate đăng nhập → không được (401 theo route hiện tại)",
      async () => {
        const { res } = await fetchJson("GET", "/api/dashboard/emails", { cookie: cookieCandidate });
        if (res.status !== 401) throw new Error(`mong đợi 401, nhận ${res.status}`);
      },
    );

    await step("AUTH-004", "POST /api/auth/login — HR hợp lệ → cookie", async () => {
      const { res, json } = await fetchJson("POST", "/api/auth/login", {
        body: { email: HR_EMAIL, password: PASSWORD },
      });
      if (res.status !== 200 || !json?.success) throw new Error(JSON.stringify(json));
      cookieHr = extractSessionCookie(res);
      if (!cookieHr) throw new Error("Thiếu cookie HR");
    });

    await step("RBAC-003", "GET /api/dashboard/emails — HR → 200 + success", async () => {
      const { res, json } = await fetchJson("GET", "/api/dashboard/emails", { cookie: cookieHr });
      if (res.status !== 200) throw new Error(`status ${res.status}: ${JSON.stringify(json)}`);
      if (!json?.success) throw new Error(JSON.stringify(json));
    });

    await step("RBAC-004", "GET /api/dashboard/interviews — HR → 200 + success", async () => {
      const { res, json } = await fetchJson("GET", "/api/dashboard/interviews", { cookie: cookieHr });
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      if (!json?.success) throw new Error(JSON.stringify(json));
    });

    await step("AUTH-005", "POST /api/auth/login — admin → cookie + GET /me role admin", async () => {
      const { res, json } = await fetchJson("POST", "/api/auth/login", {
        body: { email: ADMIN_EMAIL, password: PASSWORD },
      });
      if (res.status !== 200 || !json?.success) throw new Error(JSON.stringify(json));
      const c = extractSessionCookie(res);
      if (!c) throw new Error("Thiếu cookie admin");
      const me = await fetchJson("GET", "/api/auth/me", { cookie: c });
      if (me.res.status !== 200 || me.json?.data?.user?.role !== "admin")
        throw new Error(JSON.stringify(me.json));
    });
  };

  run()
    .then(() => {
      log("");
      log(`--- Tổng kết: ${pass} PASS, ${fail} FAIL ---`);
      fs.writeFileSync(LOG_FILE, lines.join("\n") + "\n", "utf8");
      log(`Đã ghi log: ${LOG_FILE}`);
      process.exit(fail > 0 ? 1 : 0);
    })
    .catch((e) => {
      log(`[ERROR] ${e.message}`);
      fs.writeFileSync(LOG_FILE, lines.join("\n") + "\n", "utf8");
      process.exit(1);
    });
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main();
}
