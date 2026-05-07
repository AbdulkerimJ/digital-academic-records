import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getCorrectionRequestDetail, 
  approveCorrectionRequest, 
  rejectCorrectionRequest 
} from "../../api/corrections.api"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card } from "../../components/ui/card"
import { Textarea } from "../../components/ui/textarea"
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Building2, 
  FileText,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  History
} from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "../../components/ui/skeleton"

export default function CorrectionDetailModal({ requestId, isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const { data: requestData, isLoading } = useQuery({
    queryKey: ["correction-request", requestId],
    queryFn: () => getCorrectionRequestDetail(requestId),
    enabled: !!requestId && isOpen
  })

  const request = requestData?.data?.request

  const approveMutation = useMutation({
    mutationFn: () => approveCorrectionRequest(requestId),
    onSuccess: () => {
      toast.success("Correction request approved successfully!")
      queryClient.invalidateQueries({ queryKey: ["correction-requests"] })
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve")
  })

  const rejectMutation = useMutation({
    mutationFn: (reason) => rejectCorrectionRequest(requestId, reason),
    onSuccess: () => {
      toast.success("Correction request rejected.")
      queryClient.invalidateQueries({ queryKey: ["correction-requests"] })
      onClose()
      setIsRejecting(false)
      setRejectionReason("")
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject")
  })

  if (!requestId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
        {/* Header */}
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary/10 text-primary border-none rounded-lg text-[10px] font-black uppercase px-2 py-0.5 tracking-widest">
              Request ID: {requestId.slice(0, 8)}
            </Badge>
            {request && (
              <Badge className={`
                rounded-full font-black text-[10px] uppercase px-4 py-1 flex items-center gap-1.5 border-none
                ${request.status === 'pending' ? 'bg-amber-500 text-white' : request.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'}
              `}>
                {request.status === 'pending' && <Clock size={12} />}
                {request.status === 'approved' && <CheckCircle2 size={12} />}
                {request.status === 'rejected' && <XCircle size={12} />}
                {request.status}
              </Badge>
            )}
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-primary/90 flex items-center gap-3">
              Correction Review Board
            </DialogTitle>
            <DialogDescription className="text-sm font-bold text-muted-foreground/70">
              Analyze the student's request and verify the record integrity before making a final decision.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 scrollbar-hide">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-24 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
            </div>
          ) : (
            <>
              {/* Profile Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border-border/40 bg-muted/5 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <User size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Identity</span>
                  </div>
                  <p className="font-black text-lg tracking-tight">{request.studentFirstName} {request.studentLastName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-1">{request.nationalId}</p>
                </Card>

                <Card className="p-6 border-border/40 bg-muted/5 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                      <Building2 size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institution</span>
                  </div>
                  <p className="font-black text-lg tracking-tight truncate">{request.institutionName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-1">Provider ID: {request.institutionId?.slice(0, 8)}</p>
                </Card>
              </div>

              {/* The Request */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
                    <MessageSquare size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Student's Request Statement</h4>
                </div>
                <Card className="p-6 border-amber-500/20 bg-amber-500/5 rounded-3xl italic text-sm font-medium leading-relaxed text-amber-900 shadow-inner">
                  "{request.requestText}"
                </Card>
              </section>

              {/* Target Record Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                    <FileText size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Target Record Details</h4>
                </div>
                <div className="p-6 border border-border/60 rounded-3xl bg-background shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border/40">
                    <div>
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-2 py-0">
                        {request.recordType}
                      </Badge>
                      <p className="font-black text-sm mt-1">Academic Certificate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Reference ID</p>
                      <p className="font-mono text-[10px] font-bold">{request.recordId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/80">
                    <History size={14} className="text-primary/40" />
                    <span>Submitted on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </section>

              {/* Rejection UI */}
              {isRejecting && (
                <section className="space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-destructive/10 rounded-lg text-destructive">
                      <AlertCircle size={16} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-destructive">Rejection Reason</h4>
                  </div>
                  <Textarea 
                    placeholder="Provide a detailed explanation for the student regarding why this request is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px] rounded-2xl border-destructive/20 focus-visible:ring-destructive/20 font-medium"
                  />
                </section>
              )}

              {/* Review Info for non-pending */}
              {request.status !== 'pending' && (
                <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/60">
                   <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={18} className="text-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Administrative Decision</span>
                  </div>
                  <p className="text-sm font-bold">Reviewed by Administrator</p>
                  {request.rejectionReason && (
                    <p className="text-xs font-medium text-destructive mt-2 bg-destructive/5 p-3 rounded-xl">
                      <span className="font-black uppercase text-[9px] block mb-1">Reason for Rejection:</span>
                      {request.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="p-8 bg-muted/10 border-t border-border/40">
          {request?.status === 'pending' ? (
            <div className="flex w-full gap-4">
              {!isRejecting ? (
                <>
                  <Button 
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-black text-lg border-muted/60 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
                    onClick={() => setIsRejecting(true)}
                  >
                    <XCircle className="mr-2" size={20} /> Reject Request
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2" size={20} /> Approve Correction
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    className="flex-1 h-14 rounded-2xl font-black text-lg"
                    onClick={() => { setIsRejecting(false); setRejectionReason(""); }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-[2] h-14 rounded-2xl font-black text-lg shadow-xl shadow-destructive/20 hover:scale-[1.02] transition-all"
                    onClick={() => rejectMutation.mutate(rejectionReason)}
                    disabled={!rejectionReason || rejectMutation.isPending}
                  >
                    Confirm Rejection
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl font-black text-lg border-muted/60"
              onClick={onClose}
            >
              Close Review Board
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
