import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listDegrees, deleteDegree, uploadBulkDegrees } from "../../api/degrees.api"
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
import { Plus, Edit2, Trash2, Search, UploadCloud, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import DegreeAddEditModal from "./DegreeAddEditModal"
import BulkUploadModal from "../../components/common/BulkUploadModal"
import Pagination from "../../components/common/Pagination"
import { useSearchParams } from "react-router-dom"

export default function DegreeRecordsTable() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const searchQuery = searchParams.get("search") || ""

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingDegree, setEditingDegree] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ["degrees", page, limit, searchQuery],
    queryFn: () => listDegrees({ page, limit, search: searchQuery }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDegree(id),
    onSuccess: () => {
      toast.success("Degree record deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ["degrees"] })
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete degree"),
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
    e.preventDefault() // Form submission still works but is handled by the effect
  }

  const setPage = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", newPage.toString())
    setSearchParams(newParams)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this degree record? This action cannot be undone.")) {
      deleteMutation.mutate(id)
    }
  }

  const openEditModal = (degree) => {
    setEditingDegree(degree)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingDegree(null)
    setIsModalOpen(true)
  }

  const records = data?.data?.degrees || []
  const totalCount = data?.data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

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
                <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-widest py-5">Student</TableHead>
                <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-widest py-5">Degree Info</TableHead>
                <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-widest py-5">Academic Org</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">CGPA</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Graduation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableBodySkeleton columns={6} rows={5} />
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium">
                    No degree records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/10 transition-colors border-border/40">
                    <TableCell className="py-4">
                      <div className="font-bold text-sm text-foreground">{record.studentFirstName} {record.studentLastName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{record.studentNationalId}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-bold text-sm">{record.degreeTitle}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{record.degreeLevelName} · {record.degreeTitleCode}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-bold text-[11px] uppercase tracking-tight">{record.institutionName}</div>
                      <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{record.collegeName} · {record.departmentName}</div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge variant="outline" className="font-black text-xs px-2.5 py-0.5 rounded-lg border-primary/20 bg-primary/5 text-primary">
                        {record.cgpa}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="text-xs font-bold text-muted-foreground">
                        {new Date(record.graduationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(record)}
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
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

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {isModalOpen && (
        <DegreeAddEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingDegree}
        />
      )}

      {isBulkOpen && (
        <BulkUploadModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          title="Bulk Upload Degree Records"
          description="Upload a CSV file containing multiple degree records. Download the template below to ensure proper formatting."
          uploadFunction={uploadBulkDegrees}
          queryKeyToInvalidate="degrees"
          templateUrl={user?.roleName === "SUPER_ADMIN" ? "/templates/degrees_super_template.csv" : "/templates/degrees_template.csv"}
        />
      )}
    </div>
  )
}
