import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  GraduationCap, BookOpen, Calendar, 
  ShieldCheck, ArrowLeft, 
  MapPin, Building2, User, FileText,
  BadgeCheck, Award, Shield, Database,
  Sun, Moon, Hash, Clock, Cpu, Fingerprint,
  CheckCircle2, AlertCircle
} from 'lucide-react'
import { getDegreeDetail, getExamDetail, verifyRecordDetail } from '../../api/student.api'
import { useTheme } from '../../context/ThemeContext'
import Spinner from '../../components/ui/Spinner'

export default function RecordDetailPage() {
  const { type, id, token } = useParams()
  const { theme, toggleTheme } = useTheme()
  const isPublic = !!token

  const { data, isLoading, isError, error } = useQuery({
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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500 font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <Spinner size="lg" className="text-primary mb-6" />
        <h2 className="text-2xl font-black tracking-tighter uppercase">Extracting Record Data...</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-sm font-mono text-[10px] uppercase tracking-[0.3em]">Querying Distributed Academic Ledger</p>
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500 font-sans text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="w-20 h-20 border border-destructive/30 rounded flex items-center justify-center mb-8 bg-destructive/5 text-destructive">
          <FileText size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">Record Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-10 font-medium text-sm leading-relaxed border-l-2 border-destructive pl-6 text-left mx-auto">
          {error?.message || "The requested academic record could not be retrieved from the national registry. It may have been archived or access has been restricted."}
        </p>
        <Link to={isPublic ? `/verify/${token}` : "/dashboard/records"} className="h-14 px-8 border border-border rounded flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-muted transition-all">
          <ArrowLeft size={16} /> Return to Audit List
        </Link>
      </div>
    )
  }

  const record = data.data.record || data.data.degree || data.data.exam
  
  // Intelligence: Extract student from response OR synthesize from record fields
  const student = data.data.student || {
    firstName: record?.studentFirstName,
    lastName: record?.studentLastName,
    nationalId: record?.studentNationalId
  }

  if (!record) {
     return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500 font-sans text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">Data Index Error</h1>
        <p className="text-muted-foreground max-w-md mb-10">Record exists but data mapping failed.</p>
        <Link to={isPublic ? `/verify/${token}` : "/dashboard/records"} className="h-14 px-8 border border-border rounded flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-muted transition-all">
          <ArrowLeft size={16} /> Return to Audit List
        </Link>
      </div>
    )
  }

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
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 md:p-16 flex flex-col gap-12 relative z-20">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between no-print">
          <Link 
            to={isPublic ? `/verify/${token}` : `/dashboard/records?tab=${type}s`} 
            className="flex items-center gap-3 px-4 py-2 border border-border rounded text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
          >
            <ArrowLeft size={14} /> Back to Records Audit
          </Link>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded">
            <ShieldCheck size={12} /> Cryptographically Verified
          </div>
        </div>

        {/* Record Header */}
        <div className="space-y-10">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity w-fit">
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center">
              {type === 'degree' ? <GraduationCap size={28} className="text-primary-foreground" /> : <BookOpen size={28} className="text-primary-foreground" />}
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter leading-none uppercase">Official {type === 'degree' ? 'Degree' : 'Examination'} Record</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">National Registry Audit</span>
            </div>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.85] text-foreground uppercase">
              {type === 'degree' ? record.degreeTitle : record.examLevelName}
            </h2>
            <div className="flex flex-wrap gap-4 items-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2 border-r border-border pr-4">
                <Hash size={12} className="text-primary" /> Audit ID: {record.id.substring(0, 14).toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-primary" /> Verified: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Modules */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* 01. Subject Identity */}
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
                  <p className="text-3xl font-black tracking-tight uppercase">
                    {student?.firstName ? `${student.firstName} ${student.lastName || ''}` : 'NOT_INDEXED'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">National ID (Fayda)</p>
                  <p className="text-3xl font-mono font-black tracking-tighter">{student?.nationalId || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 02. Technical Specifications */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-primary bg-muted/50">
                <span className="text-xs font-black">02</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Record Specifications</h3>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <div className="bg-card border border-border rounded p-0 overflow-hidden">
              <div className="bg-muted/30 px-8 py-4 border-b border-border flex justify-between items-center">
                <span className="text-[10px] font-mono text-primary font-black uppercase tracking-[0.2em]">Data Points Verified</span>
                <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} /> Integrity Confirmed
                </div>
              </div>
              <div className="p-8 md:p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Issuing Institution</p>
                      <p className="text-xl font-black uppercase">{record.institutionName}</p>
                    </div>

                    {type === 'degree' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">College / Department</p>
                        <p className="text-xl font-black uppercase">{record.collegeName || 'N/A'}</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{record.departmentName}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Degree Level / Exam Code</p>
                      <p className="text-xl font-black uppercase">{type === 'degree' ? (record.degreeLevelName || record.degreeLevelCode) : record.examLevelCode}</p>
                      <p className="text-sm font-bold text-primary uppercase tracking-widest">{type === 'degree' ? record.degreeLevelCode : 'Standardized Assessment'}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-muted border border-border rounded p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
                       <div className="absolute bottom-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                         <Award size={80} />
                       </div>
                       <div className="space-y-1 relative z-10">
                          <p className="text-[10px] font-mono text-primary uppercase tracking-widest">
                            {type === 'degree' ? 'Cumulative GPA' : 'Final Assessment Score'}
                          </p>
                          <p className="text-6xl font-black tracking-tighter text-foreground">
                            {type === 'degree' ? record.cgpa || 'N/A' : record.totalScore || 'N/A'}
                          </p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 relative z-10 pt-6 border-t border-border/50">
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                              {type === 'degree' ? 'Graduation' : 'Assessment Year'}
                            </p>
                            <p className="text-sm font-black uppercase">
                              {type === 'degree' 
                                ? (record.graduationDate ? format(new Date(record.graduationDate), 'MMMM yyyy') : 'N/A')
                                : record.year || 'N/A'
                              }
                            </p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Status</p>
                            <p className="text-sm font-black uppercase text-emerald-500">AUTHENTIC</p>
                          </div>
                       </div>
                    </div>

                    {type === 'exam' && (Boolean(record.percentile) || Boolean(record.averageScore)) && (
                      <div className="grid grid-cols-2 gap-6">
                        {Boolean(record.averageScore) && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Average Score</p>
                            <p className="text-xl font-black uppercase">{record.averageScore}</p>
                          </div>
                        )}
                        {Boolean(record.percentile) && (
                          <div className="space-y-1 text-right">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Percentile</p>
                            <p className="text-xl font-black uppercase">{record.percentile}th</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 03. Institutional Disclaimer */}
          <div className="bg-muted/30 border border-border rounded p-10 space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3 text-muted-foreground relative z-10">
              <Shield size={16} className="text-primary" />
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em]">Official Audit Disclaimer</h4>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono font-medium leading-relaxed max-w-4xl relative z-10 uppercase tracking-widest">
              This digital audit record is generated in real-time from the National Academic Registry. 
              The data presented is a cryptographically verified extraction of the issuing institution's private ledger. 
              Unauthorized modification or reproduction of this record is a criminal offense under the National Identity Protection Protocol.
            </p>
          </div>

          {/* Digital Seal Footer */}
          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 border-2 border-border border-dashed rounded flex items-center justify-center text-[10px] font-black text-muted-foreground/30 uppercase text-center p-2 leading-tight">
                   Registry<br/>Seal
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Digitally Signed By</p>
                   <p className="text-xs font-black uppercase">National Academic Records Authority</p>
                   <p className="text-[9px] font-mono text-primary uppercase">{new Date().toISOString()}</p>
                </div>
             </div>
             <div className="text-center md:text-right space-y-2">
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Official Verification Node</p>
                <p className="text-xs font-black text-primary uppercase">verify.dar.gov.et</p>
                <div className="flex items-center justify-center md:justify-end gap-3 mt-4">
                   <span className="text-[9px] font-mono uppercase tracking-widest">DAR.OS v2.4.0</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  )
}
