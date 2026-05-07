import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createDegree, updateDegree, listDegreeLevels, listDegreeTitles } from "../../api/degrees.api"
import { listInstitutions, listColleges, listDepartments } from "../../api/institutions.api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"

export default function DegreeAddEditModal({ isOpen, onClose, initialData = null, onSuccess = null, hideToast = false }) {
  const isEditing = !!initialData
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN"
  
  // For non-super admins, the institution ID comes from their profile
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
      if (initialData) {
        setFormData({
          nationalId: initialData.studentNationalId || "",
          degreeLevelId: initialData.degreeLevelId || "",
          degreeTitleId: initialData.degreeTitleId || "",
          institutionId: initialData.institutionId || effectiveInstitutionId || "",
          collegeId: initialData.collegeId || "",
          departmentId: initialData.departmentId || "",
          cgpa: initialData.cgpa?.toString() || "",
          graduationDate: initialData.graduationDate ? new Date(initialData.graduationDate).toISOString().split('T')[0] : "",
        })
      } else {
        setFormData({
          nationalId: "",
          degreeLevelId: "",
          degreeTitleId: "",
          institutionId: effectiveInstitutionId || "",
          collegeId: "",
          departmentId: "",
          cgpa: "",
          graduationDate: "",
        })
      }
    }
  }, [isOpen, initialData, effectiveInstitutionId])

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
    queryKey: ["institutions-list"],
    queryFn: () => listInstitutions(),
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
    mutationFn: (data) => (isEditing ? updateDegree(initialData.id, data) : createDegree(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degrees"] })
      if (!hideToast) {
        toast.success(isEditing ? "Degree record updated successfully!" : "Degree record created successfully!")
      }
      if (onSuccess) onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} degree record`)
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value }
      
      // Reset dependent fields
      if (name === "institutionId") {
        newState.collegeId = ""
        newState.departmentId = ""
      }
      if (name === "collegeId") {
        newState.departmentId = ""
      }
      if (name === "degreeLevelId") {
        newState.degreeTitleId = ""
      }
      
      return newState
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
    }

    if (isEditing) {
      // API only accepts certain fields for update
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-6 border-none shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-primary">
            {isEditing ? "Edit Degree Record" : "Add Degree Record"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? "Update details for this degree record." : "Enter details for the new degree record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">National ID</label>
                <Input
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  placeholder="Enter National ID"
                  className="rounded-xl h-12 bg-muted/30 border-muted/60"
                  required
                />
              </div>

              {isSuperAdmin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institution</label>
                  <Select
                    value={formData.institutionId}
                    onValueChange={(v) => handleSelectChange("institutionId", v)}
                    required
                  >
                    <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionsData?.data?.institutions?.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Degree Level</label>
              <Select
                value={formData.degreeLevelId}
                onValueChange={(v) => handleSelectChange("degreeLevelId", v)}
                required
              >
                <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  {levelsData?.data?.levels?.filter(l => l.isActive).map((level) => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Degree Title</label>
              <Select
                value={formData.degreeTitleId}
                onValueChange={(v) => handleSelectChange("degreeTitleId", v)}
                disabled={!formData.degreeLevelId}
                required
              >
                <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                  <SelectValue placeholder="Select Title" />
                </SelectTrigger>
                <SelectContent>
                  {titlesData?.data?.titles?.filter(t => t.isActive).map((title) => (
                    <SelectItem key={title.id} value={title.id}>{title.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">College</label>
              <Select
                value={formData.collegeId}
                onValueChange={(v) => handleSelectChange("collegeId", v)}
                disabled={!formData.institutionId}
                required
              >
                <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  {collegesData?.data?.colleges?.filter(c => c.isActive).map((college) => (
                    <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</label>
              <Select
                value={formData.departmentId}
                onValueChange={(v) => handleSelectChange("departmentId", v)}
                disabled={!formData.collegeId}
                required
              >
                <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsData?.data?.departments?.filter(d => d.isActive).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CGPA</label>
              <Input
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="e.g. 3.75"
                className="rounded-xl h-12 bg-muted/30 border-muted/60"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Graduation Date</label>
              <Input
                name="graduationDate"
                type="date"
                value={formData.graduationDate}
                onChange={handleChange}
                className="rounded-xl h-12 bg-muted/30 border-muted/60"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-black text-sm mt-4 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Degree Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
