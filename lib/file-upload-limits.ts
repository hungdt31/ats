/** Giới hạn dung lượng file CV / tài liệu ứng viên (profile, nộp đơn). */
export const MAX_CANDIDATE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_CANDIDATE_FILE_SIZE_MB = 5;

/**
 * Kiểm tra dung lượng file trước khi gửi lên storage.
 * @returns Chuỗi lỗi tiếng Việt nếu vượt quá; `null` nếu hợp lệ.
 */
export function validateCandidateFileSize(file: File): string | null {
  if (file.size > MAX_CANDIDATE_FILE_SIZE_BYTES) {
    return `Dung lượng file vượt quá ${MAX_CANDIDATE_FILE_SIZE_MB} MB (hiện tại khoảng ${(file.size / (1024 * 1024)).toFixed(1)} MB). Vui lòng chọn file nhỏ hơn hoặc nén tài liệu.`;
  }
  return null;
}
