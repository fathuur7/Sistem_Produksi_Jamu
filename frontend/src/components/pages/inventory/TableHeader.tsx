interface TableHeaderProps {
  onAddNew: () => void;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export function TableHeader({ onAddNew, totalItems, startIndex, endIndex }: TableHeaderProps) {
  const safeEndIndex = Math.min(endIndex, totalItems);

  return (
    <div className="flex flex-col gap-4 border-b border-surface-container bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,228,0.88))] px-5 py-5 sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/55">
          Direktori Stok
        </p>
        <h3 className="mt-2 font-headline text-2xl font-bold text-primary">
          {totalItems} bahan siap dipantau
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Menampilkan {startIndex + 1}-{safeEndIndex} dari keseluruhan inventaris aktif.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddNew}
        className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-on-primary shadow-[0_22px_40px_-24px_rgba(0,53,39,0.6)] transition-transform hover:-translate-y-0.5"
        aria-label="Tambah bahan baku baru"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        Tambah Bahan
      </button>
    </div>
  );
}
