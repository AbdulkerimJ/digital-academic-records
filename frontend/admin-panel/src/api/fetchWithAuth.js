const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

/**
 * A wrapper around native fetch that handles automatic token refresh.
 * Use this for streaming responses (like bulk uploads) where axios interceptors cannot be used.
 */
export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken")
  
  // Prepare headers
  const headers = {
    ...options.headers,
    "Authorization": token ? `Bearer ${token}` : undefined
  }

  // First attempt
  let response = await fetch(url, { ...options, headers })

  // If unauthorized, attempt to refresh the token
  if (response.status === 401) {
    try {
      const refreshRes = await fetch(`${baseURL}/api/users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include" // Crucial to send/receive cookies
      })
      
      const refreshData = await refreshRes.json()
      
      if (refreshData.success || refreshData.status === "success") {
        const newToken = refreshData.data.accessToken
        localStorage.setItem("accessToken", newToken)
        
        // Update authorization header and retry the original request
        const retryHeaders = {
          ...headers,
          "Authorization": `Bearer ${newToken}`
        }
        
        response = await fetch(url, { ...options, headers: retryHeaders })
      } else {
        // Refresh failed (e.g., refresh token expired)
        handleAuthFailure()
      }
    } catch (err) {
      // Network error or other failure during refresh
      handleAuthFailure()
    }
  }

  return response
}

const handleAuthFailure = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("user")
  // Only redirect if we're not already on the login page to avoid loops
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login"
  }
}
