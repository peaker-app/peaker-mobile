export const parsePageParam = (value: string | null): number => {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
};
