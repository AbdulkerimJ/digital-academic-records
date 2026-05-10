import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  ClipboardList, AlertCircle, CheckCircle2, 
  Clock, FileText, XCircle, ChevronRight, 
  Trash2, ArrowUpRight, GraduationCap, BookOpen 
} from 'lucide-react'
import { getMyRequests, cancelCorrectionRequest } from '../../api/student.api'
import { toast } from 'sonner'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

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
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="text-primary" /></div>
  }

  const requests = data?.data?.requests || []

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':  return <Badge variant="warning" className="flex items-center gap-1.5"><Clock size={12}/> Pending Review</Badge>
      case 'APPROVED': return <Badge variant="success" className="flex items-center gap-1.5"><CheckCircle2 size={12}/> Approved</Badge>
      case 'REJECTED': return <Badge variant="danger" className="flex items-center gap-1.5"><XCircle size={12}/> Rejected</Badge>
      default:         return <Badge>{status}</Badge>
    }
  }

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to withdraw this correction request?')) {
      cancelMutation.mutate(id)
    }
  }

  return (
    <div className="animate-fade-in-up space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
            <ClipboardList size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Correction Requests</h1>
            <p className="text-muted-foreground font-medium mt-1">Track and manage your reported record errors.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-2xl border border-border/50">
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
            <p className="text-xl font-black text-foreground">{requests.length}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-foreground">{requests.filter(r => r.status === 'PENDING').length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-[2.5rem] p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
              <ClipboardList size={40} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-2xl font-black text-foreground">No Requests Found</h3>
            <p className="text-muted-foreground mt-3 max-w-md font-medium leading-relaxed">
              If you find any discrepancy in your official degrees or exam results, you can report them directly from your <strong className="text-primary">Records</strong> page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row group">
                
                {/* Left Panel: Request Content */}
                <div className="flex-1 p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(req.status)}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        {req.recordType === 'DEGREE' ? <GraduationCap size={12}/> : <BookOpen size={12}/>}
                        {req.recordType} Record
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] font-mono">
                      #{req.id.substring(0,8)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                      <FileText size={16} />
                      Your reported issue:
                    </div>
                    <p className="text-lg font-bold text-foreground leading-relaxed pl-6 border-l-4 border-primary/20 italic">
                      "{req.requestText}"
                    </p>
                  </div>

                  {req.status === 'REJECTED' && req.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 p-6 rounded-2xl animate-fade-in">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-black text-xs uppercase tracking-widest mb-2">
                        <XCircle size={16} /> Rejection Feedback
                      </div>
                      <p className="text-red-900 dark:text-red-300 font-medium">
                        {req.rejectionReason}
                      </p>
                    </div>
                  )}

                  {req.status === 'APPROVED' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-6 rounded-2xl animate-fade-in">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">
                        <CheckCircle2 size={16} /> Update Applied
                      </div>
                      <p className="text-emerald-900 dark:text-emerald-300 font-medium">
                        The institution has reviewed your request and successfully updated your official records.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Panel: Metadata & Actions */}
                <div className="md:w-72 shrink-0 bg-secondary/30 border-l border-border p-8 flex flex-col justify-between gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timeline</p>
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">Submitted</span>
                              <span className="text-[10px] font-medium text-muted-foreground">{format(new Date(req.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          {req.reviewedAt ? (
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-500 ring-emerald-500/10' : 'bg-red-500 ring-red-500/10'} ring-4`} />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">Reviewed</span>
                                <span className="text-[10px] font-medium text-muted-foreground">{format(new Date(req.reviewedAt), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 opacity-50">
                              <div className="w-2 h-2 rounded-full bg-muted border border-border" />
                              <span className="text-xs font-bold text-muted-foreground">Under Review</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {req.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancel(req.id)}
                        disabled={cancelMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl border border-border hover:border-red-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        {cancelMutation.isPending && cancelMutation.variables === req.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Withdraw
                          </>
                        )}
                      </button>
                    )}
                    <div className="p-3 rounded-xl bg-secondary text-[10px] font-bold text-center text-muted-foreground">
                      Managed by National Records Authority
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
