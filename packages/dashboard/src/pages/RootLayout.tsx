import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";

export function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-40 border-r border-border">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="grow">
          <Suspense>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
