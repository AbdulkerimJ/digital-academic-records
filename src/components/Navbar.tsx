// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Portal", path: "/portal" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export function Navbar(): JSX.Element {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-lg backdrop-blur-xl" : "backdrop-blur-sm"
      }`}
    >
      <div className="bg-[rgba(10,26,47,0.6)] border-b border-white/6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo + side-by-side texts */}
            <Link to="/" className="flex items-center gap-4">
              <motion.img
                src="/logo.png"
                alt="NILARVS logo"
                className="h-10 w-10 rounded-md object-contain"
                initial={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260 }}
              />

              {/* Texts side-by-side */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <div className="text-sm font-display font-bold text-[#F7F4EE]">NILARVS</div>
                <div className="text-xs text-[#D7D4CC] hidden sm:block">National ID‑Linked Academic Verification</div>
              </div>
            </Link>

            {/* Desktop nav (texts side-by-side already) */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      className={active ? "bg-[#D4A017] text-white border-none" : "text-[#F7F4EE]"}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile toggle */}
            <div className="md:hidden">
              <button
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((s) => !s)}
                className="p-2 rounded-md bg-white/6 hover:bg-white/8"
              >
                {mobileOpen ? <X className="h-5 w-5 text-[#F7F4EE]" /> : <Menu className="h-5 w-5 text-[#F7F4EE]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu (animated) */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={mobileOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-4 pb-4 pt-2 space-y-2 border-t border-white/6 bg-[rgba(10,26,47,0.85)]">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-left text-[#F7F4EE]">
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

