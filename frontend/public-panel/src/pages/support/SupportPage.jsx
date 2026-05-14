import React, { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { 
  LifeBuoy, 
  Send, 
  Mail, 
  Type, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

const SupportPage = () => {
  const { student } = useAuth();
  const [form, setForm] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/support-requests', form);
      toast.success('Your request has been submitted. We will contact you via the provided email.');
      setForm({ email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Module Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
                <LifeBuoy size={22} className="text-primary-foreground" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter leading-none capitalize">Support Center</h2>
                <span className="text-[8px] font-bold text-primary capitalize tracking-[0.4em] mt-1">Submit your technical or academic support requests.</span>
             </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black capitalize tracking-widest rounded-none">
            <Activity size={12} /> System Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-3 bg-card border border-border p-8 relative overflow-hidden rounded-none shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="bg-primary/[0.03] border-l-4 border-primary p-6 space-y-2">
               <div className="flex items-center gap-2 text-primary">
                 <AlertCircle size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Identification Requirement</span>
               </div>
               <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
                 Your profile is authenticated via National ID (Fayda). Please provide an external contact email below to receive our response.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                  <input 
                    type="email" 
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="Where should we reach you?"
                    className="w-full h-12 bg-muted/20 border border-border rounded-none pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/20 placeholder:font-normal"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                  <input 
                    type="text" 
                    required
                    placeholder="Brief summary"
                    className="w-full h-12 bg-muted/20 border border-border rounded-none pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/20 placeholder:font-normal"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Request Details</label>
              <textarea 
                required
                rows={6}
                placeholder="Please describe your issue in detail..."
                className="w-full bg-muted/20 border border-border rounded-none p-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none resize-none transition-all placeholder:text-muted-foreground/20 placeholder:font-normal"
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {loading ? <Spinner size="sm" /> : <><Send size={18} /> Submit Support Request</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;
