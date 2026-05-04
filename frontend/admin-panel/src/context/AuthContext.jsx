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

  const logout = async () => {
    try {
      await api.post("/api/users/logout")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      localStorage.removeItem("accessToken")
      setUser(null)
      setIsAuthenticated(false)
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
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
