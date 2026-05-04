import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(var(--primary),0.05),transparent_28%)]" />
      <Sidebar />
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
