/**
 * Query keys tập trung — tránh hard-code string rải rác,
 * dễ invalidate theo nhóm.
 *
 * Convention: [namespace, ...args]
 */
export const queryKeys = {
  /** Auth */
  auth: {
    me: () => ["auth", "me"] as const,
  },

  /** Jobs (public) */
  jobs: {
    all: () => ["jobs"] as const,
    lists: () => ["jobs", "list"] as const,
    detail: (id: string) => ["jobs", "detail", id] as const,
  },

  /** Candidate */
  candidate: {
    applications: () => ["candidate", "applications"] as const,
    profile: () => ["candidate", "profile"] as const,
    interviews: () => ["candidate", "interviews"] as const,
  },
} as const;
