import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QrCode, ShieldCheck, Search, GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [token, setToken] = useState('')

  const handleVerify = (e) => {
    e.preventDefault()
    if (!token.trim()) return
    navigate(`/verify/${token.trim()}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">DAR Public</span>
          </div>
          <div>
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/80 rounded-lg transition-colors border border-border">
                Student Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl w-full space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-2 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
              Verify Academic Records instantly.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Employers and institutions can verify digital degrees and standardized exams submitted by students by simply entering the secure QR token below.
            </p>
          </div>

          <form onSubmit={handleVerify} className="max-w-md mx-auto pt-4 relative">
            <div className="relative flex items-center shadow-sm rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/20 transition-all border border-border bg-card">
              <div className="pl-4 pr-2 text-muted-foreground">
                <QrCode size={20} />
              </div>
              <input
                type="text"
                placeholder="Enter 16-character verification token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 bg-transparent py-4 text-foreground placeholder:text-muted-foreground outline-none text-sm md:text-base font-mono"
                required
                minLength={10}
              />
              <div className="pr-2">
                <button
                  type="submit"
                  disabled={!token.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Search size={16} /> Verify
                </button>
              </div>
            </div>
          </form>

          {!isAuthenticated && (
            <div className="pt-12 mt-12 border-t border-border">
              <p className="text-muted-foreground mb-4">Are you a student looking to view your records?</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                Login with Fayda ID <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
