import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { toast } from "sonner"
import { LogIn, ShieldCheck, GraduationCap } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await login(email, password)
      toast.success("Logged in successfully")
      navigate("/")
    } catch (error) {
      toast.error(error.message || "Login failed. Please check your credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-primary/5 text-foreground overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-background/95 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-10" />

        {/* Content */}
        <div className="relative z-20 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">DAR Platform</span>
        </div>

        <div className="relative z-20 mt-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground/90 leading-tight">
            Digital Academic<br />Records Administration
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            A secure, centralized platform for managing student data, academic credentials, and institutional workflows.
          </p>
          
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border/50">
            <ShieldCheck className="text-primary h-8 w-8" />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Secure Portal</span>
              <br />Authorized personnel only.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* Placeholder for future "Forgot password" link */}
                <a href="#" className="text-xs font-medium text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  Sign in to Portal
                </span>
              )}
            </Button>
          </form>

          <div className="pt-6 text-center lg:text-left text-sm text-muted-foreground">
            Having trouble accessing your account?{" "}
            <a href="#" className="text-primary hover:underline underline-offset-4" onClick={(e) => e.preventDefault()}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
