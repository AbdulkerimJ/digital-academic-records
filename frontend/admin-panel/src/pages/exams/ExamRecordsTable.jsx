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
import { Plus, Edit2, Trash2, Search, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import ExamAddEditModal from "./ExamAddEditModal"
import BulkUploadModal from "../../components/common/BulkUploadModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import Pagination from "../../components/common/Pagination"
import { useSearchParams } from "react-router-dom"

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

  const examsData = data?.data?.examRecords
  const exams = Array.isArray(examsData) ? examsData : []
  const totalCount = data?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  // Predictive Prefetching for next/prev pages
  useEffect(() => {
    const commonParams = { search: searchQuery, limit }
    
    // Prefetch Next Page
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["exams", page + 1, limit, searchQuery],
        queryFn: () => listExams({ ...commonParams, page: page + 1 })
      })
    }

    // Prefetch Previous Page
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["exams", page - 1, limit, searchQuery],
        queryFn: () => listExams({ ...commonParams, page: page - 1 })
      })
    }
  }, [page, searchQuery, limit, totalPages, queryClient])

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExam(id),
    onSuccess: () => {
      toast.success("Exam record deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ["exams"] })
      setIsDeleteModalOpen(false)
      setRecordToDelete(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete exam"),
  })

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams)
      if (searchInput) newParams.set("search", searchInput)
      else newParams.delete("search")
      newParams.set("page", "1")
      setSearchParams(newParams)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, setSearchParams, searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
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
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card border border-border/60 p-4 rounded-2xl shadow-sm relative overflow-hidden">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto relative z-10">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by student name or National ID..."
              className="pl-9 rounded-xl bg-background border-border/60 focus-visible:ring-primary/20 h-10 font-medium"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2 w-full md:w-auto relative z-10">
          <Button
            variant="outline"
            className="flex-1 md:flex-none rounded-xl h-10 font-black gap-2 border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => setIsBulkOpen(true)}
          >
            <UploadCloud size={16} /> Bulk Upload CSV
          </Button>
          <Button
            className="flex-1 md:flex-none rounded-xl h-10 font-black gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            onClick={openAddModal}
          >
            <Plus size={16} /> Add Single Record
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest py-5">Student</TableHead>
                <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest py-5">Exam Level</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Year</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Scores</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableBodySkeleton columns={6} rows={5} />
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium">
                    No exam records found.
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-muted/10 transition-colors border-border/40">
                    <TableCell className="py-4">
                      <div className="font-bold text-sm text-foreground">{exam.studentFirstName} {exam.studentLastName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{exam.studentNationalId}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-bold text-sm">{exam.examLevelName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{exam.examLevelCode} · {exam.institutionName}</div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge variant="outline" className="font-black text-xs px-2.5 py-0.5 rounded-lg border-muted-foreground/20">
                        {exam.year}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge className={`font-black text-[10px] px-3 uppercase rounded-full ${exam.resultStatus === 'PASS' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-destructive/10 text-destructive border-none'}`}>
                        {exam.resultStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-xs font-medium space-y-0.5">
                        {exam.totalScore && <div><span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mr-2">Total</span>{exam.totalScore}</div>}
                        {exam.averageScore && <div><span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mr-2">Avg</span>{exam.averageScore}</div>}
                        {exam.percentile && <div><span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mr-2">Perc</span>{exam.percentile}%</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(exam)}
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(exam)}
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
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
      </Card>

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
          itemName={`${recordToDelete?.studentFirstName} ${recordToDelete?.studentLastName}'s ${recordToDelete?.examLevelName}`}
          title="Delete Exam Record"
        />
      )}

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        setPage={setPage} 
        limit={limit}
        setLimit={setLimit}
        totalCount={totalCount}
        itemName="exams"
        isFetching={isFetching}
      />

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
          title="Bulk Upload Exam Records"
          description="Upload a CSV file containing multiple exam records. Download the template below to ensure proper formatting."
          uploadFunction={uploadBulkExams}
          queryKeyToInvalidate="exams"
          templateUrl={user?.roleName === "SUPER_ADMIN" ? "/templates/exams_super_template.csv" : "/templates/exams_template.csv"}
        />
      )}
    </div>
  )
}
