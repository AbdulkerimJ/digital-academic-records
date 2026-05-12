import React, { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { LifeBuoy, Send, Mail, Type, X, Loader2 } from 'lucide-react';

export default function SupportModal({ open, onClose }) {
  const [form, setForm] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/support-requests', form);
      toast.success('Your request has been submitted. Check your email for a response.');
      onClose();
      setForm({ email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-300 rounded-none">
        <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <div className="space-y-8">
          <div className="border-b border-border pb-4">
             <h3 className="text-2xl font-black tracking-tighter text-foreground capitalize leading-none">
               System <span className="text-primary">Support</span>
             </h3>
             <p className="text-muted-foreground font-medium text-[10px] tracking-tight uppercase opacity-70 mt-2">
               Submit a technical inquiry to the administrative team.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="Where should we reach you?"
                  className="w-full h-14 bg-muted/10 border border-border rounded-none pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/20 placeholder:font-normal"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Subject</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                <input 
                  type="text" 
                  required
                  placeholder="What is the issue?"
                  className="w-full h-14 bg-muted/10 border border-border rounded-none pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/20 placeholder:font-normal"
                  value={form.subject}
                  onChange={(e) => setForm({...form, subject: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Request Details</label>
              <textarea 
                required
                rows={5}
                placeholder="Describe the problem..."
                className="w-full bg-muted/10 border border-border rounded-none p-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none resize-none transition-all placeholder:text-muted-foreground/20 placeholder:font-normal"
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Submitting...</>
              ) : (
                <><Send size={18} /> Send Support Request</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
