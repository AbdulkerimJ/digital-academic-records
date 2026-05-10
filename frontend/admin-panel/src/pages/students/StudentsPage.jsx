import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerStudent, registerBulkStudentsStream } from "../../api/students.api"
import StudentTable from "./StudentTable"
import StudentDetailModal from "./StudentDetailModal"
import BulkUploadModal from "../../components/common/BulkUploadModal"
import { Button } from "../../components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { UserPlus, ShieldCheck, Search, UploadCloud, Activity, Clock } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  
  const selectedStudentId = searchParams.get("studentId")
  const isDetailOpen = !!selectedStudentId
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [faydaId, setFaydaId] = useState("")

  const registerMutation = useMutation({
    mutationFn: (id) => registerStudent({ faydaId: id }),
    onSuccess: (res) => {
      toast.success("Student registered successfully.")
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setIsRegisterOpen(false)
      setFaydaId("")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Verification failed")
    }
  })

  const handleOpenDetail = (id) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("studentId", id)
    setSearchParams(newParams)
  }

  const handleCloseDetail = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("studentId")
    setSearchParams(newParams)
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-700 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={10} className="animate-pulse" /> SYSTEM ONLINE
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
            Student <span className="text-primary">Registry</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            View and manage student profiles and their academic records.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsBulkOpen(true)} 
            className="rounded-none h-11 px-8 gap-3 font-bold text-xs border-border hover:bg-muted/50 transition-all shadow-sm"
          >
            <UploadCloud size={14} /> Bulk upload
          </Button>
          <Button 
            onClick={() => setIsRegisterOpen(true)} 
            className="rounded-none h-11 px-8 gap-3 font-bold text-xs shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
          >
            <UserPlus size={14} /> Register student
          </Button>
        </div>
      </div>

      {/* 2. Data Table */}
      <div className="relative">
        <StudentTable onSelectStudent={handleOpenDetail} />
      </div>

      <BulkUploadModal 
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk registration"
        description="Upload a CSV file to register multiple students at once."
        uploadFunction={registerBulkStudentsStream}
        queryKeyToInvalidate="students"
        templateUrl="/templates/students_template.csv"
      />

      <StudentDetailModal 
        studentId={selectedStudentId} 
        isOpen={isDetailOpen} 
        onClose={handleCloseDetail} 
      />

      {/* 3. Registration Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none border border-border bg-card shadow-2xl p-0 overflow-hidden">
          <div className="bg-muted/30 p-10 border-b border-border text-left space-y-5">
            <div className="w-14 h-14 bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <ShieldCheck size={28} />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none">Student verification</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-2">
                Enter the student's National ID to verify their identity and register them in the system.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="faydaId" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">National ID</Label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <Input 
                  id="faydaId" 
                  value={faydaId}
                  onChange={(e) => setFaydaId(e.target.value.toUpperCase())}
                  placeholder="ID-XXXXXXXX"
                  className="h-14 pl-12 rounded-none bg-muted/10 border border-border focus-visible:ring-primary/20 font-mono text-base font-bold tracking-tight uppercase"
                />
              </div>
            </div>
            
            <div className="p-5 bg-primary/[0.03] border-l-2 border-primary flex gap-5 items-start">
              <Activity size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-primary/70 leading-relaxed uppercase tracking-tight">
                Verifying the ID will automatically create a student profile in the registry.
              </p>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0">
            <Button 
              className="w-full h-14 rounded-none font-bold text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all" 
              disabled={!faydaId || registerMutation.isPending}
              onClick={() => registerMutation.mutate(faydaId)}
            >
              {registerMutation.isPending ? "Verifying..." : "Verify & register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
