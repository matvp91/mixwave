import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Suspense } from "react";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense>
        <Outlet />
      </Suspense>
    </div>
  );
}
