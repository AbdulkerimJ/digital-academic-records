import { Bell, Menu, Search, User, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

export default function Navbar({ onMenuToggle }) {
  const { student } = useAuth()
  const { theme, toggleTheme } = useTheme()

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
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-primary transition-all active:scale-90"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link to="/dashboard/profile" className="flex items-center gap-4 group">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-black text-foreground capitalize tracking-tight">
              {student?.firstName} {student?.lastName}
            </span>
            <span className="text-[9px] font-bold text-primary capitalize tracking-[0.2em]">Verified Student</span>
          </div>
          <div className="w-12 h-12 bg-muted/50 border border-border group-hover:border-primary/50 flex items-center justify-center transition-all">
            <User size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </header>
  )
}
