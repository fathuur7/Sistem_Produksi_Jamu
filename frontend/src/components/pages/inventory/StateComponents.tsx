// ============================================
// State Components (Loading, Error, Empty)
// ============================================
export function LoadingState() {
  return (
    <div className="bg-surface-container-low rounded-3xl p-8 overflow-hidden shadow-sm flex items-center justify-center min-h-75">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface/60 font-medium">Memuat data bahan...</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-error-container text-on-error-container p-6 rounded-xl flex items-start gap-4 mb-6">
      <span className="material-symbols-outlined shrink-0 text-2xl">error</span>
      <div>
        <p className="font-bold">Gagal Memuat Data</p>
        <p className="text-sm opacity-90">
          {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data bahan'}
        </p>
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-on-error-container text-error-container rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          aria-label="Coba muat ulang data"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="bg-surface-container-low rounded-3xl p-12 overflow-hidden shadow-sm flex items-center justify-center min-h-100">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-surface/40">inbox</span>
        </div>
        <h3 className="text-xl font-bold text-on-surface">Belum Ada Bahan</h3>
        <p className="text-on-surface/60 max-w-sm">Mulai tambahkan bahan baku baru untuk mengelola inventaris Anda</p>
        <button
          onClick={onAddNew}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:scale-95 transition-transform"
          aria-label="Tambah bahan pertama"
        >
          <span className="material-symbols-outlined">add</span>
          Tambah Bahan Pertama
        </button>
      </div>
    </div>
  );
}
