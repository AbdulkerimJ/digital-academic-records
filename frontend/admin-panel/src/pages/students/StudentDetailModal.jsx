import { useQuery } from "@tanstack/react-query"
import { getStudentRecords } from "../../api/students.api"
import { useAuth } from "../../context/AuthContext"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "../../components/ui/dialog"
import { Card } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ShieldCheck,
  Building2,
  Award,
  AlertCircle,
  Fingerprint,
  Activity,
  History,
  User
} from "lucide-react"
import { cn } from "../../lib/utils"

export default function StudentDetailModal({ studentId, isOpen, onClose }) {
  const { user } = useAuth()
  const { data: recordsData, isLoading, isError } = useQuery({
    queryKey: ["student-records", studentId],
    queryFn: () => getStudentRecords(studentId),
    enabled: !!studentId && isOpen
  })

  const student = recordsData?.data?.student
  const examsRaw = recordsData?.data?.exams
  const exams = Array.isArray(examsRaw) ? examsRaw : []
  const degreesRaw = recordsData?.data?.degrees
  const degrees = Array.isArray(degreesRaw) ? degreesRaw : []

  if (!studentId) return null

  const getInitials = (s) => s ? `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase() : ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-none">
        {/* 1. Identity Header Section */}
        <div className="bg-muted/10 py-4 px-8 border-b border-border relative">
          <div className="absolute top-0 right-0 py-4 px-8">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-700 tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <ShieldCheck size={12} /> Verified record
             </div>
          </div>

          <DialogHeader className="flex flex-col md:flex-row items-start gap-8 text-left">
            {isLoading ? (
              <Skeleton className="h-16 w-16 rounded-none shrink-0" />
            ) : (
              <div className="h-16 w-16 bg-primary flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-primary/20 shrink-0 font-mono">
                {getInitials(student)}
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-80" />
                  <Skeleton className="h-4 w-60" />
                </div>
              ) : isError ? (
                <div className="flex items-center gap-3 text-destructive font-bold text-xs">
                  <AlertCircle size={18} /> Error loading student data
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <DialogTitle className="text-3xl font-black tracking-tighter text-foreground capitalize leading-none">
                      {student?.firstName} {student?.lastName}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">
                       <div className="flex items-center gap-1.5">
                          <Fingerprint size={12} className="text-primary/40" /> {student?.nationalId}
                       </div>
                       <div className="w-1.5 h-1.5 rounded-full bg-border" />
                       <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-primary/40" /> {student?.dateOfBirth && new Date(student.dateOfBirth).toLocaleDateString()}
                       </div>
                       <div className="w-1.5 h-1.5 rounded-full bg-border" />
                       <div className="flex items-center gap-1.5">
                          <User size={12} className="text-primary/40" /> {student?.gender || "—"}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 border-t border-border/50 pt-4">
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground capitalize tracking-tighter">System id:</span>
                        <code className="text-[10px] font-bold text-primary/60 font-mono capitalize tracking-widest">{student?.id}</code>
                     </div>
                  </div>
                </>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* 2. Records Content Section */}
        <div className="p-10 max-h-[70vh] overflow-y-auto space-y-12 scrollbar-hide">
          {isLoading ? (
            <div className="space-y-10">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="h-8 w-64 rounded-none" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-40 rounded-none" />
                    <Skeleton className="h-40 rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* University Records */}
              {(user?.roleName === "SUPER_ADMIN" || user?.institutionType === "COLLEGE") && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
                        <GraduationCap size={20} />
                      </div>
                      <h3 className="text-sm font-black tracking-widest capitalize">University degrees</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">
                       <History size={12} /> {degrees.length} records
                    </div>
                  </div>
                  
                  {degrees.length === 0 ? (
                    <div className="p-16 text-center border border-dashed border-border bg-muted/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[10px] font-bold text-muted-foreground/50 relative z-10">No university degrees found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {degrees.map((degree) => (
                        <Card key={degree.id} className="relative overflow-hidden group border border-border bg-card p-6 rounded-none transition-all hover:border-primary/40 shadow-sm hover:shadow-xl">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-primary/[0.07]" />
                          <div className="relative space-y-6">
                            <div className="flex justify-between items-start">
                              <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary capitalize tracking-widest">
                                {degree.degreeLevelCode}
                              </div>
                              <span className="text-[9px] font-bold text-muted-foreground font-mono capitalize tracking-tighter">Year {new Date(degree.createdAt).getFullYear()}</span>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-black text-base tracking-tighter capitalize leading-tight group-hover:text-primary transition-colors">{degree.degreeTitle}</h4>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">
                                <Building2 size={12} className="text-primary/30" />
                                {degree.institutionName}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-border flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-bold text-muted-foreground/40 capitalize tracking-widest">CGPA</span>
                                 <div className="text-xl font-black text-primary font-mono">{degree.cgpa?.toFixed(2) || "N/A"}</div>
                              </div>
                              <Award size={24} className="text-primary opacity-10 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Examination Records */}
              {(user?.roleName === "SUPER_ADMIN" || user?.institutionType === "EXAM_BOARD") && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                        <BookOpen size={20} />
                      </div>
                      <h3 className="text-sm font-black tracking-widest capitalize">National exams</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground capitalize tracking-widest">
                       <History size={12} /> {exams.length} records
                    </div>
                  </div>

                  {exams.length === 0 ? (
                    <div className="p-16 text-center border border-dashed border-border bg-muted/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[10px] font-bold text-muted-foreground/50 relative z-10">No exam history found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {exams.map((exam) => (
                        <div key={exam.id} className="group flex items-center gap-8 p-6 border border-border bg-card rounded-none hover:bg-primary/[0.02] hover:border-primary/20 transition-all">
                          <div className="h-14 w-14 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <Award size={28} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-sm tracking-widest capitalize text-foreground group-hover:text-primary transition-colors">{exam.examLevelName}</h4>
                              <div className="text-[10px] font-bold text-muted-foreground font-mono bg-muted/20 px-3 py-1 border border-border capitalize tracking-widest">
                                Year {exam.year}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground/60 capitalize tracking-widest">
                              <div className="flex items-center gap-2">
                                <span className="opacity-40">Total score:</span> 
                                <span className="text-primary font-black text-xs font-mono">{exam.totalScore || "N/A"}</span>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-border" />
                              <div className="flex items-center gap-2">
                                <span className="opacity-40">Average score:</span> 
                                <span className="text-primary font-black text-xs font-mono">{exam.averageScore || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 transition-all">
                             <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-700 capitalize tracking-widest">Verified</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
