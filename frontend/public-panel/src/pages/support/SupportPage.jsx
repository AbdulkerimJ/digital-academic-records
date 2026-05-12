import React, { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { 
  LifeBuoy, 
  Send, 
  Mail, 
  Type, 
  AlertCircle
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
      
      {/* 1. Header (Standard Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-2">
        <div className="space-y-1 text-left">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
            Registry <span className="text-primary">Support</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            Submit your technical or academic inquiries directly to the registry team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 bg-card border border-border p-8 relative overflow-hidden rounded-none shadow-sm">
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

        <div className="space-y-6">
           <div className="p-6 border border-border bg-muted/10 space-y-4 rounded-none">
              <div className="flex items-center gap-3 text-primary">
                <LifeBuoy size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Support Protocol</h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
                Responses are dispatched via the provided email address within 24-48 business hours.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
