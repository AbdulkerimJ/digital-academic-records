import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { listColleges, listDepartments, deleteCollege, deleteDepartment, listInstitutions, updateCollege, updateDepartment } from "../../api/institutions.api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { 
  Plus, 
  Search, 
  GraduationCap, 
  BookOpen, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Building2,
  ChevronRight,
  AlertCircle,
  Network,
  Power
} from "lucide-react"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "sonner"
import CollegeModal from "./CollegeModal"
import DepartmentModal from "./DepartmentModal"

export default function AcademicStructurePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedInstitutionId = searchParams.get("institutionId") || user?.institutionId || ""
  const selectedCollegeId = searchParams.get("collegeId") || ""

  const setSelectedInstitutionId = (id) => {
    const newParams = new URLSearchParams(searchParams)
    if (id) newParams.set("institutionId", id)
    else newParams.delete("institutionId")
    
    // Always reset college when institution changes
    newParams.delete("collegeId")
    setSearchParams(newParams, { replace: true })
  }

  const setSelectedCollegeId = (id) => {
    const newParams = new URLSearchParams(searchParams)
    if (id) newParams.set("collegeId", id)
    else newParams.delete("collegeId")
    setSearchParams(newParams, { replace: true })
  }
  
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false)
  const [collegeToEdit, setCollegeToEdit] = useState(null)
  
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [departmentToEdit, setDepartmentToEdit] = useState(null)

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null, // "college" or "department"
    id: null,
    name: ""
  })

  // Fetch institutions if super admin
  const { data: institutionsData } = useQuery({
    queryKey: ["institutions", "COLLEGE"],
    queryFn: () => listInstitutions({ limit: 100, type: "COLLEGE" }),
    enabled: user?.roleName === "SUPER_ADMIN",
  })

  const instRaw = institutionsData?.data?.institutions
  const institutions = Array.isArray(instRaw) ? instRaw : []

  // Fetch colleges
  const { data: collegesData, isLoading: isLoadingColleges, isFetching: isFetchingColleges } = useQuery({
    queryKey: ["colleges", selectedInstitutionId],
    queryFn: () => listColleges(selectedInstitutionId),
    enabled: !!selectedInstitutionId,
  })

  // Fetch departments
  const { data: departmentsData, isLoading: isLoadingDepartments, isFetching: isFetchingDepartments } = useQuery({
    queryKey: ["departments", selectedCollegeId],
    queryFn: () => listDepartments(selectedInstitutionId, selectedCollegeId),
    enabled: !!selectedCollegeId,
  })

  // Auto-select first college-type institution for Super Admin if none selected
  useEffect(() => {
    if (user?.roleName === "SUPER_ADMIN" && !searchParams.get("institutionId") && institutions.length > 0) {
      setSelectedInstitutionId(institutions[0].id)
    }
  }, [user, searchParams, institutions])


  const isExamBoardUser = user?.institutionType === "EXAM_BOARD"

  if (isExamBoardUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full text-destructive">
          <Network size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black">Access Restricted</h2>
          <p className="text-muted-foreground">Academic structure management is not available for Exam Boards.</p>
        </div>
      </div>
    )
  }

  const collegesRaw = collegesData?.data?.colleges
  const colleges = Array.isArray(collegesRaw) ? collegesRaw : []
  const deptsRaw = departmentsData?.data?.departments
  const departments = Array.isArray(deptsRaw) ? deptsRaw : []

  // Auto-select first college if none selected
  useEffect(() => {
    if (colleges.length > 0 && !selectedCollegeId) {
      setSelectedCollegeId(colleges[0].id)
    }
  }, [colleges, selectedCollegeId])

  // Safety check: if selected college is no longer in the list (e.g. deleted), clear it
  useEffect(() => {
    // Only check if we actually have a selection in the URL
    if (selectedCollegeId) {
      // If the list is empty, or the ID isn't in the list, and we aren't currently loading new data
      const exists = colleges.some(c => c.id === selectedCollegeId)
      if (!exists && !isFetchingColleges) {
        setSelectedCollegeId("")
      }
    }
  }, [colleges, selectedCollegeId, isFetchingColleges])

  const deleteCollegeMutation = useMutation({
    mutationFn: (collegeId) => deleteCollege(selectedInstitutionId, collegeId),
    onSuccess: (_, deletedId) => {
      toast.success("College deleted successfully")
      
      // If the currently selected college was deleted, clear the selection
      if (selectedCollegeId === deletedId) {
        setSelectedCollegeId("")
      }

      setDeleteConfirm({ isOpen: false, type: null, id: null, name: "" })
      
      // Remove all department queries from cache to ensure no stale data
      queryClient.removeQueries({ queryKey: ["departments", deletedId] })
      queryClient.invalidateQueries({ queryKey: ["colleges", selectedInstitutionId] })
      queryClient.invalidateQueries({ queryKey: ["departments"] })
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete college"),
  })

  const deleteDepartmentMutation = useMutation({
    mutationFn: (deptId) => deleteDepartment(selectedInstitutionId, selectedCollegeId, deptId),
    onSuccess: () => {
      toast.success("Department deleted successfully")
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: "" })
      queryClient.invalidateQueries({ queryKey: ["departments", selectedCollegeId] })
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete department"),
  })

  const toggleCollegeStatusMutation = useMutation({
    mutationFn: ({ collegeId, isActive }) => updateCollege(selectedInstitutionId, collegeId, { isActive: !isActive }),
    onSuccess: () => {
      toast.success("College status updated")
      queryClient.invalidateQueries({ queryKey: ["colleges", selectedInstitutionId] })
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update college status"),
  })

  const toggleDepartmentStatusMutation = useMutation({
    mutationFn: ({ deptId, isActive }) => updateDepartment(selectedInstitutionId, selectedCollegeId, deptId, { isActive: !isActive }),
    onSuccess: () => {
      toast.success("Department status updated")
      queryClient.invalidateQueries({ queryKey: ["departments", selectedCollegeId] })
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update department status"),
  })

  const handleDeleteCollegeRequest = (college) => {
    setDeleteConfirm({
      isOpen: true,
      type: "college",
      id: college.id,
      name: college.name
    })
  }

  const handleDeleteDepartmentRequest = (dept) => {
    setDeleteConfirm({
      isOpen: true,
      type: "department",
      id: dept.id,
      name: dept.name
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === "college") {
      deleteCollegeMutation.mutate(deleteConfirm.id)
    } else {
      deleteDepartmentMutation.mutate(deleteConfirm.id)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-primary/90 flex items-center gap-3">
            <Network className="text-primary" />
            Academic Structure
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">
            Manage Colleges and Departments
          </p>
        </div>

        {user?.roleName === "SUPER_ADMIN" && (
          <div className="w-full md:w-64">
            <Select value={selectedInstitutionId} onValueChange={setSelectedInstitutionId}>
              <SelectTrigger className="rounded-xl h-11 border-primary/20 bg-primary/5 font-bold">
                <Building2 size={16} className="mr-2 text-primary" />
                <SelectValue placeholder="Select Institution" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id} className="rounded-lg font-medium">
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedInstitutionId ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4 text-center border-dashed rounded-[3rem] bg-muted/20 border-primary/20">
          <Building2 size={48} className="text-primary/20" />
          <div>
            <h3 className="text-xl font-black">No Institution Selected</h3>
            <p className="text-sm text-muted-foreground font-medium">Please select an institution to manage its academic structure.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Colleges Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <GraduationCap size={16} className="text-primary" />
                Colleges
              </h3>
              <Button 
                size="sm" 
                onClick={() => { setCollegeToEdit(null); setIsCollegeModalOpen(true); }}
                className="h-8 rounded-lg font-black text-[10px] uppercase gap-1.5 shadow-lg shadow-primary/20"
              >
                <Plus size={14} /> Add College
              </Button>
            </div>

            <Card className="rounded-[2.5rem] border-border/60 shadow-sm overflow-hidden p-3 space-y-1 min-h-[400px] relative">
              <FetchingIndicator isFetching={isFetchingColleges} />
              {isFetchingColleges && colleges.length === 0 ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/20 bg-muted/10">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 rounded-full" />
                      <Skeleton className="h-2 w-1/4 rounded-full" />
                    </div>
                  </div>
                ))
              ) : colleges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[360px] text-center p-6 text-muted-foreground gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">No Colleges Found</p>
                </div>
              ) : (
                colleges.map((college) => (
                  <div
                    key={college.id}
                    onClick={() => setSelectedCollegeId(college.id)}
                    className={`
                      group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border
                      ${selectedCollegeId === college.id 
                        ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                        : "bg-background text-foreground border-border/40 hover:border-primary/40 hover:bg-primary/5"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedCollegeId === college.id ? "bg-white/20" : "bg-muted text-primary"}`}>
                        {college.code}
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight leading-tight">{college.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedCollegeId === college.id ? "text-white/60" : "text-muted-foreground/60"}`}>
                          {college.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 rounded-lg ${selectedCollegeId === college.id ? "hover:bg-white/20 text-white" : "hover:bg-primary/10 text-muted-foreground"}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); setCollegeToEdit(college); setIsCollegeModalOpen(true); }}
                            className="rounded-lg font-bold text-xs gap-2"
                          >
                            <Edit2 size={12} /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); toggleCollegeStatusMutation.mutate({ collegeId: college.id, isActive: college.isActive }); }}
                            className="rounded-lg font-bold text-xs gap-2"
                          >
                            <Power size={12} className={college.isActive ? "text-amber-500" : "text-emerald-500"} /> 
                            {college.isActive ? "Deactivate" : "Activate"} College
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCollegeRequest(college); }}
                            className="rounded-lg font-bold text-xs gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 size={12} /> Delete College
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* Departments Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-500" />
                Departments
                {selectedCollegeId && (
                  <Badge variant="outline" className="ml-2 font-mono text-[9px] border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2">
                    {colleges.find(c => c.id === selectedCollegeId)?.code}
                  </Badge>
                )}
              </h3>
              <Button 
                size="sm" 
                disabled={!selectedCollegeId}
                onClick={() => { setDepartmentToEdit(null); setIsDepartmentModalOpen(true); }}
                className="h-8 rounded-lg font-black text-[10px] uppercase gap-1.5 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus size={14} /> Add Department
              </Button>
            </div>

            <Card className="rounded-[2.5rem] border-border/60 shadow-sm overflow-hidden p-3 space-y-1 min-h-[400px] relative">
              <FetchingIndicator isFetching={isFetchingDepartments} />
              {!selectedCollegeId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 text-muted-foreground gap-4 opacity-60">
                  <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-dashed border-primary/20">
                    <AlertCircle size={32} className="text-primary/30" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/60">No College Selected</p>
                    <p className="text-[10px] font-bold opacity-40 mt-1 max-w-[200px]">Choose a college from the left to manage its departments</p>
                  </div>
                </div>
              ) : isFetchingDepartments && departments.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-border/20 bg-muted/10 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-5/6 rounded-full" />
                          <Skeleton className="h-3 w-1/3 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-6 rounded-lg" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-12 rounded-md" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : departments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 text-muted-foreground gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/5 flex items-center justify-center border border-dashed border-emerald-500/20">
                    <BookOpen size={32} className="text-emerald-500/30" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600/60">No Departments</p>
                    <p className="text-[10px] font-bold opacity-40 mt-1">Start by adding the first department to this college.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {departments.map((dept) => (
                    <div key={dept.id} className="group p-4 rounded-2xl border border-border/40 bg-muted/5 hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-black text-sm tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{dept.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-1.5 rounded">{dept.code}</span>
                            <Badge className={`text-[8px] h-4 font-black uppercase tracking-tight ${dept.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"} border-none`}>
                              {dept.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                            <DropdownMenuItem 
                              onClick={() => { setDepartmentToEdit(dept); setIsDepartmentModalOpen(true); }}
                              className="rounded-lg font-bold text-xs gap-2"
                            >
                              <Edit2 size={12} /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleDepartmentStatusMutation.mutate({ deptId: dept.id, isActive: dept.isActive })}
                              className="rounded-lg font-bold text-xs gap-2"
                            >
                              <Power size={12} className={dept.isActive ? "text-amber-500" : "text-emerald-500"} /> 
                              {dept.isActive ? "Deactivate" : "Activate"} Dept
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDepartmentRequest(dept)}
                              className="rounded-lg font-bold text-xs gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 size={12} /> Delete Dept
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      <CollegeModal 
        isOpen={isCollegeModalOpen} 
        onClose={() => setIsCollegeModalOpen(false)} 
        institutionId={selectedInstitutionId}
        college={collegeToEdit}
      />

      <DepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        institutionId={selectedInstitutionId}
        collegeId={selectedCollegeId}
        department={departmentToEdit}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteCollegeMutation.isPending || deleteDepartmentMutation.isPending}
        title={`Delete ${deleteConfirm.type === "college" ? "College" : "Department"}`}
        itemName={deleteConfirm.name}
        description={deleteConfirm.type === "college" ? "Deleting this college will also permanently remove all its associated departments and potentially linked academic records. This action cannot be undone." : null}
      />
    </div>
  )
}
