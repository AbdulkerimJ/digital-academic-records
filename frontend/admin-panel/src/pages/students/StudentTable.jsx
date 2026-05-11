import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listStudents, deleteStudent } from "../../api/students.api"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import { 
  Search, 
  Calendar,
  Eye,
  Trash2,
  ArrowRight,
  Fingerprint,
  Activity
} from "lucide-react"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import useDebounce from "../../hooks/useDebounce"
import Pagination from "../../components/common/Pagination"
import { useSearchParams } from "react-router-dom"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import { cn } from "../../lib/utils"

export default function StudentTable({ onSelectStudent }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const searchTerm = searchParams.get("search") || ""
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data: studentsData, isLoading, isFetching } = useQuery({
    queryKey: ["students", debouncedSearch, page, limit],
    queryFn: () => listStudents({ 
      search: debouncedSearch, 
      page, 
      limit
    })
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      toast.success("Record deleted.")
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setIsDeleteModalOpen(false)
      setStudentToDelete(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed")
  })

  const studentsRaw = studentsData?.data?.students
  const students = Array.isArray(studentsRaw) ? studentsRaw : []
  const totalCount = studentsData?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  const getInitials = (s) => `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase()

  const handleSearchChange = (value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set("search", value)
    } else {
      newParams.delete("search")
    }
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const handleDeleteClick = (e, student) => {
    e.stopPropagation()
    setStudentToDelete(student)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete.id)
    }
  }

  const startRange = (page - 1) * limit + 1
  const endRange = Math.min(page * limit, totalCount)

  return (
    <div className="bg-card border border-border shadow-sm p-1">
      {/* 1. Search Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 border-b border-border p-1.5 relative overflow-hidden">
        <FetchingIndicator isFetching={isFetching} />
        <div className="relative w-full md:max-w-lg group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search students by name or ID..." 
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 pl-12 rounded-none bg-card border-border focus-visible:ring-primary/20 text-xs font-bold tracking-tight placeholder:text-muted-foreground/30"
          />
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1 bg-muted/20 border border-border text-[11px] font-semibold text-muted-foreground tracking-widest">
              <Activity size={10} className="text-primary" /> 
              Showing {startRange}—{endRange} of {totalCount}
           </div>
        </div>
      </div>

      {/* 2. Data Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead className="py-2 px-8 text-[13px] font-bold tracking-widest text-muted-foreground border-r border-border/50 w-[350px]">Student name</TableHead>
              <TableHead className="py-2 px-8 text-[13px] font-bold tracking-widest text-muted-foreground border-r border-border/50 w-[200px]">ID number</TableHead>
              <TableHead className="py-2 px-8 text-[13px] font-bold tracking-widest text-muted-foreground border-r border-border/50 w-[200px]">Date of birth</TableHead>
              <TableHead className="py-2 px-8 text-[13px] font-bold tracking-widest text-muted-foreground border-r border-border/50 w-[150px] text-center">Status</TableHead>
              <TableHead className="text-right pr-10 py-2 text-[13px] font-bold tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableBodySkeleton rows={limit} columns={5} />
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-96 text-center border-none">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                    <div className="w-16 h-16 bg-muted/30 flex items-center justify-center mb-6 border border-border">
                      <Fingerprint size={32} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-bold text-foreground">No students found</p>
                    <p className="text-[10px] font-bold text-muted-foreground max-w-xs mt-2 mb-8 leading-relaxed tracking-tight">No student records were found matching your search.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow 
                  key={student.id} 
                  className="group border-border hover:bg-primary/[0.02] transition-colors cursor-pointer border-b last:border-0" 
                  onClick={() => onSelectStudent(student.id)}
                >
                  <TableCell className="py-1.5 px-8">
                    <div className="flex items-center gap-5">
                      <div className="h-7 w-7 bg-muted/20 border border-border flex items-center justify-center text-muted-foreground font-black text-[9px] shrink-0 font-mono group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-all">
                        {getInitials(student)}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="font-medium text-base tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                          {student.firstName} {student.lastName}
                        </span>
                        <code className="text-xs font-normal text-muted-foreground/40 mt-0.5 truncate tracking-tight">Verified student</code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-8">
                    <div className="flex items-center gap-2">
                      <Fingerprint size={12} className="text-primary opacity-30" />
                      <code className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 border border-primary/10 font-mono">
                        {student.nationalId}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-8">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70 tracking-tight">
                      <Calendar size={12} className="opacity-30" />
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-8 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-700 tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10 py-1.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDeleteClick(e, student)}
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </Button>
                      <ArrowRight size={14} className="ml-2 text-muted-foreground/20 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 3. Pagination */}
      <div className="px-8 py-1 border-t border-border bg-muted/5">
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          setPage={(p) => {
            const newParams = new URLSearchParams(searchParams)
            newParams.set("page", p.toString())
            setSearchParams(newParams)
          }} 
          limit={limit} 
          setLimit={(l) => {
            const newParams = new URLSearchParams(searchParams)
            newParams.set("limit", l.toString())
            newParams.set("page", "1")
            setSearchParams(newParams)
          }} 
          totalCount={totalCount} 
          itemName="students" 
          isFetching={isFetching} 
        />
      </div>

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
          title="Delete student"
          description={
            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                Are you sure you want to delete the student record for <span className="text-foreground font-black underline underline-offset-4 decoration-primary/30">"{studentToDelete?.firstName} {studentToDelete?.lastName}"</span>?
              </p>
              <div className="bg-destructive/5 border-l-2 border-destructive p-4">
                <p className="text-[10px] font-bold text-destructive tracking-widest">Warning: Permanent action</p>
                <p className="text-[10px] font-bold text-destructive/70 mt-1">This will remove the student from the system. This cannot be undone.</p>
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}
