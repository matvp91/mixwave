export const SKIP_JOB = "skipped";

export type SkippableJobResult<T> = typeof SKIP_JOB | T;
