import { useState, useEffect } from "react"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { listCorrectionRequests } from "../../api/corrections.api"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  ArrowRight,
  Activity,
  ShieldCheck
} from "lucide-react"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import Pagination from "../../components/common/Pagination"
import { useSearchParams, useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function CorrectionTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const statusFilter = searchParams.get("status") || "pending"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  const { data: requestsData, isLoading, isFetching } = useQuery({
    queryKey: ["correction-requests", statusFilter, page, limit],
    queryFn: () => listCorrectionRequests({ status: statusFilter, page, limit })
  })

  const requests = Array.isArray(requestsData?.data?.requests) ? requestsData.data.requests : []
  const totalCount = requestsData?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  const setStatusFilter = (status) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("status", status)
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

  return (
    <div className="space-y-4">
      {/* 1. Industrial Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 border-b border-border p-1.5 relative overflow-hidden">
        <FetchingIndicator isFetching={isFetching} />
        <div className="flex items-center gap-0 bg-card border border-border">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-none h-9 px-6 text-xs font-bold transition-all border-r last:border-0 border-border",
                statusFilter === status 
                  ? "bg-primary text-white hover:bg-primary hover:text-white" 
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 pr-4">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <Activity size={10} /> Found {totalCount} requests
           </div>
        </div>
      </div>

      {/* 2. Request Grid */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead className="w-[280px] text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Student name</TableHead>
              <TableHead className="text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Institution</TableHead>
              <TableHead className="text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Type</TableHead>
              <TableHead className="text-[13px] font-bold text-muted-foreground py-2 px-6 border-r border-border/50">Details</TableHead>
              <TableHead className="text-[13px] font-bold text-muted-foreground py-2 text-center border-r border-border/50">Status</TableHead>
              <TableHead className="text-right pr-8 text-[13px] font-bold text-muted-foreground py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && requests.length === 0 ? (
              <TableBodySkeleton rows={limit} columns={6} />
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3 py-12 opacity-30">
                    <ShieldCheck size={48} strokeWidth={1} />
                    <p className="text-xs font-bold">No correction requests found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow 
                  key={request.id} 
                  className="group border-border hover:bg-primary/[0.02] transition-colors cursor-pointer border-b last:border-0"
                  onClick={() => navigate(`/corrections/${request.id}`)}
                >
                  <TableCell className="py-1.5 pl-6">
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {request.studentFirstName} {request.studentLastName}
                      </span>
                      <code className="text-xs font-normal text-muted-foreground font-mono">
                        {request.studentNationalId}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-xs tracking-tight text-foreground line-clamp-1 max-w-[150px]">
                        {request.institutionName}
                      </span>
                      <code className="text-[10px] font-normal text-muted-foreground/40 font-mono">
                        {request.institutionId?.slice(0, 12)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <div className="inline-flex px-2 py-0.5 bg-muted/50 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {request.recordType}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-6">
                    <p className="text-xs font-medium text-muted-foreground line-clamp-1 max-w-[200px]">
                      {request.requestText}
                    </p>
                  </TableCell>
                  <TableCell className="py-1.5 px-6 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-semibold tracking-widest",
                      request.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                      request.status === 'PENDING' ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                      "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {(request.status === 'APPROVED' || request.status === 'PENDING') && (
                        <div className={cn(
                          "w-1 h-1 rounded-full animate-pulse",
                          request.status === 'APPROVED' ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                      )}
                      {request.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8 py-1.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all"
                      >
                        <ArrowRight size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Standard Pagination */}
      <div className="p-1 border-t border-border bg-muted/5">
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          setPage={setPage} 
          limit={limit}
          setLimit={setLimit}
          totalCount={totalCount}
          itemName="requests"
          isFetching={isFetching}
        />
      </div>
    </div>
  )
}
