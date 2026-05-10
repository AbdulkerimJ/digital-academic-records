import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { toast } from 'sonner'
import { 
  QrCode, ShieldCheck, Search, GraduationCap, 
  ArrowRight, Upload, KeyRound, Camera, User,
  Moon, Sun, HelpCircle, ChevronRight, Fingerprint, Lock,
  Shield, Database, Cpu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { requestOtp, verifyOtp } from '../../api/student.api'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import QRScanner from '../../components/ui/QRScanner'

export default function LandingPage() {
  const { isAuthenticated, setStudent, setIsAuth } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  // Verification states
  const [token, setToken] = useState('')
  const [scanning, setScanning] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  // Login states
  const [step, setStep] = useState('id') // 'id' | 'otp'
  const [faydaId, setFaydaId] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleVerify = (e) => {
    e.preventDefault()
    if (!token.trim()) return
    
    // Smart Parsing: If it's a URL, extract the last segment
    let extractedToken = token.trim()
    if (extractedToken.includes('/') || extractedToken.includes('http')) {
      extractedToken = extractedToken.split('/').filter(Boolean).pop()
    }
    
    if (extractedToken) {
      navigate(`/verify/${extractedToken}`)
    } else {
      toast.error('Invalid verification format.')
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(null)
    if (!faydaId.trim()) return
    setLoading(true)
    try {
      await requestOtp(faydaId.trim())
      toast.success('OTP sent to your registered phone.')
      setStep('otp')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(null)
    if (!otp.trim()) return
    setLoading(true)
    try {
      const res = await verifyOtp(faydaId.trim(), otp.trim())
      const { accessToken, user } = res.data
      localStorage.setItem('studentAccessToken', accessToken)
      setStudent(user)
      setIsAuth(true)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCameraScan = (data) => {
    const extractedToken = data.split('/').filter(Boolean).pop()
    if (extractedToken) {
      toast.success('QR Code scanned!')
      setCameraOpen(false)
      navigate(`/verify/${extractedToken}`)
    } else {
      toast.error('Invalid QR code format.')
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const MAX_DIM = 1200
        let w = img.width
        let h = img.height
        if (w > MAX_DIM || h > MAX_DIM) {
           const ratio = Math.min(MAX_DIM/w, MAX_DIM/h)
           w = w * ratio
           h = h * ratio
        }
        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)
        
        const imageData = ctx.getImageData(0, 0, w, h)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        })

        setScanning(false)

        if (code && code.data) {
          const text = code.data
          const extractedToken = text.split('/').filter(Boolean).pop()
          if (extractedToken) {
            toast.success('QR Code detected!')
            navigate(`/verify/${extractedToken}`)
          } else {
            toast.error('QR code does not contain a valid token.')
          }
        } else {
          toast.error('No QR code found in this image.')
        }
      }
      img.onerror = () => {
        setScanning(false)
        toast.error('Failed to load image.')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-500 font-sans">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,var(--color-primary),transparent)] opacity-[0.03] pointer-events-none" />

      {/* Floating Theme Toggle (Restored to Top) */}
      <div className="fixed top-8 right-8 z-50 flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 border border-border rounded bg-card/50 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Camera Scanner Modal */}
      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} title="Security Scanner" size="sm">
        <QRScanner onScan={handleCameraScan} onClose={() => setCameraOpen(false)} />
      </Modal>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 md:p-16 flex flex-col gap-12 relative z-20">
        
        {/* Hero Area */}
        <div className="space-y-10">
          {/* Integrated Branding */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center">
              <GraduationCap size={28} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter leading-none">DAR.SYSTEM</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">National Infrastructure</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-muted border border-border rounded text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              <Shield size={12} className="text-primary" /> Secure Institutional Access
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground uppercase">
              The Digital <br/>
              <span className="text-muted-foreground">Academic Records</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-mono font-medium max-w-2xl leading-relaxed border-l-2 border-primary pl-6 tracking-tight">
              Official centralized repository for the verification and management of national academic credentials. 
              Synchronized with the National ID (Fayda) biometric framework.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Verifier Tile */}
          <div className="lg:col-span-7 bg-card border border-border rounded p-10 md:p-14 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Database size={120} />
            </div>
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight text-foreground uppercase">Verify Record</h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Module ID: 0X-VERIFIER</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                    <span className="text-[10px] font-mono tracking-tighter">CMD_</span>
                    <QrCode size={18} />
                  </div>
                  <input
                    type="text"
                    name="token"
                    id="token"
                    placeholder="Enter Verification URL..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-16 bg-muted/30 border border-border rounded pl-20 pr-6 text-xl font-bold tracking-tight focus:outline-none focus:border-primary transition-all font-mono"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-14 bg-primary text-primary-foreground flex items-center justify-center gap-3 rounded font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-lg shadow-primary/10"
                >
                  <ShieldCheck size={18} /> Run System Verification
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setCameraOpen(true)}
                    className="h-12 flex items-center justify-center gap-3 border border-border rounded text-[9px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-all"
                  >
                    <Camera size={16} /> Scan QR
                  </button>
                  <label 
                    htmlFor="qr-upload"
                    className="h-12 flex items-center justify-center gap-3 border border-border rounded text-[9px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-muted transition-all"
                  >
                    <Upload size={16} /> Upload QR
                  </label>
                  <input type="file" id="qr-upload" name="qr-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </form>
            </div>
          </div>

          {/* 2. Student Tile */}
          <div className="lg:col-span-5 bg-card border border-border rounded p-10 flex flex-col justify-between relative group overflow-hidden">
            <div className="absolute bottom-0 right-0 p-6 opacity-5">
              <Cpu size={120} />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-primary border border-border">
                  <Fingerprint size={24} />
                </div>
                {isAuthenticated && (
                   <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest border border-emerald-500/20 px-2 py-1 rounded">Session: AUTHENTICATED</span>
                )}
              </div>

              {isAuthenticated ? (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Student Access</h3>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Biometric Identity Verified</p>
                  </div>
                  <Link to="/dashboard" className="w-full h-14 bg-foreground text-background flex items-center justify-center gap-3 rounded font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all">
                    Go to Dashboard <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Student Login</h3>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">OTP Authentication Required</p>
                  </div>

                  {step === 'id' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          name="faydaId"
                          id="faydaId"
                          placeholder="Enter Fayda ID..."
                          className="w-full h-14 bg-muted/30 border border-border rounded pl-12 pr-6 text-xs font-bold tracking-tight focus:outline-none focus:border-primary transition-all font-mono"
                          value={faydaId}
                          onChange={(e) => setFaydaId(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full h-14 bg-foreground text-background flex items-center justify-center gap-3 rounded font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : 'Send Login OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <input
                        type="text"
                        name="otp"
                        id="otp"
                        placeholder="000000"
                        className="w-full h-14 bg-muted/30 border border-border rounded text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-primary transition-all font-mono"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={8}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStep('id')}
                          className="h-12 border border-border rounded text-[9px] font-black uppercase tracking-widest hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="h-12 bg-primary text-primary-foreground flex items-center justify-center rounded font-black text-[9px] uppercase tracking-widest transition-all"
                          disabled={loading}
                        >
                          {loading ? <Spinner size="sm" /> : 'Verify & Login'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="mt-auto pt-12 border-t border-border flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-6">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">© {new Date().getFullYear()} National Academic Registry</p>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest cursor-default">Help Center</span>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono uppercase tracking-widest">DAR.OS v2.4.0</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
           </div>
        </div>
      </main>
    </div>
  )
}
