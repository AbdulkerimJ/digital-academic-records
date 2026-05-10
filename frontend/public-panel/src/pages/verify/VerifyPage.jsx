import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  GraduationCap, ShieldCheck, CheckCircle2, XCircle, 
  BookOpen, Calendar, AlertCircle, ArrowUpRight,
  Database, User, Fingerprint, Shield, Sun, Moon,
  ChevronLeft, Award, FileText, Activity, MapPin, 
  Building2, Hash, Clock
} from 'lucide-react'
import { verifyQrToken } from '../../api/student.api'
import { useTheme } from '../../context/ThemeContext'
import Spinner from '../../components/ui/Spinner'

export default function VerifyPage() {
  const { token } = useParams()
  const { theme, toggleTheme } = useTheme()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['verify-qr', token],
    queryFn: () => verifyQrToken(token),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500 font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <Spinner size="lg" className="text-primary mb-6" />
        <h2 className="text-2xl font-black tracking-tighter uppercase">Synchronizing Records...</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-sm font-mono text-[10px] uppercase tracking-[0.3em]">Querying National Academic Ledger</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500 font-sans text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="w-20 h-20 border border-destructive/30 rounded flex items-center justify-center mb-8 bg-destructive/5 text-destructive">
          <XCircle size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">Verification Denied</h1>
        <p className="text-muted-foreground max-w-md mb-10 font-medium text-sm leading-relaxed border-l-2 border-destructive pl-6 text-left mx-auto">
          {error.message || "The record token provided is invalid, expired, or has been cryptographically revoked by the issuer."}
        </p>
        <Link to="/" className="h-14 px-8 border border-border rounded flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-muted transition-all">
          <ChevronLeft size={16} /> Return to Security Portal
        </Link>
      </div>
    )
  }

  const result = data?.data
  const student = result?.student
  const degrees = result?.degrees || []
  const exams = result?.exams || []

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-500 font-sans pb-32">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,var(--color-primary),transparent)] opacity-[0.03] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 w-10 h-10 border border-border rounded bg-card/50 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 md:p-16 flex flex-col gap-16 relative z-20">
        
        {/* Header Section */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <GraduationCap size={22} className="text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter leading-none">DAR.SYSTEM</h1>
                <span className="text-[8px] font-bold text-primary uppercase tracking-[0.4em] mt-1">Audit Module</span>
              </div>
            </Link>
            <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded">
              <ShieldCheck size={12} /> Record Verified Authentic
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.85] text-foreground uppercase">
              Audit Summary <br/>
              <span className="text-muted-foreground">Record Indices</span>
            </h2>
            <div className="flex flex-wrap gap-4 items-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2 border-r border-border pr-4">
                <Hash size={12} className="text-primary" /> Token: {token.substring(0, 12)}...
              </div>
              <div className="flex items-center gap-2">
                <Database size={12} className="text-primary" /> Ledger: MAIN_NET_2.4
              </div>
            </div>
          </div>
        </div>

        {/* 1. STUDENT IDENTITY SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-primary bg-muted/50">
              <span className="text-xs font-black">01</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Subject Identity</h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="bg-card border border-border rounded p-8 md:p-12 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
              <Fingerprint size={120} />
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">Full Legal Name</p>
                <p className="text-3xl font-black tracking-tight uppercase">{student?.firstName} {student?.lastName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">National ID (Fayda)</p>
                <p className="text-3xl font-mono font-black tracking-tighter">{student?.nationalId}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DEGREES SECTION */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-primary bg-muted/50">
              <span className="text-xs font-black">02</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Degrees</h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {degrees.length === 0 ? (
            <div className="bg-muted/10 border border-border border-dashed rounded p-12 text-center">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest italic">No degree records indexed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {degrees.map((deg) => (
                <div key={deg.id} className="bg-card border border-border rounded p-6 md:p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-muted border border-border rounded flex items-center justify-center text-primary shrink-0">
                        <GraduationCap size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black tracking-tight uppercase leading-tight">{deg.degreeTitle}</h4>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {deg.institutionName} • {deg.degreeLevelCode}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to={`/verify/${token}/degree/${deg.id}`}
                      className="h-12 px-6 bg-primary text-primary-foreground rounded flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/10"
                    >
                      View Detailed Audit <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. EXAMINATIONS SECTION */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-primary bg-muted/50">
              <span className="text-xs font-black">03</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Examinations</h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {exams.length === 0 ? (
            <div className="bg-muted/10 border border-border border-dashed rounded p-12 text-center">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest italic">No examination records indexed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-card border border-border rounded p-6 md:p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-muted border border-border rounded flex items-center justify-center text-primary shrink-0">
                        <BookOpen size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black tracking-tight uppercase leading-tight">{exam.examLevelName}</h4>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          Assessment Year: {exam.year} • Score: {exam.totalScore}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to={`/verify/${token}/exam/${exam.id}`}
                      className="h-12 px-6 bg-primary text-primary-foreground rounded flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/10"
                    >
                      View Detailed Audit <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Institutional Disclaimer */}
        <div className="bg-muted/30 border border-border rounded p-10 space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3 text-muted-foreground relative z-10">
            <Shield size={16} className="text-primary" />
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em]">Official Audit Summary</h4>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono font-medium leading-relaxed max-w-4xl relative z-10 uppercase tracking-widest">
            This page provides a high-level summary of records indexed in the National Academic Registry. 
            For legal certification, full cryptographic proof, and secondary data points, please access the detailed audit module for each individual record.
          </p>
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
