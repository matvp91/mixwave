import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PreviewDto } from "@/tsr";

type StoragePreviewProps = {
  preview: PreviewDto | null;
  onClose(): void;
};

export function StoragePreview({ preview, onClose }: StoragePreviewProps) {
  return (
    <Sheet open={preview !== null} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-none w-[640px]">
        <SheetHeader>
          <SheetTitle>Preview</SheetTitle>
          {preview ? (
            <>
              <SheetDescription>
                <p>{preview.path}</p>
              </SheetDescription>
              <pre className="text-xs overflow-auto">{preview.data}</pre>
            </>
          ) : null}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
