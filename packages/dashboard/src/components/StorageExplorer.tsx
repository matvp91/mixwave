import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import Folder from "lucide-react/icons/folder";
import type { FolderDto } from "@/tsr";

type StorageExplorerProps = {
  folder: FolderDto;
};

export function StorageExplorer({ folder }: StorageExplorerProps) {
  return (
    <div>
      <div className="mb-4">
        <PathBreadcrumbs path={folder.path} />
      </div>
      <ul>
        {folder.subFolders.map((subFolder) => {
          return (
            <li key={subFolder.path}>
              <Link
                to={`/storage?path=${subFolder.path}`}
                className="flex gap-2"
              >
                <Folder /> {subFolder.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul>
        {folder.files.map((file) => {
          return <li key={file.path}>{file.name}</li>;
        })}
      </ul>
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
  console.log(chunks);

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
        <BreadcrumbItem>
          <BreadcrumbPage>{lastChunk?.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
