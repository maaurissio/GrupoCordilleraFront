import { Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'

export function ProtectedRoute({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean
  children: ReactElement
}) {
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}
