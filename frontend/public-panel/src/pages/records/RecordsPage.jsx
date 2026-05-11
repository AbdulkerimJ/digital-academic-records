import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { 
  GraduationCap, BookOpen, AlertCircle, Calendar, 
  ArrowUpRight, ShieldCheck, CheckCircle2, Database,
  Activity, Hash, Search, Filter, Shield, Info,
  AlertTriangle, X
} from 'lucide-react'
import { getMyExams, getMyDegrees, submitCorrectionRequest } from '../../api/student.api'
import { toast } from 'sonner'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'

export default function RecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Use URL Search Params as the single source of truth for the active tab
  const activeTab = searchParams.get('tab') === 'exams' ? 'exams' : 'degrees'
  
  const { data: examsData, isLoading: examsLoading } = useQuery({ queryKey: ['my-exams'], queryFn: getMyExams })
  const { data: degreesData, isLoading: degreesLoading } = useQuery({ queryKey: ['my-degrees'], queryFn: getMyDegrees })

  const handleTabChange = (tab) => {
    setSearchParams({ tab })
  }

  const [correctionModalOpen, setCorrectionModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [correctionText, setCorrectionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const openCorrection = (record, type) => {
    setSelectedRecord({ ...record, type })
    setCorrectionText('')
    setCorrectionModalOpen(true)
  }

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault()
    if (!correctionText.trim()) return
    setSubmitting(true)
    try {
      await submitCorrectionRequest(selectedRecord.id, {
        recordType: selectedRecord.type,
        requestText: correctionText.trim()
      })
      toast.success('Correction request submitted successfully.')
      setCorrectionModalOpen(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (examsLoading || degreesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-[0.3em]">Loading records...</p>
      </div>
    )
  }

  const degrees = degreesData?.data?.degrees || []
  const exams = examsData?.data?.exams || []

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* 1. Module Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
                <Database size={22} className="text-primary-foreground" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter leading-none capitalize">Your Records</h2>
                <span className="text-[8px] font-bold text-primary capitalize tracking-[0.4em] mt-1">Verified Information</span>
             </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black capitalize tracking-widest rounded-none">
            <ShieldCheck size={12} /> Records Updated
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-end justify-between border-b border-border pb-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-[0.85] text-foreground">
              Official <br/>
              <span className="text-muted-foreground">Records</span>
            </h1>
            <p className="text-[11px] font-mono text-muted-foreground capitalize tracking-widest leading-relaxed border-l-2 border-primary pl-6">
              Primary repository for all verified degrees, qualifications, and national assessment results. 
            </p>
          </div>

          {/* Technical Tab Switcher (State derived from URL) */}
          <div className="flex p-1 bg-muted/30 border border-border rounded-none w-full md:w-auto">
            <button
              onClick={() => handleTabChange('degrees')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 text-[10px] font-black capitalize tracking-[0.2em] transition-all rounded-none ${
                activeTab === 'degrees' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <GraduationCap size={16} /> Degrees
            </button>
            <button
              onClick={() => handleTabChange('exams')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 text-[10px] font-black capitalize tracking-[0.2em] transition-all rounded-none ${
                activeTab === 'exams' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <BookOpen size={16} /> Examinations
            </button>
          </div>
        </div>
      </div>

      {/* 2. Records Inventory */}
      <div className="space-y-6">
        {activeTab === 'degrees' && (
          degrees.length === 0 ? (
            <div className="bg-muted/10 border border-border border-dashed rounded-none p-20 text-center flex flex-col items-center">
              <GraduationCap size={48} className="text-muted-foreground/20 mb-6" />
              <h3 className="text-xl font-black capitalize tracking-tight">No Degrees Indexed</h3>
              <p className="text-xs font-mono text-muted-foreground mt-2 capitalize tracking-widest">The national registry contains no tertiary qualifications for this identity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {degrees.map((degree) => (
                <div key={degree.id} className="bg-card border border-border rounded-none overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="bg-muted/30 px-8 py-4 border-b border-border flex justify-between items-center">
                    <span className="text-[10px] font-mono text-primary font-black capitalize tracking-[0.2em]">Asset_ID: DEG_{degree.id.substring(0, 12).toUpperCase()}</span>
                    <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black capitalize tracking-widest">
                      <CheckCircle2 size={12} /> Registry Verified
                    </div>
                  </div>
                  
                  <div className="p-8 md:p-10 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div className="space-y-2">
                          <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-widest">Qualification Title</p>
                          <h4 className="text-3xl font-black tracking-tight capitalize leading-none text-foreground">{degree.degreeTitle}</h4>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                          <button 
                            onClick={() => openCorrection(degree, 'DEGREE')}
                            className="h-12 w-12 border border-border text-muted-foreground hover:text-amber-500 hover:border-amber-500/30 flex items-center justify-center transition-all rounded-none"
                            title="Report Record Error"
                          >
                            <AlertCircle size={20} />
                          </button>
                          <Link 
                            to={`/dashboard/records/degree/${degree.id}`}
                            className="h-12 px-6 bg-primary text-primary-foreground rounded-none flex items-center gap-3 text-[10px] font-black capitalize tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/10"
                          >
                            View Details <ArrowUpRight size={16} />
                          </Link>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Institution</p>
                        <p className="text-sm font-black capitalize leading-tight">{degree.institutionName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Department</p>
                        <p className="text-sm font-black capitalize leading-tight">{degree.departmentName || 'GENERAL'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Level</p>
                        <p className="text-sm font-black capitalize leading-tight font-mono">{degree.degreeLevelCode || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Issue Date</p>
                        <p className="text-sm font-black capitalize leading-tight font-mono">
                          {degree.graduationDate ? format(new Date(degree.graduationDate), 'yyyy-MM-dd') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'exams' && (
          exams.length === 0 ? (
            <div className="bg-muted/10 border border-border border-dashed rounded-none p-20 text-center flex flex-col items-center">
              <BookOpen size={48} className="text-muted-foreground/20 mb-6" />
              <h3 className="text-xl font-black capitalize tracking-tight">No Examinations Indexed</h3>
              <p className="text-xs font-mono text-muted-foreground mt-2 capitalize tracking-widest">No national examination results have been published for this subject.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-card border border-border rounded-none overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="bg-muted/30 px-8 py-4 border-b border-border flex justify-between items-center">
                    <span className="text-[10px] font-mono text-primary font-black capitalize tracking-[0.2em]">Asset_ID: EXM_{exam.id.substring(0, 12).toUpperCase()}</span>
                    <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black capitalize tracking-widest rounded-none">
                      <CheckCircle2 size={12} /> Verified
                    </div>
                  </div>
                  
                  <div className="p-8 md:p-10 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div className="space-y-2">
                          <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-widest">Exam Category</p>
                          <h4 className="text-3xl font-black tracking-tight capitalize leading-none text-foreground">{exam.examLevelName}</h4>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                          <button 
                            onClick={() => openCorrection(exam, 'EXAM')}
                            className="h-12 w-12 border border-border text-muted-foreground hover:text-amber-500 hover:border-amber-500/30 flex items-center justify-center transition-all rounded-none"
                            title="Report Record Error"
                          >
                            <AlertCircle size={20} />
                          </button>
                          <Link 
                            to={`/dashboard/records/exam/${exam.id}`}
                            className="h-12 px-6 bg-primary text-primary-foreground rounded-none flex items-center gap-3 text-[10px] font-black capitalize tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/10"
                          >
                            View Details <ArrowUpRight size={16} />
                          </Link>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Issuing Body</p>
                        <p className="text-sm font-black capitalize leading-tight">{exam.institutionName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Assessment Year</p>
                        <p className="text-sm font-black capitalize leading-tight font-mono">{exam.year}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Final Score</p>
                        <p className="text-xl font-black text-primary leading-tight font-mono">{exam.totalScore}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary/60 capitalize tracking-widest">Registry Status</p>
                        <p className="text-sm font-black capitalize leading-tight text-emerald-500">AUTHENTIC</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Technical Disclaimer */}
      <div className="bg-muted/30 border border-border rounded-none p-10 space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3 text-muted-foreground relative z-10">
          <Shield size={16} className="text-primary" />
          <h4 className="text-[9px] font-black capitalize tracking-[0.4em]">Official Note</h4>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono font-medium leading-relaxed max-w-4xl relative z-10 capitalize tracking-widest">
          The records displayed are authoritative and derived from official institution records. 
        </p>
      </div>

      {/* DISCREPANCY REPORTING PROTOCOL (MODAL) */}
      <Modal open={correctionModalOpen} onClose={() => !submitting && setCorrectionModalOpen(false)} title="DISCREPANCY_REPORTING_PROTOCOL" size="md">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 border border-amber-500/20 bg-amber-500/5 text-amber-600 rounded-none relative overflow-hidden">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black capitalize tracking-widest">Important Note</p>
                <p className="text-xs font-medium leading-relaxed capitalize tracking-tight">
                  False discrepancy reporting or frivolous claims may lead to identity protocol suspension. 
                  Provide clear, factual details regarding the data discrepancy.
                </p>
              </div>
            </div>

            <div className="p-6 bg-muted/30 border border-border rounded-none space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground capitalize tracking-widest">Target Asset</p>
                <span className="text-[9px] font-mono text-primary font-black capitalize tracking-widest">ID: #{selectedRecord?.id?.substring(0,12).toUpperCase()}</span>
              </div>
              <p className="text-lg font-black capitalize tracking-tight text-foreground leading-none">
                {selectedRecord?.degreeTitle || selectedRecord?.examLevelName}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleCorrectionSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="correctionText" className="text-[10px] font-black text-muted-foreground capitalize tracking-[0.2em]">Discrepancy Description</label>
                <span className="text-[9px] font-mono text-muted-foreground/40 capitalize">Required_Field</span>
              </div>
              <textarea
                id="correctionText"
                className="w-full min-h-[160px] p-6 bg-muted/20 border border-border rounded-none text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-y capitalize tracking-tight"
                placeholder="E.G. RECORDED GRADUATION YEAR IS 2023, ACTUAL DATE IS 2024..."
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
              <button 
                type="button" 
                className="h-12 px-8 border border-transparent text-[10px] font-black text-muted-foreground capitalize tracking-widest hover:bg-muted transition-all"
                onClick={() => setCorrectionModalOpen(false)}
                disabled={submitting}
              >
                Cancel Protocol
              </button>
              <button 
                type="submit" 
                className="h-12 px-10 bg-primary text-primary-foreground font-black text-[10px] capitalize tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-3 rounded-none"
                disabled={submitting}
              >
                {submitting ? <><Spinner size="sm"/> Processing...</> : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
