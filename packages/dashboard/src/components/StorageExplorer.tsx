import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment, UIEventHandler, useEffect, useRef } from "react";
import Folder from "lucide-react/icons/folder";
import type { FolderDto } from "@/tsr";

type StorageExplorerProps = {
  path: string;
  contents: FolderDto["contents"];
  onNext(): void;
};

export function StorageExplorer({
  path,
  contents,
  onNext,
}: StorageExplorerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onScroll: UIEventHandler<HTMLDivElement> = () => {
    if (!ref.current) {
      return;
    }
    const bottom =
      ref.current.scrollHeight - ref.current.scrollTop ===
      ref.current.clientHeight;
    if (bottom) {
      onNext();
    }
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const isOverflown =
      ref.current.scrollHeight > ref.current.clientHeight ||
      ref.current.scrollWidth > ref.current.clientWidth;
    if (!isOverflown) {
      onNext();
    }
  }, [contents.length]);

  return (
    <div className="flex flex-col grow">
      <div className="p-4 h-14 border-b">
        <PathBreadcrumbs path={path} />
      </div>
      <div
        className="flex grow basis-0 overflow-auto p-4"
        onScroll={onScroll}
        ref={ref}
      >
        <ul>
          {contents.map((content) => {
            const chunks = content.path.split("/");

            if (content.type === "folder") {
              const name = chunks[chunks.length - 2];
              return (
                <li key={content.path}>
                  <Link
                    to={`/storage?path=${content.path}`}
                    className="flex gap-2 text-sm items-center"
                  >
                    <Folder className="w-4 h-4" /> {name}
                  </Link>
                </li>
              );
            }

            if (content.type === "file") {
              const name = chunks[chunks.length - 1];
              return (
                <li key={content.path}>
                  <File content={content} name={name} />
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
}

function PathBreadcrumbs({ path }: { path: string }) {
  const splits = path.split("/");
  splits.pop();

  let prevPath = "";
  const chunks = splits.map((part) => {
    const result = {
      name: part,
      path: prevPath + part + "/",
    };
    prevPath += part + "/";
    return result;
  });

  const lastChunk = chunks.pop();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {chunks.map((chunk) => {
          return (
            <Fragment key={chunk.path}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/storage?path=${chunk.path}`}>{chunk.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          );
        })}
        {lastChunk ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{lastChunk.name}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function File({
  content,
  name,
}: {
  content: Extract<FolderDto["contents"][0], { type: "file" }>;
  name: string;
}) {
  return <div className="text-sm">{name}</div>;
}
