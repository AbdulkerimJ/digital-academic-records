import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  listColleges, 
  listDepartments, 
  deleteCollege, 
  deleteDepartment,
  updateCollege,
  updateDepartment,
  listInstitutions
} from "../../api/institutions.api"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { 
  Plus, 
  Building, 
  Network, 
  Pencil, 
  Trash2, 
  Activity,
  Clock,
  Building2,
  ChevronRight,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import CollegeModal from "./CollegeModal"
import DepartmentModal from "./DepartmentModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import { TableBodySkeleton } from "../../components/common/TableSkeleton"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"
import { cn } from "../../lib/utils"

export default function AcademicStructurePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN"

  // Hierarchy State
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(user?.institutionId || "")
  const [selectedCollege, setSelectedCollege] = useState(null)

  // Modals state
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState("")

  // Queries
  const { data: instData } = useQuery({
    queryKey: ["institutions", "academic"],
    queryFn: () => listInstitutions({ limit: 100, type: "COLLEGE" }), // Filter only Colleges/Universities
    enabled: isSuperAdmin
  })

  const { data: collegesData, isLoading: loadingColleges } = useQuery({
    queryKey: ["colleges", selectedInstitutionId],
    queryFn: () => listColleges(selectedInstitutionId),
    enabled: !!selectedInstitutionId
  })

  const { data: deptsData, isLoading: loadingDepts } = useQuery({
    queryKey: ["departments", selectedInstitutionId, selectedCollege?.id],
    queryFn: () => listDepartments(selectedInstitutionId, selectedCollege?.id),
    enabled: !!selectedInstitutionId && !!selectedCollege?.id
  })

  const colleges = Array.isArray(collegesData?.data?.colleges) ? collegesData.data.colleges : []
  const departments = Array.isArray(deptsData?.data?.departments) ? deptsData.data.departments : []
  const institutions = instData?.data?.institutions || []

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => 
      deleteType === "college" 
        ? deleteCollege(selectedInstitutionId, id) 
        : deleteDepartment(selectedInstitutionId, selectedCollege.id, id),
    onSuccess: () => {
      toast.success("Record deleted.")
      queryClient.invalidateQueries([deleteType === "college" ? "colleges" : "departments"])
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
      if (deleteType === "college" && selectedCollege?.id === itemToDelete.id) {
        setSelectedCollege(null)
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed")
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ type, item }) => 
      type === "college" 
        ? updateCollege(selectedInstitutionId, item.id, { isActive: !item.isActive }) 
        : updateDepartment(selectedInstitutionId, selectedCollege.id, item.id, { isActive: !item.isActive }),
    onSuccess: (_, variables) => {
      toast.success("Status updated.")
      queryClient.invalidateQueries([variables.type === "college" ? "colleges" : "departments"])
    }
  })

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 capitalize tracking-widest">
              <Activity size={10} className="animate-pulse" /> SYSTEM ONLINE
            </div>
            <div className="text-[9px] font-bold text-muted-foreground capitalize tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
            Academic <span className="text-primary">Structure</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            Manage the institutional hierarchy through a nested college and department workflow.
          </p>
        </div>

        {/* Institution Context: Top Right */}
        {isSuperAdmin && (
          <div className="flex flex-col gap-1.5 text-right">
            <div className="flex items-center justify-end gap-2 text-[10px] font-black text-muted-foreground/60 capitalize tracking-widest">
              <Building2 size={12} className="text-primary" /> Institution Context
            </div>
            <Select value={selectedInstitutionId} onValueChange={(val) => { setSelectedInstitutionId(val); setSelectedCollege(null); }}>
              <SelectTrigger className="w-full md:w-64 h-10 rounded-none bg-muted/20 border-border text-xs font-bold focus:ring-primary/20">
                <SelectValue placeholder="Select Institution" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border shadow-2xl">
                {institutions.map(inst => (
                  <SelectItem key={inst.id} value={inst.id} className="text-xs font-bold">{inst.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3. College Selection Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black capitalize tracking-widest flex items-center gap-2">
              <Building size={14} className="text-primary" /> Colleges
            </h3>
            <Button 
              size="sm" 
              onClick={() => { setEditingItem(null); setIsCollegeModalOpen(true); }}
              className="rounded-none h-8 px-4 text-[10px] font-black capitalize tracking-widest"
              disabled={!selectedInstitutionId}
            >
              <Plus size={10} className="mr-1.5" /> Add college
            </Button>
          </div>

          <div className="bg-card border border-border p-1 shadow-sm">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] font-black capitalize tracking-widest py-3 px-4">College</TableHead>
                  <TableHead className="text-right pr-4 text-[10px] font-black capitalize tracking-widest py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingColleges ? (
                  <TableBodySkeleton columns={2} rows={8} />
                ) : colleges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-40 text-center opacity-30">
                      <p className="text-[10px] font-black capitalize">No colleges found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  colleges.map((college) => (
                    <TableRow 
                      key={college.id} 
                      className={cn(
                        "group border-border hover:bg-primary/[0.02] cursor-pointer transition-all",
                        selectedCollege?.id === college.id ? "bg-primary/[0.05] border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                      )}
                      onClick={() => setSelectedCollege(college)}
                    >
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-bold text-xs tracking-tight",
                            selectedCollege?.id === college.id ? "text-primary" : "text-foreground"
                          )}>
                            {college.name}
                          </span>
                          <code className="text-[9px] font-bold text-muted-foreground/40 font-mono">{college.code}</code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); setEditingItem(college); setIsCollegeModalOpen(true); }} 
                            className="h-7 w-7 rounded-none text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); setItemToDelete(college); setDeleteType("college"); setIsDeleteModalOpen(true); }} 
                            className="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 size={12} />
                          </Button>
                          <ChevronRight size={14} className={cn(
                            "ml-2 transition-transform",
                            selectedCollege?.id === college.id ? "translate-x-1 text-primary" : "text-muted-foreground/20"
                          )} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 4. Department Management Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black capitalize tracking-widest flex items-center gap-2">
              <Network size={14} className="text-primary" /> {selectedCollege ? `${selectedCollege.name} Departments` : "Departments"}
            </h3>
            <Button 
              size="sm" 
              onClick={() => { setEditingItem(null); setIsDeptModalOpen(true); }}
              className="rounded-none h-8 px-4 text-[10px] font-black capitalize tracking-widest"
              disabled={!selectedCollege}
            >
              <Plus size={10} className="mr-1.5" /> Add department
            </Button>
          </div>

          {!selectedCollege ? (
            <div className="border border-border p-20 flex flex-col items-center justify-center text-center bg-muted/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 bg-muted/20 flex items-center justify-center text-muted-foreground/40 mb-4 relative z-10">
                <ArrowRight size={32} />
              </div>
              <p className="text-xs font-black text-muted-foreground/60 capitalize tracking-widest relative z-10">Select a college to view departments</p>
            </div>
          ) : (
            <div className="bg-card border border-border p-1 shadow-sm">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-border border-b-2">
                    <TableHead className="text-[10px] font-black capitalize tracking-widest py-3 px-4">Department</TableHead>
                    <TableHead className="text-[10px] font-black capitalize tracking-widest py-3 px-4">Code</TableHead>
                    <TableHead className="text-center text-[10px] font-black capitalize tracking-widest py-3 px-4">Status</TableHead>
                    <TableHead className="text-right pr-4 text-[10px] font-black capitalize tracking-widest py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDepts ? (
                    <TableBodySkeleton columns={4} rows={8} />
                  ) : departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center opacity-30">
                        <p className="text-[10px] font-black capitalize">No departments found for this college</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((dept) => (
                      <TableRow key={dept.id} className="group border-border hover:bg-primary/[0.02] border-b last:border-0 transition-colors">
                        <TableCell className="py-3 px-4">
                          <span className="font-bold text-xs tracking-tight">{dept.name}</span>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <code className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 border border-primary/10 font-mono">
                            {dept.code}
                          </code>
                        </TableCell>
                        <TableCell className="text-center py-3 px-4">
                          <div 
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-bold cursor-pointer transition-all",
                              dept.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                            )}
                            onClick={() => toggleStatusMutation.mutate({ type: "department", item: dept })}
                          >
                            {dept.isActive && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                            {dept.isActive ? "Active" : "Inactive"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(dept); setIsDeptModalOpen(true); }} className="h-7 w-7 rounded-none text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                              <Pencil size={12} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(dept); setDeleteType("department"); setIsDeleteModalOpen(true); }} className="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <CollegeModal 
        isOpen={isCollegeModalOpen} 
        onClose={() => { setIsCollegeModalOpen(false); setEditingItem(null); }}
        college={editingItem}
        institutionId={selectedInstitutionId}
      />

      <DepartmentModal 
        isOpen={isDeptModalOpen} 
        onClose={() => { setIsDeptModalOpen(false); setEditingItem(null); }}
        department={editingItem}
        institutionId={selectedInstitutionId}
        collegeId={selectedCollege?.id}
      />

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={() => deleteMutation.mutate(itemToDelete.id)}
        title="Delete record"
        description={`Are you sure you want to delete this ${deleteType}? This action will be logged.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
