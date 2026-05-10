import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createExam, updateExam, listExamLevels } from "../../api/exams.api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"
import { listInstitutions } from "../../api/institutions.api"
import { BookOpen, Fingerprint, Calendar, Building2, Activity, ShieldCheck, Award } from "lucide-react"
import { cn } from "../../lib/utils"

export default function ExamAddEditModal({ isOpen, onClose, exam = null }) {
  const isEditing = !!exam
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
      if (exam) {
        setFormData({
          year: exam.year?.toString() || "",
          totalScore: exam.totalScore?.toString() || "",
          averageScore: exam.averageScore?.toString() || "",
          percentile: exam.percentile?.toString() || "",
          resultStatus: exam.resultStatus || "",
          nationalId: exam.studentNationalId || "",
          examLevelCode: exam.examLevelCode || "",
          institutionCode: exam.institutionCode || "",
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
  }, [isOpen, exam])

  const { data: levelsData, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["exam-levels-list"],
    queryFn: () => listExamLevels(),
    enabled: isOpen && !isEditing,
  })
  
  const { data: institutionsData, isLoading: isLoadingInstitutions } = useQuery({
    queryKey: ["institutions-list", "EXAM_BOARD"],
    queryFn: () => listInstitutions({ type: "EXAM_BOARD" }),
    enabled: isOpen && !isEditing && isSuperAdmin,
  })

  const mutation = useMutation({
    mutationFn: (data) => (isEditing ? updateExam(exam.id, data) : createExam(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] })
      toast.success(isEditing ? "Record updated." : "Exam registered.")
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      year: formData.year ? parseInt(formData.year, 10) : null,
      totalScore: formData.totalScore ? parseFloat(formData.totalScore) : null,
      averageScore: formData.averageScore ? parseFloat(formData.averageScore) : null,
      percentile: formData.percentile ? parseFloat(formData.percentile) : null,
    }

    if (isEditing) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-none border border-border bg-card shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* 1. Technical Header */}
          <div className="bg-muted/30 py-4 px-8 border-b border-border text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <BookOpen size={20} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-700 uppercase tracking-widest">
                <ShieldCheck size={12} /> Secure ledger
              </div>
            </div>
            
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">
                {isEditing ? "Modify assessment" : "Register assessment"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-1 tracking-tight">
                Record national examination performance within the academic registry.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            {!isEditing ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Student ID</Label>
                    <div className="relative">
                      <Fingerprint size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        placeholder="ID-XXXXXXXX"
                        className="h-12 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-primary/20 font-mono text-sm font-bold uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Exam level</Label>
                    <Select value={formData.examLevelCode} onValueChange={(v) => handleSelectChange("examLevelCode", v)} required>
                      <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border shadow-2xl">
                        {levelsData?.data?.examLevels?.filter(l => l.isActive).map((level) => (
                          <SelectItem key={level.id} value={level.code.toString()} className="rounded-none text-xs font-bold uppercase">
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Exam body</Label>
                    <Select value={formData.institutionCode} onValueChange={(v) => handleSelectChange("institutionCode", v)} required>
                      <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4">
                        <div className="flex items-center gap-3">
                          <Building2 size={16} className="text-muted-foreground/40" />
                          <SelectValue placeholder="Select exam body" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border shadow-2xl">
                        {institutionsData?.data?.institutions?.map((inst) => (
                          <SelectItem key={inst.id} value={inst.code.toString()} className="rounded-none text-xs font-bold uppercase">
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 border border-border bg-muted/5 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground/50">Student ID:</span>
                  <span className="text-foreground font-mono">{formData.nationalId}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground/50">Exam level:</span>
                  <span className="text-foreground">{formData.examLevelCode}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Exam year</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    className="h-12 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-primary/20 font-mono text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Result status</Label>
                <Select value={formData.resultStatus} onValueChange={(v) => handleSelectChange("resultStatus", v)} required>
                  <SelectTrigger className="h-12 rounded-none bg-muted/10 border-border px-4 font-bold text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border shadow-2xl">
                    <SelectItem value="PASS" className="rounded-none text-xs font-bold text-emerald-600">PASS</SelectItem>
                    <SelectItem value="FAIL" className="rounded-none text-xs font-bold text-destructive">FAIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total score</Label>
                <Input
                  name="totalScore"
                  type="number"
                  step="any"
                  value={formData.totalScore}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-12 rounded-none bg-muted/10 border-border px-4 focus-visible:ring-primary/20 font-mono text-sm font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Average</Label>
                <Input
                  name="averageScore"
                  type="number"
                  step="any"
                  value={formData.averageScore}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-12 rounded-none bg-muted/10 border-border px-4 focus-visible:ring-primary/20 font-mono text-sm font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Percentile</Label>
                <Input
                  name="percentile"
                  type="number"
                  step="any"
                  value={formData.percentile}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-12 rounded-none bg-muted/10 border-border px-4 focus-visible:ring-primary/20 font-mono text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex sm:justify-between items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-none h-14 px-8 font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground">
              Abort
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="rounded-none h-14 px-12 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all min-w-[180px]"
            >
              {mutation.isPending ? "Processing..." : (isEditing ? "Save changes" : "Create record")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
