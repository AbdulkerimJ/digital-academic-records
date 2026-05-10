import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listExams, deleteExam, uploadBulkExams } from "../../api/exams.api"
import { useAuth } from "../../context/AuthContext"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { Plus, Edit2, Trash2, Search, UploadCloud, Activity, ShieldCheck, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import ExamAddEditModal from "./ExamAddEditModal"
import BulkUploadModal from "../../components/common/BulkUploadModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import Pagination from "../../components/common/Pagination"
import { useSearchParams } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function ExamRecordsTable() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const searchQuery = searchParams.get("search") || ""

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [recordToDelete, setRecordToDelete] = useState(null)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["exams", page, limit, searchQuery],
    queryFn: () => listExams({ page, limit, search: searchQuery }),
  })

  const exams = Array.isArray(data?.data?.examRecords) ? data.data.examRecords : []
  const totalCount = data?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExam(id),
    onSuccess: () => {
      toast.success("Record deleted.")
      queryClient.invalidateQueries({ queryKey: ["exams"] })
      setIsDeleteModalOpen(false)
      setRecordToDelete(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams)
      if (searchInput) newParams.set("search", searchInput)
      else newParams.delete("search")
      newParams.set("page", "1")
      setSearchParams(newParams)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, setSearchParams])

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

  const handleDeleteClick = (record) => {
    setRecordToDelete(record)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteMutation.mutate(recordToDelete.id)
    }
  }

  const openEditModal = (exam) => {
    setEditingExam(exam)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingExam(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      
      {/* 1. Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20 border-b border-border p-4 relative overflow-hidden">
        <div className="relative w-full md:max-w-md group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by student name or ID..."
            className="h-10 pl-10 rounded-none bg-card border-border focus-visible:ring-primary/20 text-xs font-bold"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto relative z-10">
          <Button
            variant="outline"
            className="flex-1 md:flex-none rounded-none h-10 px-6 font-bold text-xs border-border hover:bg-muted/50 transition-all"
            onClick={() => setIsBulkOpen(true)}
          >
            <UploadCloud size={14} /> Bulk upload
          </Button>
          <Button
            className="flex-1 md:flex-none rounded-none h-10 px-6 font-bold text-xs shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
            onClick={openAddModal}
          >
            <Plus size={14} /> Add result
          </Button>
        </div>
      </div>

      {/* 2. Data Grid */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead className="w-[200px] text-xs font-bold text-muted-foreground py-4 px-6 border-r border-border/50">Student name</TableHead>
              <TableHead className="w-[220px] text-xs font-bold text-muted-foreground py-4 px-6 border-r border-border/50">Exam level</TableHead>
              <TableHead className="text-center text-xs font-bold text-muted-foreground py-4 px-6 border-r border-border/50 w-[100px]">Year</TableHead>
              <TableHead className="text-center text-xs font-bold text-muted-foreground py-4 px-6 border-r border-border/50 w-[120px]">Result</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4 px-6 border-r border-border/50">Scores</TableHead>
              <TableHead className="text-right pr-8 text-xs font-bold text-muted-foreground py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableBodySkeleton columns={6} rows={limit} />
            ) : exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    <GraduationCap size={48} strokeWidth={1} />
                    <p className="text-xs font-bold">No exam results found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow 
                  key={exam.id} 
                  className="group border-border hover:bg-primary/[0.02] transition-colors cursor-pointer border-b last:border-0"
                >
                  <TableCell className="py-2 pl-6">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {exam.studentFirstName} {exam.studentLastName}
                      </span>
                      <code className="text-[10px] font-bold text-muted-foreground font-mono">
                        {exam.studentNationalId}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-6">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs tracking-tight text-foreground">
                        {exam.examLevelName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[8px] font-bold text-primary uppercase font-mono">{exam.examLevelCode}</code>
                        <span className="text-[9px] text-muted-foreground font-bold border-l border-border pl-2">
                          {exam.institutionName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-2 px-6">
                    <span className="text-xs font-bold font-mono text-muted-foreground">{exam.year}</span>
                  </TableCell>
                  <TableCell className="text-center py-2 px-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-bold",
                      exam.resultStatus === 'PASS' 
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {exam.resultStatus === 'PASS' && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                      {exam.resultStatus}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-6">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {exam.totalScore && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                          <span className="text-[10px] font-bold text-foreground">{exam.totalScore}</span>
                        </div>
                      )}
                      {exam.averageScore && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Avg</span>
                          <span className="text-[10px] font-bold text-foreground">{exam.averageScore}</span>
                        </div>
                      )}
                      {exam.percentile && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Perc</span>
                          <span className="text-[10px] font-bold text-foreground">{exam.percentile}%</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8 py-2">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(exam)}
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(exam)}
                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Pagination */}
      <div className="p-4 border-t border-border bg-muted/5">
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          setPage={setPage} 
          limit={limit}
          setLimit={setLimit}
          totalCount={totalCount}
          itemName="exam records"
          isFetching={isFetching}
        />
      </div>

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
          itemName={`${recordToDelete?.studentFirstName} ${recordToDelete?.studentLastName}'s ${recordToDelete?.examLevelName}`}
          title="Delete result"
          description="Are you sure you want to delete this exam result? This action will be logged."
        />
      )}

      {isModalOpen && (
        <ExamAddEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingExam}
        />
      )}

      {isBulkOpen && (
        <BulkUploadModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          title="Bulk Result Upload"
          description="Upload a CSV file to import multiple exam results simultaneously."
          uploadFunction={uploadBulkExams}
          queryKeyToInvalidate="exams"
          templateUrl={user?.roleName === "SUPER_ADMIN" ? "/templates/exams_super_template.csv" : "/templates/exams_template.csv"}
        />
      )}
    </div>
  )
}
