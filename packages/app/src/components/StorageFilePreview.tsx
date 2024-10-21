import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { StorageFile } from "@/api";

type StoragePreviewProps = {
  file: StorageFile | null;
  onClose(): void;
};

export function StorageFilePreview({ file, onClose }: StoragePreviewProps) {
  return (
    <Sheet open={file !== null} onOpenChange={onClose}>
      <SheetContent
        className="sm:max-w-none w-[640px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Preview</SheetTitle>
          {file ? (
            <>
              <p className="text-sm mb-2">{file.path}</p>
              <pre className="text-xs overflow-auto p-4 bg-zinc-900 text-white">
                {file.data}
              </pre>
            </>
          ) : null}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
