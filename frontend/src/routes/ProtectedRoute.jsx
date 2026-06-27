import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const { user, token } = useSelector((s) => s.auth)
  if (!user || !token) return <Navigate to="/login" replace />
  return <Outlet />
}
