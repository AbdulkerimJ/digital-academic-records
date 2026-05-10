import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { toast } from 'sonner'
import { 
  QrCode, ShieldCheck, Search, GraduationCap, 
  ArrowRight, Upload, KeyRound, Camera, User,
  Moon, Sun, HelpCircle, ChevronRight, Fingerprint, Lock,
  Shield, Database, Cpu, Globe, Zap
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
  const [loginModalOpen, setLoginModalOpen] = useState(false)

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

  const scrollTo = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-200 flex flex-col relative overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-500">
      
      {/* 1. Stunning Animated Background */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] opacity-[0.15] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-cyan-500 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-all duration-500" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transition-all duration-500" />

      {/* 2. Sleek Glassmorphism Header */}
      <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#030712]/50 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter text-slate-950 dark:text-white transition-colors">NAR</h1>
                <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mt-0.5 transition-colors">National academic registry</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-8 border-l border-slate-200 dark:border-white/10 pl-8 transition-colors">
               {[
                 { name: 'Home', id: 'hero' },
                 { name: 'About', id: 'about' },
                 { name: 'Verification', id: 'verify-section' }
               ].map((item) => (
                 <button 
                  key={item.name}
                  onClick={() => scrollTo(item.id)}
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                 >
                   {item.name}
                 </button>
               ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:border-white/30 dark:hover:bg-white/5 transition-all"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button 
                onClick={() => setLoginModalOpen(true)}
                className="h-10 px-6 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
              >
                <User size={14} /> Student Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Camera Scanner Modal */}
      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} title="Security Scanner" size="sm">
        <QRScanner onScan={handleCameraScan} onClose={() => setCameraOpen(false)} />
      </Modal>

      {/* Student Login Modal */}
      <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} title="" size="md">
        <div className="flex flex-col relative group overflow-hidden">
          {/* Subtle Background Icon */}
          <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none rotate-12">
             <Shield size={200} />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-xl shadow-slate-900/10 dark:shadow-none">
                    <Fingerprint size={26} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Identity Gateway</span>
                    <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white leading-none">Student portal</h3>
                 </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Secure session
              </div>
            </div>

            {isAuthenticated ? (
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-slate-950 dark:text-white">Identity verified</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your biometric profile is currently active.</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setLoginModalOpen(false)} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center gap-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 dark:shadow-none">
                    Enter Dashboard <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                    Access your verified academic credentials using the <span className="font-bold text-slate-950 dark:text-white">National Identification protocol</span>.
                  </p>
                </div>

                {step === 'id' ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="relative group/input">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 group-focus-within/input:border-blue-500/50 transition-colors">
                        <User size={16} className="text-slate-400 dark:text-slate-500 group-focus-within/input:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="faydaId"
                        id="faydaId"
                        placeholder="National ID Number"
                        className="w-full h-16 bg-white dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-16 pr-6 text-sm font-semibold text-slate-900 dark:text-white tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        value={faydaId}
                        onChange={(e) => setFaydaId(e.target.value)}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center gap-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20 dark:shadow-none"
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : 'Request Access OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Verification code</label>
                       <input
                        type="text"
                        name="otp"
                        id="otp"
                        placeholder="000000"
                        className="w-full h-20 bg-white dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-2xl text-center text-4xl font-black text-slate-900 dark:text-white tracking-[0.4em] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-mono placeholder:text-slate-200 dark:placeholder:text-slate-800"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={8}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setStep('id')}
                        className="h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="h-14 bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98] transition-all"
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : 'Confirm identity'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
               <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">
                  Protected by national encryption protocols. unauthorized access attempts are logged.
               </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 md:p-16 flex flex-col gap-32 relative z-20">
        
        {/* 3. Epic Hero Section */}
        <div id="hero" className="flex flex-col items-center text-center space-y-10 pt-24 pb-16 scroll-mt-32 relative z-10">
          <div className="space-y-8 max-w-5xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] text-slate-950 dark:text-white transition-colors">
              Digital <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-pink-500 dark:from-blue-400 dark:via-cyan-400 dark:to-pink-400">Academic Records</span>
            </h2>
            <div className="max-w-3xl px-8 py-6 bg-white/40 dark:bg-white/[0.01] backdrop-blur-2xl border border-slate-200/60 dark:border-white/5 rounded-[2rem] shadow-2xl shadow-slate-200/30 dark:shadow-none transition-all duration-700 hover:bg-white/60 dark:hover:bg-white/[0.03]">
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                A centralized digital infrastructure for the <span className="text-slate-950 dark:text-white font-bold tracking-tight">secure issuance</span>, storage, and verification of academic credentials, seamlessly integrated with the <span className="text-blue-600 dark:text-blue-400 font-bold tracking-tight">National Fayda ID system</span>.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Glassmorphic Bento Grid */}
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Verifier Tile */}
          <div id="verify-section" className="w-full bg-white/70 dark:bg-white/[0.02] backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 md:p-14 relative group overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none scroll-mt-32 hover:bg-white/90 dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/10 transition-all duration-700">
            {/* Internal Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-2">
                <h3 className="text-xl md:text-3xl font-bold text-slate-950 dark:text-white transition-colors">Verify record</h3>
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider transition-colors">Module ID: 0X-VERIFIER</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-blue-500 dark:group-focus-within/input:text-blue-400 transition-colors">
                    <QrCode size={20} />
                  </div>
                  <input
                    type="text"
                    name="token"
                    id="token"
                    placeholder="Enter Verification URL..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-16 bg-white dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 text-lg font-semibold text-slate-900 dark:text-white tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center gap-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                >
                  <ShieldCheck size={18} /> Run System Verification
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setCameraOpen(true)}
                    className="h-14 flex items-center justify-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <Camera size={18} /> Scan QR
                  </button>
                  <label 
                    htmlFor="qr-upload"
                    className="h-14 flex items-center justify-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <Upload size={18} /> Upload QR
                  </label>
                  <input type="file" id="qr-upload" name="qr-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 5. Core Functions Section */}
        <div id="about" className="space-y-16 pt-24 scroll-mt-32 relative">
          <div className="flex flex-col items-center text-center gap-4">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white transition-colors">Core functions</h3>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-[0.3em] transition-colors">Operational layer: System capabilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { 
                title: 'Institutional Record Management', 
                desc: 'Registrars and authorized institutional users can securely upload, manage, and audit academic records with full cryptographic traceability.',
                icon: Database
              },
              { 
                title: 'Personal Credential Vault', 
                desc: 'Students can access their verified academic history, including degrees and exam results, through a secure portal synchronized with Fayda ID.',
                icon: Lock
              },
              { 
                title: 'Third-Party Verification', 
                desc: 'Public and private entities can instantly validate the authenticity of any academic record via encrypted QR codes or verification tokens.',
                icon: ShieldCheck
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:bg-white/90 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 transition-all duration-500 rounded-[2rem] space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm group-hover:scale-110 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 group-hover:border-blue-500/20 dark:group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-500">
                  <feature.icon size={28} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight transition-colors">{feature.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Stunning Workflow Section */}
        <div id="workflow" className="relative scroll-mt-32 mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent blur-3xl rounded-[3rem] pointer-events-none transition-all duration-500" />
          <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 md:p-20 overflow-hidden relative shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.03] text-slate-900 dark:text-white">
              <Shield size={600} />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-300 mb-8 border border-blue-500/20 dark:border-blue-500/30">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] text-slate-950 dark:text-white transition-colors">Seamless <br/> Verification <br/> Workflow</h3>
                  <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest pt-2 transition-colors">Operational Guide v1.0</p>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  The Digital Academic Records system simplifies the complex process of credential issuance and verification through a streamlined three-step protocol.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-6">
                {[
                  { step: '01', title: 'Identity Synchronization', desc: 'Authorized registrars register students directly from the Fayda service.' },
                  { step: '02', title: 'Institutional Issuance', desc: 'Educational bodies upload certified records directly to the national secure vault.' },
                  { step: '03', title: 'Instant Validation', desc: 'Third parties scan QR codes for immediate, cryptographically-secure record verification.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-x-2">
                    <div className="flex-shrink-0 w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 group-hover:border-blue-500/20 dark:group-hover:border-blue-500/40 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-500">
                      <span className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{item.step}</span>
                    </div>
                    <div className="space-y-3 flex-1 pt-2">
                      <h4 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white transition-colors">{item.title}</h4>
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Footer */}
        <div className="mt-12 pt-12 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-center gap-8 pb-8 transition-colors">
           <div className="flex flex-wrap items-center justify-center gap-8">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">© {new Date().getFullYear()} National Academic Registry</p>
              <div className="flex items-center gap-8">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Protocol</span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">Security Standards</span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">Help Center</span>
              </div>
           </div>
        </div>
      </main>

    </div>
  )
}
