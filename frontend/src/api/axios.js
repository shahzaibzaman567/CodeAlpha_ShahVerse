import axios from 'axios'

// In production (Vercel), frontend and backend are on same domain
// So /api routes are handled by backend serverless function
// In development, proxy via vite.config.js to localhost:5000
const getBaseURL = () => {
  const env = import.meta.env.VITE_API_URL
  if (env) return env
  // Fallback: same origin /api
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`
  }
  return 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shahverse_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

// Handle responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shahverse_user')
      localStorage.removeItem('shahverse_token')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
