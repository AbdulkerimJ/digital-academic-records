import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useAuth } from "../../context/AuthContext"
import DegreeLevelsTable from "./DegreeLevelsTable"
import DegreeTitlesTable from "./DegreeTitlesTable"
import { LayoutGrid, GraduationCap, Settings2 } from "lucide-react"

export default function DegreesPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN"

  return (
    <div className="space-y-6">
      <Tabs defaultValue="records" className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border/50">
            <TabsTrigger value="records" className="gap-2 px-6">
              <LayoutGrid size={16} /> Records
            </TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger value="levels" className="gap-2 px-6">
                  <GraduationCap size={16} /> Levels
                </TabsTrigger>
                <TabsTrigger value="titles" className="gap-2 px-6">
                  <Settings2 size={16} /> Titles
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="records" className="mt-6 border-none p-0 outline-none">
          <div className="bg-card border border-border/60 rounded-3xl p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-4">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Degree Records</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              The record management system is currently under development. Stay tuned for single and bulk issuance features.
            </p>
          </div>
        </TabsContent>

        {isSuperAdmin && (
          <>
            <TabsContent value="levels" className="mt-6 outline-none">
              <DegreeLevelsTable />
            </TabsContent>
            <TabsContent value="titles" className="mt-6 outline-none">
              <DegreeTitlesTable />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
