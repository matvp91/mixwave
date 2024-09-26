type ScalarProps = {
  url: string;
};

export function Scalar({ url }: ScalarProps) {
  return (
    <iframe
      className="w-full h-full"
      src={`/scalar.html?url=${encodeURIComponent(url)}`}
    />
  );
}
