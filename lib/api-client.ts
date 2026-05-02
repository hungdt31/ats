/**
 * API client helper — wrapper mỏng quanh fetch để:
 * - Tự động ném lỗi khi response không ok
 * - Trả về kiểu generic T đã được parse JSON
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? `HTTP ${res.status}`,
      body?.fieldErrors
    );
  }

  return body as T;
}

export async function apiPost<T>(url: string, data: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? `HTTP ${res.status}`,
      body?.fieldErrors
    );
  }

  return body as T;
}
