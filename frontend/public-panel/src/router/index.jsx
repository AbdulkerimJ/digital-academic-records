import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import RecordsPage from '../pages/records/RecordsPage'
import QRCodesPage from '../pages/qr/QRCodesPage'
import RequestsPage from '../pages/requests/RequestsPage'
import ProfilePage from '../pages/profile/ProfilePage'
import RecordDetailPage from '../pages/records/RecordDetailPage'
import Spinner from '../components/ui/Spinner'

import LandingPage from '../pages/landing/LandingPage'
import VerifyPage from '../pages/verify/VerifyPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Verifying session...</p>
      </div>
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/" replace />

  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Verifying session...</p>
      </div>
    </div>
  )
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return children
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/verify/:token',
    element: <VerifyPage />,
  },
  {
    path: '/verify/:token/:type/:id',
    element: <RecordDetailPage />,
  },

  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'records',
        element: <RecordsPage />,
      },
      {
        path: 'records/:type/:id',
        element: <RecordDetailPage />,
      },
      {
        path: 'qr-codes',
        element: <QRCodesPage />,
      },
      {
        path: 'requests',
        element: <RequestsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      }
    ],
  },
])

export default router
