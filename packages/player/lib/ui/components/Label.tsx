import type { Slot } from "../..";
import type { Metadata } from "../types";

type LabelProps = {
  slot: Slot | null;
  metadata?: Metadata;
};

export function Label({ slot, metadata }: LabelProps) {
  if (slot?.type === "ad") {
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
