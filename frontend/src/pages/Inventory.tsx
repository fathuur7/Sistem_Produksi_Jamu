import { Helmet } from 'react-helmet-async';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import InventoryHeader from '../components/pages/inventory/InventoryHeader';
import InventoryTable from '../components/pages/inventory/InventoryTable';
import InventoryBento from '../components/pages/inventory/InventoryBento';

export default function Inventory() {
  return (
    <>
      <Helmet>
        <title>Inventaris | Penjamu Handal</title>
        <meta name="description" content="Manajemen stok bahan baku esensial untuk produksi Jamu." />
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body flex">
        <Sidebar />

        <div className="flex-1 lg:ml-72 flex flex-col w-full">
          <TopBar />

          <main className="p-4 sm:p-8 space-y-6 max-w-350 w-full pb-20">
            <InventoryHeader />
            <InventoryTable />
            <InventoryBento />
          </main>
        </div>
      </div>
    </>
  );
}
