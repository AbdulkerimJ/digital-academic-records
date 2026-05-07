import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCorrectionRequestDetail,
  approveCorrectionRequest,
  rejectCorrectionRequest,
} from "../../api/corrections.api"
import { getExamById } from "../../api/exams.api"
import { getDegreeById } from "../../api/degrees.api"

import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  FileText,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  History,
  Edit3,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import ExamAddEditModal from "../exams/ExamAddEditModal"
import DegreeAddEditModal from "../degrees/DegreeAddEditModal"

const STATUS_CLASSES = {
  PENDING: "bg-amber-500 text-white",
  APPROVED: "bg-emerald-500 text-white",
  REJECTED: "bg-destructive text-white",
}

const STATUS_ICONS = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
}

export default function CorrectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  
  // Record fixing states
  const [isFixModalOpen, setIsFixModalOpen] = useState(false)
  const [targetRecord, setTargetRecord] = useState(null)
  const [isFetchingRecord, setIsFetchingRecord] = useState(false)

  // Fetch correction request detail
  const { data: requestData, isLoading, isError } = useQuery({
    queryKey: ["correction-request", id],
    queryFn: () => getCorrectionRequestDetail(id),
    enabled: !!id,
  })

  const request = requestData?.data?.request

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["correction-request", id] })
    queryClient.invalidateQueries({ queryKey: ["correction-requests"] })
  }

  const approveMutation = useMutation({
    mutationFn: () => approveCorrectionRequest(id),
    onSuccess: () => { 
      toast.success("Record fixed and request approved!"); 
      invalidate() 
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve"),
  })

  const rejectMutation = useMutation({
    mutationFn: (reason) => rejectCorrectionRequest(id, reason),
    onSuccess: () => {
      toast.success("Correction request rejected.")
      invalidate()
      setIsRejecting(false)
      setRejectionReason("")
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject"),
  })

  const handleReviewAndFix = async () => {
    if (!request) return
    
    setIsFetchingRecord(true)
    try {
      let recordData;
      if (request.recordType === 'EXAM') {
        const res = await getExamById(request.recordId)
        recordData = res.data?.examRecord || res.data
      } else {
        const res = await getDegreeById(request.recordId)
        recordData = res.data?.degreeRecord || res.data
      }
      
      setTargetRecord(recordData)
      setIsFixModalOpen(true)
    } catch (err) {
      toast.error("Failed to fetch the referenced record. It might have been deleted.")
    } finally {
      setIsFetchingRecord(false)
    }
  }

  const StatusIcon = request?.status ? STATUS_ICONS[request.status] : Clock

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Back Button + Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-2xl border border-border/60"
          onClick={() => navigate("/corrections")}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black tracking-tight text-primary/90">Correction Review Board</h2>
            <Badge className="rounded-xl font-black text-[9px] uppercase px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
              {request?.recordType} Record
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Request ID: <span className="font-mono font-black">{id}</span>
          </p>
        </div>
        {request && (
          <Badge className={`ml-auto rounded-full font-black text-[10px] uppercase px-4 py-1 flex items-center gap-1.5 border-none ${STATUS_CLASSES[request.status] || "bg-muted"}`}>
            <StatusIcon size={12} />
            {request.status}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        </div>
      ) : isError ? (
        <Card className="p-12 flex flex-col items-center gap-4 text-center border-destructive/20 bg-destructive/5 rounded-3xl">
          <AlertCircle size={48} className="text-destructive" />
          <p className="font-black text-destructive">Failed to load correction request.</p>
          <Button variant="outline" onClick={() => navigate("/corrections")}>Back to Board</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Student's Request */}
            <Card className="p-6 rounded-3xl border-border/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                  <MessageSquare size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Student's Request Statement</h3>
              </div>
              <blockquote className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-2xl italic text-sm font-medium leading-relaxed text-amber-900">
                "{request.requestText}"
              </blockquote>
              <p className="text-[10px] font-bold text-muted-foreground/50 flex items-center gap-1.5">
                <History size={12} /> Submitted on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
              </p>
            </Card>



            {/* Review History (non-pending) */}
            {request.status !== 'PENDING' && (
              <Card className="p-6 rounded-3xl border-dashed border-border/60 bg-muted/20 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-primary/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Administrative Decision</span>
                </div>
                <p className="text-sm font-bold">Reviewed on {new Date(request.reviewedAt).toLocaleDateString()}</p>
                {request.rejectionReason && (
                  <div className="text-xs font-medium text-destructive bg-destructive/5 p-4 rounded-2xl">
                    <span className="font-black uppercase text-[9px] block mb-1">Reason for Rejection:</span>
                    {request.rejectionReason}
                  </div>
                )}
              </Card>
            )}

            {/* Rejection Text Input */}
            {isRejecting && (
              <Card className="p-6 rounded-3xl border-destructive/20 shadow-sm space-y-4 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-xl text-destructive">
                    <AlertCircle size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-destructive">Rejection Reason</h3>
                </div>
                <Textarea
                  placeholder="Provide a detailed explanation for the student..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px] rounded-2xl border-destructive/20 focus-visible:ring-destructive/20 font-medium"
                />
              </Card>
            )}

            {/* Action Buttons */}
            {request.status === 'PENDING' && (
              <div className="flex gap-4">
                {!isRejecting ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl font-black text-base border-muted/60 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
                      onClick={() => setIsRejecting(true)}
                    >
                      <XCircle className="mr-2" size={18} /> Reject Request
                    </Button>
                    <Button
                      className="flex-[2] h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                      onClick={handleReviewAndFix}
                      disabled={isFetchingRecord}
                    >
                      {isFetchingRecord ? <Loader2 className="animate-spin mr-2" size={18} /> : <Edit3 className="mr-2" size={18} />}
                      Review & Update Record
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="flex-1 h-14 rounded-2xl font-black text-base"
                      onClick={() => { setIsRejecting(false); setRejectionReason("") }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-[2] h-14 rounded-2xl font-black text-base shadow-xl shadow-destructive/20 hover:scale-[1.02] transition-all"
                      onClick={() => rejectMutation.mutate(rejectionReason)}
                      disabled={!rejectionReason || rejectMutation.isPending}
                    >
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Sidebar Info */}
          <div className="space-y-4">
            {/* Student Identity */}
            <Card className="p-6 border-border/60 bg-muted/5 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <User size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Identity</span>
              </div>
              <p className="font-black text-lg tracking-tight">{request.studentFirstName} {request.studentLastName}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-1 font-mono">{request.studentNationalId || "N/A"}</p>
            </Card>

            {/* Institution */}
            <Card className="p-6 border-border/60 bg-muted/5 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                  <Building2 size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institution</span>
              </div>
              <p className="font-black text-lg tracking-tight leading-tight">{request.institutionName || "N/A"}</p>
              <p className="text-[10px] font-mono font-bold text-muted-foreground/50 mt-1">{request.institutionId?.slice(0, 8)}</p>
            </Card>

            {/* System Reference */}
            <Card className="p-6 border-dashed border-border/60 bg-transparent rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
                  <FileText size={14} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">System Reference</span>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Record ID</p>
                <p className="font-mono text-[9px] font-bold text-muted-foreground/50 break-all leading-tight">{request.recordId}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Record Fixing Modals */}
      {isFixModalOpen && request?.recordType === 'EXAM' && (
        <ExamAddEditModal
          isOpen={isFixModalOpen}
          onClose={() => setIsFixModalOpen(false)}
          initialData={targetRecord}
          hideToast={true}
          onSuccess={() => {
            approveMutation.mutate()
          }}
        />
      )}
      
      {isFixModalOpen && request?.recordType === 'DEGREE' && (
        <DegreeAddEditModal
          isOpen={isFixModalOpen}
          onClose={() => setIsFixModalOpen(false)}
          initialData={targetRecord}
          hideToast={true}
          onSuccess={() => {
            approveMutation.mutate()
          }}
        />
      )}
    </div>
  )
}
