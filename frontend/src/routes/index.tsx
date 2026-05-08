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

// ── Protected pages ───────────────────────────────────────────
const Dashboard      = lazy(() => import('../pages/Dashboard'));
const Inventory      = lazy(() => import('../pages/Inventory'));
const TambahBahan    = lazy(() => import('../pages/TambahBahan'));
const Production     = lazy(() => import('../pages/Production'));
const Recipes        = lazy(() => import('../pages/Recipes'));
const RecipeDetail   = lazy(() => import('../pages/RecipeDetail'));
const Supplier       = lazy(() => import('../pages/Supplier'));
const Reports        = lazy(() => import('../pages/Reports'));
const Settings       = lazy(() => import('../pages/Settings'));
const SearchResults  = lazy(() => import('../pages/SearchResults'));
const Notifications  = lazy(() => import('../pages/Notifications'));
const Users          = lazy(() => import('../pages/Users'));
const Cities         = lazy(() => import('../pages/Cities'));
// const Benefits       = lazy(() => import('../pages/Benefits'));

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
const Protected = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'supervisor' | 'staff')[];
}) => (
  <LazyLoad>
    <PrivateRoute allowedRoles={allowedRoles}>
      {children}
    </PrivateRoute>
  </LazyLoad>
);

// ── Root layout: AuthProvider membungkus semua route ─────────
// fetchMe() dipanggil sekali saat app mount di sini.
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
    element: <RootLayout />, // semua route inherit dari sini
    children: [
      // ── Public routes ──────────────────────────────────────
      {
        path: '/',
        element: <LazyLoad><Login /></LazyLoad>,
      },
      {
        path: '/request-access',
        element: <LazyLoad><RequestAccess /></LazyLoad>,
      },
      {
        path: '/forgot-password',
        element: <LazyLoad><ForgotPassword /></LazyLoad>,
      },
      {
        path: '/unauthorized',
        element: <LazyLoad><Forbidden /></LazyLoad>,
      },

      // ── Protected routes ────────────────────────────────────
      {
        path: '/dashboard',
        element: <Protected><Dashboard /></Protected>,
      },
      {
        path: '/inventory',
        element: <Protected><Inventory /></Protected>,
      },
      {
        path: '/inventory/tambah-bahan',
        element: <Protected><TambahBahan /></Protected>,
      },
      {
        path: '/production',
        element: <Protected><Production /></Protected>,
      },
      {
        path: '/recipes',
        element: <Protected><Recipes /></Protected>,
      },
      {
        path: '/recipes/:id',
        element: <Protected><RecipeDetail /></Protected>,
      },
      {
        path: '/supplier',
        element: <Protected><Supplier /></Protected>,
      },
      {
        path: '/reports',
        element: <Protected><Reports /></Protected>,
      },
      {
        path: '/settings',
        element: <Protected><Settings /></Protected>,
      },
      {
        path: '/search',
        element: <Protected><SearchResults /></Protected>,
      },
      {
        path: '/notifications',
        element: <Protected><Notifications /></Protected>,
      },
      {
        path: '/cities',
        element: <Protected><Cities /></Protected>,
      },
      // {
      //   path: '/benefits',
      //   element: <Protected><Benefits /></Protected>,
      // },

      // ── Admin-only ──────────────────────────────────────────
      {
        path: '/users',
        element: (
          <Protected allowedRoles={['admin']}>
            <Users />
          </Protected>
        ),
      },

      // ── 404 ────────────────────────────────────────────────
      {
        path: '*',
        element: <LazyLoad><NotFound /></LazyLoad>,
      },
    ],
  },
]);

export default router;