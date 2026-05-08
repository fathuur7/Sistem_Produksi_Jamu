// ============================================
// Modal Component - Form UI
// ============================================

import React from 'react';

interface AddEditModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  formData: {
    nama: string;
    kategori: string;
    satuan: string;
    stokAwal: string;
    threshold: string;
    hargaSatuan: string;
  };
  isPending: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AddEditModal({
  isOpen,
  mode,
  formData,
  isPending,
  onFormChange,
  onSubmit,
  onClose,
}: AddEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-on-primary px-8 py-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold">
            {mode === 'add' ? 'Tambah Bahan Baku' : 'Edit Bahan Baku'}
          </h3>
          <button
            onClick={onClose}
            className="text-on-primary hover:opacity-80 transition-opacity"
            aria-label="Tutup modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Nama Bahan *</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={onFormChange}
              className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Contoh: Jahe Merah"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Kategori *</label>
              <input
                type="text"
                name="kategori"
                value={formData.kategori}
                onChange={onFormChange}
                className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Rempah"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Satuan *</label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan}
                onChange={onFormChange}
                className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: kg"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Stok Awal</label>
              <input
                type="number"
                name="stokAwal"
                value={formData.stokAwal}
                onChange={onFormChange}
                className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Batas Minimum</label>
              <input
                type="number"
                name="threshold"
                value={formData.threshold}
                onChange={onFormChange}
                className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10"
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Harga Satuan</label>
            <input
              type="number"
              name="hargaSatuan"
              value={formData.hargaSatuan}
              onChange={onFormChange}
              className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
              disabled={isPending}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-surface-container text-primary font-bold rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:scale-95 transition-transform disabled:opacity-50"
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
