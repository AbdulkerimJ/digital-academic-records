import { Link, NavLink } from "react-router-dom";
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
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
    title: "Users",
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
];

function getInitials(user) {
  const firstInitial = user?.firstName?.[0] || "D";
  const lastInitial = user?.lastName?.[0] || "A";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function formatLabel(value) {
  if (!value) return "";
  return value.replaceAll("_", " ").toLowerCase();
}

export default function Sidebar() {
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles.includes(user?.roleName)) return false;

    if (user?.roleName === "REGISTRAR" && item.institutionTypes) {
      return item.institutionTypes.includes(user?.institutionType);
    }

    return true;
  });

  return (
    <aside className="relative z-10 flex h-screen w-80 shrink-0 flex-col border-r border-border bg-card/90 backdrop-blur-md">
      <div className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              DAR Admin
            </h1>
            <p className="text-xs text-muted-foreground">
              Digital Academic Records
            </p>
          </div>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {formatLabel(user?.roleName) || "workspace"}
          </Badge>
          {user?.institutionType ? (
            <Badge variant="outline" className="rounded-full">
              {formatLabel(user.institutionType)}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="px-6">
        <Separator />
      </div>

      <nav className="flex-1 px-4 py-5">
        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Navigation
        </div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-background text-muted-foreground shadow-sm ring-1 ring-border group-hover:bg-background group-hover:text-primary",
                  )}
                >
                  <item.icon size={18} />
                </span>
                <span className="flex-1">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
