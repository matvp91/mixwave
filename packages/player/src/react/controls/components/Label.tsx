import { useSelector } from "../..";
import { useParams } from "../hooks/useParams";

export function Label() {
  const { metadata } = useParams();
  const interstitial = useSelector((facade) => facade.interstitial);

  if (interstitial?.type === "ad") {
    return (
      <div className="text-white text-sm font-medium flex items-center px-2">
        Ad
      </div>
    );
  }

  if (metadata?.title) {
    return (
      <div className="text-white text-sm flex items-center px-2 gap-1">
        {metadata.subtitle ? (
          <>
            <span className="font-medium">{metadata.title}</span>{" "}
            {metadata.subtitle}
          </>
        ) : (
          metadata.title
        )}
      </div>
    );
  }

  return null;
}
