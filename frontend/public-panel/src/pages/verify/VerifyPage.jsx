import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { GraduationCap, ShieldCheck, CheckCircle2, XCircle, BookOpen, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react'
import { verifyQrToken } from '../../api/student.api'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function VerifyPage() {
  const { token } = useParams()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['verify-qr', token],
    queryFn: () => verifyQrToken(token),
    retry: false, // Don't retry if token is invalid
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <Spinner size="lg" className="text-primary mb-6" />
        <h2 className="text-xl font-bold text-foreground">Verifying Academic Records...</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-sm">Checking the validity of this access token with the national database.</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-6">
          <XCircle size={40} className="text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3 text-center">Verification Failed</h1>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          {error.message || "This access token is invalid, expired, or has been revoked by the student."}
        </p>
        <Link to="/" className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl transition-colors">
          Return to Portal
        </Link>
      </div>
    )
  }

  const result = data?.data
  const student = result?.student
  const degrees = result?.degrees || []
  const exams = result?.exams || []

  return (
    <div className="min-h-screen bg-background">
      {/* Verification Header */}
      <div className="bg-primary text-primary-foreground py-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                Verified Records <CheckCircle2 size={24} className="text-green-300" />
              </h1>
              <p className="text-primary-foreground/80 font-medium mt-1">
                Official academic records powered by DAR.
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 md:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70 mb-1">Authenticated Subject</p>
            <p className="text-lg font-bold">{student?.firstName} {student?.lastName}</p>
            <p className="text-sm font-mono mt-0.5 opacity-80">{student?.nationalId}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-bold text-primary/70 hover:text-primary transition-all group"
        >
          <ArrowUpRight size={16} className="rotate-[225deg] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
          Back to Verification Portal
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* Degrees Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <h2 className="text-2xl font-black text-foreground">Degrees & Certifications</h2>
            <Badge variant="primary" className="ml-2">{degrees.length}</Badge>
          </div>

          {degrees.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center">
              <p className="text-muted-foreground font-medium">No official degrees recorded for this individual.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {degrees.map((deg) => (
                <div key={deg.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="uppercase text-[10px] tracking-widest">{deg.degreeLevelCode}</Badge>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{deg.institutionName}</span>
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-1 group-hover:text-primary transition-colors">
                      <Link to={`/verify/${token}/degree/${deg.id}`}>
                        {deg.degreeTitle}
                      </Link>
                    </h3>
                    {deg.departmentName && <p className="text-sm font-medium text-muted-foreground">{deg.departmentName} - {deg.collegeName}</p>}
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="md:text-right shrink-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Graduation Date</p>
                      <p className="text-base font-bold text-foreground flex items-center md:justify-end gap-1.5">
                        <Calendar size={14} className="text-muted-foreground" />
                        {format(new Date(deg.graduationDate), 'MMMM yyyy')}
                      </p>
                    </div>
                    <Link 
                      to={`/verify/${token}/degree/${deg.id}`}
                      className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Exams Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h2 className="text-2xl font-black text-foreground">Standardized Exams</h2>
            <Badge variant="success" className="ml-2">{exams.length}</Badge>
          </div>

          {exams.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center">
              <p className="text-muted-foreground font-medium">No standardized exam results recorded.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="uppercase text-[10px] tracking-widest">{exam.examLevelCode}</Badge>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{exam.institutionName}</span>
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-1 group-hover:text-primary transition-colors">
                      <Link to={`/verify/${token}/exam/${exam.id}`}>
                        {exam.examLevelName}
                      </Link>
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">Administered in {exam.year}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-8">
                      {exam.percentile && (
                        <div className="text-center">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Percentile</p>
                          <p className="text-lg font-black text-foreground">{exam.percentile}th</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Score</p>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{exam.totalScore}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/verify/${token}/exam/${exam.id}`}
                      className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 flex gap-4">
          <AlertCircle size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Confidentiality Notice</h4>
            <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
              This verification link was uniquely generated by the subject and is strictly confidential. 
              The information provided here is directly queried from the Digital Academic Records database and reflects 
              the official records provided by accredited institutions.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
