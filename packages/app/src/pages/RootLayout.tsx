import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";

export function RootLayout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
      <aside className="border-r">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="flex flex-col grow">
          <Suspense>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
