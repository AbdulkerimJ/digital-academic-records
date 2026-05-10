import CorrectionTable from "./CorrectionTable"
import { Activity, Clock } from "lucide-react"

export default function CorrectionsPage() {
  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 capitalize tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={10} className="animate-pulse" /> SYSTEM ONLINE
            </div>
            <div className="text-[9px] font-bold text-muted-foreground capitalize tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
            Correction <span className="text-primary">Review</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            Review and approve student record correction requests to ensure data accuracy.
          </p>
        </div>
      </div>

      {/* 2. Work Queue */}
      <div className="bg-card border border-border shadow-sm p-1">
        <CorrectionTable />
      </div>
    </div>
  )
}
