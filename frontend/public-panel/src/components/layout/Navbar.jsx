import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  GraduationCap, LayoutDashboard, FileText, QrCode,
  ClipboardList, Moon, Sun, LogOut, User, Menu, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/records',    label: 'Records',    icon: FileText },
  { to: '/qr-codes',   label: 'QR Codes',   icon: QrCode },
  { to: '/requests',   label: 'Requests',   icon: ClipboardList },
]

function getInitials(s) {
  if (!s) return 'ST'
  return `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase() || 'ST'
}

export default function Navbar() {
  const { student, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [dropdownOpen, setDropdown]   = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLinkCls = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive 
        ? 'bg-primary/10 text-primary' 
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`

  const mobileNavCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="flex items-center justify-between h-16 px-4 md:px-8 max-w-7xl mx-auto w-full gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <GraduationCap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-extrabold text-foreground leading-none tracking-tight">DAR Portal</span>
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5">Student Access</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkCls}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Avatar dropdown */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:ring-2 hover:ring-primary/30 transition-all ml-2"
              onClick={() => setDropdown((v) => !v)}
              aria-label="Open user menu"
              title={`${student?.firstName} ${student?.lastName}`}
            >
              {getInitials(student)}
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1 z-50 animate-fade-in-up">
                <div className="px-4 py-2.5">
                  <p className="text-sm font-bold text-foreground truncate">
                    {student?.firstName} {student?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {student?.nationalId}
                  </p>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="px-1.5">
                  <NavLink 
                    to="/profile" 
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setDropdown(false)}
                  >
                    <User size={16} className="text-muted-foreground" /> Profile
                  </NavLink>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="px-1.5">
                  <button 
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={logout}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground border border-border hover:bg-secondary transition-colors ml-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-1.5 animate-fade-in-up">
          <div className="mb-2 px-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {getInitials(student)}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{student?.firstName} {student?.lastName}</p>
              <p className="text-xs text-muted-foreground">{student?.nationalId}</p>
            </div>
          </div>
          <div className="h-px bg-border my-2 mx-2" />
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={mobileNavCls}
              onClick={() => setMenuOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <div className="h-px bg-border my-2 mx-2" />
          <NavLink 
            to="/profile" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <User size={18} className="text-muted-foreground" /> Profile
          </NavLink>
          <button 
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left" 
            onClick={logout}
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      )}
    </header>
  )
}
