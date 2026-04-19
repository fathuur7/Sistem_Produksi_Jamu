import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Helper function untuk determine status berdasarkan stok
function getStatus(stock: number, threshold: number) {
  if (stock === 0) return 'Kosong';
  if (stock <= threshold) return 'Kritis';
  if (stock <= threshold * 1.5) return 'Peringatan';
  return 'Sehat';
}

// Helper function untuk get status styling
function getStatusStyles(status: string) {
  const styles: Record<string, any> = {
    'Sehat': {
      bgColor: 'bg-tertiary-fixed',
      iconColor: 'text-on-tertiary-fixed-variant',
      statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      statusDot: 'bg-on-tertiary-container',
      barFill: 'bg-on-tertiary-container',
      icon: 'eco',
    },
    'Peringatan': {
      bgColor: 'bg-secondary-fixed',
      iconColor: 'text-on-secondary-fixed-variant',
      statusClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
      statusDot: 'bg-secondary-container',
      barFill: 'bg-secondary-container',
      icon: 'spa',
    },
    'Kritis': {
      bgColor: 'bg-error-container',
      iconColor: 'text-on-error-container',
      statusClass: 'bg-error-container text-on-error-container',
      statusDot: 'bg-error',
      barFill: 'bg-error',
      icon: 'fireplace',
    },
    'Kosong': {
      bgColor: 'bg-outline',
      iconColor: 'text-on-surface/50',
      statusClass: 'bg-outline text-on-surface/70',
      statusDot: 'bg-outline',
      barFill: 'bg-outline',
      icon: 'delete_sweep',
    },
  };
  return styles[status] || styles['Sehat'];
}

// Fetch bahan data dari API
async function fetchBahanData() {
  const response = await fetch('/api/bahan');
  if (!response.ok) {
    throw new Error('Gagal mengambil data bahan');
  }
  const data = await response.json();
  
  // Format data dari API agar sesuai dengan table
  const bahanList = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];
  
  return bahanList.map((item: any, index: number) => {
    const status = getStatus(item.stokAwal || 0, item.threshold || 10);
    const statusStyles = getStatusStyles(status);
    
    return {
      id: item.id || index + 1,
      name: item.nama || 'Unknown',
      variety: `${item.kategori} - ${item.satuan}` || '',
      category: item.kategori || 'Umum',
      stock: item.stokAwal || 0,
      threshold: item.threshold || 10,
      unit: item.satuan || 'kg',
      status: status,
      icon: statusStyles.icon,
      bgColor: statusStyles.bgColor,
      iconColor: statusStyles.iconColor,
      statusClass: statusStyles.statusClass,
      statusDot: statusStyles.statusDot,
      barFill: statusStyles.barFill,
      barPercentage: `${Math.min(100, ((item.stokAwal || 0) / (item.threshold || 10)) * 100)}%`,
    };
  });
}

const ITEMS_PER_PAGE = 5; // Tampilkan 5 items per halaman

function InventoryTable() {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch data dari API
  const { data: bahanData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bahan-inventory'],
    queryFn: fetchBahanData,
  });

  // Refetch data saat component mount dan setup auto-refetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Hitung pagination
  const totalItems = bahanData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = bahanData.slice(startIndex, endIndex);

  // Handler pagination
  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="bg-surface-container-low rounded-3xl p-8 overflow-hidden shadow-sm flex items-center justify-center min-h-75">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface/60 font-medium">Memuat data bahan...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-error-container text-on-error-container p-6 rounded-xl flex items-start gap-4 mb-6">
          <span className="material-symbols-outlined shrink-0 text-2xl">error</span>
          <div>
            <p className="font-bold">Gagal Memuat Data</p>
            <p className="text-sm opacity-90">{error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data bahan'}</p>
            <button 
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-on-error-container text-error-container rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && bahanData.length === 0 && (
        <div className="bg-surface-container-low rounded-3xl p-12 overflow-hidden shadow-sm flex items-center justify-center min-h-100">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-on-surface/40">inbox</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">Belum Ada Bahan</h3>
            <p className="text-on-surface/60 max-w-sm">Mulai tambahkan bahan baku baru untuk mengelola inventaris Anda</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && bahanData.length > 0 && (
        <>
          <div className="bg-surface-container-low rounded-3xl p-1 overflow-hidden shadow-sm">
            <div className="bg-surface-container-lowest rounded-[1.4rem] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-surface-container-high/30">
                  <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">Bahan Baku</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">Kategori</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">Stok Saat Ini</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">Batas Minimum</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40 text-center">Status</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/30">
                {currentPageData.map((item: any) => (
                <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${item.bgColor} rounded-2xl flex items-center justify-center ${item.iconColor} shadow-inner`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-lg">{item.name}</p>
                        <p className="text-xs text-on-surface/50">{item.variety}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-on-surface/70 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/10">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-xl font-bold ${item.status === 'Kritis' ? 'text-error' : 'text-primary'}`}>
                        {item.stock} {item.unit}
                      </span>
                      <div className="w-24 h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden shadow-inner">
                        <div className={`h-full ${item.barFill} rounded-full`} style={{ width: item.barPercentage }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-on-surface/40">
                      {item.threshold.toFixed(1)} {item.unit}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 ${item.statusClass} rounded-full text-xs font-bold uppercase tracking-wider`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot} ${item.status === 'Kritis' ? 'animate-pulse' : ''}`}></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-primary hover:bg-primary-fixed/30 rounded-lg transition-colors focus:opacity-100" title="Edit Data">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className={`p-2 rounded-lg transition-colors focus:opacity-100 ${item.status === 'Kritis' ? 'text-secondary bg-secondary-fixed/30 hover:bg-secondary-fixed/50' : 'text-secondary hover:bg-secondary-fixed/20'}`} title="Isi Ulang Stok (Restock)">
                        <span className="material-symbols-outlined text-[20px]">{item.status === 'Kritis' ? 'autorenew' : 'inventory_2'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Footer Pagination/Stats */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
        <div className="text-sm font-medium text-on-surface/40">
          Menampilkan <span className="text-on-surface font-bold">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> dari <span className="text-on-surface font-bold">{totalItems}</span> bahan baku
        </div>
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button 
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface/40 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors ${
                currentPage === pageNum
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface/60 hover:bg-surface-container-high'
              }`}>
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button 
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface/40 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          </div>
        </div>
        </>
      )}
    </>
  );
}

export default InventoryTable;
