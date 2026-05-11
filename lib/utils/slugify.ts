/**
 * Chuyển chuỗi (kể cả tiếng Việt có dấu) thành slug URL-friendly.
 *
 * Ví dụ:
 *   "Kỹ sư phần mềm Senior"  → "ky-su-phan-mem-senior"
 *   "Trưởng phòng Kế Toán"   → "truong-phong-ke-toan"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // bỏ dấu tổ hợp (NFD decompose)
    .replace(/đ/gi, (c) => c === "đ" ? "d" : "D") // đ/Đ riêng vì không decompose
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")     // chỉ giữ alphanumeric, space, hyphen
    .replace(/\s+/g, "-")             // spaces → hyphen
    .replace(/-{2,}/g, "-")           // nhiều hyphen liên tiếp → 1
    .replace(/^-|-$/g, "");           // trim hyphen đầu/cuối
}

/**
 * Sinh slug duy nhất bằng cách append số đếm nếu base slug đã tồn tại.
 * `exists` là hàm async kiểm tra slug đã dùng hay chưa.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const candidate = slugify(base);
  if (!(await exists(candidate))) return candidate;

  let i = 2;
  while (await exists(`${candidate}-${i}`)) {
    i++;
  }
  return `${candidate}-${i}`;
}
