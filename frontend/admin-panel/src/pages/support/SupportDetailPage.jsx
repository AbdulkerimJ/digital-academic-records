import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Send, 
  Mail, 
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const SupportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [responseMessage, setResponseMessage] = useState('');

  // Fetch ticket detail
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['support-request', id],
    queryFn: async () => {
      const res = await api.get('/api/support-requests');
      // Since there's no direct detail endpoint in the repo yet, we filter from the list
      // In a real app, you'd use api.get(`/api/support-requests/${id}`)
      return res.data.data.requests.find(r => r.id === id);
    }
  });

  // Response mutation
  const respondMutation = useMutation({
    mutationFn: async ({ id, response }) => {
      const res = await api.post(`/api/support-requests/${id}/respond`, { response });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['support-request', id]);
      queryClient.invalidateQueries(['all-support-requests']);
      toast.success('Response sent to requester email!');
      setResponseMessage('');
    }
  });

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) return;
    respondMutation.mutate({ id, response: responseMessage });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Retrieving Inquiry Details...</p>
    </div>
  );

  if (error || !ticket) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <AlertCircle size={48} className="text-destructive" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Inquiry not found</p>
      <Link to="/support" className="text-primary text-xs font-bold underline uppercase tracking-widest">Back to Queue</Link>
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <button 
          onClick={() => navigate('/support')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
           <span className={`text-[10px] font-black px-2 py-0.5 uppercase tracking-widest ${ticket.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'}`}>
              {ticket.status}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inquiry Content */}
        <div className="lg:col-span-9 space-y-6">
           <div className="space-y-1">

              <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-muted-foreground tracking-[0.2em] opacity-60">
                 <span className="flex items-center gap-1.5"><Mail size={12} className="text-primary" /> <span className="text-[11px]">{ticket.email}</span></span>
                 <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
           </div>

           <div className="space-y-2">

              <div className="bg-muted/30 border border-border p-4 rounded-none shadow-sm text-foreground/90 leading-relaxed font-medium text-sm">
                 {ticket.message}
              </div>
           </div>

           {ticket.status === 'RESOLVED' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                   Answer
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-none shadow-sm text-emerald-900 dark:text-emerald-400 font-bold text-sm leading-relaxed">
                   {ticket.response}
                </div>
              </div>
           )}

           {ticket.status === 'PENDING' && (
              <form onSubmit={handleSendResponse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Your Answer</label>
                  <textarea 
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-40 bg-card border border-border p-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none resize-none shadow-sm placeholder:font-normal"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={respondMutation.isPending || !responseMessage.trim()}
                  className="w-full h-12 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {respondMutation.isPending ? (
                    <><Loader2 className="animate-spin" size={16} /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Answer</>
                  )}
                </button>
              </form>
           )}
        </div>

        {/* Right Column: Metadata / Stats */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-card border border-border p-4 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                 <ShieldCheck size={16} className="text-primary" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Details</h4>
              </div>
              
              <div className="space-y-3">
                 <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">ID</span>
                    <p className="font-mono text-[9px] font-bold text-foreground truncate">{ticket.id}</p>
                 </div>
                 
                 <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Sent By</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-bold text-foreground truncate">{ticket.email}</span>
                    </div>
                 </div>

                 {ticket.status === 'RESOLVED' && (
                    <div className="space-y-0.5">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Answered</span>
                       <p className="text-[9px] font-bold text-foreground uppercase tracking-tighter">
                          {new Date(ticket.responded_at || ticket.updated_at).toLocaleString()}
                       </p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDetailPage;
