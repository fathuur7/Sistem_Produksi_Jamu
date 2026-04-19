import { useNavigate } from 'react-router-dom';

function InventoryHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-6 mb-12">
      <div>
        <nav className="flex items-center gap-2 text-xs font-bold text-on-surface/40 mb-2 tracking-widest uppercase">
          <span>Apoteker</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-secondary">Inventaris</span>
        </nav>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary font-headline">Bahan Baku Esensial</h2>
        <p className="mt-2 text-on-surface/60 font-medium max-w-md text-sm md:text-base">
          Kelola sumber kehidupan produksi Jamu. Tingkat stok real-time untuk akar, daun, dan botani.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 w-full sm:w-auto">
        <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-3 bg-surface-container-high text-primary font-bold rounded-xl hover:bg-surface-container-highest transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
          Filter
        </button>
        <button 
          onClick={() => navigate('/inventory/tambah-bahan')}
          className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-3 apothecary-gradient text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Bahan
        </button>
      </div>
    </div>
  );
}

export default InventoryHeader;
