import { refreshSession } from "@/lib/auth/refresh";
import { getAccessToken } from "@/lib/auth/tokenStore";
import { correlationHeader, newCorrelationId } from "./correlation";
import { gatewayUrl } from "./gateway";
import type { ProblemDetails } from "./problem";

export class ApiError extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.title ?? `HTTP ${problem.status}`);
    this.name = "ApiError";
  }
}

export const readProblem = async (
  response: Response,
): Promise<ProblemDetails> => {
  try {
    return { status: response.status, ...(await response.json()) };
  } catch {
    return { status: response.status };
  }
};

const baseHeaders = (correlationId: string): Record<string, string> => {
  const token = getAccessToken();

  return token
    ? { [correlationHeader]: correlationId, Authorization: `Bearer ${token}` }
    : { [correlationHeader]: correlationId };
};

const send = (
  path: string,
  init: RequestInit,
  correlationId: string,
): Promise<Response> =>
  fetch(`${gatewayUrl()}/api/${path}`, {
    ...init,
    headers: { ...baseHeaders(correlationId), ...init.headers },
  });

const isReplayable = (body: BodyInit | null | undefined): boolean =>
  !(typeof ReadableStream !== "undefined" && body instanceof ReadableStream);

const sendWithAuth = async (
  path: string,
  init: RequestInit,
): Promise<Response> => {
  const correlationId = newCorrelationId();
  const first = await send(path, init, correlationId);

  if (first.status !== 401 || !isReplayable(init.body)) {
    return first;
  }

  return (await refreshSession())
    ? send(path, init, correlationId)
    : first;
};

const unwrap = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new ApiError(await readProblem(response));
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
};

export const apiFetch = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> =>
  unwrap<T>(
    await sendWithAuth(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    }),
  );

export const apiUpload = async <T>(
  path: string,
  body: FormData,
  init?: RequestInit,
): Promise<T> =>
  unwrap<T>(
    await sendWithAuth(path, { ...init, method: init?.method ?? "POST", body }),
  );

export const buildQuery = (
  params: Record<string, string | number | undefined | null>,
): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();

  return query ? `?${query}` : "";
};
