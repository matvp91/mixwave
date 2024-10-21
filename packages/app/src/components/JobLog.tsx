import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type JobLogProps = {
  value: string;
  index: number;
};

export function JobLog({ value, index }: JobLogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const onResize = () => {
      if (!ref.current) {
        return;
      }
      setShowMore(ref.current.clientHeight < ref.current.scrollHeight);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="border border-border rounded-md p-2 break-all flex">
      <div className="mr-2 font-medium">{index + 1}</div>
      <div>
        <div
          ref={ref}
          className={cn("overflow-hidden", !expanded && "max-h-12")}
        >
          {value}
        </div>
        {showMore ? (
          <button
            className="text-xs font-medium"
            onClick={() => {
              setExpanded((v) => !v);
            }}
          >
            {expanded ? "collapse" : "expand"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
