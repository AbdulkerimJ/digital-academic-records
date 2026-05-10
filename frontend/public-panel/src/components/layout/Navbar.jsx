import { Bell, Menu, Search, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Navbar({ onMenuToggle }) {
  const { student } = useAuth()

  return (
    <header className="h-20 border-b border-border bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-muted-foreground hover:text-primary md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/30 border border-border rounded text-muted-foreground group focus-within:border-primary/50 transition-all">
          <Search size={16} className="group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-48 lg:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
        </button>

        <Link to="/dashboard/profile" className="flex items-center gap-3 group">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
              {student?.firstName} {student?.lastName}
            </span>
            <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Verified Student</span>
          </div>
          <div className="w-10 h-10 bg-muted/50 border border-border group-hover:border-primary/50 flex items-center justify-center transition-all">
            <User size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </header>
  )
}
