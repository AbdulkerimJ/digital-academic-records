import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../../api/dashboard.api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data?.stats || {};

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents || 0,
      icon: GraduationCap,
      description: "Students on platform",
    },
    {
      title: "Admins",
      value: stats.totalUsers || 0,
      icon: Users,
      description: "System staff",
    },
    {
      title: "Exams",
      value: stats.totalExams || 0,
      icon: FileText,
      description: "Exam records",
    },
    {
      title: "Degrees",
      value: stats.totalDegrees || 0,
      icon: CheckCircle2,
      description: "Certificates",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingCorrections || 0,
      icon: AlertCircle,
      description: "Needs review",
      urgent: stats.pendingCorrections > 0,
    },
  ];

  if (user?.roleName === "SUPER_ADMIN") {
    statCards.unshift({
      title: "Institutions",
      value: stats.totalInstitutions || 0,
      icon: Building2,
      description: "Schools and Boards",
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-xl bg-muted/20" />
          <Skeleton className="h-4 w-48 bg-muted/20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 bg-muted/10 border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Refined Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={10} className="animate-pulse" /> System Online
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} /> Last Sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
            Welcome, <span className="text-primary">{user?.firstName || 'Admin'}</span>
          </h2>
        </div>
      </div>

      {/* 2. Beautified Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "group relative bg-card border border-border p-6 flex flex-col justify-between gap-8 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden",
              stat.urgent && "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
            )}
          >
            {/* Top Accent Line */}
            <div className={cn(
              "absolute top-0 left-0 h-[2px] transition-all duration-500 group-hover:w-full",
              stat.urgent ? "bg-amber-500 w-full" : "bg-primary w-8"
            )} />

            {/* Faint Background Pattern (Only on Hover) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity duration-700 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px]" />

            <div className="flex items-start justify-between relative z-10">
              <div className={cn(
                "w-11 h-11 flex items-center justify-center border transition-all duration-500",
                stat.urgent 
                  ? "bg-amber-500 border-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                  : "bg-background border-border text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              )}>
                <stat.icon size={20} />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600/40 uppercase tracking-widest">
                <ShieldCheck size={12} /> SECURE
              </div>
            </div>

            <div className="space-y-1 text-left relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                  {stat.title}
                </p>
                {stat.urgent && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
              </div>
              <div className="flex items-end justify-between gap-2">
                <h3 className="text-3xl font-black tracking-tighter text-foreground font-mono leading-none">
                  {stat.value.toLocaleString()}
                </h3>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-tight pb-1",
                  stat.urgent ? "text-amber-600" : "text-muted-foreground/60"
                )}>
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 3. Action Protocol Card */}
        <div className="bg-primary p-6 flex flex-col justify-between text-white group hover:brightness-105 transition-all shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex items-center justify-between text-white relative z-10">
            <h4 className="text-sm font-black uppercase tracking-widest">Recent Activity</h4>
            <TrendingUp size={16} className="opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          
          <div className="space-y-4 mt-6 relative z-10 text-left">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Check system actions</p>
             <Link to="/audit-logs">
               <button className="h-10 w-full bg-white/10 border border-white/20 hover:bg-white hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  View Logs <ChevronRight size={14} />
               </button>
             </Link>
          </div>
        </div>
      </div>

      {/* 4. Refined Privacy Disclaimer */}
      <div className="bg-card border border-border p-8 text-left shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
        <div className="flex items-center gap-3 text-primary mb-3">
          <ShieldCheck size={18} />
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Privacy Notice</h4>
        </div>
        <p className="text-[13px] text-muted-foreground font-medium tracking-tight max-w-4xl leading-relaxed">
          This administrative panel is restricted to authorized personnel. Every action you take is automatically logged for security and auditing purposes. Please ensure you logout when your session is finished.
        </p>
      </div>

    </div>
  );
}
