import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  ClipboardList, AlertCircle, CheckCircle2, 
  Clock, FileText, XCircle, ChevronRight, 
  Trash2, ArrowUpRight, GraduationCap, BookOpen,
  Shield, Activity, Hash, Cpu, ArrowLeft
} from 'lucide-react'
import { getMyRequests, cancelCorrectionRequest } from '../../api/student.api'
import { toast } from 'sonner'
import Spinner from '../../components/ui/Spinner'

export default function RequestsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ 
    queryKey: ['my-requests'], 
    queryFn: getMyRequests 
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelCorrectionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-requests'])
      toast.success('Correction request withdrawn successfully.')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to withdraw request.')
    }
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-[0.3em]">Loading requests...</p>
      </div>
    )
  }

  const requests = data?.data?.requests || []

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to withdraw this correction request?')) {
      cancelMutation.mutate(id)
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'PENDING':  return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
      case 'APPROVED': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      case 'REJECTED': return 'bg-destructive/10 border-destructive/20 text-destructive'
      default:         return 'bg-muted border-border text-muted-foreground'
    }
  }

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* 1. Module Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
                <ClipboardList size={22} className="text-primary-foreground" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter leading-none capitalize">Correction Requests</h2>
                <span className="text-[8px] font-bold text-primary capitalize tracking-[0.4em] mt-1">Report errors or missing information in your academic records.</span>
             </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-muted/30 rounded-none text-[9px] font-black capitalize tracking-widest">
            <Activity size={12} className="text-primary" /> {requests.length} active cases
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-2 max-w-2xl">
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
             <div className="bg-card border border-border p-6 flex flex-col items-center justify-center text-center rounded-none">
                <p className="text-[9px] font-mono text-muted-foreground capitalize tracking-widest mb-1">Total</p>
                <p className="text-3xl font-black font-mono tracking-tighter">{requests.length.toString().padStart(2, '0')}</p>
             </div>
             <div className="bg-card border border-border p-6 flex flex-col items-center justify-center text-center rounded-none">
                <p className="text-[9px] font-mono text-amber-500 capitalize tracking-widest mb-1">Pending</p>
                <p className="text-3xl font-black font-mono tracking-tighter">{requests.filter(r => r.status === 'PENDING').length.toString().padStart(2, '0')}</p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Requests Feed */}
      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="bg-muted/10 border border-border border-dashed rounded-none p-20 text-center flex flex-col items-center">
            <Shield size={48} className="text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-black capitalize tracking-tight">No Requests</h3>
            <p className="text-xs font-mono text-muted-foreground mt-2 capitalize tracking-widest">You haven't submitted any correction requests yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-card border border-border rounded-none overflow-hidden flex flex-col md:flex-row group">
                
                {/* Audit Content */}
                <div className="flex-1 p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 border text-[9px] font-black capitalize tracking-widest rounded-none ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 border border-border bg-muted/50 text-[9px] font-mono text-muted-foreground capitalize tracking-widest rounded-none">
                        {req.recordType === 'DEGREE' ? <GraduationCap size={10}/> : <BookOpen size={10}/>} {req.recordType}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/40 capitalize tracking-widest">
                      ID: #{req.id.substring(0, 12).toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-primary capitalize tracking-widest">
                       <Activity size={12} /> Reported Discrepancy
                    </div>
                    <p className="text-xl font-black tracking-tight text-foreground capitalize border-l-4 border-muted pl-6 py-1">
                      "{req.requestText}"
                    </p>
                  </div>

                  {/* Feedback Modules */}
                  {req.status === 'REJECTED' && req.rejectionReason && (
                    <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-none relative overflow-hidden">
                      <div className="flex items-center gap-2 text-destructive text-[10px] font-black capitalize tracking-widest mb-3">
                        <XCircle size={14} /> Registrar Feedback
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed capitalize tracking-tight">
                        {req.rejectionReason}
                      </p>
                    </div>
                  )}

                  {req.status === 'APPROVED' && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-none relative overflow-hidden">
                      <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black capitalize tracking-widest mb-3">
                        <CheckCircle2 size={14} /> Records Updated
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed capitalize tracking-tight">
                        The institution has verified your request and updated the records.
                      </p>
                    </div>
                  )}
                </div>

                {/* Audit Metadata & Actions */}
                <div className="md:w-80 shrink-0 bg-muted/30 border-l border-border p-8 flex flex-col justify-between gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[9px] font-mono text-muted-foreground capitalize tracking-widest">Status Timeline</p>
                      <div className="space-y-4 relative">
                        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border/50" />
                        
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black capitalize tracking-tight">Request Submitted</span>
                            <span className="text-[9px] font-mono text-muted-foreground">{format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                          </div>
                        </div>

                        {req.reviewedAt ? (
                          <div className="flex items-start gap-4 relative z-10">
                            <div className={`w-2.5 h-2.5 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-destructive'} mt-1`} />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black capitalize tracking-tight">Registrar Review</span>
                              <span className="text-[9px] font-mono text-muted-foreground">{format(new Date(req.reviewedAt), 'yyyy-MM-dd HH:mm')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4 relative z-10 opacity-30">
                            <div className="w-2.5 h-2.5 rounded-full bg-muted border border-border mt-1" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black capitalize tracking-tight">Pending Review</span>
                              <span className="text-[9px] font-mono text-muted-foreground italic">In Queue...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {req.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancel(req.id)}
                        disabled={cancelMutation.isPending}
                        className="w-full h-12 border border-destructive/30 text-destructive text-[10px] font-black capitalize tracking-widest hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center justify-center gap-2 rounded-none"
                      >
                        {cancelMutation.isPending && cancelMutation.variables === req.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Trash2 size={14} /> Cancel Request
                          </>
                        )}
                      </button>
                    )}
                    <div className="p-3 bg-muted border border-border text-[8px] font-mono text-center text-muted-foreground capitalize tracking-widest leading-relaxed rounded-none">
                      This request is being reviewed by the institution.
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
