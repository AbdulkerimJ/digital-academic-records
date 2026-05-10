import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  GraduationCap, BookOpen, Calendar, 
  ShieldCheck, ArrowLeft, 
  MapPin, Building2, User, FileText,
  BadgeCheck, Award
} from 'lucide-react'
import { getDegreeDetail, getExamDetail, verifyRecordDetail } from '../../api/student.api'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function RecordDetailPage() {
  const { type, id, token } = useParams()
  const isPublic = !!token

  const { data, isLoading, isError } = useQuery({
    queryKey: ['record-detail', type, id, token],
    queryFn: () => {
      if (isPublic) {
        return verifyRecordDetail(token, type, id)
      } else {
        return type === 'degree' ? getDegreeDetail(id) : getExamDetail(id)
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <FileText size={40} />
        </div>
        <h1 className="text-3xl font-black text-foreground">Record Not Found</h1>
        <p className="text-muted-foreground">The requested record does not exist or you don't have permission to view it.</p>
        <Link to={isPublic ? `/verify/${token}` : "/dashboard/records"} className="inline-flex items-center gap-2 text-primary font-bold">
          <ArrowLeft size={18} /> Return to list
        </Link>
      </div>
    )
  }

  const record = data.data.record || data.data.degree || data.data.exam
  const student = data.data.student

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      {/* Action Header */}
      <div className="flex items-center justify-start no-print">
        <Link 
          to={isPublic ? `/verify/${token}` : `/dashboard/records?tab=${type}s`} 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to {isPublic ? 'Verified List' : 'My Records'}
        </Link>
      </div>

      {/* Certificate Container */}
      <div className="bg-card border-4 border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Top Accent Bar */}
        <div className="h-4 bg-gradient-to-r from-primary via-blue-600 to-indigo-600" />
        
        {/* Certificate Header */}
        <div className="p-8 md:p-12 border-b border-border bg-secondary/20 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck size={160} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl rotate-3">
              {type === 'degree' ? <GraduationCap size={48} /> : <BookOpen size={48} />}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">
                Official {type === 'degree' ? 'Degree Certificate' : 'Exam Result'}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                  <Building2 size={16} />
                  {record.institutionName}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-border self-center" />
                <div className="text-sm font-bold text-muted-foreground">
                  Verification ID: {record.id.substring(0, 12).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-8 md:p-12 space-y-12">
          {/* Recipient Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <User size={18} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Credential Holder</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-black text-foreground leading-tight">
                  {student?.firstName} {student?.lastName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="primary" className="font-mono tracking-tighter">FAYDA: {student?.nationalId}</Badge>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck size={14} /> Verified Identity
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end md:text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Institution Location</p>
                <p className="text-sm font-bold text-foreground flex items-center md:justify-end gap-1.5">
                  <MapPin size={14} /> Addis Ababa, Ethiopia
                </p>
              </div>
            </div>
          </div>

          {/* Record Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-border/60">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Academic Achievement</p>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground leading-tight">
                    {type === 'degree' ? record.degreeTitle : record.examLevelName}
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    {type === 'degree' ? record.degreeLevelName : record.examLevelCode}
                  </p>
                </div>
              </div>

              {type === 'degree' && record.departmentName && (
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Department / Faculty</p>
                  <p className="text-lg font-bold text-foreground">{record.departmentName}</p>
                  <p className="text-sm text-muted-foreground font-medium">{record.collegeName}</p>
                </div>
              )}
            </div>

            <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 flex flex-col justify-between gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {type === 'degree' ? 'Cumulative GPA' : 'Total Score'}
                  </p>
                  <p className="text-5xl font-black text-foreground tracking-tighter">
                    {type === 'degree' ? record.cgpa || 'N/A' : record.totalScore || 'N/A'}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Award size={32} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> {type === 'degree' ? 'Graduation' : 'Academic Year'}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {type === 'degree' 
                      ? (record.graduationDate ? format(new Date(record.graduationDate), 'MMMM yyyy') : 'N/A')
                      : record.year || 'N/A'
                    }
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-end gap-1">
                    <ShieldCheck size={10} /> Status
                  </p>
                  <p className={`text-sm font-bold ${type === 'degree' || record.resultStatus === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {type === 'degree' ? 'Authentic' : (record.resultStatus || 'Authentic')}
                  </p>
                </div>

                {type === 'exam' && (record.averageScore || record.percentile) && (
                  <>
                    <div className="space-y-1 pt-2 border-t border-border/40">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Average Score</p>
                      <p className="text-sm font-bold text-foreground">{record.averageScore || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-border/40 text-right">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Percentile</p>
                      <p className="text-sm font-bold text-foreground">{record.percentile ? `${record.percentile}th` : 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-12 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 flex items-center justify-center border-2 border-border border-dashed rounded-2xl text-[10px] font-black text-muted-foreground/30 uppercase text-center p-2 leading-tight">
                Digital<br/>Seal
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Digitally Signed By</p>
                <p className="text-xs font-bold text-foreground">National Academic Records Authority</p>
                <p className="text-[10px] font-mono text-muted-foreground/60">{new Date().toISOString()}</p>
              </div>
            </div>
            <div className="text-center md:text-right space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Verification Portal</p>
              <p className="text-xs font-bold text-primary">verify.dar.gov.et</p>
              <p className="text-[9px] text-muted-foreground max-w-[200px]">
                This is a secure digital record. You can verify its authenticity by scanning the QR code on the original token.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Accent */}
        <div className="h-2 bg-secondary" />
      </div>

      {/* Help Footer */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-6 rounded-[2rem] flex items-start gap-4 no-print">
        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
          <strong>Note:</strong> This digital certificate is intended for viewing and quick verification. For official legal purposes, please use the secure QR token generated through your student portal which provides direct access to the live record database.
        </p>
      </div>
    </div>
  )
}

function AlertCircle({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
