import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { toast } from "sonner"
import { LogIn, ShieldCheck, Fingerprint, Activity, Clock, Shield, KeyRound, Lock, Globe, Sun, Moon, HelpCircle, LifeBuoy } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { cn } from "../../lib/utils"
import SupportModal from "../../components/ui/SupportModal"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      <div className="absolute top-0 right-0 p-10 flex items-start gap-4 z-50">
         <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-12 w-12 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm cursor-pointer"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

         <div className="hidden lg:flex flex-col items-end space-y-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 capitalize tracking-widest">
               <Activity size={12} className="animate-pulse" /> System online
            </div>
            <div className="text-[9px] font-bold text-muted-foreground/40 capitalize tracking-tighter flex items-center gap-2">
               <Clock size={10} /> {new Date().toLocaleTimeString()}
            </div>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-lg space-y-10">
          
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-14 h-14 bg-primary flex items-center justify-center text-white shadow-2xl">
                <Shield size={32} strokeWidth={2.5} />
              </div>
              <div className="space-y-1 text-left">
                 <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">NAR</h1>
                 <p className="text-[10px] font-black text-primary capitalize tracking-[0.4em] ml-0.5">National academic registry</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight">Identity verification</h2>
              <p className="text-xs font-bold text-muted-foreground capitalize tracking-tight opacity-60 font-mono">Secure tunnel active · Node authorized</p>
            </div>
          </div>

          <div className="bg-card border border-border shadow-2xl p-8 md:p-12 space-y-10 relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
               <Fingerprint size={80} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Email address</Label>
                  <Input id="email" type="email" placeholder="admin@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-16 rounded-none bg-muted/10 border-border pl-6 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold text-sm tracking-tight" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60">Administrative password</Label>
                    <a href="#" className="text-[9px] font-black text-primary capitalize tracking-widest hover:underline" onClick={(e) => e.preventDefault()}>Reset access</a>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-16 rounded-none bg-muted/10 border-border pl-6 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold text-sm tracking-[0.2em]" />
                </div>
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-none text-[11px] font-black capitalize tracking-[0.2em] shadow-2xl transition-all">
                {isSubmitting ? 'Verifying...' : <><KeyRound size={18} /> Authorize access</>}
              </Button>
            </form>

            <div className="pt-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary opacity-60" />
                  <span className="text-[9px] font-black text-muted-foreground/60 capitalize tracking-widest">End-to-end encrypted</span>
               </div>
               <button onClick={() => setIsSupportOpen(true)} className="flex items-center gap-2 text-[9px] font-black text-primary hover:underline transition-all">
                  <LifeBuoy size={12} /> Having trouble?
               </button>
            </div>
          </div>

          <div className="text-center text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest pt-4">
            National Academic Registry Infrastructure &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
      <SupportModal open={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  )
}
