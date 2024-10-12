export function ApiPage() {
  return (
    <iframe
      className="w-full h-full"
      src={`${window.__ENV__.PUBLIC_API_ENDPOINT}/swagger`}
    />
  );
}
