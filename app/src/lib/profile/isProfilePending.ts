import { ApiError } from "@/lib/api/client";

export const isProfilePending = (error: unknown): boolean =>
  error instanceof ApiError && error.problem.status === 404;
