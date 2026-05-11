import CorrectionTable from "./CorrectionTable"
import { ShieldCheck } from "lucide-react"

export default function CorrectionsPage() {
  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-2">
        <div className="space-y-1 text-left">

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
