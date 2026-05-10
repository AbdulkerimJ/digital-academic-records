import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import { Clock, User, Monitor, Globe, Tag, Activity, ArrowRight, ShieldAlert, Fingerprint } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

export default function AuditLogDetailsModal({ isOpen, onClose, log }) {
  if (!log) return null

  const formatJSON = (data) => {
    if (!data || Object.keys(data).length === 0) return "No data recorded"
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return "Invalid data format"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 rounded-none border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 1. Technical Event Header */}
        <div className="bg-muted/30 py-4 px-8 border-b border-border text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <ShieldAlert size={20} />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
               Event id: {log.id?.slice(0, 8)}
            </div>
          </div>
          
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none flex items-center gap-3">
              <Activity size={20} className="text-primary" />
              {log.action.replace(/_/g, ' ').toLowerCase()}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed mt-2 uppercase tracking-tight">
              Detailed audit trail for the specified administrative action.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* 2. Metadata Grid */}
        <div className="p-10 flex-1 overflow-y-auto space-y-10 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 border border-border bg-muted/5 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <Clock size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Timestamp</span>
              </div>
              <p className="text-xs font-black text-foreground uppercase tracking-tight">{new Date(log.createdAt).toLocaleString()}</p>
            </div>

            <div className="p-5 border border-border bg-muted/5 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <User size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Actor</span>
              </div>
              <p className="text-xs font-black text-foreground uppercase tracking-tight truncate">
                {log.actorFirstName ? `${log.actorFirstName} ${log.actorLastName}` : "System"}
              </p>
            </div>

            <div className="p-5 border border-border bg-muted/5 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <Fingerprint size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Target entity</span>
              </div>
              <p className="text-xs font-black text-foreground uppercase tracking-tight">
                {log.entityType} <span className="opacity-30 font-mono text-[9px] ml-1">{log.entityId?.slice(0, 6)}</span>
              </p>
            </div>

            <div className="p-5 border border-border bg-muted/5 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <Globe size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Network context</span>
              </div>
              <p className="text-xs font-mono font-bold text-primary truncate">{log.ipAddress || "0.0.0.0"}</p>
            </div>
          </div>

          {/* 3. Data Differential Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <Activity size={16} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Data state differential</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Previous state</span>
                  </div>
                </div>
                <div className="p-5 bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[200px]">
                  <pre className="text-amber-200/60 whitespace-pre-wrap">{formatJSON(log.oldValues)}</pre>
                </div>
              </div>

              <div className="bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Updated state</span>
                  </div>
                </div>
                <div className="p-5 bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[200px]">
                  <pre className="text-emerald-200/60 whitespace-pre-wrap">{formatJSON(log.newValues)}</pre>
                </div>
              </div>
            </div>
          </div>

          {log.userAgent && (
            <div className="p-6 border border-border bg-muted/5 flex items-start gap-4">
              <Monitor className="text-muted-foreground/30 shrink-0 mt-1" size={18} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">System agent string</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate leading-relaxed">{log.userAgent}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 pt-0">
          <Button 
            onClick={onClose}
            className="w-full h-14 rounded-none font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:brightness-110"
          >
            Close record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
