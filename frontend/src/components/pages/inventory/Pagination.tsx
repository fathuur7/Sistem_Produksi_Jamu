interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPrevious,
  onNext,
  onGoToPage,
}: PaginationProps) {
  const visibleEnd = Math.min(endIndex, totalItems);

  return (
    <div className="flex flex-col gap-4 border-t border-surface-container bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,228,0.85))] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      {/* Stats */}
      <div className="text-sm font-medium text-on-surface/50">
        Menampilkan <span className="font-bold text-on-surface">{startIndex + 1}-{visibleEnd}</span> dari{' '}
        <span className="font-bold text-on-surface">{totalItems}</span> bahan baku
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface/40 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onGoToPage(pageNum)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors ${
              currentPage === pageNum
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface/60 hover:bg-surface-container-high'
            }`}
            aria-label={`Halaman ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface/40 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
