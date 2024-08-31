import { StretchLoader } from "@/components/StretchLoader";
import { useEffect, useState } from "react";

export function ApiPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onMessage = () => {
      setLoaded(true);
    };

    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="w-full h-full">
      {loaded ? null : (
        <div className="absolute inset-0 bg-white">
          <StretchLoader />
        </div>
      )}
      <iframe className="w-full h-full" src="/embed/api" />
    </div>
  );
}
