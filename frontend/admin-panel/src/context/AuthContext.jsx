import { createContext, useContext, useState, useEffect } from "react"
import api from "../api/axios"

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get("/api/users/me")
        if (response.data.success || response.data.status === "success") {
          setUser(response.data.data.user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("accessToken")
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Synchronize auth state across tabs
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === "accessToken" && !e.newValue) {
        setUser(null)
        setIsAuthenticated(false)
        // Only redirect if we're not already on the login page to avoid loops
        if (window.location.pathname !== "/login" && window.location.pathname !== "/activate-account") {
          window.location.href = "/login"
        }
      }
      
      // Optionally handle login in another tab
      if (e.key === "accessToken" && e.newValue) {
        // Just reload to get the fresh state from the new token
        window.location.reload()
      }
    }

    window.addEventListener("storage", syncLogout)
    return () => window.removeEventListener("storage", syncLogout)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/users/login", { email, password })
      if (response.data.success || response.data.status === "success") {
        const { accessToken, user } = response.data.data
        localStorage.setItem("accessToken", accessToken)

        setUser(user)
        setIsAuthenticated(true)
        return response.data
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const activate = async (token, password) => {
    try {
      const response = await api.post("/api/users/activate-invite", { token, password })
      if (response.data.success || response.data.status === "success") {
        const { accessToken, user } = response.data.data
        localStorage.setItem("accessToken", accessToken)

        setUser(user)
        setIsAuthenticated(true)
        return response.data
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const logout = async () => {
    // Clear local state immediately for instant feedback
    localStorage.removeItem("accessToken")
    setUser(null)
    setIsAuthenticated(false)
    
    // Perform server-side logout in the background
    try {
      api.post("/api/users/logout").catch(err => console.error("Background logout failed:", err))
    } finally {
      // Immediate redirect
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    activate,
    logout,
  }
  
  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
