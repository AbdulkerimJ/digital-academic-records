import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  LifeBuoy, 
  Search, 
  Mail, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SupportManagementPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Fetch all support requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['all-support-requests'],
    queryFn: async () => {
      const res = await api.get('/api/support-requests');
      return res.data.data.requests;
    }
  });

  const filteredRequests = requests?.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 pb-4">
      
      {/* 1. Header (Standard Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-border pb-2">
        <div className="space-y-0.5 text-left">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground capitalize leading-none">
            Support <span className="text-primary">List</span>
          </h2>
          <p className="text-muted-foreground font-medium text-[10px] tracking-tight uppercase opacity-60">
            Manage student and registrar help requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="bg-muted/30 border border-border flex items-center p-1 rounded-none">
              <button 
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === 'ALL' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('PENDING')}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === 'PENDING' ? "bg-amber-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('RESOLVED')}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === 'RESOLVED' ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Resolved
              </button>
           </div>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-card border border-border p-2 shadow-sm flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or email..."
            className="w-full bg-muted/20 border border-border h-10 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 placeholder:font-normal rounded-none"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/10 border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest">
           <Filter size={14} /> {filteredRequests?.length || 0} Found
        </div>
      </div>

      {/* 3. Requests Table / List */}
      <div className="bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Date</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center gap-3 animate-pulse">
                        <LifeBuoy className="text-primary/40 animate-spin" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Administrative Ledger...</span>
                     </div>
                  </td>
                </tr>
              ) : filteredRequests?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">No matching inquiries found in the registry</p>
                  </td>
                </tr>
              ) : filteredRequests?.map((ticket) => (
                <tr 
                  key={ticket.id}
                  onClick={() => navigate(`/support/${ticket.id}`)}
                  className="group cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                     <span className={cn(
                       "text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-none border",
                       ticket.status === 'PENDING' ? "bg-amber-500/5 text-amber-600 border-amber-500/20" : "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                     )}>
                        {ticket.status}
                     </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 max-w-md">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors">{ticket.subject}</h3>
                      <p className="text-[10px] text-muted-foreground truncate opacity-70 italic">"{ticket.message}"</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       <Mail size={10} className="text-primary/50" />
                       <span className="text-[11px] font-bold text-foreground tracking-wider">{ticket.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black text-foreground uppercase tracking-tighter leading-none">{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupportManagementPage;
