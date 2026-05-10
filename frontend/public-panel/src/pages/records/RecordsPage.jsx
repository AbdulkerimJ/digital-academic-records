import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { GraduationCap, BookOpen, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react'
import { getMyExams, getMyDegrees, submitCorrectionRequest } from '../../api/student.api'
import { toast } from 'sonner'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function RecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'exams' ? 'exams' : 'degrees'
  
  const { data: examsData, isLoading: examsLoading, refetch: refetchExams } = useQuery({ queryKey: ['my-exams'], queryFn: getMyExams })
  const { data: degreesData, isLoading: degreesLoading, refetch: refetchDegrees } = useQuery({ queryKey: ['my-degrees'], queryFn: getMyDegrees })

  const [activeTab, setActiveTab] = useState(initialTab)
  
  // Sync tab state with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Update tab if URL changes externally
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (tab === 'degrees' || tab === 'exams')) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="text-primary" /></div>
  }

  const degrees = degreesData?.data?.degrees || []
  const exams = examsData?.data?.exams || []

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground font-medium mt-2">View your verified degrees, certifications, and exam results.</p>
        </div>
      </div>

      <div className="flex p-1 bg-secondary border border-border rounded-xl w-fit">
        <button
          onClick={() => handleTabChange('degrees')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'degrees' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap size={18} />
          Degrees ({degrees.length})
        </button>
        <button
          onClick={() => handleTabChange('exams')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'exams' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen size={18} />
          Exams ({exams.length})
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'degrees' && (
          degrees.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
              <GraduationCap size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">No degrees found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Your registered institutions have not issued any degrees or certifications to your profile yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {degrees.map((degree) => (
                <div key={degree.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <GraduationCap size={80} />
                  </div>
                  <div className="relative z-10">
                    <Badge variant="primary" className="mb-4 text-[10px] uppercase tracking-widest">{degree.degreeLevelCode || 'Degree'}</Badge>
                    <h3 className="text-xl font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer">
                      <Link to={`/dashboard/records/degree/${degree.id}`}>
                        {degree.degreeTitle}
                      </Link>
                    </h3>
                    {degree.departmentName && <p className="text-sm font-bold text-muted-foreground mb-6">Department: {degree.departmentName}</p>}
                    
                    <div className="space-y-3 pt-6 border-t border-border/60">
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Calendar size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Graduation Date</span>
                          {degree.graduationDate ? format(new Date(degree.graduationDate), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <button 
                          onClick={() => openCorrection(degree, 'DEGREE')}
                          className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <AlertCircle size={14} /> Correction
                        </button>
                        <Link 
                          to={`/dashboard/records/degree/${degree.id}`}
                          className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          View Details <ArrowUpRight size={14} />
                        </Link>
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
            <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
              <BookOpen size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">No exam records found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">No examination boards have published results for your profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen size={80} />
                  </div>
                  <div className="relative z-10">
                    <Badge variant="secondary" className="mb-4 text-[10px] uppercase tracking-widest">{exam.examLevelCode || 'Exam'}</Badge>
                    <h3 className="text-xl font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer">
                      <Link to={`/dashboard/records/exam/${exam.id}`}>
                        {exam.examLevelName || 'General Exam'}
                      </Link>
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground mb-6">Score: <span className="text-primary text-base">{exam.totalScore}</span></p>
                    
                    <div className="space-y-3 pt-6 border-t border-border/60">
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Calendar size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Academic Year</span>
                          {exam.year || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <button 
                          onClick={() => openCorrection(exam, 'EXAM')}
                          className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <AlertCircle size={14} /> Correction
                        </button>
                        <Link 
                          to={`/dashboard/records/exam/${exam.id}`}
                          className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          View Details <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal open={correctionModalOpen} onClose={() => !submitting && setCorrectionModalOpen(false)} title="Request Record Correction" size="md">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-medium mb-4">
            If you spotted an error in your <strong className="text-foreground">{selectedRecord?.type === 'DEGREE' ? selectedRecord?.title : selectedRecord?.subjectName}</strong> record, submit a correction request to the issuing institution.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 text-sm text-amber-700 dark:text-amber-400 font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <p>False claims or frivolous requests may lead to account suspension. Please describe the issue clearly.</p>
          </div>
        </div>
        
        <form onSubmit={handleCorrectionSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="correctionText" className="text-sm font-bold text-foreground">Describe the error</label>
            <textarea
              id="correctionText"
              className="w-full min-h-[120px] p-4 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-y"
              placeholder="e.g. My graduation year is incorrectly listed as 2023 instead of 2024..."
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-xl font-semibold text-muted-foreground hover:bg-secondary transition-colors"
              onClick={() => setCorrectionModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? <><Spinner size="sm"/> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
