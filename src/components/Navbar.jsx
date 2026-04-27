import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { isPortalSubdomain, getPortalUrl, getMainUrl } from "@/lib/domain";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isPortal = isPortalSubdomain();

  // Navigation items (Information only)
  const navItems = isPortal 
    ? [
        { label: "Main Site", path: getMainUrl(), isExternal: true },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Verification", path: "/verify" },
        { label: "Contact", path: "/contact" },
      ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderLink = (item, isMobile = false, onClick) => {
    const active = location.pathname === item.path;
    
    if (item.isExternal) {
      return (
        <a key={item.label} href={item.path} onClick={onClick} className={isMobile ? "w-full" : ""}>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start md:justify-center rounded-sm px-5 transition-colors uppercase text-[10px] font-bold tracking-widest text-muted-foreground hover:text-primary font-bold bg-transparent`}
          >
            {item.label}
          </Button>
        </a>
      );
    }

    return (
      <Link key={item.path} to={item.path} onClick={onClick} className={isMobile ? "w-full" : ""}>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start md:justify-center rounded-sm px-5 transition-colors uppercase text-[10px] font-bold tracking-widest ${
            active 
              ? "text-primary border-b-0 md:border-b-2 border-primary rounded-none bg-transparent" 
              : "text-muted-foreground hover:text-primary font-bold bg-transparent"
          }`}
        >
          {item.label}
        </Button>
      </Link>
    );
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border/80 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-12">
          <a href={getMainUrl()} className="flex items-center gap-4 group">
            <div className="relative z-10 h-10 w-10 bg-primary flex items-center justify-center shadow-md rounded-sm">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold tracking-tight text-foreground">
                NAR
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent leading-none -mt-1">
                National Academic Registry
              </span>
            </div>
          </a>

          {/* Desktop Nav - Information Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => renderLink(item))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Desktop Action Button */}
            <div className="hidden md:block">
              {isPortal ? (
                <Link to="/">
                  <Button variant="outline" size="sm" className="rounded-sm border-primary/20 hover:border-primary text-primary font-bold uppercase text-[10px] tracking-[0.1em] gap-2">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getPortalUrl()}>
                  <Button size="sm" className="rounded-sm bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-[0.1em] gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    <ShieldCheck className="h-3.5 w-3.5" /> Portal Access
                  </Button>
                </a>
              )}
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen((s) => !s)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mt-4 bg-card border border-border p-4 rounded-sm shadow-xl"
            >
              <div className="flex flex-col space-y-2 pb-4">
                {navItems.map((item) => renderLink(item, true, () => setMobileOpen(false)))}
                
                <div className="pt-4 mt-2 border-t border-border">
                  {isPortal ? (
                    <Link to="/" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full justify-center rounded-sm h-12 uppercase text-xs font-bold tracking-widest gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <a href={getPortalUrl()} onClick={() => setMobileOpen(false)}>
                      <Button className="w-full justify-center rounded-sm h-12 uppercase text-xs font-bold tracking-widest gap-2">
                        <ShieldCheck className="h-4 w-4" /> Access Secure Portal
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

