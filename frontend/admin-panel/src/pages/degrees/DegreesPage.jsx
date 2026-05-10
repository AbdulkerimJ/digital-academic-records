import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useAuth } from "../../context/AuthContext"
import DegreeLevelsTable from "./DegreeLevelsTable"
import DegreeTitlesTable from "./DegreeTitlesTable"
import DegreeRecordsTable from "./DegreeRecordsTable"
import { LayoutGrid, GraduationCap, Settings2, Activity, Clock } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function DegreesPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN"
  const currentTab = searchParams.get("tab") || "records"

  const handleTabChange = (value) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("tab", value)
    setSearchParams(newParams)
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 capitalize tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={10} className="animate-pulse" /> SYSTEM ONLINE
            </div>
            <div className="text-[9px] font-bold text-muted-foreground capitalize tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
            Degree <span className="text-primary">Management</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            View and issue academic certificates for students.
          </p>
        </div>
      </div>

      {/* 2. Navigation */}
      {isSuperAdmin ? (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between border-b border-border mb-8">
            <TabsList className="bg-transparent h-12 p-0 rounded-none gap-0">
              <TabsTrigger 
                value="records" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 h-12 text-xs font-bold transition-all"
              >
                <LayoutGrid size={14} className="mr-2" /> Degree list
              </TabsTrigger>
              <TabsTrigger 
                value="levels" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 h-12 text-xs font-bold transition-all"
              >
                <GraduationCap size={14} className="mr-2" /> Degree levels
              </TabsTrigger>
              <TabsTrigger 
                value="titles" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 h-12 text-xs font-bold transition-all"
              >
                <Settings2 size={14} className="mr-2" /> Degree titles
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="records" className="mt-0 outline-none p-1 bg-card border border-border shadow-sm">
            <DegreeRecordsTable />
          </TabsContent>

          <TabsContent value="levels" className="mt-0 outline-none p-1 bg-card border border-border shadow-sm">
            <DegreeLevelsTable />
          </TabsContent>
          
          <TabsContent value="titles" className="mt-0 outline-none p-1 bg-card border border-border shadow-sm">
            <DegreeTitlesTable />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-card border border-border shadow-sm p-1">
          <DegreeRecordsTable />
        </div>
      )}
    </div>
  )
}
