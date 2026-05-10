import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { toast } from 'sonner'
import { QrCode, ShieldCheck, Search, GraduationCap, ArrowRight, Upload, KeyRound, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { requestOtp, verifyOtp } from '../../api/student.api'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import QRScanner from '../../components/ui/QRScanner'

export default function LandingPage() {
  const { isAuthenticated, setStudent, setIsAuth } = useAuth()
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
    navigate(`/verify/${token.trim()}`)
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Camera Scanner Modal */}
      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} title="Scan QR Code" size="sm">
        <QRScanner onScan={handleCameraScan} onClose={() => setCameraOpen(false)} />
      </Modal>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">DAR Public</span>
          </Link>
          <div>
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Verification Center
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl w-full space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-2 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Verify Academic Records instantly.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Employers can verify records using a QR token, or students can sign in below to manage their digital profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Verification Panel */}
            <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm space-y-6">
              <div className="text-left space-y-1">
                <h2 className="text-xl font-bold text-foreground">Employer Verification</h2>
                <p className="text-sm text-muted-foreground">Enter token or upload QR image</p>
              </div>

              <form onSubmit={handleVerify} className="relative">
                <div className="relative flex items-center shadow-sm rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/20 transition-all border border-border bg-background">
                  <div className="pl-4 pr-2 text-muted-foreground">
                    <QrCode size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Token..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-transparent py-4 text-foreground placeholder:text-muted-foreground outline-none text-sm font-mono"
                    required
                  />
                  <div className="pr-2">
                    <button
                      type="submit"
                      disabled={!token.trim() || scanning}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </form>

              <div className="flex items-center gap-4 justify-center">
                <div className="h-px bg-border flex-1" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OR</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCameraOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors border border-primary/20"
                >
                  <Camera size={18} /> 
                  Scan
                </button>
                <label 
                  htmlFor="qr-upload" 
                  className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition-colors border border-border ${scanning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload size={18} className={scanning ? 'animate-bounce text-primary' : 'text-muted-foreground'} /> 
                  Upload
                </label>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="qr-upload" 
                onChange={handleFileUpload} 
              />
            </div>

            {/* Login Panel */}
            <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm space-y-6">
              {isAuthenticated ? (
                <div className="h-full flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <GraduationCap size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">You are signed in</h3>
                    <p className="text-sm text-muted-foreground">Access your private dashboard to view your full records.</p>
                  </div>
                  <Link to="/dashboard" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-left space-y-1">
                    <h2 className="text-xl font-bold text-foreground">Student Sign In</h2>
                    <p className="text-sm text-muted-foreground">Sign in with Fayda National ID</p>
                  </div>

                  {step === 'id' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div className="text-left">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider ml-1" htmlFor="faydaId">Fayda ID</label>
                        <input
                          id="faydaId"
                          type="text"
                          className="w-full h-12 mt-1 px-4 bg-background border border-border rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder="e.g. ETH-12345678"
                          value={faydaId}
                          onChange={(e) => setFaydaId(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50" 
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : <><ArrowRight size={18} /> Send OTP</>}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="text-left">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider ml-1" htmlFor="otp">
                          <KeyRound size={14} className="text-muted-foreground" />
                          Passcode
                        </label>
                        <input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          className="w-full h-12 mt-1 px-4 bg-background border border-border rounded-xl text-center text-xl font-black tracking-[0.3em] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder="••••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          maxLength={8}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setStep('id')}
                          className="h-12 px-4 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl border border-border transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50" 
                          disabled={loading}
                        >
                          {loading ? <Spinner size="sm" /> : 'Sign In'}
                        </button>
                      </div>
                    </form>
                  )}
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Identity Verified by Fayda
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
