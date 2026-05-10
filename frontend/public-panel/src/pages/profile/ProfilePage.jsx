import { useState } from 'react'
import { format } from 'date-fns'
import { 
  User, Shield, Calendar, Mail, Fingerprint, 
  Settings, LogOut, Key, CheckCircle2, AlertCircle 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

export default function ProfilePage() {
  const { student, logout } = useAuth()
  const [revoking, setRevoking] = useState(false)

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  const getInitials = () => {
    return `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header Profile Section */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            {getInitials()}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              {student.firstName} {student.lastName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="primary" className="px-3 py-1 text-xs">Verified Student</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-xs font-mono tracking-tight">{student.nationalId}</Badge>
            </div>
            <p className="text-muted-foreground font-medium pt-2 max-w-md">
              Your profile is verified through the National Identity System (Fayda).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Information */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">First Name</p>
                <p className="text-base font-bold text-foreground">{student.firstName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Father's / Last Name</p>
                <p className="text-base font-bold text-foreground">{student.lastName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fayda National ID</p>
                <p className="text-base font-bold text-foreground font-mono">{student.nationalId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gender</p>
                <p className="text-base font-bold text-foreground capitalize">{student.gender || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date of Birth</p>
                <p className="text-base font-bold text-foreground">
                  {student.dateOfBirth ? format(new Date(student.dateOfBirth), 'MMMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Account Created</p>
                <p className="text-base font-bold text-foreground">
                  {student.createdAt ? format(new Date(student.createdAt), 'MMMM yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">Identity Fully Verified</h3>
              <p className="text-sm text-emerald-800/70 dark:text-emerald-500/70 leading-relaxed">
                Your academic records are linked to your national identity. Any changes to your identity information must be updated through the Fayda National ID office.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-2 shadow-sm">
            <button 
              className="w-full flex items-center justify-between p-4 hover:bg-secondary rounded-2xl transition-colors group"
              onClick={logout}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut size={18} />
                </div>
                <span className="text-sm font-bold text-foreground">Sign out of Portal</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronRight({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
