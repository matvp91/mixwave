import cn from "clsx";
import { useRef } from "react";
import type { MouseEventHandler } from "react";

type SqButtonProps = {
  children: React.ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onIdle?: () => void;
  idleTime?: number;
  selected?: boolean;
  disabled?: boolean;
};

export function SqButton({
  children,
  onClick,
  onIdle,
  idleTime,
  selected,
  disabled,
  ...rest
}: SqButtonProps) {
  const timerRef = useRef<number>();

  const onMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdle?.();
    }, idleTime ?? 200);
  };

  return (
    <button
      className={cn(
        "relative flex items-center justify-center w-12 h-12 text-white after:absolute after:left-0 after:top-0 after:w-12 after:h-12 after:bg-black/75 after:rounded-full after:-z-10 after:pointer-events-none after:opacity-0 after:transition-all",
        selected
          ? "after:opacity-95"
          : "hover:after:opacity-50 active:after:opacity-85 group active:after:scale-105",
      )}
      onClick={(event) => {
        clearTimeout(timerRef.current);
        onClick(event);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        clearTimeout(timerRef.current);
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
