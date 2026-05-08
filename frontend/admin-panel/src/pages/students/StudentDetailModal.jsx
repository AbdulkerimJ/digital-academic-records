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
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Skeleton } from "../../components/ui/skeleton"
import { 
  GraduationCap, 
  BookOpen, 
  UserCircle2, 
  Calendar, 
  MapPin, 
  ShieldCheck,
  Building2,
  Award,
  AlertCircle
} from "lucide-react"

export default function StudentDetailModal({ studentId, isOpen, onClose }) {
  const { user } = useAuth()
  const { data: recordsData, isLoading, isError } = useQuery({
    queryKey: ["student-records", studentId],
    queryFn: () => getStudentRecords(studentId),
    enabled: !!studentId && isOpen
  })

  const student = recordsData?.data?.student
  const exams = recordsData?.data?.exams || []
  const degrees = recordsData?.data?.degrees || []

  if (!studentId) return null

  const getInitials = (s) => s ? `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase() : ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
        {/* Header Section */}
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {isLoading ? (
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            ) : (
              <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-2 ring-primary/5 shrink-0">
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                  {getInitials(student)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex-1 space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-48 mx-auto md:mx-0" />
                </div>
              ) : isError ? (
                <div className="flex items-center gap-2 text-destructive font-bold">
                  <AlertCircle size={18} /> Error loading student data
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <DialogTitle className="text-3xl font-black tracking-tight text-primary/90">
                      {student?.firstName} {student?.lastName}
                    </DialogTitle>
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 rounded-full text-[10px] uppercase font-black px-3 tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 border-none">
                      <ShieldCheck size={12} /> Verified
                    </Badge>
                  </div>
                  <DialogDescription className="text-sm font-bold text-muted-foreground/80 flex flex-wrap justify-center md:justify-start items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <UserCircle2 size={14} className="text-primary/40" /> {student?.nationalId}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30 hidden sm:block" />
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary/40" /> {student?.dateOfBirth && new Date(student.dateOfBirth).toLocaleDateString()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30 hidden sm:block" />
                    <span className="flex items-center gap-1.5 uppercase">
                      <span className="text-[10px] font-black text-primary/40">GENDER:</span> {student?.gender || "N/A"}
                    </span>
                  </DialogDescription>
                </>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 scrollbar-hide">
          {isLoading ? (
            <div className="space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-[1.5rem]" />
                    <Skeleton className="h-32 rounded-[1.5rem]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Degree Records Section - Hidden for Exam Board Admins */}
              {(user?.roleName === "SUPER_ADMIN" || user?.institutionType === "COLLEGE") && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">University (College) Degrees</h3>
                  </div>
                  
                  {degrees.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-muted/50 bg-muted/5 rounded-[2rem]">
                      <p className="text-muted-foreground text-sm font-bold">No university records found for this student.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {degrees.map((degree) => (
                        <Card key={degree.id} className="relative overflow-hidden group border-border/60 hover:border-primary/40 transition-all rounded-[1.5rem] p-6 shadow-sm hover:shadow-md">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                          <div className="relative space-y-4">
                            <div className="flex justify-between items-start">
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] font-black tracking-tighter uppercase px-2 rounded-lg">
                                {degree.degreeLevelCode}
                              </Badge>
                              <span className="text-[10px] font-black text-muted-foreground/60 uppercase">Issued {new Date(degree.createdAt).getFullYear()}</span>
                            </div>
                            <div>
                              <h4 className="font-black text-lg tracking-tight leading-tight mb-1">{degree.degreeTitle}</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                  <Building2 size={12} className="text-primary/40" />
                                  {degree.institutionName}
                                </div>
                                {degree.collegeName && (
                                  <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/70 ml-5">
                                    <span className="h-1 w-1 rounded-full bg-primary/20" />
                                    {degree.collegeName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                              <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">CGPA</div>
                              <div className="text-sm font-black text-primary">{degree.cgpa?.toFixed(2) || "N/A"}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Exam Records Section - Hidden for College Admins */}
              {(user?.roleName === "SUPER_ADMIN" || user?.institutionType === "EXAM_BOARD") && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">National Examinations</h3>
                  </div>

                  {exams.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-muted/50 bg-muted/5 rounded-[2rem]">
                      <p className="text-muted-foreground text-sm font-bold">No examination records found for this student.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {exams.map((exam) => (
                        <Card key={exam.id} className="flex items-center gap-6 p-5 border-border/60 rounded-2xl hover:bg-muted/5 transition-all shadow-sm">
                          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <Award size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-black text-sm tracking-tight">{exam.examLevelName}</h4>
                              <Badge variant="outline" className="text-[9px] font-black border-muted/60 uppercase px-2 py-0">
                                Year {exam.year}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                              <span>Total Score: <span className="text-primary text-xs font-black">{exam.totalScore || "N/A"}</span></span>
                              {exam.averageScore && <span>Avg: <span className="text-primary text-xs font-black">{exam.averageScore}</span></span>}
                            </div>
                          </div>
                        </Card>
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

