/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// 1. Import komponen secara dinamis (Code Splitting) menggunakan React.lazy
const Login = lazy(() => import('../pages/Login'));
const RequestAccess = lazy(() => import('../pages/RequestAccess'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Forbidden = lazy(() => import('../pages/Forbidden'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Inventory = lazy(() => import('../pages/Inventory'));
const TambahBahan = lazy(() => import('../pages/TambahBahan'));
const Production = lazy(() => import('../pages/Production'));
const Recipes = lazy(() => import('../pages/Recipes'));
const Supplier = lazy(() => import('../pages/Supplier'));
const Reports = lazy(() => import('../pages/Reports'));
const Settings = lazy(() => import('../pages/Settings'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Users = lazy(() => import('../pages/Users'));
const RecipeDetail = lazy(() => import('../pages/RecipeDetail'));

// 2. Beri fallback (Loading Screen) saat file komponen sedang di-download oleh browser
const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
    </div>
  }>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LazyLoad>
        <Login />
      </LazyLoad>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <LazyLoad>
        <Dashboard />
      </LazyLoad>
    ),
  },
  {
    path: '/inventory',
    element: (
      <LazyLoad>
        <Inventory />
      </LazyLoad>
    ),
  },
  {
    path: '/inventory/tambah-bahan',
    element: (
      <LazyLoad>
        <TambahBahan />
      </LazyLoad>
    ),
  },
  {
    path: '/production',
    element: (
      <LazyLoad>
        <Production />
      </LazyLoad>
    ),
  },
  {
    path: '/recipes',
    element: (
      <LazyLoad>
        <Recipes />
      </LazyLoad>
    ),
  },
  {
    path: '/recipes/:id',
    element: (
      <LazyLoad>
        <RecipeDetail />
      </LazyLoad>
    ),
  },
  {
    path: '/supplier',
    element: (
      <LazyLoad>
        <Supplier />
      </LazyLoad>
    ),
  },
  {
    path: '/reports',
    element: (
      <LazyLoad>
        <Reports />
      </LazyLoad>
    ),
  },
  {
    path: '/settings',
    element: (
      <LazyLoad>
        <Settings />
      </LazyLoad>
    ),
  },
  {
    path: '/search',
    element: (
      <LazyLoad>
        <SearchResults />
      </LazyLoad>
    ),
  },
  {
    path: '/notifications',
    element: (
      <LazyLoad>
        <Notifications />
      </LazyLoad>
    ),
  },
  {
    path: '/users',
    element: (
      <LazyLoad>
        <Users />
      </LazyLoad>
    ),
  },
  {
    path: '/request-access',
    element: (
      <LazyLoad>
        <RequestAccess />
      </LazyLoad>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <LazyLoad>
        <ForgotPassword />
      </LazyLoad>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <LazyLoad>
        <Forbidden />
      </LazyLoad>
    ),
  },
  // Route penangkap 404 (harus diurutan paling bawah)
  {
    path: '*',
    element: (
      <LazyLoad>
        <NotFound />
      </LazyLoad>
    ),
  },
]);

export default router;
