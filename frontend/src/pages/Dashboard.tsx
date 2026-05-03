import { Helmet } from 'react-helmet-async';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import DashboardMetrics from '../components/pages/dashboard/DashboardMetrics';
import ActiveCycle from '../components/pages/dashboard/ActiveCycle';
import SpiceStock from '../components/pages/dashboard/SpiceStock';
import ProductionQueue from '../components/pages/dashboard/ProductionQueue';

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Penjamu Handal</title>
        <meta name="description" content="Dashboard Penjamu Handal — ringkasan data jamu, rempah, dan khasiat." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body">
        <Sidebar />

        <div className="ml-72 min-h-screen flex flex-col">
          <TopBar />

          <main className="p-8 space-y-10 max-w-[1400px]">
            <DashboardMetrics />
            <ActiveCycle />

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <SpiceStock />
              <ProductionQueue />
            </div>
          </main>
        </div>

        {/* FAB */}
        <button className="fixed bottom-10 right-10 bg-secondary text-on-secondary w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        </button>
      </div>
    </>
  );
}
