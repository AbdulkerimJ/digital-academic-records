import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Clock, User, Monitor, Globe, Tag, Activity } from "lucide-react"

export default function AuditLogDetailsModal({ isOpen, onClose, log }) {
  if (!log) return null

  const formatJSON = (data) => {
    if (!data) return "None"
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return "Invalid data"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-primary" />
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {log.action.replace(/_/g, ' ')}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-serif">Activity Details</DialogTitle>
          <DialogDescription>
            Detailed information about this system event.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 mt-4 pr-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                <Clock className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Timestamp</p>
                  <p className="text-sm font-medium">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                <User className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Actor</p>
                  <p className="text-sm font-medium">
                    {log.actorFirstName ? `${log.actorFirstName} ${log.actorLastName}` : "System"} 
                    <span className="text-xs text-muted-foreground ml-2">({log.actorEmail || "N/A"})</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                <Tag className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Target Entity</p>
                  <p className="text-sm font-medium">
                    {log.entityType} 
                    <span className="text-xs text-muted-foreground ml-2">ID: {log.entityId}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                <Globe className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Network Context</p>
                  <p className="text-sm font-medium">{log.ipAddress || "Unknown IP"}</p>
                </div>
              </div>
            </div>

            {log.userAgent && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                <Monitor className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Device / User Agent</p>
                  <p className="text-xs font-mono truncate">{log.userAgent}</p>
                </div>
              </div>
            )}

            {/* Changes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Old State
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[150px]">
                  <pre className="text-amber-200/80">{formatJSON(log.oldValues)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  New State
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[150px]">
                  <pre className="text-emerald-200/80">{formatJSON(log.newValues)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
