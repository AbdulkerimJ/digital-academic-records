import React, { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { LifeBuoy, Send, Mail, Type, MessageSquare, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';

export default function SupportModal({ open, onClose, defaultSubject = '' }) {
  const [form, setForm] = useState({
    email: '',
    subject: defaultSubject,
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/support-requests', form);
      toast.success('Your request has been submitted. We will contact you via email.');
      onClose();
      setForm({ email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="" size="md">
      <div className="space-y-8">
        <div className="border-b border-border pb-4">
           <h3 className="text-2xl font-black tracking-tighter text-foreground capitalize leading-none">
             System <span className="text-primary">Support</span>
           </h3>
           <p className="text-muted-foreground font-medium text-[10px] tracking-tight uppercase opacity-70 mt-2">
             Submit a technical inquiry to the administrative team.
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="email" 
                name="email"
                autoComplete="email"
                required
                placeholder="Where should we reach you?"
                className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-none pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                required
                placeholder="What is this about?"
                className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-none pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                value={form.subject}
                onChange={(e) => setForm({...form, subject: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Message</label>
            <textarea 
              required
              rows={5}
              placeholder="Please describe your request in detail..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-none p-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-primary text-white rounded-none font-black text-[11px] uppercase tracking-[0.3em] hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {loading ? <Spinner size="sm" /> : <><Send size={18} /> Send Support Request</>}
          </button>
        </form>
      </div>
    </Modal>
  );
}
