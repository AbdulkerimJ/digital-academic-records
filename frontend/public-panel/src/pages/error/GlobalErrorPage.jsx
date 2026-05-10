import { useRouteError, useNavigate } from "react-router-dom"
import { AlertTriangle, Home, RotateCcw, ShieldAlert, Activity } from "lucide-react"

export default function GlobalErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  console.error("Critical System Fault:", error)

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden font-sans">
      {/* 1. Technical Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      
      <div className="max-w-md w-full bg-card border border-border shadow-2xl p-0 relative z-10 overflow-hidden">
        {/* 2. Technical Header */}
        <div className="bg-destructive/5 py-4 px-8 border-b border-border flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-destructive flex items-center justify-center text-white">
                <ShieldAlert size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-destructive">System Fault</span>
           </div>
           <Activity size={12} className="text-destructive opacity-30" />
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Application Error</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight opacity-60">The requested operation encountered a runtime exception.</p>
          </div>
          
          <div className="bg-muted/30 p-4 border border-border space-y-2">
            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Exception details:</p>
            <p className="text-xs font-mono font-bold text-destructive break-words leading-relaxed">
              {error?.statusText || error?.message || "Internal rendering exception caught by global boundary."}
            </p>
          </div>

          <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            Record state preserved. You can attempt to re-initialize the component or return to the central dashboard.
          </p>

          <div className="flex gap-4 pt-4">
            <button 
              className="flex-1 h-12 rounded-none border border-border font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-muted flex items-center justify-center transition-all" 
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={14} /> Re-initialize
            </button>
            <button 
              className="flex-1 h-12 rounded-none bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/10 flex items-center justify-center transition-all hover:brightness-110" 
              onClick={() => navigate("/", { replace: true })}
            >
              <Home size={14} /> Exit to Home
            </button>
          </div>
        </div>

        <div className="bg-muted/20 p-4 border-t border-border flex items-center justify-between">
           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Node failure protection</span>
           <div className="w-2 h-2 bg-destructive animate-pulse" />
        </div>
      </div>
    </div>
  )
}
