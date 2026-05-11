import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-500 font-sans">
      
      {/* 1. Subtle Clinical Grid (Light) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      
      {/* 2. Soft Emerald Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,rgba(var(--primary),0.03),transparent)] pointer-events-none z-0" />

      {/* Sidebar - Desktop & Mobile Drawer */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
      <div className="relative z-10 flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Topbar onMenuToggle={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 lg:px-8 lg:py-6 no-scrollbar">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
}
