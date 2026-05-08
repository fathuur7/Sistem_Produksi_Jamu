// ============================================
// Restock Modal Component
// ============================================

import type { InventoryItem } from '../../../types/inventory';

interface RestockModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RestockModal({
  isOpen,
  item,
  value,
  onValueChange,
  onConfirm,
  onCancel,
  isLoading = false,
}: RestockModalProps) {
  if (!isOpen || !item) return null;

  const newQuantity = Number(value) - item.stock;
  const isValid = !isNaN(Number(value)) && Number(value) > item.stock;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in scale-95 duration-200">
        {/* Header */}
        <div className="bg-secondary text-on-secondary px-8 py-6">
          <h3 className="text-2xl font-bold">Isi Ulang Stok</h3>
          <p className="text-on-secondary/80 text-sm mt-1">{item.name}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Current Stock Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-lg p-4">
              <p className="text-xs font-bold text-on-surface/40 uppercase tracking-wider">Stok Sekarang</p>
              <p className="text-2xl font-bold text-primary mt-2">{item.stock} {item.unit}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-4">
              <p className="text-xs font-bold text-on-surface/40 uppercase tracking-wider">Minimum</p>
              <p className="text-2xl font-bold text-secondary mt-2">{item.threshold.toFixed(1)} {item.unit}</p>
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-sm font-bold text-on-surface mb-3">
              Stok Target
            </label>
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={String(item.stock)}
                className="w-full px-4 py-3 border-2 border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-lg font-bold transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/60 font-medium">
                {item.unit}
              </span>
            </div>
            {value && (
              <p className="text-xs text-on-surface/60 mt-2">
                {isValid ? (
                  <span className="text-secondary font-semibold">
                    ✓ Akan menambah {newQuantity} {item.unit}
                  </span>
                ) : (
                  <span className="text-error">
                    ✗ Harus lebih besar dari {item.stock} {item.unit}
                  </span>
                )}
              </p>
            )}
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
              disabled={isLoading || !isValid}
              className="flex-1 px-4 py-3 bg-secondary text-on-secondary font-bold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">autorenew</span>
                  Isi Ulang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
