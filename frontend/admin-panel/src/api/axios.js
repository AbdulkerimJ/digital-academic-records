import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  })
  
  failedQueue = [];
}

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Ignore 401s from login or refresh endpoints to avoid loops/reloads
    const isAuthRoute = originalRequest.url.includes("/login") || originalRequest.url.includes("/refresh")

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        const res = await axios.post(
          `${baseURL}/api/users/refresh`,
          {},
          { withCredentials: true }
        )

        if (res.data.success || res.data.status === "success") {
          const { accessToken } = res.data.data
          localStorage.setItem("accessToken", accessToken)
          
          processQueue(null, accessToken);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false;
      }
    }

    // Extract backend error message if available
    const backendMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
    const enhancedError = new Error(backendMessage)
    enhancedError.response = error.response // Keep response for status checking if needed
    
    return Promise.reject(enhancedError)
  }
)

export default api
