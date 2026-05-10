import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createDegree, updateDegree, listDegreeLevels, listDegreeTitles } from "../../api/degrees.api"
import { listInstitutions, listColleges, listDepartments } from "../../api/institutions.api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"
import { GraduationCap, Fingerprint, Calendar, Building2, BookOpen, Activity, ShieldCheck } from "lucide-react"
import { cn } from "../../lib/utils"

export default function DegreeAddEditModal({ isOpen, onClose, degree = null, onSuccess }) {
  const isEditing = !!degree
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN"
  
  const effectiveInstitutionId = isSuperAdmin ? null : user?.institutionId

  const [formData, setFormData] = useState({
    nationalId: "",
    degreeLevelId: "",
    degreeTitleId: "",
    institutionId: effectiveInstitutionId || "",
    collegeId: "",
    departmentId: "",
    cgpa: "",
    graduationDate: "",
  })

  useEffect(() => {
    if (isOpen) {
      if (degree) {
        setFormData({
          nationalId: degree.studentNationalId || "",
          degreeLevelId: degree.degreeLevelId?.toString() || "",
          degreeTitleId: degree.degreeTitleId?.toString() || "",
          institutionId: degree.institutionId?.toString() || effectiveInstitutionId?.toString() || "",
          collegeId: degree.collegeId?.toString() || "",
          departmentId: degree.departmentId?.toString() || "",
          cgpa: degree.cgpa?.toString() || "",
          graduationDate: degree.graduationDate ? new Date(degree.graduationDate).toISOString().split('T')[0] : "",
        })
      } else {
        setFormData({
          nationalId: "",
          degreeLevelId: "",
          degreeTitleId: "",
          institutionId: effectiveInstitutionId?.toString() || "",
          collegeId: "",
          departmentId: "",
          cgpa: "",
          graduationDate: "",
        })
      }
    }
  }, [isOpen, degree, effectiveInstitutionId])

  // Queries
  const { data: levelsData } = useQuery({
    queryKey: ["degree-levels-list"],
    queryFn: () => listDegreeLevels(),
    enabled: isOpen,
  })

  const { data: titlesData } = useQuery({
    queryKey: ["degree-titles-list", formData.degreeLevelId],
    queryFn: () => listDegreeTitles({ degreeLevelId: formData.degreeLevelId }),
    enabled: !!formData.degreeLevelId,
  })

  const { data: institutionsData } = useQuery({
    queryKey: ["institutions-list", "COLLEGE"],
    queryFn: () => listInstitutions({ type: "COLLEGE" }),
    enabled: isOpen && isSuperAdmin,
  })

  const { data: collegesData } = useQuery({
    queryKey: ["colleges-list", formData.institutionId],
    queryFn: () => listColleges(formData.institutionId),
    enabled: !!formData.institutionId,
  })

  const { data: departmentsData } = useQuery({
    queryKey: ["departments-list", formData.institutionId, formData.collegeId],
    queryFn: () => listDepartments(formData.institutionId, formData.collegeId),
    enabled: !!formData.institutionId && !!formData.collegeId,
  })

  const mutation = useMutation({
    mutationFn: (data) => (isEditing ? updateDegree(degree.id, data) : createDegree(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] })
      toast.success(isEditing ? "Record updated." : "Degree issued.")
      if (onSuccess) onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Operation failed")
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value }
      if (name === "institutionId") { newState.collegeId = ""; newState.departmentId = ""; }
      if (name === "collegeId") { newState.departmentId = ""; }
      if (name === "degreeLevelId") { newState.degreeTitleId = ""; }
      return newState
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...formData, cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null }

    if (isEditing) {
      mutation.mutate({
        degreeLevelId: payload.degreeLevelId,
        degreeTitleId: payload.degreeTitleId,
        collegeId: payload.collegeId,
        departmentId: payload.departmentId,
        cgpa: payload.cgpa,
        graduationDate: payload.graduationDate,
      })
    } else {
      mutation.mutate(payload)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 rounded-none border border-border bg-card shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* 1. Technical Header */}
          <div className="bg-muted/30 py-4 px-8 border-b border-border text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <GraduationCap size={20} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-700 capitalize tracking-widest">
                <ShieldCheck size={12} /> Secure issuance
              </div>
            </div>
            
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-black tracking-tighter capitalize leading-none">
                {isEditing ? "Modify certificate" : "Issue certificate"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-1 tracking-tight">
                Register a verified academic degree record within the national registry.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            {/* Student Identity */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Student ID</Label>
                <div className="relative">
                  <Fingerprint size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    placeholder="ID-XXXXXXXX"
                    disabled={isEditing}
                    className="h-12 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-primary/20 font-mono text-sm font-bold capitalize"
                    required
                  />
                </div>
              </div>

              {isSuperAdmin && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Academic institution</Label>
                  <Select value={formData.institutionId} onValueChange={(v) => handleSelectChange("institutionId", v)} required>
                    <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                      <div className="flex items-center gap-3">
                        <Building2 size={16} className="text-muted-foreground/40" />
                        <SelectValue placeholder="Select academic institution" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border shadow-2xl">
                      {institutionsData?.data?.institutions?.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id.toString()} className="rounded-none text-xs font-bold capitalize">{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Academic Track */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Degree level</Label>
                <Select value={formData.degreeLevelId} onValueChange={(v) => handleSelectChange("degreeLevelId", v)} required>
                  <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border shadow-2xl">
                    {levelsData?.data?.degreeLevels?.filter(l => l.isActive).map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()} className="rounded-none text-xs font-bold capitalize">{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Degree title</Label>
                <Select value={formData.degreeTitleId} onValueChange={(v) => handleSelectChange("degreeTitleId", v)} disabled={!formData.degreeLevelId} required>
                  <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border shadow-2xl">
                    {titlesData?.data?.degreeTitles?.filter(t => t.isActive).map((title) => (
                      <SelectItem key={title.id} value={title.id.toString()} className="rounded-none text-xs font-bold capitalize">{title.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Institutional Hierarchy */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">College</Label>
                <Select value={formData.collegeId} onValueChange={(v) => handleSelectChange("collegeId", v)} disabled={!formData.institutionId} required>
                  <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border shadow-2xl">
                    {collegesData?.data?.colleges?.filter(c => c.isActive).map((college) => (
                      <SelectItem key={college.id} value={college.id.toString()} className="rounded-none text-xs font-bold capitalize">{college.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Department</Label>
                <Select value={formData.departmentId} onValueChange={(v) => handleSelectChange("departmentId", v)} disabled={!formData.collegeId} required>
                  <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border shadow-2xl">
                    {departmentsData?.data?.departments?.filter(d => d.isActive).map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()} className="rounded-none text-xs font-bold capitalize">{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">CGPA</Label>
                <div className="relative">
                  <Activity size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="h-12 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-primary/20 font-mono text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Graduation date</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    name="graduationDate"
                    type="date"
                    value={formData.graduationDate}
                    onChange={handleChange}
                    className="h-12 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-primary/20 font-bold text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex sm:justify-between items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-none h-14 px-8 font-black text-[10px] capitalize tracking-widest text-muted-foreground/60 hover:text-foreground">
              Abort
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="rounded-none h-14 px-12 font-black text-[10px] capitalize tracking-widest shadow-2xl shadow-primary/20 transition-all min-w-[200px]"
            >
              {mutation.isPending ? "Processing..." : (isEditing ? "Save changes" : "Issue certificate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
