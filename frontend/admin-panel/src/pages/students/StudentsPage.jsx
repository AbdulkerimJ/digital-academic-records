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
import { UserPlus, Sparkles, ShieldCheck, Search, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { useSearchParams } from "react-router-dom"

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
      toast.success("Student identity verified and registered!")
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative p-1">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-primary/90">Student Registry</h2>
          <p className="text-muted-foreground font-medium text-sm max-w-lg">
            Access the unified national database of student identities and their verified academic history across all levels.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline"
            onClick={() => setIsBulkOpen(true)} 
            className="rounded-2xl h-12 px-6 gap-3 font-black border-muted/60 hover:bg-muted/50 transition-all"
          >
            <UploadCloud size={18} /> Bulk Import
          </Button>
          <Button 
            onClick={() => setIsRegisterOpen(true)} 
            className="rounded-2xl h-12 px-6 gap-3 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <UserPlus size={18} /> Register via Fayda
          </Button>
        </div>
      </div>

      <StudentTable onSelectStudent={handleOpenDetail} />

      <BulkUploadModal 
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Register Students"
        description="Upload a CSV file containing student National IDs to register them in bulk. Download the template below to ensure proper formatting."
        uploadFunction={registerBulkStudentsStream}
        queryKeyToInvalidate="students"
        templateUrl="/templates/students_template.csv"
      />

      <StudentDetailModal 
        studentId={selectedStudentId} 
        isOpen={isDetailOpen} 
        onClose={handleCloseDetail} 
      />

      {/* Registration Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-10 border-b border-primary/10 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl ring-1 ring-primary/5">
              <ShieldCheck size={32} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-center">Verify Identity</DialogTitle>
              <DialogDescription className="text-center font-medium">
                Enter the student's National ID to pull their verified bio-data from the Fayda system.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="faydaId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">National Identification Number</Label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <Input 
                  id="faydaId" 
                  value={faydaId}
                  onChange={(e) => setFaydaId(e.target.value.toUpperCase())}
                  placeholder="e.g. ET-12345678"
                  className="h-14 pl-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/20 font-mono text-lg font-bold"
                />
              </div>
            </div>
            
            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-3 items-start">
              <Sparkles size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-normal">
                Registration will automatically create a secure student profile and fetch all academic records linked to this ID.
              </p>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0">
            <Button 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" 
              disabled={!faydaId || registerMutation.isPending}
              onClick={() => registerMutation.mutate(faydaId)}
            >
              {registerMutation.isPending ? "Verifying..." : "Verify & Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
