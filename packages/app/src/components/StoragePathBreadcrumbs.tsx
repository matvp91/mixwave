import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import House from "lucide-react/icons/house";
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
        {paths.map(({ path, name }, index) => {
          return (
            <Fragment key={path}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/storage?path=${path}`}>
                    {index ? name : <House className="w-4 h-4" />}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
            </Fragment>
          );
        })}
        {target ? (
          <BreadcrumbItem>
            <BreadcrumbPage>
              {target.path === "/" ? (
                <House className="w-4 h-4" />
              ) : (
                target.name
              )}
            </BreadcrumbPage>
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
