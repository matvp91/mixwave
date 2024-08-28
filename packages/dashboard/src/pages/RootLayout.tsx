import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Suspense } from "react";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="absolute top-16 inset-0 overflow-y-auto">
        <Suspense>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
