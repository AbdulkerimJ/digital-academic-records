import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FileText, QrCode, ClipboardList, GraduationCap, 
  ChevronRight, ShieldCheck, Download, History, 
  MoreHorizontal, CheckCircle2, BookOpen, AlertCircle,
  Activity, Database, Shield, Fingerprint, Award,
  ArrowUpRight, Cpu, Lock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getMyExams, getMyDegrees, getMyRequests, getMyQrTokens } from '../../api/student.api'
import Spinner from '../../components/ui/Spinner'

export default function DashboardPage() {
  const { student } = useAuth()

  const { data: examsData, isLoading: examsLoading } = useQuery({ queryKey: ['my-exams'], queryFn: getMyExams })
  const { data: degreesData, isLoading: degreesLoading } = useQuery({ queryKey: ['my-degrees'], queryFn: getMyDegrees })
  const { data: requestsData, isLoading: requestsLoading } = useQuery({ queryKey: ['my-requests'], queryFn: getMyRequests })
  const { data: qrData, isLoading: qrLoading } = useQuery({ queryKey: ['my-qrs'], queryFn: getMyQrTokens })

  const isLoading = examsLoading || degreesLoading || requestsLoading || qrLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-[0.3em]">Querying National Ledger...</p>
      </div>
    )
  }

  const exams = examsData?.data?.exams || []
  const degrees = degreesData?.data?.degrees || []
  const requestsCount = requestsData?.data?.count || 0
  const qrCount = qrData?.data?.count || 0

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Header Protocol Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Cpu size={22} className="text-primary-foreground" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter leading-none capitalize">Security Protocols</h2>
                <span className="text-[8px] font-bold text-primary capitalize tracking-[0.4em] mt-1">Operational Module</span>
             </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black capitalize tracking-widest rounded">
            <ShieldCheck size={12} /> Biometric Identity Verified
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-[0.85] text-foreground">
            Welcome, <br/>
            <span className="text-muted-foreground">{student?.firstName} {student?.lastName}</span>
          </h1>
          <div className="flex flex-wrap gap-4 items-center font-mono text-[10px] text-muted-foreground capitalize tracking-widest border-l-2 border-primary pl-6">
             <div className="flex items-center gap-2 pr-4 border-r border-border">
                <Fingerprint size={12} className="text-primary" /> Fayda ID: {student?.nationalId}
             </div>
             <div className="flex items-center gap-2">
                <Activity size={12} className="text-primary" /> Status: Session_Authorized
             </div>
          </div>
        </div>
      </div>

      {/* 2. Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Degrees Tile */}
        <div className="bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 border border-border flex items-center justify-center text-primary bg-muted/50">
              <GraduationCap size={20} />
            </div>
            <span className="text-[8px] font-mono text-muted-foreground capitalize tracking-[0.2em]">DB_REF: QUAL_01</span>
          </div>
          <p className="text-5xl font-mono font-black text-foreground tracking-tighter mb-2">
            {degrees.length.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] font-black text-muted-foreground capitalize tracking-widest">Verified Degrees</p>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
             <Database size={80} />
          </div>
        </div>

        {/* Exams Tile */}
        <div className="bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 border border-border flex items-center justify-center text-primary bg-muted/50">
              <BookOpen size={20} />
            </div>
            <span className="text-[8px] font-mono text-muted-foreground capitalize tracking-[0.2em]">DB_REF: EXAM_02</span>
          </div>
          <p className="text-5xl font-mono font-black text-foreground tracking-tighter mb-2">
            {exams.length.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] font-black text-muted-foreground capitalize tracking-widest">Examinations</p>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
             <FileText size={80} />
          </div>
        </div>

        {/* QR Tokens Tile */}
        <div className="bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 border border-border flex items-center justify-center text-emerald-500 bg-emerald-500/5">
              <QrCode size={20} />
            </div>
            <span className="text-[8px] font-mono text-emerald-500 capitalize tracking-[0.2em]">Status: Active</span>
          </div>
          <p className="text-5xl font-mono font-black text-foreground tracking-tighter mb-2">
            {qrCount.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] font-black text-muted-foreground capitalize tracking-widest">Security Tokens</p>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
             <Lock size={80} />
          </div>
        </div>

        {/* Requests Tile */}
        <div className="bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 border border-border flex items-center justify-center text-primary bg-muted/50">
              <ClipboardList size={20} />
            </div>
            <span className="text-[8px] font-mono text-muted-foreground capitalize tracking-[0.2em]">Action Queue</span>
          </div>
          <p className="text-5xl font-mono font-black text-foreground tracking-tighter mb-2">
            {requestsCount.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] font-black text-muted-foreground capitalize tracking-widest">Correction Requests</p>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
             <Activity size={80} />
          </div>
        </div>
      </div>

      {/* 3. Action Protocol & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Protocol Management Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-4">
             <Shield size={18} className="text-primary" />
             <h3 className="text-xl font-black tracking-tight">Quick Actions</h3>
          </div>
          
          <div className="space-y-3">
            <Link to="/dashboard/records" className="w-full h-16 border border-border bg-card flex items-center justify-between px-6 group hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-4">
                <FileText size={18} className="text-primary" />
                <span className="text-[10px] font-black capitalize tracking-widest">Academic Records</span>
              </div>
              <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link to="/dashboard/qr-codes" className="w-full h-16 border border-border bg-card flex items-center justify-between px-6 group hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-4">
                <QrCode size={18} className="text-primary" />
                <span className="text-[10px] font-black capitalize tracking-widest">QR Access Tokens</span>
              </div>
              <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link to="/dashboard/requests" className="w-full h-16 border border-border bg-card flex items-center justify-between px-6 group hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-4">
                <ClipboardList size={18} className="text-primary" />
                <span className="text-[10px] font-black capitalize tracking-widest">Correction Requests</span>
              </div>
              <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Live Registry Feed Section */}
        <div className="lg:col-span-8 bg-card border border-border rounded p-0 overflow-hidden">
          <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-4">
               <Database size={18} className="text-primary" />
               <h3 className="text-xl font-black capitalize tracking-tight">Authenticated Registry Feed</h3>
            </div>
            <Link to="/dashboard/records" className="text-[9px] font-black text-primary capitalize tracking-widest hover:underline">View Full Ledger</Link>
          </div>

          <div className="divide-y divide-border">
            {degrees.slice(0, 2).map((deg) => (
              <div key={deg.id} className="p-8 hover:bg-muted/50 transition-colors flex items-center justify-between gap-6 group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 border border-border rounded flex items-center justify-center text-primary bg-muted/50 group-hover:border-primary transition-colors">
                    <GraduationCap size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-foreground leading-tight capitalize">{deg.degreeTitle}</h4>
                    <p className="text-[9px] font-mono text-muted-foreground capitalize tracking-widest">
                       {deg.institutionName} • {format(new Date(deg.graduationDate), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 capitalize tracking-widest">
                    <CheckCircle2 size={12} /> Validated
                  </div>
                  <Link to={`/dashboard/records/degree/${deg.id}`} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            ))}

            {exams.slice(0, 2).map((exam) => (
              <div key={exam.id} className="p-8 hover:bg-muted/50 transition-colors flex items-center justify-between gap-6 group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 border border-border rounded flex items-center justify-center text-primary bg-muted/50 group-hover:border-primary transition-colors">
                    <BookOpen size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-foreground leading-tight capitalize">{exam.examLevelName}</h4>
                    <p className="text-[9px] font-mono text-muted-foreground capitalize tracking-widest">
                       {exam.institutionName} • Year {exam.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 capitalize tracking-widest">
                    <CheckCircle2 size={12} /> Validated
                  </div>
                  <Link to={`/dashboard/records/exam/${exam.id}`} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-muted/30 border-t border-border text-center">
            <p className="text-[9px] font-mono text-muted-foreground capitalize tracking-[0.2em] max-w-lg mx-auto">
              These digital documents are cryptographically bound to your identity. Modification is a violation of the National Signature Protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function format(date, formatStr) {
  const d = new Date(date)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}
