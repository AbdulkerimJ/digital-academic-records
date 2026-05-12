import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  FileBadge,
  BookOpen,
  ClipboardCheck,
  Network,
  History,
  Shield,
  Activity,
  ChevronRight,
  LifeBuoy,
  X
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
    end: true,
  },
  {
    title: "Admin Users",
    href: "/users",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Institutions",
    href: "/institutions",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Students",
    href: "/students",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
  },
  {
    title: "Degrees",
    href: "/degrees",
    icon: FileBadge,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
    institutionTypes: ["COLLEGE"],
  },
  {
    title: "Exams",
    href: "/exams",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
    institutionTypes: ["EXAM_BOARD"],
  },
  {
    title: "Correction Requests",
    href: "/corrections",
    icon: ClipboardCheck,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
  },
  {
    title: "Academic Structure",
    href: "/structure",
    icon: Network,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
    institutionTypes: ["COLLEGE"],
  },
  {
    title: "Activity Logs",
    href: "/audit-logs",
    icon: History,
    roles: ["SUPER_ADMIN", "REGISTRAR"],
  },
  {
    title: "Support Queue",
    href: "/support",
    icon: LifeBuoy,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Technical Support",
    href: "#support",
    icon: LifeBuoy,
    roles: ["REGISTRAR"],
    isModal: true
  },
];

export default function Sidebar({ isOpen, onClose, onSupportOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles.includes(user?.roleName)) return false;

    if (user?.roleName === "REGISTRAR" && item.institutionTypes) {
      return item.institutionTypes.includes(user?.institutionType);
    }

    return true;
  });

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-card transition-transform duration-300 transform lg:relative lg:translate-x-0 shadow-sm",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground lg:hidden"
      >
        <X size={20} />
      </button>

      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
             <Shield size={22} className="text-white" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-black tracking-tighter leading-none text-foreground">
              NAR
            </h1>
            <span className="text-[12px] font-black text-primary capitalize tracking-[0.2em]">National academic registry</span>
          </div>
        </Link>
      </div>

      {/* Professional Separator */}
      <div className="px-6 mb-6">
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
      </div>

      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-10">
        <div className="mb-4 px-4 flex items-center justify-between opacity-40">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Admin Protocol</span>
           <div className="h-px flex-1 bg-border ml-4" />
        </div>
        
        <div className="space-y-1">
          {filteredNavItems.map((item, index) => {
            if (item.isModal) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => onSupportOpen()}
                    className="w-full group relative flex items-center gap-4 px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-none overflow-hidden text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <item.icon size={16} className="shrink-0 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left truncate">{item.title}</span>
                  </button>
                  {index < filteredNavItems.length - 1 && (
                    <div className="px-4 my-0.5">
                      <div className="h-px w-full bg-border/20" />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-4 px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-none overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} className={cn(
                        "shrink-0 transition-transform duration-300",
                        isActive ? "scale-110" : "group-hover:scale-110 opacity-50 group-hover:opacity-100"
                      )} />
                      
                      <span className="flex-1 truncate">{item.title}</span>
                      
                      {isActive && <ChevronRight size={14} className="opacity-40" />}
                    </>
                  )}
                </NavLink>
                
                {/* Thin Line Separator between all items */}
                {index < filteredNavItems.length - 1 && (
                  <div className="px-4 my-0.5">
                    <div className="h-px w-full bg-border/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
