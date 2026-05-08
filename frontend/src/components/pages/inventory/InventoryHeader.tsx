interface InventoryHeaderProps {
  isFilterOpen: boolean;
  categories: string[];
  filterCategory: string;
  filterStatus: string;
  onToggleFilter: () => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onResetFilters: () => void;
}

function InventoryHeader({
  isFilterOpen,
  categories,
  filterCategory,
  filterStatus,
  onToggleFilter,
  onCategoryChange,
  onStatusChange,
  onResetFilters,
}: InventoryHeaderProps) {
  const activeFilterCount = Number(filterCategory !== 'all') + Number(filterStatus !== 'all');
  const categoryLabel = filterCategory === 'all' ? `${categories.length} kategori tersedia` : filterCategory;
  const statusLabel = filterStatus === 'all' ? 'Semua status' : filterStatus;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,244,228,0.94))] p-6 shadow-[0_24px_60px_-46px_rgba(28,28,19,0.35)] backdrop-blur-sm sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px] xl:items-start">
        <div className="max-w-3xl">
          <nav className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-on-surface/40">
            <span>Apoteker</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary">Inventaris</span>
          </nav>
          <h2 className="font-headline text-[clamp(2.5rem,5vw,4.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-primary">
            Bahan Baku Esensial
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-on-surface/60 md:text-lg">
            Kelola sumber kehidupan produksi jamu dengan panel stok yang lebih tenang, cepat dipindai, dan siap dipakai untuk keputusan restock harian.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center rounded-2xl bg-surface-container-low px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant/70 shadow-inner">
              {categoryLabel}
            </span>
            <span className="inline-flex items-center rounded-2xl bg-surface-container-low px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant/70 shadow-inner">
              {statusLabel}
            </span>
            <span className="inline-flex items-center rounded-2xl bg-tertiary-fixed/16 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-on-tertiary-fixed-variant">
              {activeFilterCount === 0 ? 'Tanpa filter aktif' : `${activeFilterCount} filter aktif`}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:max-w-[310px] xl:justify-self-end">
          <div className="rounded-[1.5rem] bg-surface-container-low px-4 py-4 shadow-inner">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/55">Panel Navigasi</p>
            <p className="mt-2 font-headline text-xl font-bold text-primary">
              {activeFilterCount === 0 ? 'Lihat semua bahan' : 'Tampilan tersaring'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant/72">
              Buka filter untuk menyorot kategori bahan atau status stok yang butuh perhatian tim gudang.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleFilter}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold shadow-sm transition-colors ${
              isFilterOpen
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            {isFilterOpen ? 'Tutup Filter' : 'Filter Inventaris'}
          </button>

          {isFilterOpen && (
            <div className="w-full rounded-[1.6rem] border border-outline-variant/18 bg-surface p-4 shadow-lg">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface/50">
                    Kategori
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface/50">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(event) => onStatusChange(event.target.value)}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Sehat">Sehat</option>
                    <option value="Peringatan">Peringatan</option>
                    <option value="Kritis">Kritis</option>
                    <option value="Kosong">Kosong</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-highest"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InventoryHeader;
