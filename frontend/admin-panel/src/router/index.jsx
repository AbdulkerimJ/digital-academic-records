import { createBrowserRouter, Navigate } from "react-router-dom"
import LoginPage from "../pages/auth/LoginPage"
import DashboardPage from "../pages/dashboard/DashboardPage"
import UsersPage from "../pages/users/UsersPage"
import InstitutionsPage from "../pages/institutions/InstitutionsPage"
import StudentsPage from "../pages/students/StudentsPage"
import DegreesPage from "../pages/degrees/DegreesPage"
import ExamsPage from "../pages/exams/ExamsPage"
import CorrectionsPage from "../pages/corrections/CorrectionsPage"
import GlobalErrorPage from "../pages/error/GlobalErrorPage"
import AppShell from "../components/layout/AppShell"
import { useAuth } from "../context/AuthContext"

import PageLoader from "../components/common/PageLoader"

const ProtectedRoute = ({ children, roles, institutionTypes }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <PageLoader message="Verifying session..." className="h-screen" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  if (roles && !roles.includes(user?.roleName)) {
    return <Navigate to="/" replace />
  }

  if (user?.roleName === "REGISTRAR" && institutionTypes && !institutionTypes.includes(user?.institutionType)) {
    return <Navigate to="/" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <PageLoader message="Verifying session..." className="h-screen" />
  if (isAuthenticated) return <Navigate to="/" replace />

  return children
}

const router = createBrowserRouter([
  {
    path: "/login",
    errorElement: <GlobalErrorPage />,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    errorElement: <GlobalErrorPage />,
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
        path: "users",
        element: (
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institutions",
        element: (
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <InstitutionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "students",
        element: <StudentsPage />,
      },
      {
        path: "degrees",
        element: (
          <ProtectedRoute institutionTypes={["COLLEGE"]}>
            <DegreesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "exams",
        element: (
          <ProtectedRoute institutionTypes={["EXAM_BOARD"]}>
            <ExamsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "corrections",
        element: <CorrectionsPage />,
      },
    ],
  },
])

export default router
