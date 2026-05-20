/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import AuthProvider from '../components/AuthProvider';

// ── Public pages ──────────────────────────────────────────────
const Login          = lazy(() => import('../pages/Login'));
const RequestAccess  = lazy(() => import('../pages/RequestAccess'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const NotFound       = lazy(() => import('../pages/NotFound'));
const Forbidden      = lazy(() => import('../pages/Forbidden'));

// ── Shared Protected pages ────────────────────────────────────
const SearchResults  = lazy(() => import('../pages/SearchResults'));
const Notifications  = lazy(() => import('../pages/Notifications'));

// ── Staff pages ───────────────────────────────────────────────
const DashboardStaff = lazy(() => import('../pages/staff/Dashboard'));
const Production     = lazy(() => import('../pages/staff/Production'));
const SettingsStaff  = lazy(() => import('../pages/staff/Settings'));

// ── Admin pages ───────────────────────────────────────────────
const DashboardAdmin = lazy(() => import('../pages/admin/Dashboard'));
const Inventory      = lazy(() => import('../pages/admin/Inventory'));
const TambahBahan = lazy(() => import('../pages/admin/TambahBahan'));
const Recipes        = lazy(() => import('../pages/admin/Recipes'));
const RecipeDetail   = lazy(() => import('../pages/admin/RecipeDetail'));
const Supplier       = lazy(() => import('../pages/admin/Supplier'));
const Reports        = lazy(() => import('../pages/admin/Reports'));
const Users          = lazy(() => import('../pages/admin/Users'));
const Cities         = lazy(() => import('../pages/admin/Cities'));
const SettingsAdmin  = lazy(() => import('../pages/admin/Settings'));

// ── Loading spinner ───────────────────────────────────────────
const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-container-highest border-t-primary" />
          <p className="text-sm font-medium text-outline animate-pulse">Memuat...</p>
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

// ── Protected shorthand ───────────────────────────────────────
const Protected = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ('admin' | 'staff')[] }) => (
  <LazyLoad>
    <PrivateRoute allowedRoles={allowedRoles}>
      {children}
    </PrivateRoute>
  </LazyLoad>
);

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    element: <RootLayout />, 
    children: [
      { path: '/', element: <LazyLoad><Login /></LazyLoad> },
      { path: '/request-access', element: <LazyLoad><RequestAccess /></LazyLoad> },
      { path: '/forgot-password', element: <LazyLoad><ForgotPassword /></LazyLoad> },
      { path: '/unauthorized', element: <LazyLoad><Forbidden /></LazyLoad> },
      { path: '/search', element: <Protected><SearchResults /></Protected> },
      { path: '/notifications', element: <Protected><Notifications /></Protected> },

      // ── Murni Staff ──
      { path: '/staff/dashboard', element: <Protected allowedRoles={['staff']}><DashboardStaff /></Protected> },
      { path: '/staff/production', element: <Protected allowedRoles={['staff']}><Production /></Protected> },
      { path: '/staff/settings', element: <Protected allowedRoles={['staff']}><SettingsStaff /></Protected> },

      // ── Murni Admin ──
      { path: '/admin/dashboard', element: <Protected allowedRoles={['admin']}><DashboardAdmin /></Protected> },
      { path: '/admin/inventory', element: <Protected allowedRoles={['admin']}><Inventory /></Protected> },
      { path: '/admin/inventory/tambah-bahan', element: <Protected allowedRoles={['admin']}><TambahBahan /></Protected> },
      { path: '/admin/recipes', element: <Protected allowedRoles={['admin']}><Recipes /></Protected> },
      { path: '/admin/recipes/:id', element: <Protected allowedRoles={['admin']}><RecipeDetail /></Protected> },
      { path: '/admin/supplier', element: <Protected allowedRoles={['admin']}><Supplier /></Protected> },
      { path: '/admin/reports', element: <Protected allowedRoles={['admin']}><Reports /></Protected> },
      { path: '/admin/users', element: <Protected allowedRoles={['admin']}><Users /></Protected> },
      { path: '/admin/cities', element: <Protected allowedRoles={['admin']}><Cities /></Protected> },
      { path: '/admin/settings', element: <Protected allowedRoles={['admin']}><SettingsAdmin /></Protected> },

      { path: '*', element: <LazyLoad><NotFound /></LazyLoad> },
    ],
  },
]);

export default router;