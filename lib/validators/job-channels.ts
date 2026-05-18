import { z } from "zod";

function isAllowedExternalUrl(s: string): boolean {
  const t = s.trim();
  if (t.startsWith("/") && t.length > 1) return true;
  try {
    new URL(t);
    return /^https?:\/\//i.test(t);
  } catch {
    return false;
  }
}

/** Payload POST /api/dashboard/jobs/[id]/channels — link bài viết bắt buộc (URL hoặc path nội bộ /...). */
export const upsertJobChannelSchema = z.object({
  channel: z.enum(["linkedin", "itviec", "topcv", "vietnamworks", "website"]),
  status: z.enum(["pending", "posted", "failed", "expired", "removed"]),
  external_url: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập link bài viết.")
    .refine(isAllowedExternalUrl, {
      message:
        "Link bài viết phải là URL đầy đủ (https://...) hoặc đường dẫn nội bộ bắt đầu bằng / (ví dụ /jobs/ten-tin).",
    }),
  external_id: z
    .string()
    .optional()
    .transform((v) => {
      const t = (v ?? "").trim();
      return t.length ? t : null;
    }),
});

export type UpsertJobChannelInput = z.infer<typeof upsertJobChannelSchema>;
