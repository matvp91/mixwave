import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type JobStatsTileProps = {
  value: number;
  className: string;
  onClick: () => void;
  active: boolean;
  tooltip: string;
};

export function JobStatsTile({
  value,
  className,
  onClick,
  active,
  tooltip,
}: JobStatsTileProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <li
          onClick={onClick}
          className={cn(
            "flex flex-col items-center justify-center text-xs w-10 h-10 rounded-lg",
            active && "bg-muted text-primary",
          )}
        >
          {value}
          <div className={cn("w-2 h-2 rounded-full", className)} />
        </li>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
