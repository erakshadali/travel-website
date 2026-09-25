import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { AdminAuthProvider, useAdminAuth } from './auth'
import { useNoIndex } from './hooks'
import BookingDetail from './pages/BookingDetail'
import Dashboard from './pages/Dashboard'
import { MessagesPage, SubscribersPage, TripPlansPage } from './pages/Inbox'
import Login from './pages/Login'

// Every admin page except the login screen: no token means straight to /admin/login.
function RequireAdmin() {
  const { token } = useAdminAuth()
  const location = useLocation()
  if (!token) return <Navigate to="/admin/login" replace state={{ from: location }} />
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

// Rendered by App.jsx for every /admin URL, instead of the public site's navbar, footer and extras.
export default function AdminApp() {
  useNoIndex()
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/bookings/:id" element={<BookingDetail />} />
          <Route path="/admin/trip-plans" element={<TripPlansPage />} />
          <Route path="/admin/messages" element={<MessagesPage />} />
          <Route path="/admin/subscribers" element={<SubscribersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
