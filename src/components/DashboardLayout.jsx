import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, 
  User, Bell, LogOut, ShieldCheck 
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { getMainUrl } from "@/lib/domain";
import { useNavigate } from "react-router-dom";

export function DashboardLayout({ children, menuItems, activeTab, userRole, basePath }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to securely end your session and log out?")) {
      window.location.href = getMainUrl();
    }
  };

  const handleTabChange = (id) => {
    navigate(`${basePath}/${id}`);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* 1. TOP BAR (Permanent) */}
      <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-sm shadow-lg">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-primary">NILARVS</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-accent">National Registry</p>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-border mx-2" />
          <div className="hidden md:block">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{userRole}</div>
            <div className="text-xs font-mono font-medium text-success flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
               Secure Session Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="h-10 w-10 flex items-center justify-center rounded-sm hover:bg-secondary transition-colors relative">
             <Bell className="h-5 w-5 text-muted-foreground" />
             <div className="absolute top-2.5 right-2.5 h-2 w-2 bg-accent rounded-full border-2 border-background" />
          </button>
          <ThemeToggle />
          <div className="h-10 w-10 bg-secondary rounded-sm flex items-center justify-center border border-border">
             <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. SIDEBAR (Interactive & Collapsible) */}
        <motion.nav 
          animate={{ width: isCollapsed ? 80 : 280 }}
          className="bg-card border-r border-border flex flex-col h-full relative z-40"
        >
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:scale-110 transition-transform z-50"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div className="p-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-sm transition-all relative group ${
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-primary"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                    <span className="text-[9px] opacity-70 font-medium">{item.sub}</span>
                  </div>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl whitespace-nowrap z-50 border border-white/10">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border bg-secondary/10">
             <button 
               onClick={handleLogout}
               className="w-full flex items-center gap-4 p-3 text-destructive hover:bg-destructive/5 rounded-sm transition-all group relative"
             >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="text-xs font-bold uppercase tracking-wider">Logout</span>}
                {isCollapsed && (
                  <div className="absolute left-16 bg-destructive text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                    Logout
                  </div>
                )}
             </button>
          </div>
        </motion.nav>

        {/* 3. MAIN WORKSPACE (Scrollable Content) */}
        <main className="flex-1 overflow-y-auto bg-background/30 p-8 md:p-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
