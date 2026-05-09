import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { History, Activity, AlertTriangle, ShieldCheck } from "lucide-react"
import { Card } from "../../components/ui/card"
import { toast } from "sonner"

import { getAuditLogs } from "../../api/audit.api"
import AuditLogsFilters from "./AuditLogsFilters"
import AuditLogsTable from "./AuditLogsTable"
import AuditLogDetailsModal from "./AuditLogDetailsModal"
import FetchingIndicator from "../../components/common/FetchingIndicator"

export default function AuditLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedLog, setSelectedLog] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Derive filters and pagination from URL
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "20", 10)
  const actionFilter = searchParams.get("action") || "all"
  const entityFilter = searchParams.get("entityType") || "all"

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || !value) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    newParams.set("page", "1") // Reset to page 1 on filter change
    setSearchParams(newParams)
  }

  const setPage = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", newPage.toString())
    setSearchParams(newParams)
  }

  const setLimit = (newLimit) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("limit", newLimit.toString())
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["audit-logs", { page, limit, actionFilter, entityFilter }],
    queryFn: () => getAuditLogs({
      page,
      limit,
      action: actionFilter !== "all" ? actionFilter : undefined,
      entityType: entityFilter !== "all" ? entityFilter : undefined
    }),
    keepPreviousData: true,
  })

  const logs = data?.data?.logs || []
  const totalCount = data?.data?.totalCount || 0

  const handleViewDetails = (log) => {
    setSelectedLog(log)
    setIsDetailsModalOpen(true)
  }

  if (error) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center border-destructive/20 bg-destructive/5">
        <AlertTriangle size={48} className="text-destructive mb-4" />
        <h3 className="text-xl font-bold text-destructive mb-2">Failed to load activity logs</h3>
        <p className="text-muted-foreground">{error.response?.data?.message || error.message}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
        <FetchingIndicator isFetching={isFetching} />
        <div className="absolute -right-12 -top-12 text-primary/5 rotate-12 pointer-events-none">
          <History size={200} />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 bg-background shadow-sm rounded-xl text-primary border border-primary/10">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">System Activity Logs</h2>
            <p className="text-muted-foreground mt-1">Monitor all administrative actions and security events across the platform.</p>
          </div>
        </div>
      </div>

      <AuditLogsFilters 
        actionFilter={actionFilter}
        setActionFilter={(val) => updateFilters({ action: val })}
        entityFilter={entityFilter}
        setEntityFilter={(val) => updateFilters({ entityType: val })}
        onClear={clearFilters}
      />

      <AuditLogsTable 
        logs={logs}
        totalCount={totalCount}
        currentPage={page}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        isFetching={isLoading}
        onViewDetails={handleViewDetails}
      />

      <AuditLogDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  )
}
