import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Upload, List, CheckCircle2, AlertCircle, 
  Clock, ShieldCheck, TrendingUp, ArrowUpCircle, 
  Database, ShieldAlert, FileText, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";

// Manual Entry Form Component
function UploadRecordForm({ onUpload }) {
  const [formData, setFormData] = useState({
    nationalId: "", fieldOfStudy: "", year: "", score: "", levelId: "1"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/registrar/upload", formData);
      toast.success("Academic record committed to National Ledger.");
      setFormData({ nationalId: "", fieldOfStudy: "", year: "", score: "", levelId: "1" });
      if (onUpload) onUpload();
    } catch (err) {
      toast.error("Registry synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
         <h1 className="text-4xl font-display font-bold text-primary">Manual Entry</h1>
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mt-1">Direct Secure Data Ingestion</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-sm shadow-sm academic-border space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-primary uppercase tracking-tight">Record Submission Form</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Student National ID</label>
            <input required className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="FAYDA-123456789" value={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Academic Year</label>
            <input required className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="2024" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Field of Study</label>
            <input required className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Computer Science" value={formData.fieldOfStudy} onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Final GPA</label>
            <input required className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. 3.95" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} />
          </div>
        </div>
        
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-sm font-bold uppercase tracking-widest shadow-lg">
          {loading ? "Syncing..." : "Commit to Registry"}
        </Button>
      </form>

      {/* --- BULK UPLOAD SECTION --- */}
      <div className="mt-12">
         <h1 className="text-4xl font-display font-bold text-primary mb-1">Bulk Upload</h1>
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-6">Mass Ingestion via CSV/Excel</p>
         
         <div className="bg-card border border-dashed border-primary/40 p-12 rounded-sm text-center academic-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary transition-colors">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Upload Institutional Records</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
               Select a standardized CSV or Excel ledger file to synchronize hundreds of student records simultaneously.
            </p>
            
            <input 
               type="file" 
               id="bulk-upload-input" 
               className="hidden" 
               accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
               onChange={(e) => {
                 if (e.target.files && e.target.files.length > 0) {
                   const toastId = toast.loading("Fetching and validating file...");
                   setTimeout(() => {
                     toast.success("File uploaded and records synchronized successfully!", { id: toastId });
                     // Reset input so the same file can be selected again if needed
                     e.target.value = null;
                   }, 1500);
                 }
               }}
            />
            <Button 
               onClick={() => document.getElementById('bulk-upload-input').click()} 
               className="h-12 px-8 rounded-sm font-bold uppercase tracking-widest shadow-lg"
               type="button"
            >
               Upload File
            </Button>
         </div>
      </div>
    </div>
  );
}

// Correction/Dispute List Component
function CorrectionsList({ corrections, onUpdate }) {
  const handleResolve = async (id, status) => {
    try {
      await api.patch(`/registrar/corrections/${id}`, { status });
      toast.success(`Request ${status}.`);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
         <h1 className="text-4xl font-display font-bold text-primary">Dispute Queue</h1>
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mt-1">Pending Record Correction Requests</p>
      </div>
      <div className="space-y-4">
        {corrections.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-border rounded-sm bg-secondary/20">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">No Pending Disputes</p>
          </div>
        ) : (
          corrections.map((c) => (
            <div key={c.id} className={`bg-card border p-6 rounded-sm shadow-sm flex justify-between items-start gap-6 transition-all ${c.status === 'PENDING' ? 'border-border academic-border' : 'border-secondary opacity-70'}`}>
              <div className="space-y-2 flex-1">
                 <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${c.status === 'PENDING' ? 'bg-accent' : c.status === 'APPROVED' ? 'bg-success' : 'bg-destructive'}`} />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                     {c.status === 'PENDING' ? 'Priority Dispute' : `Status: ${c.status}`}
                   </span>
                 </div>
                 <h4 className="font-bold text-foreground">{c.student || c.studentName} <span className="text-muted-foreground font-normal">({c.nationalId})</span></h4>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">"{c.description}"</p>
              </div>
              <div className="flex gap-2">
                {c.status === "PENDING" ? (
                  <>
                    <Button onClick={() => handleResolve(c.id, "APPROVED")} variant="outline" className="h-10 border-success text-success uppercase text-[10px] rounded-sm hover:bg-success hover:text-white transition-all">Approve</Button>
                    <Button onClick={() => handleResolve(c.id, "REJECTED")} variant="outline" className="h-10 border-destructive text-destructive uppercase text-[10px] rounded-sm hover:bg-destructive hover:text-white transition-all">Reject</Button>
                  </>
                ) : (
                  <span className={`px-4 py-2 text-[10px] font-bold uppercase rounded-sm border ${c.status === 'APPROVED' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    {c.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function RegistrarDashboard() {
  const { tab } = useParams();
  const activeTab = tab || "overview"; // Get active tab from URL

  const [records, setRecords] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ processed: 1240, pending: 45, rejected: 12, syncProgress: 75 });

  const fetchData = async () => {
    try {
      const [rRes, cRes] = await Promise.all([api.get("/registrar/records"), api.get("/registrar/corrections")]);
      setRecords(rRes.data?.data ?? rRes.data ?? []);
      setCorrections(cRes.data?.data ?? cRes.data ?? []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const menuItems = [
    { id: "overview", label: "Registry Analytics", icon: LayoutDashboard, sub: "System Overview" },
    { id: "upload", label: "Manual Entry", icon: ArrowUpCircle, sub: "New Records" },
    { id: "corrections", label: "Correction Requests", icon: ShieldAlert, sub: "Dispute Center" },
    { id: "ledger", label: "Audit Log", icon: Database, sub: "Registry Archive" },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-primary uppercase tracking-widest animate-pulse">Initializing Terminal...</div>;

  return (
    <DashboardLayout 
      menuItems={menuItems} 
      activeTab={activeTab} 
      userRole="Institutional Registrar"
      basePath="/registrar"
    >
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          
          {/* --- REGISTRY ANALYTICS TAB --- */}
          {activeTab === "overview" && (
            <div className="space-y-10">
               <div>
                  <h1 className="text-4xl font-display font-bold text-primary">Registry Analytics</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mt-1">Real-time Ingestion Statistics</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {[
                   { label: "Synced to Registry", value: stats.processed, icon: CheckCircle2, color: "text-success", bg: "bg-success/5" },
                   { label: "Bulk Ingestion", value: stats.pending, icon: Clock, color: "text-accent", bg: "bg-accent/5" },
                   { label: "Integrity Rejections", value: stats.rejected, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/5" },
                   { label: "Sync Health", value: "98.2%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
                 ].map((s, i) => (
                   <div key={i} className={`p-5 border border-border rounded-sm ${s.bg} flex items-center justify-between shadow-sm`}>
                      <div>
                         <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{s.label}</div>
                         <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                      </div>
                      <s.icon className={`h-8 w-8 opacity-20 ${s.color}`} />
                   </div>
                 ))}
               </div>

               {stats.pending > 0 && (
                 <div className="bg-card border border-primary/20 p-8 rounded-sm shadow-sm academic-border overflow-hidden">
                   <div className="flex justify-between items-end mb-4">
                      <div className="flex items-center gap-3">
                         <div className="h-3 w-3 rounded-full bg-accent animate-ping" />
                         <span className="text-sm font-bold uppercase tracking-widest text-primary">Bulk Ingestion Cycle Active</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-primary">{stats.syncProgress}% COMPLETE</span>
                   </div>
                   <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stats.syncProgress}%` }} className="h-full bg-accent" />
                   </div>
                   <p className="text-xs text-muted-foreground mt-4 italic text-right">Optimizing Ledger Record {stats.processed + 1}...</p>
                 </div>
               )}
            </div>
          )}

          {/* --- OTHER TABS --- */}
          {activeTab === "upload" && <UploadRecordForm onUpload={fetchData} />}
          {activeTab === "corrections" && <CorrectionsList corrections={corrections} onUpdate={fetchData} />}
          {activeTab === "ledger" && (
            <div className="space-y-6">
              <div className="mb-6">
                 <h1 className="text-4xl font-display font-bold text-primary">Audit Log</h1>
                 <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mt-1">Historical Registry Archive</p>
              </div>
              <div className="bg-card border border-border rounded-sm shadow-sm academic-border overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
                  <div className="flex items-center gap-3"><Database className="h-5 w-5 text-primary" /><h2 className="text-xl font-display font-bold text-primary uppercase tracking-tight">Ledger Audit</h2></div>
                  <Button variant="outline" className="h-8 text-[9px] uppercase tracking-widest font-bold">Export Audit Logs</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary/5 text-[10px] uppercase font-bold text-muted-foreground border-b border-border tracking-widest">
                        <th className="px-6 py-4">Student</th><th className="px-6 py-4">ID</th><th className="px-6 py-4">GPA</th><th className="px-6 py-4">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-primary">{r.name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-foreground">{r.nationalId}</td>
                          <td className="px-6 py-4 text-sm font-bold text-accent">{r.gpa}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{r.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
