import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { toast } from "sonner"
import { ShieldCheck, KeyRound, Shield, Fingerprint, Activity, Clock, Sun, Moon, Eye, EyeOff } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { cn } from "../../lib/utils"

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { activate } = useAuth()
  const { theme, setTheme } = useTheme()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      toast.error("Invalid activation link")
      navigate("/login")
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    
    try {
      await activate(token, password)
      toast.success("Account activated successfully! Identity verified.")
      setTimeout(() => {
        window.location.href = "/"
      }, 800)
    } catch (error) {
      toast.error(error.message || "Failed to activate account. The link may have expired.")
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
               <Activity size={12} className="animate-pulse" /> Security protocol active
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
              <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight uppercase">Activate Account</h2>
              <p className="text-xs font-bold text-muted-foreground capitalize tracking-tight opacity-60 font-mono">Invitation Link Verified · Set Your Secure Password</p>
            </div>
          </div>

          <div className="bg-card border border-border shadow-2xl p-8 md:p-12 space-y-10 relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
               <Fingerprint size={80} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">New Administrative Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min. 8 characters" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="h-16 rounded-none bg-muted/10 border-border pl-6 pr-14 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold text-sm tracking-[0.2em]" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground/60 ml-1">Confirm Identity Credentials</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Repeat password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="h-16 rounded-none bg-muted/10 border-border pl-6 pr-14 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary font-semibold text-sm tracking-[0.2em]" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-none text-[11px] font-black capitalize tracking-[0.2em] shadow-2xl transition-all">
                {isSubmitting ? 'Initializing...' : <><KeyRound size={18} /> Activate identity</>}
              </Button>
            </form>

            <div className="pt-6 border-t border-border flex items-center justify-end">
               <a href="/login" className="text-[9px] font-black text-primary hover:underline transition-all">
                  Existing credentials? Sign in
               </a>
            </div>
          </div>

          <div className="text-center text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest pt-4">
            National Academic Registry Infrastructure &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
