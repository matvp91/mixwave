import { Scalar } from "@/components/Scalar";

export function ApiPage() {
  return <Scalar url={import.meta.env.VITE_API_URL} />;
}
