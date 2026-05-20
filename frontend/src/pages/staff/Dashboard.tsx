import { Helmet } from 'react-helmet-async';
import AppShell from '../../components/layout/AppShell';
import DashboardMetrics from '../../components/pages/dashboard/DashboardMetrics';
import ActiveCycle from '../../components/pages/dashboard/ActiveCycle';
import SpiceStock from '../../components/pages/dashboard/SpiceStock';
import ProductionQueue from '../../components/pages/dashboard/ProductionQueue';

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Penjamu Handal</title>
        <meta name="description" content="Konsol produksi Penjamu Handal — pantau batch aktif, stok rempah, dan antrian produksi secara real-time." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-8 space-y-10 max-w-[1400px] w-full">
          <DashboardMetrics />
          <ActiveCycle />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <SpiceStock />
            <ProductionQueue />
          </div>
        </main>

        {/* FAB */}
        <button className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 bg-secondary text-on-secondary w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
          <span className="material-symbols-outlined text-2xl sm:text-3xl group-hover:rotate-90 transition-transform">add</span>
        </button>
      </AppShell>
    </>
  );
}
