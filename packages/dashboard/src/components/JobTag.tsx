import uniqolor from "uniqolor";

type JobTagProps = {
  tag?: string;
};

export function JobTag({ tag }: JobTagProps) {
  if (!tag) {
    return null;
  }

  const { color } = uniqolor(tag, {});

  return (
    <span
      className="text-xs px-2 py-[2px] rounded-full font-medium"
      style={{ color, backgroundColor: hexToRGB(color, 0.25) }}
    >
      {tag}
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
