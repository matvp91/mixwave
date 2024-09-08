import cn from "clsx";

type SqButtonProps = {
  children: React.ReactNode;
  onClick(): void;
  selected?: boolean;
};

export function SqButton({
  children,
  onClick,
  selected,
  ...rest
}: SqButtonProps) {
  return (
    <button
      className={cn("mix-sqbutton", selected && "mix-sqbutton--selected")}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
