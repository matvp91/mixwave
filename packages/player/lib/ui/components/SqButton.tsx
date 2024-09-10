import cn from "clsx";
import { useRef } from "react";

type SqButtonProps = {
  children: React.ReactNode;
  onClick(): void;
  onIdle?: () => void;
  selected?: boolean;
};

export function SqButton({
  children,
  onClick,
  onIdle,
  selected,
  ...rest
}: SqButtonProps) {
  const timerRef = useRef<number>();

  const onMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdle?.();
    }, 500);
  };

  return (
    <button
      className={cn(
        "group relative flex items-center justify-center w-12 h-12 text-white after:absolute after:left-0 after:top-0 after:w-12 after:h-12 after:bg-black/50 after:rounded-full after:-z-10 after:pointer-events-none after:opacity-0 after:transition-all active:after:scale-105",
        selected
          ? "after:opacity-75"
          : "hover:after:opacity-25 active:after:opacity-50",
      )}
      onClick={() => {
        clearTimeout(timerRef.current);
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        clearTimeout(timerRef.current);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
