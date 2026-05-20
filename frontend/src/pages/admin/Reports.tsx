import { Helmet } from 'react-helmet-async';
import AppShell from '../../components/layout/AppShell';
import ReportsHeader from '../../components/pages/reports/ReportsHeader';
import ReportsMetrics from '../../components/pages/reports/ReportsMetrics';
import ReportsVolumeChart from '../../components/pages/reports/ReportsVolumeChart';
import ReportsStock from '../../components/pages/reports/ReportsStock';
import ReportsTable from '../../components/pages/reports/ReportsTable';

export default function Reports() {
  return (
    <>
      <Helmet>
        <title>Laporan Analitik | Penjamu Handal</title>
        <meta name="description" content="Laporan analitik produksi dan keseimbangan efisiensi bahan Penjamu Handal." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-6 md:p-10 max-w-[1400px] w-full mx-auto space-y-10 pb-24">
          <ReportsHeader />
          <ReportsMetrics />

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <ReportsVolumeChart />
            <ReportsStock />
          </section>

          <ReportsTable />
        </main>
      </AppShell>
    </>
  );
}
