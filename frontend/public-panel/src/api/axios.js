import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach student access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentAccessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
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

// Silent refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthRoute =
      original.url.includes('/login') ||
      original.url.includes('/verify') ||
      original.url.includes('/refresh')

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch(err => {
          return Promise.reject(err);
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${baseURL}/api/students/refresh`,
          {},
          { withCredentials: true }
        )
        if (res.data.success || res.data.status === 'success') {
          const { accessToken } = res.data.data
          localStorage.setItem('studentAccessToken', accessToken)
          processQueue(null, accessToken)
          original.headers.Authorization = `Bearer ${accessToken}`
          return api(original)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('studentAccessToken')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // Extract backend error message
    const backendMessage = error.response?.data?.message || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(backendMessage))
  }
)

export default api
