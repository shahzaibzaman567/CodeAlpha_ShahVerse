import axios from 'axios'

// Development: proxy through vite → localhost:5000
// Production (Vercel): frontend + backend same domain → /api works directly
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shahverse_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shahverse_user')
      localStorage.removeItem('shahverse_token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
