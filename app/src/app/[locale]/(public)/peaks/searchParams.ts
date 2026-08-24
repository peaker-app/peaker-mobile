export interface PeakQuery {
  q: string;
  page: number;
  country: string;
  region: string;
  minAltitude: string;
  maxAltitude: string;
}

export const pageSize = 24;
export const minAltitudeBound = 0;
export const maxAltitudeBound = 9000;

export type RawSearchParams = Record<string, string | string[] | undefined>;

const single = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const positiveInteger = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
};

export const parsePeakQuery = (params: RawSearchParams): PeakQuery => ({
  q: single(params.q),
  page: positiveInteger(single(params.page), 1),
  country: single(params.country),
  region: single(params.region),
  minAltitude: single(params.minAltitude),
  maxAltitude: single(params.maxAltitude),
});

export const activeFilterCount = (query: PeakQuery): number =>
  [query.country, query.region, query.minAltitude, query.maxAltitude].filter(
    (value) => value !== "",
  ).length;

export const toQueryString = (
  query: Partial<PeakQuery>,
  resetPage = true,
): string => {
  const search = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ["q", query.q],
    ["country", query.country],
    ["region", query.region],
    ["minAltitude", query.minAltitude],
    ["maxAltitude", query.maxAltitude],
    ["page", resetPage ? undefined : query.page],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== "" && value !== 1) {
      search.set(key, String(value));
    }
  }

  const result = search.toString();

  return result ? `?${result}` : "";
};
