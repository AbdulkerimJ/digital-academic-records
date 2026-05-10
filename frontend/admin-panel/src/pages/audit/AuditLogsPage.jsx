import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { History, Activity, AlertTriangle, ShieldCheck, Clock } from "lucide-react"
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
    newParams.set("page", "1")
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

  const { data, error, isFetching } = useQuery({
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
      <Card className="p-12 flex flex-col items-center justify-center text-center border-destructive/20 bg-destructive/5 rounded-none">
        <AlertTriangle size={48} className="text-destructive mb-4" />
        <h3 className="text-sm font-black uppercase tracking-widest text-destructive mb-2">Security Fetch Error</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">{error.response?.data?.message || error.message}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={10} className="animate-pulse" /> SYSTEM ONLINE
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
            Audit <span className="text-primary">Logs</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            Monitor all administrative actions and security events across the platform.
          </p>
        </div>
      </div>

      {/* 2. Filters */}
      <AuditLogsFilters 
        actionFilter={actionFilter}
        setActionFilter={(val) => updateFilters({ action: val })}
        entityFilter={entityFilter}
        setEntityFilter={(val) => updateFilters({ entityType: val })}
        onClear={clearFilters}
      />

      {/* 3. Activity Feed */}
      <div className="bg-card border border-border shadow-sm p-1">
        <AuditLogsTable 
          logs={logs}
          totalCount={totalCount}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          isFetching={isFetching}
          onViewDetails={handleViewDetails}
        />
      </div>

      <AuditLogDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  )
}
