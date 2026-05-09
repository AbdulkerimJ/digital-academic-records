import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext({
  student: null,
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [student, setStudent]           = useState(null)
  const [isAuthenticated, setIsAuth]    = useState(false)
  const [isLoading, setIsLoading]       = useState(true)

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('studentAccessToken')
      if (!token) { setIsLoading(false); return }

      try {
        const res = await api.get('/api/students/me')
        if (res.data.success || res.data.status === 'success') {
          setStudent(res.data.data.student)
          setIsAuth(true)
        }
      } catch {
        localStorage.removeItem('studentAccessToken')
      } finally {
        setIsLoading(false)
      }
    }
    check()
  }, [])

  // Cross-tab logout sync
  useEffect(() => {
    const sync = (e) => {
      if (e.key === 'studentAccessToken' && !e.newValue) {
        setStudent(null)
        setIsAuth(false)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const logout = async () => {
    localStorage.removeItem('studentAccessToken')
    setStudent(null)
    setIsAuth(false)
    try {
      api.post('/api/students/logout').catch(() => {})
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ student, isAuthenticated, isLoading, logout, setStudent, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
