export const correlationHeader = "X-Correlation-Id";

export const newCorrelationId = (): string => crypto.randomUUID();
