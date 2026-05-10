import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLocation, NavLink } from "react-router-dom";
import { Moon, Sun, LogOut, ChevronDown, User, ShieldCheck, Activity, Menu } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const sectionTitles = [
  {
    path: "/",
    title: "Dashboard",
    description: "Overview of all system activity and records.",
  },
  {
    path: "/users",
    title: "Admin Users",
    description: "Manage who has access to this system.",
  },
  {
    path: "/institutions",
    title: "Institutions",
    description: "Manage schools and organizations on the platform.",
  },
  {
    path: "/students",
    title: "Students",
    description: "View and manage all student records.",
  },
  {
    path: "/degrees",
    title: "Degrees",
    description: "Manage and issue digital degree certificates.",
  },
  {
    path: "/exams",
    title: "Exams",
    description: "Manage exam records and results.",
  },
  {
    path: "/corrections",
    title: "Correction Requests",
    description: "Review and approve data change requests.",
  },
  {
    path: "/profile",
    title: "Profile Settings",
    description: "Update your personal details and security.",
  },
];

function getInitials(user) {
  const firstInitial = user?.firstName?.[0] || "D";
  const lastInitial = user?.lastName?.[0] || "A";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function getSection(pathname) {
  const exactMatch = sectionTitles.find((section) => section.path === pathname);
  if (exactMatch) return exactMatch;

  const nestedMatch = sectionTitles
    .filter((section) => section.path !== "/")
    .find((section) => pathname.startsWith(section.path));

  return nestedMatch || sectionTitles[0];
}

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const section = getSection(location.pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card px-4 md:px-8 py-4 shadow-sm transition-all duration-500">
      <div className="flex flex-wrap items-center justify-between gap-6">
        
        {/* Page Context */}
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={onMenuToggle}
            className="p-2 -ml-2 text-muted-foreground hover:text-primary lg:hidden transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 space-y-0.5 text-left">
            <h2 className="text-xl md:text-2xl font-black tracking-tighter text-foreground capitalize leading-tight truncate">
              {section.title}
            </h2>
            <p className="hidden md:block text-[10px] font-bold text-muted-foreground capitalize tracking-widest opacity-70 truncate">
              {section.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-12 w-12 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-12 pl-1 pr-4 border border-border bg-background flex items-center gap-3 hover:border-primary/50 transition-all group shadow-sm">
                <div className="h-10 w-10 bg-primary flex items-center justify-center text-[11px] font-black text-white">
                  {getInitials(user)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-black capitalize tracking-widest text-foreground leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="mt-1.5 text-[9px] font-black text-primary capitalize tracking-tighter">
                    {user?.roleName}
                  </p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-none border-border bg-card p-0 overflow-hidden shadow-2xl">
              <DropdownMenuLabel className="p-6 bg-muted/20 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary flex items-center justify-center text-xs font-black text-white">
                    {getInitials(user)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-black capitalize tracking-tight text-foreground truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground capitalize tracking-widest truncate">
                      {user?.institutionName}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <div className="p-2">
                <NavLink to="/profile">
                  <DropdownMenuItem className="group flex items-center gap-4 px-4 py-3 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all">
                    <User size={16} />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black capitalize tracking-widest">My Profile</span>
                      <span className="text-[8px] capitalize opacity-70">Settings and personal info</span>
                    </div>
                  </DropdownMenuItem>
                </NavLink>

                <DropdownMenuSeparator className="bg-border/50 mx-2" />

                <DropdownMenuItem
                  className="flex items-center gap-4 px-4 py-3 text-destructive focus:bg-destructive/10 focus:text-destructive rounded-none cursor-pointer transition-all"
                  onClick={logout}
                >
                  <LogOut size={16} />
                  <span className="text-[10px] font-black capitalize tracking-widest">Logout</span>
                </DropdownMenuItem>
              </div>

              <div className="bg-muted/30 p-3 border-t border-border flex items-center justify-between">
                 <span className="text-[8px] font-black text-muted-foreground capitalize">{user?.institutionType}</span>
                 <ShieldCheck size={12} className="text-primary" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
