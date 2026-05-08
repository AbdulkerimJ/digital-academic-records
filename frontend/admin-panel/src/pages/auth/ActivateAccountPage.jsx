import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { toast } from "sonner"
import { ShieldCheck, GraduationCap, KeyRound, CheckCircle2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { activate } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      toast.success("Account activated successfully! Redirecting...")
      // Immediate full-page redirect to dashboard
      window.location.href = "/"
    } catch (error) {
      toast.error(error.message || "Failed to activate account. The link may have expired.")
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-primary/5 text-foreground overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-background/95 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-10" />

        <div className="relative z-20 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">DAR Platform</span>
        </div>

        <div className="relative z-20 mt-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground/90 leading-tight">
            Complete Your<br />Account Setup
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            You're just one step away from accessing the Digital Academic Records Administration portal.
          </p>
          
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border/50">
            <ShieldCheck className="text-primary h-8 w-8" />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Secure Activation</span>
              <br />Set a strong password to protect your access.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Activation Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome to the Team</h2>
            <p className="text-muted-foreground">
              Please set a password for your new administrative account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Activating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <KeyRound size={18} />
                  Activate Account
                </span>
              )}
            </Button>
          </form>

          <div className="pt-6 text-center lg:text-left text-sm text-muted-foreground">
            Already have an active account?{" "}
            <a href="/login" className="text-primary hover:underline underline-offset-4">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
