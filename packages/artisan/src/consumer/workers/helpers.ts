export const JOB_SKIPPED = "__JOB_SKIPPED__";

export type SkippableJobResult<T> = typeof JOB_SKIPPED | T;
