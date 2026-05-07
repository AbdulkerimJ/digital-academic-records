import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { listStudents } from "../../api/students.api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"
import { 
  Search, 
  UserCircle2, 
  ExternalLink, 
  Filter, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2
} from "lucide-react"
import useDebounce from "../../hooks/useDebounce"
import Pagination from "../../components/common/Pagination"

import { useSearchParams } from "react-router-dom"

import FetchingIndicator from "../../components/common/FetchingIndicator"

export default function StudentTable({ onSelectStudent }) {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const searchTerm = searchParams.get("search") || ""
  
  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data: studentsData, isLoading, isPlaceholderData, isFetching } = useQuery({
    queryKey: ["students", debouncedSearch, page, limit],
    queryFn: () => listStudents({ 
      search: debouncedSearch, 
      page, 
      limit
    })
  })

  const queryClient = useQueryClient()
  const students = studentsData?.data?.students || []
  const totalCount = studentsData?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  // Predictive Prefetching for next/prev pages
  useEffect(() => {
    const commonParams = { search: debouncedSearch, limit }
    
    // Prefetch Next Page
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["students", debouncedSearch, page + 1, limit],
        queryFn: () => listStudents({ ...commonParams, page: page + 1, limit })
      })
    }

    // Prefetch Previous Page
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["students", debouncedSearch, page - 1, limit],
        queryFn: () => listStudents({ ...commonParams, page: page - 1, limit })
      })
    }
  }, [page, debouncedSearch, limit, totalPages, queryClient])

  const getInitials = (s) => `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase()

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

  const handleSearchChange = (value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set("search", value)
    } else {
      newParams.delete("search")
    }
    newParams.set("page", "1") // Reset to page 1 on search
    setSearchParams(newParams)
  }

  const onPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const onItemsPerPageChange = (newLimit) => {
    setLimit(newLimit)
  }

  const startRange = (page - 1) * limit + 1
  const endRange = Math.min(page * limit, totalCount)

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border/60 p-4 rounded-2xl shadow-sm relative overflow-hidden">
        <FetchingIndicator isFetching={isFetching} />
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input 
            placeholder="Search by name or National ID..." 
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-muted/20 border-none focus-visible:ring-primary/20 text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-bold whitespace-nowrap px-4 lowercase tracking-tight">
            showing {totalCount > 0 ? startRange : 0} to {endRange} of {totalCount} students
          </span>
        </div>
      </div>

      {/* Table Container */}
      <Card className="rounded-3xl border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-muted/60">
                <TableHead className="w-[80px] pl-6"></TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">National ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="text-right pr-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isFetching && students.length === 0) ? (
                <TableBodySkeleton rows={limit} columns={7} />
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2">
                      <UserCircle2 size={40} className="opacity-20" />
                      <span>No students found matching your criteria.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className="border-muted/40 hover:bg-muted/5 transition-colors group cursor-pointer" onClick={() => onSelectStudent(student.id)}>
                    <TableCell className="pl-6 py-4">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-primary/5">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">
                          {getInitials(student)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{student.firstName} {student.lastName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Verified Identity</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <code className="text-xs font-bold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md">
                        {student.nationalId}
                      </code>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Calendar size={12} className="opacity-70" />
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="ghost" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        {student.gender || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="rounded-md bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase font-bold tracking-widest px-2">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/5 hover:text-primary">
                        <ExternalLink size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          setPage={onPageChange} 
          limit={limit} 
          setLimit={onItemsPerPageChange} 
          totalCount={totalCount} 
          itemName="students" 
          isFetching={isFetching} 
        />
      </Card>
    </div>
  )
}
