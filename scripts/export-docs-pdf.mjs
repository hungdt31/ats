/**
 * Export toàn bộ docs/ sang PDF
 * Output: docs/pdf/ với cùng cấu trúc thư mục
 *
 * Chạy: node scripts/export-docs-pdf.mjs
 */

import { mdToPdf } from "md-to-pdf";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");
const OUT_DIR = path.join(DOCS_DIR, "pdf");

// ─── CSS cơ bản (portrait) ──────────────────────────────────────────────────
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');

  * { box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', 'Noto Sans', Arial, sans-serif;
    font-size: 13px;
    line-height: 1.75;
    color: #1a1a1a;
    margin: 0;
  }

  h1 {
    font-size: 20px; color: #1e3a5f;
    border-bottom: 3px solid #1e3a5f;
    padding-bottom: 6px; margin-top: 32px;
    page-break-after: avoid;
  }
  h2 {
    font-size: 16px; color: #2563eb;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px; margin-top: 26px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 14px; color: #374151;
    margin-top: 18px;
    page-break-after: avoid;
  }
  h4 { font-size: 13px; color: #4b5563; margin-top: 14px; page-break-after: avoid; }

  p { margin: 8px 0; }
  li { margin: 3px 0; }

  /* ── Bảng: tự co để vừa trang, không tràn ────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 11px;
    table-layout: fixed;       /* ← chia đều cột, không tràn ngang */
    word-break: break-word;
    overflow-wrap: break-word;
  }
  th {
    background: #1e3a5f;
    color: white;
    padding: 6px 8px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    white-space: normal;
  }
  td {
    padding: 5px 7px;
    border: 1px solid #d1d5db;
    vertical-align: top;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  tr:nth-child(even) td { background: #f8fafc; }

  /* Tránh cắt hàng giữa trang */
  tr { page-break-inside: avoid; }

  /* ── Code ─────────────────────────────────────────────────────────── */
  code {
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10.5px;
    font-family: 'Consolas', 'Courier New', monospace;
    word-break: break-all;
  }
  pre {
    background: #1e293b; color: #e2e8f0;
    padding: 12px 14px; border-radius: 6px;
    font-size: 10px; line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: break-word;
    page-break-inside: avoid;
  }
  pre code { background: none; padding: 0; color: inherit; font-size: inherit; }

  blockquote {
    border-left: 4px solid #2563eb;
    padding: 6px 12px; margin: 10px 0;
    color: #475569; background: #f0f7ff;
  }
  a { color: #2563eb; word-break: break-all; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
`;

// CSS bổ sung cho bảng test-case nhiều cột (TestDocument) — landscape
const TEST_TABLE_CSS = `
  /* Bảng test case: ưu tiên vừa trang landscape */
  table {
    font-size: 10px;
  }
  th, td {
    padding: 4px 6px;
  }
  /* Cột số thứ tự: hẹp cố định */
  td:first-child, th:first-child { width: 4%; }
  /* Cột kết quả test (1st/2nd/3rd): nhỏ */
  td:nth-child(5), th:nth-child(5),
  td:nth-child(6), th:nth-child(6),
  td:nth-child(7), th:nth-child(7) { width: 5%; }
  /* Cột Note: vừa phải */
  td:last-child, th:last-child { width: 10%; }
`;

/**
 * Phân loại file để chọn config phù hợp.
 * - TestDocument (UTC/UTE/ITC/ITE): nhiều cột → landscape A4, margin nhỏ hơn
 * - DetailDesign: bảng vừa → landscape A4
 * - Còn lại: portrait A4
 */
function getConfig(relPath) {
  const norm = relPath.replace(/\\/g, "/").toLowerCase();

  const isTestDoc =
    norm.startsWith("testdocument/") &&
    (norm.includes("/utc/") ||
      norm.includes("/ute/") ||
      norm.includes("/itc/") ||
      norm.includes("/ite/"));

  const isDetailDesign = norm.startsWith("detaildesign/module_");

  if (isTestDoc) {
    return {
      css: BASE_CSS + TEST_TABLE_CSS,
      pdf_options: {
        format: "A4",
        landscape: true,
        margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
        printBackground: true,
      },
    };
  }

  if (isDetailDesign) {
    return {
      css: BASE_CSS,
      pdf_options: {
        format: "A4",
        landscape: true,
        margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
        printBackground: true,
      },
    };
  }

  // Portrait cho các tài liệu còn lại
  return {
    css: BASE_CSS,
    pdf_options: {
      format: "A4",
      landscape: false,
      margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
      printBackground: true,
    },
  };
}

/** Đệ quy lấy tất cả .md trong thư mục (bỏ qua pdf/) */
function getAllMarkdownFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pdf") continue;
      getAllMarkdownFiles(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const mdFiles = getAllMarkdownFiles(DOCS_DIR);

  if (mdFiles.length === 0) {
    console.log("Không tìm thấy file .md nào trong docs/");
    process.exit(0);
  }

  console.log(`\nTìm thấy ${mdFiles.length} file Markdown trong docs/\n`);
  console.log(`Output: ${OUT_DIR}\n`);
  console.log("─".repeat(72));

  let success = 0;
  let failed = 0;

  for (const mdFile of mdFiles) {
    const relative = path.relative(DOCS_DIR, mdFile);
    const pdfRelative = relative.replace(/\.md$/, ".pdf");
    const pdfFile = path.join(OUT_DIR, pdfRelative);

    fs.mkdirSync(path.dirname(pdfFile), { recursive: true });

    const { css, pdf_options } = getConfig(relative);
    const orient = pdf_options.landscape ? "landscape" : "portrait ";

    const label = `  [${orient}] ${relative.padEnd(58)}`;
    process.stdout.write(label);

    try {
      await mdToPdf(
        { path: mdFile },
        {
          dest: pdfFile,
          css,
          pdf_options,
          launch_options: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
        }
      );
      console.log("✓ OK");
      success++;
    } catch (err) {
      console.log(`✗ FAIL — ${err.message}`);
      failed++;
    }
  }

  console.log("─".repeat(72));
  console.log(`\nKết quả: ${success} thành công, ${failed} thất bại`);
  console.log(`PDF đã lưu tại: ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error("Lỗi:", err.message);
  process.exit(1);
});
