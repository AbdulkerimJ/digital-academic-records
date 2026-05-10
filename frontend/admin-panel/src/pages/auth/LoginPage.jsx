import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { toast } from "sonner"
import { LogIn, ShieldCheck, Fingerprint, Activity, Clock, Shield, KeyRound, Lock, Globe, Sun, Moon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { cn } from "../../lib/utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await login(email, password)
      toast.success("Identity verified. Access granted.")
      navigate("/")
    } catch (error) {
      toast.error(error.message || "Authentication failed. Check credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden font-sans">
      {/* 1. Technical Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      <div className="absolute top-0 right-0 p-10 flex items-start gap-4 z-50">
         <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-12 w-12 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

         <div className="hidden lg:flex flex-col items-end space-y-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
               <Activity size={12} className="animate-pulse" /> System online
            </div>
            <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter flex items-center gap-2">
               <Clock size={10} /> {new Date().toLocaleTimeString()}
            </div>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-lg space-y-10">
          
          {/* 2. System Landmark */}
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-14 h-14 bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                <Shield size={32} strokeWidth={2.5} />
              </div>
              <div className="space-y-1 text-left">
                 <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">
                   NAR
                 </h1>
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-0.5">National academic registry</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight">Identity verification</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight opacity-60 font-mono">Secure tunnel active · Node authorized</p>
            </div>
          </div>

          {/* 3. Authentication Block */}
          <div className="bg-card border border-border shadow-2xl p-8 md:p-12 space-y-10 relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
               <Fingerprint size={80} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Email address</Label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-16 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold text-foreground/80 text-sm tracking-tight placeholder:text-muted-foreground/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Administrative password</Label>
                    <a href="#" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline" onClick={(e) => e.preventDefault()}>
                      Reset access
                    </a>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-16 rounded-none bg-muted/10 border-border pl-12 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold text-foreground/80 text-sm tracking-[0.2em]"
                    />
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 rounded-none text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-none animate-spin" />
                    Verifying identity...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <KeyRound size={18} />
                    Authorize access
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary opacity-60" />
                  <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">End-to-end encrypted</span>
               </div>
               <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tight truncate max-w-[200px]">System node: {window.location.hostname}</p>
            </div>
          </div>

          <div className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest pt-4">
            National Academic Registry Infrastructure &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
