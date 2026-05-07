import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createExam, updateExam, listExamLevels } from "../../api/exams.api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"
import { listInstitutions } from "../../api/institutions.api"

export default function ExamAddEditModal({ isOpen, onClose, initialData = null, onSuccess = null, hideToast = false }) {
  const isEditing = !!initialData
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN"

  const [formData, setFormData] = useState({
    nationalId: "",
    examLevelCode: "",
    institutionCode: "",
    year: new Date().getFullYear().toString(),
    totalScore: "",
    averageScore: "",
    percentile: "",
    resultStatus: "",
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          year: initialData.year?.toString() || "",
          totalScore: initialData.totalScore?.toString() || "",
          averageScore: initialData.averageScore?.toString() || "",
          percentile: initialData.percentile?.toString() || "",
          resultStatus: initialData.resultStatus || "",
          // Read-only fields in edit mode
          nationalId: initialData.studentNationalId || "",
          examLevelCode: initialData.examLevelCode || "",
          institutionCode: initialData.institutionCode || "",
        })
      } else {
        setFormData({
          nationalId: "",
          examLevelCode: "",
          institutionCode: "",
          year: new Date().getFullYear().toString(),
          totalScore: "",
          averageScore: "",
          percentile: "",
          resultStatus: "",
        })
      }
    }
  }, [isOpen, initialData])

  const { data: levelsData, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["exam-levels-list"],
    queryFn: () => listExamLevels(),
    enabled: isOpen && !isEditing,
  })
  
  const { data: institutionsData, isLoading: isLoadingInstitutions } = useQuery({
    queryKey: ["institutions-list"],
    queryFn: () => listInstitutions(),
    enabled: isOpen && !isEditing && isSuperAdmin,
  })

  const mutation = useMutation({
    mutationFn: (data) => (isEditing ? updateExam(initialData.id, data) : createExam(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] })
      if (!hideToast) {
        toast.success(isEditing ? "Exam record updated successfully!" : "Exam record created successfully!")
      }
      if (onSuccess) onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} exam record`)
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Clean empty numeric fields
    const payload = {
      ...formData,
      year: formData.year ? parseInt(formData.year, 10) : null,
      totalScore: formData.totalScore ? parseFloat(formData.totalScore) : null,
      averageScore: formData.averageScore ? parseFloat(formData.averageScore) : null,
      percentile: formData.percentile ? parseFloat(formData.percentile) : null,
    }

    if (isEditing) {
      // API only accepts certain fields for update
      mutation.mutate({
        year: payload.year,
        totalScore: payload.totalScore,
        averageScore: payload.averageScore,
        percentile: payload.percentile,
        resultStatus: payload.resultStatus,
      })
    } else {
      mutation.mutate(payload)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-none shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-primary">
            {isEditing ? "Edit Exam Record" : "Add Exam Record"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? "Update scores and status for this exam." : "Enter details for the new exam record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student National ID</label>
                <Input
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  placeholder="Enter National ID"
                  className="rounded-xl h-12 bg-muted/30 border-muted/60"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exam Level</label>
                <Select
                  value={formData.examLevelCode}
                  onValueChange={(value) => handleSelectChange("examLevelCode", value)}
                  disabled={isLoadingLevels}
                  required
                >
                  <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                    <SelectValue placeholder="Select Exam Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelsData?.data?.levels?.filter(l => l.isActive).map((level) => (
                      <SelectItem key={level.id} value={level.code}>
                        {level.name} ({level.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isSuperAdmin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institution Code</label>
                  <Select
                    value={formData.institutionCode}
                    onValueChange={(value) => handleSelectChange("institutionCode", value)}
                    disabled={isLoadingInstitutions}
                    required
                  >
                    <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                      <SelectValue placeholder="Select Institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionsData?.data?.institutions?.map((inst) => (
                        <SelectItem key={inst.id} value={inst.code}>
                          {inst.name} ({inst.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {isEditing && (
            <div className="bg-muted/30 p-4 rounded-2xl mb-4 border border-border/40 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold">Student:</span>
                <span className="font-mono font-black">{formData.nationalId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold">Exam Level:</span>
                <span className="font-black">{formData.examLevelCode}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year</label>
              <Input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 2024"
                className="rounded-xl h-12 bg-muted/30 border-muted/60"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Result Status</label>
              <Select
                value={formData.resultStatus}
                onValueChange={(value) => handleSelectChange("resultStatus", value)}
                required
              >
                <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted/60">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASS">PASS</SelectItem>
                  <SelectItem value="FAIL">FAIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Score</label>
              <Input
                name="totalScore"
                type="number"
                step="any"
                value={formData.totalScore}
                onChange={handleChange}
                placeholder="Optional"
                className="rounded-xl h-12 bg-muted/30 border-muted/60"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Average</label>
              <Input
                name="averageScore"
                type="number"
                step="any"
                value={formData.averageScore}
                onChange={handleChange}
                placeholder="Optional"
                className="rounded-xl h-12 bg-muted/30 border-muted/60"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Percentile</label>
              <Input
                name="percentile"
                type="number"
                step="any"
                value={formData.percentile}
                onChange={handleChange}
                placeholder="Optional"
                className="rounded-xl h-12 bg-muted/30 border-muted/60"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-black text-sm mt-4 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Exam Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
