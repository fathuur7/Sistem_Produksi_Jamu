// ============================================
// Confirmation Modal Component
// ============================================

interface ConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in scale-95 duration-200">
        {/* Header */}
        <div className="bg-error text-on-error px-8 py-6">
          <h3 className="text-2xl font-bold">Konfirmasi Penghapusan</h3>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-error text-2xl">warning</span>
            </div>
            <div>
              <p className="text-on-surface font-medium">
                Anda akan menghapus bahan baku berikut:
              </p>
              <p className="text-on-surface/60 text-sm mt-1">
                Data ini tidak dapat dipulihkan setelah dihapus.
              </p>
            </div>
          </div>

          {/* Item Name Highlight */}
          <div className="bg-error-container/50 border-l-4 border-error px-4 py-3 rounded-lg">
            <p className="text-on-surface font-bold text-lg">{itemName}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-surface-container text-primary font-bold rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-error text-on-error font-bold rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-error border-t-transparent rounded-full animate-spin"></span>
                  Menghapus...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">delete</span>
                  Hapus
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
