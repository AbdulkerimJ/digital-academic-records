import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useAuth } from "../../context/AuthContext"
import ExamLevelsTable from "./ExamLevelsTable"
import { LayoutGrid, BookOpen } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import ExamRecordsTable from "./ExamRecordsTable"

export default function ExamsPage() {
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
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border/50">
            <TabsTrigger value="records" className="gap-2 px-6">
              <LayoutGrid size={16} /> Results
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="levels" className="gap-2 px-6">
                <BookOpen size={16} /> Levels
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="records" className="mt-6 border-none p-0 outline-none">
          <ExamRecordsTable />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="levels" className="mt-6 outline-none">
            <ExamLevelsTable />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
