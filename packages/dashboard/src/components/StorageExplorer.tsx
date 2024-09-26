import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Fragment, UIEventHandler, useRef } from "react";
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

    const totalHeight = ref.current.scrollHeight - ref.current.offsetHeight;

    if (totalHeight - ref.current.scrollTop < 10) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col grow">
      <div className="p-4 h-14 border-b">
        <PathBreadcrumbs path={path} />
      </div>
      <div className="grow relative">
        <div
          className="absolute inset-0 overflow-auto"
          onScroll={onScroll}
          ref={ref}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((content) => {
                return <Row key={content.path} content={content} />;
              })}
            </TableBody>
          </Table>
        </div>
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

function Row({ content }: { content: FolderDto["contents"][0] }) {
  const chunks = content.path.split("/");

  if (content.type === "folder") {
    const name = chunks[chunks.length - 2];
    return (
      <TableRow>
        <TableCell>
          <Folder className="w-4 h-4" />
        </TableCell>
        <TableCell>
          <Link
            to={`/storage?path=${content.path}`}
            className="flex gap-2 text-sm items-center hover:underline w-full"
          >
            {name}
          </Link>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  if (content.type === "file") {
    const name = chunks[chunks.length - 1];
    return (
      <TableRow>
        <TableCell></TableCell>
        <TableCell>{name}</TableCell>
        <TableCell>{content.size} bytes</TableCell>
      </TableRow>
    );
  }
  return null;
}
