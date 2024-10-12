export function ApiPage() {
  return (
    <iframe
      className="w-full h-full"
      src={`${import.meta.env.PUBLIC_API_ENDPOINT}/swagger`}
    />
  );
}
