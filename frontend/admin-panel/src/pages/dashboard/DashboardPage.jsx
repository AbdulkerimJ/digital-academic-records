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
  Clock,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"

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
      title: "Total Students",
      value: stats.totalStudents || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Registered in the system"
    },
    {
      title: "Exam Records",
      value: stats.totalExams || 0,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Academic assessments"
    },
    {
      title: "Degree Records",
      value: stats.totalDegrees || 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Certificates"
    },
    {
      title: "Pending Corrections",
      value: stats.pendingCorrections || 0,
      icon: AlertCircle,
      color: stats.pendingCorrections > 0 ? "text-amber-600" : "text-slate-400",
      bg: stats.pendingCorrections > 0 ? "bg-amber-50" : "bg-slate-50",
      description: "Awaiting review"
    }
  ]

  // Add Institutions card for Super Admin
  if (user?.roleName === "SUPER_ADMIN") {
    statCards.unshift({
      title: "Institutions",
      value: stats.totalInstitutions || 0,
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "Verified partners"
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground font-medium">
          Welcome back, <span className="text-foreground font-bold">{user?.firstName}</span>. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black mb-1">{stat.value.toLocaleString()}</h3>
                <p className="text-[10px] font-medium text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <Clock size={18} />
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground font-medium">
                No recent activity found.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${activity.type === 'degree' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {activity.type === 'degree' ? <GraduationCap size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{activity.student}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                          {activity.type} recorded · {activity.institution}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 justify-end text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 size={10} /> VERIFIED
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

