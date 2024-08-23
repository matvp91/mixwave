import uniqolor from "uniqolor";
import type { JobDto } from "@mixwave/api/client";

type JobTagProps = {
  job: JobDto;
};

export function JobTag({ job }: JobTagProps) {
  if (!job.tag) {
    return null;
  }

  if (job.tag === "default") {
    return null;
  }

  const { color } = uniqolor(job.tag, {});

  return (
    <span
      className="text-xs px-2 py-[2px] rounded-full font-medium"
      style={{ color, backgroundColor: hexToRGB(color, 0.25) }}
    >
      {job.tag}
    </span>
  );
}

function hexToRGB(hex: string, alpha: number) {
  return (
    "rgba(" +
    parseInt(hex.slice(1, 3), 16) +
    ", " +
    parseInt(hex.slice(3, 5), 16) +
    ", " +
    parseInt(hex.slice(5, 7), 16) +
    ", " +
    alpha +
    ")"
  );
}
