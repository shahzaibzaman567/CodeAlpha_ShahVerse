import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth)
  if (!user || !token) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
