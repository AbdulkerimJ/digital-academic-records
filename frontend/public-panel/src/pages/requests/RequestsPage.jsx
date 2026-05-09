import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ClipboardList, AlertCircle, CheckCircle2, Clock, FileText, XCircle } from 'lucide-react'
import { getMyRequests } from '../../api/student.api'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function RequestsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-requests'], queryFn: getMyRequests })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="text-primary" /></div>
  }

  const requests = data?.data?.requests || []

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING':  return <Clock size={16} className="text-amber-500" />
      case 'APPROVED': return <CheckCircle2 size={16} className="text-emerald-500" />
      case 'REJECTED': return <XCircle size={16} className="text-red-500" />
      default:         return <AlertCircle size={16} />
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':  return <Badge variant="warning">Pending Review</Badge>
      case 'APPROVED': return <Badge variant="success">Approved</Badge>
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>
      default:         return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Correction Requests</h1>
            <p className="text-muted-foreground font-medium mt-1">Track the status of your reported record errors.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-3xl p-16 text-center flex flex-col items-center">
            <ClipboardList size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">No requests found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">You haven't submitted any correction requests. If you find an error in your records, you can report it from the Records page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start gap-6">
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(req.status)}
                    <Badge variant="secondary" className="font-mono">{req.recordType}</Badge>
                    <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                      ID: {req.recordId?.substring(0,8)}...
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground mb-1">Your Request:</h4>
                    <p className="text-base font-medium text-foreground bg-secondary/50 p-4 rounded-xl border border-border/50">
                      {req.requestText}
                    </p>
                  </div>

                  {req.status === 'REJECTED' && req.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <XCircle size={14} /> Rejection Reason
                      </h4>
                      <p className="text-sm font-medium text-red-900 dark:text-red-300">
                        {req.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:w-64 shrink-0 bg-secondary rounded-xl p-5 border border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Submitted</p>
                        <p className="text-sm font-bold text-foreground">{format(new Date(req.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    {req.reviewedAt && (
                      <div className="flex items-start gap-3">
                        {getStatusIcon(req.status)}
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Reviewed</p>
                          <p className="text-sm font-bold text-foreground">{format(new Date(req.reviewedAt), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    )}
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
