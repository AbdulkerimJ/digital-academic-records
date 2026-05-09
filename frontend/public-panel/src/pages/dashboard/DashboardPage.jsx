import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, QrCode, ClipboardList, GraduationCap, ChevronRight, ShieldCheck } from 'lucide-react'
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  const examsCount = examsData?.data?.count || 0
  const degreesCount = degreesData?.data?.count || 0
  const requestsCount = requestsData?.data?.count || 0
  const qrCount = qrData?.data?.count || 0

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary to-blue-800 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck size={14} /> Identity Verified
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Welcome back,<br />
              <span className="text-blue-200">{student?.firstName}!</span>
            </h1>
            <p className="text-blue-100/90 text-lg max-w-xl font-medium">
              Manage your academic credentials, generate secure QR codes for employers, and request record corrections all in one place.
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
            <GraduationCap size={56} className="text-white drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Degrees */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Degrees & Titles</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-foreground">{degreesCount}</span>
          </div>
          <Link to="/records" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View records <ChevronRight size={16} />
          </Link>
        </div>

        {/* Exams */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Exam Results</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-foreground">{examsCount}</span>
          </div>
          <Link to="/records" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity">
            View exams <ChevronRight size={16} />
          </Link>
        </div>

        {/* Active QR Codes */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Active QR Tokens</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-foreground">{qrCount}</span>
          </div>
          <Link to="/qr-codes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
            Manage tokens <ChevronRight size={16} />
          </Link>
        </div>

        {/* Correction Requests */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Correction Req</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-foreground">{requestsCount}</span>
          </div>
          <Link to="/requests" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity">
            Check status <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
