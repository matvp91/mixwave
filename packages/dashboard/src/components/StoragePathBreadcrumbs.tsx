import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { Link } from "react-router-dom";

type StoragePathBreadcrumbsProps = {
  path: string;
};

export function StoragePathBreadcrumbs({ path }: StoragePathBreadcrumbsProps) {
  const { paths, target } = parsePathInPaths(path);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map(({ path, name }) => {
          return (
            <Fragment key={path}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/storage?path=${path}`}>{name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          );
        })}
        {target ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{target.name}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function parsePathInPaths(path: string) {
  let prevPath = "";

  const paths = path.split("/").map((part) => {
    const result = {
      name: part,
      path: prevPath + part + "/",
    };
    prevPath += part + "/";
    return result;
  });

  paths.pop();

  return {
    paths,
    target: paths.pop(),
  };
}
