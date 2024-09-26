import { Scalar } from "@/components/Scalar";

export function ApiPage() {
  return <Scalar url={import.meta.env.PUBLIC_API_ENDPOINT} />;
}
