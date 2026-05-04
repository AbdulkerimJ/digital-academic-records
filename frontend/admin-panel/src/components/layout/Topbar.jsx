import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLocation, NavLink } from "react-router-dom";
import { Moon, Sun, LogOut, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";

const sectionTitles = [
  {
    path: "/",
    title: "Dashboard overview",
    description:
      "Monitor records, institutions, and verification activity in one place.",
  },
  {
    path: "/users",
    title: "User administration",
    description:
      "Manage platform roles and privileged access for the records team.",
  },
  {
    path: "/institutions",
    title: "Institution registry",
    description:
      "Track the organizations connected to the academic records platform.",
  },
  {
    path: "/students",
    title: "Student records",
    description:
      "Review and maintain student identity and academic profile data.",
  },
  {
    path: "/degrees",
    title: "Degree management",
    description:
      "Handle qualifications, titles, and credential issuance records.",
  },
  {
    path: "/exams",
    title: "Examination records",
    description: "Maintain exam results and board-level academic evidence.",
  },
  {
    path: "/corrections",
    title: "Correction requests",
    description:
      "Process record amendments and verification follow-up requests.",
  },
  {
    path: "/profile",
    title: "Account settings",
    description:
      "Manage your personal information, and account security.",
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

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const section = getSection(location.pathname);
  const roleLabel =
    user?.roleName?.replaceAll("_", " ").toLowerCase() || "workspace access";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Academic operations
            </p>
            <Badge variant="secondary" className="rounded-full">
              {roleLabel}
            </Badge>
          </div>
          <h2 className="mt-1 truncate text-lg font-semibold text-foreground sm:text-xl">
            {section.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {section.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-11 w-11 rounded-2xl"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Separator orientation="vertical" className="hidden h-10 sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 gap-3 rounded-2xl px-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {user?.institutionName || "Digital Academic Records"}
                  </p>
                </div>
                <ChevronDown size={16} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.roleName?.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-2" />
              
              <NavLink to="/profile">
                <DropdownMenuItem className="gap-3 rounded-xl px-3 py-2.5 cursor-pointer focus:bg-accent transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Account Settings</span>
                    <span className="text-[10px] text-muted-foreground">Manage your profile and security</span>
                  </div>
                </DropdownMenuItem>
              </NavLink>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem
                className="gap-3 rounded-xl px-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                onClick={logout}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <LogOut size={16} />
                </div>
                <span className="font-semibold">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
