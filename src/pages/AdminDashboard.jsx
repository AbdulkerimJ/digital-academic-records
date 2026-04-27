import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Building2, Users, ShieldCheck, Plus, 
  Search, ExternalLink, Mail, MapPin, 
  CheckCircle2, AlertCircle, Landmark, UserCheck,
  Power, PowerOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";

function InstitutionsList({ institutions, onRegister, onToggleStatus }) {
  return (
    <section className="bg-card border border-border rounded-sm shadow-sm academic-border overflow-hidden">
      <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-primary uppercase tracking-tight">Educational Institutions</h2>
        </div>
        <Button onClick={onRegister} className="h-10 bg-primary text-white text-[10px] uppercase tracking-widest font-bold px-6 rounded-sm shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2">
           <Plus className="h-4 w-4" /> Enroll Institution
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Institution Name</th>
              <th className="px-6 py-4">Institution Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Administrative Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {institutions.map((inst, i) => {
              const active = inst.isActive || inst.status === "ACTIVE";
              return (
                <tr key={i} className={`hover:bg-secondary/10 transition-colors ${!active ? "opacity-60 bg-secondary/5" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">{inst.name}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-foreground uppercase tracking-wider">
                    {inst.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase">
                    {inst.type || "PUBLIC_UNIVERSITY"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${
                      active 
                      ? "bg-success/10 text-success border-success/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => onToggleStatus(inst.id, !active)}
                      className={`h-8 text-[9px] uppercase font-bold tracking-widest px-4 rounded-sm border-2 transition-all ${
                        active 
                        ? "border-destructive/20 text-destructive hover:bg-destructive hover:text-white" 
                        : "border-success/20 text-success hover:bg-success hover:text-white"
                      }`}
                    >
                      {active ? <PowerOff className="h-3 w-3 mr-2" /> : <Power className="h-3 w-3 mr-2" />}
                      {active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RegistrarsList({ registrars }) {
  return (
    <section className="bg-card border border-border rounded-sm shadow-sm academic-border overflow-hidden">
      <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-primary uppercase tracking-tight">Authorized Registrars</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Registrar Authority</th>
              <th className="px-6 py-4">Associated Institution</th>
              <th className="px-6 py-4">System Identity</th>
              <th className="px-6 py-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrars.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm italic text-muted-foreground">No authorized registrars enrolled</td>
              </tr>
            ) : (
              registrars.map((reg, i) => (
                <tr key={i} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{reg.name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{reg.institution}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{reg.username}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:underline text-[10px] font-bold uppercase tracking-widest">View Logs</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const { tab } = useParams();
  const activeTab = tab || "institutions";

  const [institutions, setInstitutions] = useState([]);
  const [registrars, setRegistrars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "GOVERNMENT_BODY",
    isActive: true
  });

  const fetchData = async () => {
    try {
      const [iRes, rRes] = await Promise.all([
        api.getInstitutions(),
        api.getRegistrars()
      ]);
      setInstitutions(iRes.data?.data ?? iRes.data ?? []);
      setRegistrars(rRes.data?.data ?? rRes.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.createInstitution(formData);
      if (response.data?.success) {
        toast.success("Institution enrolled successfully in National Registry.");
        setIsModalOpen(false);
        setFormData({ name: "", code: "", type: "GOVERNMENT_BODY", isActive: true });
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create institution.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      // Mocking the patch update locally for the demo
      const updated = institutions.map(inst => 
        inst.id === id ? { ...inst, isActive: newStatus, status: newStatus ? "ACTIVE" : "INACTIVE" } : inst
      );
      setInstitutions(updated);
      localStorage.setItem("nar-mock-institutions", JSON.stringify(updated));
      
      const msg = newStatus ? "Institution access restored." : "Institution access suspended.";
      toast.success(msg);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  if (loading) return <div className="p-20 text-center font-display text-primary animate-pulse text-lg tracking-widest uppercase h-screen flex items-center justify-center">Booting Authority Terminal...</div>;

  const menuItems = [
    { id: "institutions", label: "Institutions", icon: Landmark, sub: "National Register" },
    { id: "registrars", label: "Authorities", icon: UserCheck, sub: "Authorized Personnel" },
  ];

  return (
    <DashboardLayout 
      menuItems={menuItems} 
      activeTab={activeTab} 
      userRole="System Administrator"
      basePath="/admin"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "institutions" && (
            <div className="space-y-6">
              <InstitutionsList 
                institutions={institutions} 
                onRegister={() => setIsModalOpen(true)} 
                onToggleStatus={handleToggleStatus}
              />
            </div>
          )}

          {activeTab === "registrars" && (
            <div className="space-y-6">
              <RegistrarsList registrars={registrars} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ENROLLMENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border w-full max-w-lg rounded-sm shadow-2xl academic-border overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                 <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-display font-bold text-primary uppercase tracking-tight">Enroll Institution</h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <AlertCircle className="h-5 w-5" />
                 </button>
              </div>
              
              <form onSubmit={handleCreateInstitution} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Official Institution Name</label>
                    <input required className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none text-sm transition-all" placeholder="e.g. Addis Ababa University" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Institution Code</label>
                       <input required className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none text-sm transition-all" placeholder="e.g. AAU" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Authority Type</label>
                       <select className="w-full bg-background border border-border h-11 px-4 rounded-sm focus:ring-1 focus:ring-primary outline-none text-sm transition-all" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                          <option value="GOVERNMENT_BODY">Government Body</option>
                          <option value="PUBLIC_UNIVERSITY">Public University</option>
                          <option value="PRIVATE_COLLEGE">Private College</option>
                       </select>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded border-border text-primary" />
                    <label htmlFor="isActive" className="text-xs font-bold text-foreground uppercase tracking-wider cursor-pointer">Active Enrollment Status</label>
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-border mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-sm uppercase text-[10px] font-bold h-11">Cancel</Button>
                    <Button type="submit" disabled={submitting} className="flex-1 rounded-sm uppercase text-[10px] font-bold h-11 shadow-lg shadow-primary/20">
                       {submitting ? "Processing Registry..." : "Enroll Institution"}
                    </Button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
