import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  User, GraduationCap, Clock, CheckCircle2, 
  ShieldCheck, ArrowRight, FileText, Bookmark, 
  MapPin, Calendar, Award, AlertCircle, QrCode, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

function CorrectionRequest({ nationalId, studentName }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/student/correction", { nationalId, studentName, description });
      toast.success("Correction request submitted to the University Registrar.");
      setDescription("");
    } catch (err) {
      toast.error("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-8 rounded-sm shadow-sm academic-border max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="h-6 w-6 text-accent" />
        <h2 className="text-xl font-display font-bold text-primary uppercase tracking-tight">Request Official Correction</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
        If your academic record contains errors in GPA, conferring date, or department name, 
        please describe the error below. This request will be sent directly to your institution for verification.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          required
          className="w-full bg-background border border-border p-4 rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition-all min-h-[120px] resize-none"
          placeholder="Describe the discrepancy in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-primary text-primary-foreground h-12 rounded-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
        >
          {loading ? "Transmitting Request..." : "Submit Correction Request"}
        </button>
      </form>
    </div>
  );
}

export default function StudentDashboard() {
  const { tab } = useParams();
  const activeTab = tab || "biographic";

  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrState, setQrState] = useState("idle"); // idle, generating, generated

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, aRes] = await Promise.all([
          api.get("/student/profile"),
          api.get("/student/records"),
          api.get("/student/corrections") // Fetches from the shared mock endpoint
        ]);
        setProfile(pRes.data?.data ?? pRes.data);
        setRecords(rRes.data?.data ?? rRes.data ?? []);
        
        // Filter activity log for the current student mock
        const allCorrections = aRes.data?.data ?? aRes.data ?? [];
        setActivityLog(allCorrections);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center font-display text-primary animate-pulse text-lg tracking-widest uppercase h-screen flex items-center justify-center">Syncing National Student Ledger...</div>;

  const menuItems = [
    { id: "biographic", label: "National Identity", icon: User, sub: "Biographic Data" },
    { id: "academic", label: "Academic Profile", icon: GraduationCap, sub: "Verified Records" },
    { id: "correction", label: "Record Dispute", icon: AlertCircle, sub: "Report Discrepancy" },
    { id: "qrcode", label: "Generate QR", icon: QrCode, sub: "Share Record" },
    { id: "activity", label: "Activity Log", icon: Activity, sub: "Request History" },
  ];

  return (
    <DashboardLayout 
      menuItems={menuItems} 
      activeTab={activeTab} 
      userRole="Verified Student"
      basePath="/student"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "biographic" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-3xl font-display font-bold text-primary">Biographic Information</h2>
                 <div className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest rounded-sm border border-success/20">Identity Verified</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  {[
                    { label: "Full Name", value: `${profile?.first_name} ${profile?.last_name}`, icon: User },
                    { label: "National ID (Fayda)", value: profile?.national_id, icon: ShieldCheck },
                    { label: "Date of Birth", value: profile?.date_of_birth, icon: Calendar },
                    { label: "Gender", value: profile?.gender, icon: User },
                  ].map((item, i) => (
                    <div key={i} className="group border-b border-border pb-4 hover:border-primary transition-colors">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">{item.label}</div>
                      <div className="text-lg font-display font-bold text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/30 p-8 rounded-sm academic-border flex flex-col items-center justify-center text-center">
                   <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
                      <User className="h-16 w-16 text-primary" />
                   </div>
                   <h3 className="font-bold text-primary mb-1">{profile?.first_name} {profile?.last_name}</h3>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Digital ID Holder</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold text-primary">Verified Academic Records</h2>
              {records.map((record) => (
                <div key={record.id} className="bg-card border border-border p-8 rounded-sm shadow-md academic-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <GraduationCap className="h-32 w-32" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-6">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Official Institution</div>
                        <div className="text-2xl font-display font-bold text-primary">{record.institution}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Field of Study</div>
                        <div className="text-xl font-display font-semibold text-foreground">{record.field_of_study}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 h-fit">
                      <div className="p-4 bg-secondary rounded-sm border border-border">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Final Result</div>
                        <div className="text-lg font-bold text-primary">{record.result}</div>
                      </div>
                      <div className="p-4 bg-secondary rounded-sm border border-border">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Completion</div>
                        <div className="text-lg font-bold text-primary">{record.year}</div>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-sm border border-primary/10 col-span-2 flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Record Level</span>
                         <span className="text-xs font-bold text-foreground">{record.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "correction" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold text-primary">Dispute Resolution Center</h2>
              <CorrectionRequest 
                nationalId={profile?.national_id} 
                studentName={`${profile?.first_name} ${profile?.last_name}`} 
              />
            </div>
          )}

          {activeTab === "qrcode" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold text-primary">Secure QR Code</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mt-1">Instant Record Verification</p>
              
              <div className="bg-card border border-border p-12 rounded-sm shadow-sm academic-border flex flex-col items-center justify-center text-center max-w-2xl mx-auto min-h-[400px]">
                 {qrState === "idle" && (
                   <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                     <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                       <QrCode className="h-12 w-12 text-primary opacity-50" />
                     </div>
                     <h3 className="text-xl font-bold text-primary mb-2">Create Verifiable Link</h3>
                     <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
                        Generate a secure, cryptographically signed QR code that grants instant view access to your verified academic transcript.
                     </p>
                     <button 
                       onClick={() => {
                         setQrState("generating");
                         setTimeout(() => setQrState("generated"), 1500);
                       }}
                       className="bg-primary text-primary-foreground h-12 px-8 rounded-sm font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-primary/90 transition-all"
                     >
                       Generate QR Code
                     </button>
                   </div>
                 )}

                 {qrState === "generating" && (
                   <div className="flex flex-col items-center animate-in fade-in duration-300">
                     <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                     <p className="text-sm font-bold uppercase tracking-widest text-primary animate-pulse">Generating Secure Code...</p>
                   </div>
                 )}

                 {qrState === "generated" && (
                   <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                     <div className="bg-white p-4 rounded-md shadow-inner mb-8 border border-border">
                        {/* Placeholder for actual QR code, using an icon for the mock */}
                        <QrCode className="h-48 w-48 text-foreground" strokeWidth={1} />
                     </div>
                     <h3 className="text-xl font-bold text-primary mb-2">Scan to Verify</h3>
                     <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                        This QR code contains a cryptographically signed link to your verified academic transcript. Anyone scanning it can instantly verify your credentials.
                     </p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold text-primary">Activity Log</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mt-1">History of Your Requests</p>
              
              <div className="space-y-4">
                {activityLog.length === 0 ? (
                  <div className="p-10 text-center border border-dashed border-border rounded-sm bg-secondary/20">
                    <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">No activity found</p>
                  </div>
                ) : (
                  activityLog.map((log) => (
                    <div key={log.id} className="bg-card border border-border p-6 rounded-sm shadow-sm academic-border flex flex-col gap-3">
                       <div className="flex justify-between items-start">
                          <h4 className="font-bold text-foreground">Correction Request</h4>
                          <span className={`px-3 py-1 text-[9px] font-bold uppercase rounded-sm border ${
                            log.status === 'APPROVED' ? 'bg-success/10 text-success border-success/20' : 
                            log.status === 'REJECTED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                            'bg-accent/10 text-accent border-accent/20'
                          }`}>
                            {log.status}
                          </span>
                       </div>
                       
                       <div className="bg-secondary/20 p-4 rounded-sm border border-border/50">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Your Request:</p>
                          <p className="text-sm font-medium">"{log.description}"</p>
                       </div>
                       
                       {log.status !== 'PENDING' && (
                         <div className="flex items-start gap-2 mt-2">
                            <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${log.status === 'APPROVED' ? 'bg-success' : 'bg-destructive'}`} />
                            <div>
                               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Registrar Response:</p>
                               <p className={`text-sm ${log.status === 'APPROVED' ? 'text-success' : 'text-destructive'}`}>
                                  {log.status === 'APPROVED' ? "Your request has been approved and your record is updated." : "Your request was rejected. Please contact the registrar for more details."}
                               </p>
                            </div>
                         </div>
                       )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
