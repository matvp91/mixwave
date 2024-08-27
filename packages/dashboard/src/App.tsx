import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { JobsPage } from "@/pages/JobsPage";
import { JobPage } from "@/pages/JobPage";
import { ApiPage } from "@/pages/ApiPage";
import { ApiEmbedPage } from "@/pages/ApiEmbedPage";
import { RootLayout } from "@/pages/RootLayout";
import { Suspense } from "react";
import { tsr } from "./tsr";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/jobs" />,
      },
      {
        path: "/jobs",
        element: <JobsPage />,
      },
      {
        path: "/jobs/:id",
        element: <JobPage />,
      },
      {
        path: "/api",
        element: <ApiPage />,
      },
    ],
  },
  {
    path: "/embed/api",
    element: <ApiEmbedPage />,
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <tsr.ReactQueryProvider>
          <RouterProvider router={router} />
        </tsr.ReactQueryProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
