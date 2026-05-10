import { NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  QrCode, 
  ClipboardList, 
  User, 
  GraduationCap,
  ChevronRight,
  Shield,
  Activity,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/dashboard/records',    label: 'Academic Records', icon: FileText },
  { to: '/dashboard/qr-codes',   label: 'QR Tokens',   icon: QrCode },
  { to: '/dashboard/requests',   label: 'Requests',    icon: ClipboardList },
]

const bottomItems = [
  { to: '/dashboard/profile',    label: 'Identity Profile', icon: User },
]

function getInitials(s) {
  if (!s) return 'ID'
  return `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase() || 'ID'
}

export default function Sidebar({ isOpen, onClose }) {
  const { student } = useAuth()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    onClose?.()
  }, [location.pathname])

  const linkCls = ({ isActive }) => 
    `flex items-center justify-between px-4 py-3 border border-transparent text-xs font-black capitalize tracking-widest transition-all group ${
      isActive 
        ? 'bg-primary/10 border-primary/20 text-primary' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transition-transform duration-300 transform
      md:relative md:translate-x-0 md:flex md:flex-col md:h-screen md:sticky md:top-0 md:bg-background/50 md:backdrop-blur-xl
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground md:hidden"
      >
        <X size={20} />
      </button>

      {/* Brand - Integrated Style */}
      <div className="p-8 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none">NAR</h1>
            <span className="text-[8px] font-bold text-primary capitalize tracking-[0.4em] mt-1">National academic registry</span>
          </div>
        </Link>
      </div>

      {/* Navigation Sub-header */}
      <div className="px-8 pt-8 pb-2">
        <p className="text-[9px] font-mono text-muted-foreground/50 capitalize tracking-[0.3em]">System Modules</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-border space-y-4">
        {/* Secondary Nav */}
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkCls}>
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
            </NavLink>
          ))}
        </div>

        {/* User Identity Module */}
        <div className="p-4 border border-border bg-muted/30 rounded relative overflow-hidden group">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-black text-xs font-mono">
              {getInitials(student)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-black text-foreground truncate capitalize tracking-tight">
                {student?.firstName} {student?.lastName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-bold text-muted-foreground capitalize tracking-widest">Authenticated</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
             <Shield size={40} />
          </div>
        </div>
        
        {/* System Version */}
        <div className="flex items-center justify-between px-2 pt-2 opacity-30">
           <span className="text-[9px] font-mono capitalize tracking-widest">Node: v2.4.0</span>
           <Activity size={12} />
        </div>
      </div>
    </aside>
  )
}
