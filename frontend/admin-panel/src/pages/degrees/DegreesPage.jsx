import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useAuth } from "../../context/AuthContext"
import DegreeLevelsTable from "./DegreeLevelsTable"
import DegreeTitlesTable from "./DegreeTitlesTable"
import DegreeRecordsTable from "./DegreeRecordsTable"
import { LayoutGrid, GraduationCap, Settings2 } from "lucide-react"

import { useSearchParams } from "react-router-dom"

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

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <DegreeRecordsTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border/50">
            <TabsTrigger value="records" className="gap-2 px-6">
              <LayoutGrid size={16} /> Records
            </TabsTrigger>
            <TabsTrigger value="levels" className="gap-2 px-6">
              <GraduationCap size={16} /> Levels
            </TabsTrigger>
            <TabsTrigger value="titles" className="gap-2 px-6">
              <Settings2 size={16} /> Titles
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="records" className="mt-6 border-none p-0 outline-none">
          <DegreeRecordsTable />
        </TabsContent>

        <TabsContent value="levels" className="mt-6 outline-none">
          <DegreeLevelsTable />
        </TabsContent>
        <TabsContent value="titles" className="mt-6 outline-none">
          <DegreeTitlesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
