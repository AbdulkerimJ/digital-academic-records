import { useState } from 'react'
import { format } from 'date-fns'
import { 
  User, Shield, Calendar, Mail, Fingerprint, 
  Settings, LogOut, Key, CheckCircle2, AlertCircle,
  Hash, Activity, ShieldCheck, Database, ArrowRight,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

export default function ProfilePage() {
  const { student, logout } = useAuth()

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-[0.3em]">Reading Identity Ledger...</p>
      </div>
    )
  }

  const getInitials = () => {
    return `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      

        <div className="flex flex-col md:flex-row gap-8 items-center justify-between border-b border-border pb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
             <Fingerprint size={240} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-40 h-40 border border-border bg-card flex items-center justify-center text-5xl font-black text-primary relative">
               {getInitials()}
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-background rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 size={18} />
               </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-[0.85] text-foreground">
                {student.firstName} <br/>
                <span className="text-muted-foreground">{student.lastName}</span>
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="px-3 py-1 bg-muted/50 border border-border text-[10px] font-mono text-primary capitalize tracking-widest rounded">
                  Fayda_ID: {student.nationalId}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="h-14 px-10 border border-destructive/30 text-destructive font-black text-[10px] capitalize tracking-[0.3em] hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-3 group relative z-10"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Sign Out
          </button>
        </div>

      {/* 2. Identity Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Data */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="bg-muted/30 px-8 py-4 border-b border-border flex justify-between items-center">
              <span className="text-[10px] font-mono text-primary font-black capitalize tracking-[0.2em]">National Identity Metadata</span>
              <UserCheck size={14} className="text-muted-foreground/40" />
            </div>
            
            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-1.5">
                  <p className="text-[9px] font-mono text-primary capitalize tracking-widest">First Name</p>
                  <p className="text-xl font-black capitalize tracking-tight">{student.firstName}</p>
               </div>
               <div className="space-y-1.5">
                  <p className="text-[9px] font-mono text-primary capitalize tracking-widest">Father's Name</p>
                  <p className="text-xl font-black capitalize tracking-tight">{student.lastName}</p>
               </div>
               <div className="space-y-1.5">
                  <p className="text-[9px] font-mono text-primary capitalize tracking-widest">National Identity Number</p>
                  <p className="text-xl font-black font-mono tracking-tighter text-primary">{student.nationalId}</p>
               </div>
               <div className="space-y-1.5">
                  <p className="text-[9px] font-mono text-primary capitalize tracking-widest">Gender</p>
                  <p className="text-xl font-black capitalize tracking-tight">{student.gender || 'Not indexed'}</p>
               </div>
               <div className="space-y-1.5">
                  <p className="text-[9px] font-mono text-primary capitalize tracking-widest">Date of Birth</p>
                  <p className="text-xl font-black capitalize font-mono">
                    {student.dateOfBirth ? format(new Date(student.dateOfBirth), 'yyyy-MM-dd') : 'N/A'}
                  </p>
               </div>
               <div className="space-y-1.5">
                  <p className="text-[9px] font-mono text-primary capitalize tracking-widest">Registry Entry Date</p>
                  <p className="text-xl font-black capitalize font-mono">
                    {student.createdAt ? format(new Date(student.createdAt), 'yyyy-MM-dd') : 'N/A'}
                  </p>
               </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
