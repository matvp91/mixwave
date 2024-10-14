import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ArrowDownFromLine from "lucide-react/icons/arrow-down-from-line";
import ArrowUpFromLine from "lucide-react/icons/arrow-up-from-line";

type JobLogProps = {
  value: string;
  index: number;
};

export function JobLog({ value, index }: JobLogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    if (ref.current.clientHeight < ref.current.scrollHeight) {
      setShowMore(true);
    }
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
            onClick={() => {
              setExpanded((v) => !v);
            }}
          >
            {expanded ? (
              <ArrowUpFromLine className="w-4 h-4" />
            ) : (
              <ArrowDownFromLine className="w-4 h-4" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
