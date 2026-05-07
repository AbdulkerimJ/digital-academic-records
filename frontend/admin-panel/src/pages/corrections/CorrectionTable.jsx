import { useState, useEffect } from "react"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import { useQuery } from "@tanstack/react-query"
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
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  ArrowRight,
  Loader2
} from "lucide-react"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import Pagination from "../../components/common/Pagination"
import { useQueryClient } from "@tanstack/react-query"

import { useSearchParams, useNavigate } from "react-router-dom"

export default function CorrectionTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const statusFilter = searchParams.get("status") || "pending"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  const { data: requestsData, isLoading, isPlaceholderData, isFetching } = useQuery({
    queryKey: ["correction-requests", statusFilter, page, limit],
    queryFn: () => listCorrectionRequests({ status: statusFilter, page, limit })
  })

  const requests = requestsData?.data?.requests || []
  const totalCount = requestsData?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  // Predictive Prefetching for next/prev pages
  useEffect(() => {
    // Prefetch Next Page
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["correction-requests", statusFilter, page + 1, limit],
        queryFn: () => listCorrectionRequests({ status: statusFilter, page: page + 1, limit })
      })
    }

    // Prefetch Previous Page
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["correction-requests", statusFilter, page - 1, limit],
        queryFn: () => listCorrectionRequests({ status: statusFilter, page: page - 1, limit })
      })
    }
  }, [page, statusFilter, limit, totalPages, queryClient])

  const setStatusFilter = (status) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("status", status)
    newParams.set("page", "1") // Reset to page 1 on status change
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
    newParams.set("page", "1") // Reset to page 1 on limit change
    setSearchParams(newParams)
  }

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full font-black text-[10px] uppercase px-3 flex items-center gap-1.5"><Clock size={12} /> Pending</Badge>
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full font-black text-[10px] uppercase px-3 flex items-center gap-1.5"><CheckCircle2 size={12} /> Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 rounded-full font-black text-[10px] uppercase px-3 flex items-center gap-1.5"><XCircle size={12} /> Rejected</Badge>
      default:
        return <Badge variant="secondary" className="rounded-full font-black text-[10px] uppercase px-3">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border/60 p-4 rounded-2xl shadow-sm relative overflow-hidden">
        <FetchingIndicator isFetching={isFetching} />
        <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? "shadow-md" : "text-muted-foreground"}`}
            >
              {status}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium px-4">
            {totalCount} Requests found
          </span>
        </div>
      </div>

      {/* Table Container */}
      <Card className="rounded-3xl border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[280px] text-[10px] font-black uppercase tracking-widest py-5">Student / National ID</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Institution</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Record Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Request Text</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isFetching && requests.length === 0) ? (
                <TableBodySkeleton rows={limit} columns={5} />
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center text-muted-foreground/40 mb-2">
                        <Filter size={32} />
                      </div>
                      <p className="text-muted-foreground font-bold text-sm">No correction requests found matching your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className="group border-border/40 hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/corrections/${request.id}`)}
                  >
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                          {request.studentFirstName?.[0]}{request.studentLastName?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm tracking-tight">{request.studentFirstName} {request.studentLastName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{request.studentNationalId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight text-primary/80 line-clamp-1 max-w-[150px]">{request.institutionName}</span>
                        <span className="text-[9px] font-mono font-bold text-muted-foreground/40">{request.institutionId?.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge variant="outline" className="text-[9px] font-black border-muted/60 uppercase px-2 py-0.5">
                        {request.recordType}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6">
                      <p className="text-xs font-medium text-muted-foreground line-clamp-1 max-w-[200px]">
                        {request.requestText}
                      </p>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex justify-center">
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-right px-8">
                      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 hover:bg-primary/5 hover:text-primary transition-all">
                        <ArrowRight size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}
