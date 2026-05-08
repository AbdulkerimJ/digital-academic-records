import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "../../api/dashboard.api"
import { useAuth } from "../../context/AuthContext"
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Building2, 
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { Skeleton } from "../../components/ui/skeleton"
import { Badge } from "../../components/ui/badge"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  })

  const stats = data?.data?.stats || {}
  const activities = data?.data?.recentActivities || []

  const statCards = [
    {
      title: "Students",
      value: stats.totalStudents || 0,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      description: "Identity verified"
    },
    {
      title: "Administrators",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      description: "Active platform users"
    },
    {
      title: "Exam Records",
      value: stats.totalExams || 0,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      description: "Validated results"
    },
    {
      title: "Degrees Issued",
      value: stats.totalDegrees || 0,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      description: "Digital certificates"
    },
    {
      title: "Corrections",
      value: stats.pendingCorrections || 0,
      icon: AlertCircle,
      color: stats.pendingCorrections > 0 ? "text-amber-600" : "text-slate-400",
      bg: stats.pendingCorrections > 0 ? "bg-amber-500/10" : "bg-slate-500/10",
      border: stats.pendingCorrections > 0 ? "border-amber-500/20" : "border-slate-500/20",
      description: "Awaiting review"
    }
  ]

  if (user?.roleName === "SUPER_ADMIN") {
    statCards.unshift({
      title: "Institutions",
      value: stats.totalInstitutions || 0,
      icon: Building2,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      description: "Partner registry"
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[300px] rounded-2xl" />
          <Skeleton className="h-4 w-[500px] rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Welcome Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1 rounded-lg flex gap-1.5 items-center">
                <Sparkles size={12} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Session</span>
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              Hello, <span className="text-primary">{user?.firstName}</span>
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              {stats.pendingCorrections > 0 
                ? <>System stable. <span className="text-foreground font-bold">{stats.pendingCorrections} tasks</span> need your attention.</>
                : "Everything is running smoothly. You're all caught up!"}
            </p>
          </div>
          <div className="hidden lg:block">
             <div className="h-24 w-24 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary rotate-3 hover:rotate-0 transition-transform duration-500">
                <TrendingUp size={40} />
             </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className={`group relative overflow-hidden bg-card/30 backdrop-blur-md border ${stat.border} p-6 rounded-[2rem] hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 -mr-4 -mt-4">
              <stat.icon size={80} strokeWidth={1} />
            </div>
            
            <div className="flex flex-col h-full justify-between gap-6">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black tracking-tight">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 line-clamp-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
