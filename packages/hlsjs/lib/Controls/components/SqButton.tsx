type SqButtonProps = {
  children: React.ReactNode;
  onClick(): void;
};

export function SqButton({ children, onClick }: SqButtonProps) {
  return (
    <button className="mix-sqbutton" onClick={onClick}>
      {children}
    </button>
  );
}
