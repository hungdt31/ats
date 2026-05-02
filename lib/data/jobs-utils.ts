/**
 * Pure utility functions cho jobs — không import "server-only",
 * có thể dùng ở cả Server Component lẫn Client Component.
 */

/** Nhãn hiển thị loại hình công việc. */
export function employmentTypeLabel(t: string): string {
  switch (t) {
    case "full_time":
      return "Toàn thời gian";
    case "part_time":
      return "Bán thời gian";
    case "contract":
      return "Hợp đồng";
    default:
      return t;
  }
}

/** Hiển thị lương VND rút gọn; null nếu không có dữ liệu. */
export function formatSalaryRange(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + " đ";
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}
