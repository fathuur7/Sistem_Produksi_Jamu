import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import InventoryTambahBahan from '../components/pages/inventory/InventoryTambahBahan';

function TambahBahan() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect ke halaman inventory setelah 2 detik
    setTimeout(() => {
      navigate('/inventory');
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Tambah Bahan | Penjamu Handal</title>
        <meta name="description" content="Tambahkan bahan baku baru ke inventaris Penjamu Handal." />
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body flex">
        <Sidebar />

        <div className="flex-1 lg:ml-72 flex flex-col w-full">
          <TopBar />

          <main className="p-4 sm:p-8 space-y-6 w-full pb-20">
            {/* Header */}
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-on-surface/40 mb-2 tracking-widest uppercase">
                <span>Apoteker</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span>Inventaris</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-secondary">Tambah Bahan</span>
              </nav>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary font-headline">
                Tambah Bahan Baru
              </h2>
              <p className="mt-2 text-on-surface/60 font-medium max-w-md text-sm md:text-base">
                Masukkan detail bahan baku untuk menambahkannya ke sistem inventaris.
              </p>
            </div>

            {/* Form Card Centered */}
            <div className="flex justify-center">
              <div className="w-full max-w-150 space-y-4">
                <div className="bg-surface-container-low rounded-3xl p-1 overflow-hidden shadow-sm">
                  <div className="bg-surface-container-lowest rounded-[1.4rem] p-6 sm:p-8">
                    <InventoryTambahBahan onSuccess={handleSuccess} />
                  </div>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => navigate('/inventory')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali ke Inventaris
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default TambahBahan;
