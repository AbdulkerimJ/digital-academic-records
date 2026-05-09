import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { requestOtp, verifyOtp } from '../../api/student.api'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setStudent, setIsAuth } = useAuth()

  const [step, setStep]                 = useState('id')   // 'id' | 'otp'
  const [faydaId, setFaydaId]           = useState('')
  const [otp, setOtp]                   = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(null)
    if (!faydaId.trim()) { setError('Please enter your Fayda ID.'); return }
    setLoading(true)
    try {
      await requestOtp(faydaId.trim())
      toast.success('OTP sent to your registered phone.')
      setStep('otp')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(null)
    if (!otp.trim()) { setError('Please enter the OTP.'); return }
    setLoading(true)
    try {
      const res = await verifyOtp(faydaId.trim(), otp.trim())
      const { accessToken, student } = res.data
      localStorage.setItem('studentAccessToken', accessToken)
      setStudent(student)
      setIsAuth(true)
      toast.success(`Welcome back, ${student.firstName}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-primary to-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shadow-sm">
            <GraduationCap size={24} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">DAR Portal</span>
        </div>

        <div className="relative z-10 mb-8">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] tracking-tight mb-5">
            Your Academic<br />Records, Secured.
          </h1>
          <p className="text-base text-white/75 leading-relaxed max-w-sm mb-10">
            Access your verified degrees, exam results, and generate QR codes for instant employer verification.
          </p>
          <div className="flex items-center gap-4 pt-8 border-t border-white/15">
            <ShieldCheck size={32} className="text-white/80 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">National Identity Verified</p>
              <p className="text-xs text-white/60 mt-0.5">Powered by Fayda National ID System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <GraduationCap size={20} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">DAR Student Portal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {step === 'id' ? 'Sign in' : 'Verify your identity'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {step === 'id'
                ? 'Enter your Fayda National ID to receive a one-time passcode.'
                : `Enter the OTP sent to the phone linked with ${faydaId}.`}
            </p>
          </div>

          {error && <Alert type="error" className="mb-5">{error}</Alert>}

          {step === 'id' ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground tracking-tight" htmlFor="faydaId">Fayda National ID</label>
                <input
                  id="faydaId"
                  type="text"
                  className="h-12 px-4 bg-card border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="e.g. ETH-12345678"
                  value={faydaId}
                  onChange={(e) => setFaydaId(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button 
                type="submit" 
                className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? <><Spinner /> Sending OTP...</> : <><ArrowRight size={18} /> Send OTP</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground tracking-tight" htmlFor="otp">
                  <KeyRound size={14} className="text-muted-foreground" />
                  One-Time Passcode
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  className="h-14 px-4 bg-card border border-border rounded-xl text-foreground text-2xl font-black text-center tracking-[0.2em] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                  required
                  maxLength={8}
                />
              </div>
              <button 
                type="submit" 
                className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-1" 
                disabled={loading}
              >
                {loading ? <><Spinner /> Verifying...</> : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                className="h-10 w-full bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                onClick={() => { setStep('id'); setOtp(''); setError(null) }}
              >
                ← Change Fayda ID
              </button>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Not registered? Contact your institution registrar.<br />
              <span className="opacity-75">This portal is for students only.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
