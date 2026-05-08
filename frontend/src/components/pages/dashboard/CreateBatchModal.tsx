import { useState, useEffect } from 'react';
import { useCreateBatch } from '../../../hooks/useCreateBatch';
import toast from 'react-hot-toast';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (id_produksi: number, kode_batch: string) => void;
}

export default function CreateBatchModal({ isOpen, onClose, onCreated }: CreateBatchModalProps) {
  const { jamuList, isLoadingJamu, createBatch, isSubmitting, error } = useCreateBatch();

  const [idJamu, setIdJamu] = useState<number | ''>('');
  const [ukuranBatch, setUkuranBatch] = useState<string>('');
  const [catatan, setCatatan] = useState('');

  // Reset form setiap modal dibuka
  useEffect(() => {
    if (isOpen) {
      setIdJamu('');
      setUkuranBatch('');
      setCatatan('');
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idJamu || !ukuranBatch) return;

    try {
      const result = await createBatch({
        id_jamu: Number(idJamu),
        ukuran_batch: Number(ukuranBatch),
        catatan: catatan || undefined,
      });
      toast.success(`Batch ${result.kode_batch} berhasil dibuat!`);
      onCreated?.(result.id_produksi, result.kode_batch);
      onClose();
    } catch {
      // Error sudah di-set oleh hook
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden
            animate-[fadeSlideUp_0.25s_ease-out]"
          onClick={e => e.stopPropagation()}
          style={{
            animation: 'fadeSlideUp 0.25s ease-out',
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-outline-variant/15">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      add_task
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary font-headline">
                    Batch Produksi Baru
                  </h2>
                </div>
                <p className="text-sm text-on-surface-variant ml-13 pl-1">
                  Buat batch dan mulai simulasi produksi secara langsung.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

            {/* Pilih Jamu */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
                Resep Jamu *
              </label>
              <div className="relative">
                <select
                  value={idJamu}
                  onChange={e => setIdJamu(e.target.value ? Number(e.target.value) : '')}
                  required
                  disabled={isLoadingJamu}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl
                    px-4 py-3 text-sm text-on-surface font-medium appearance-none
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                    transition-all disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingJamu ? 'Memuat daftar jamu...' : '— Pilih resep jamu —'}
                  </option>
                  {jamuList.map(j => (
                    <option key={j.id_jamu} value={j.id_jamu}>
                      {j.nama_jamu} {j.jenis ? `(${j.jenis})` : ''}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm">
                  expand_more
                </span>
              </div>
            </div>

            {/* Ukuran Batch */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
                Ukuran Batch (kg) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="9999"
                  step="0.5"
                  value={ukuranBatch}
                  onChange={e => setUkuranBatch(e.target.value)}
                  required
                  placeholder="Contoh: 50"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl
                    px-4 py-3 pr-12 text-sm text-on-surface font-medium
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                    transition-all placeholder:text-on-surface-variant/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant/40 pointer-events-none">
                  kg
                </span>
              </div>
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
                Catatan <span className="normal-case font-normal">(opsional)</span>
              </label>
              <textarea
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                rows={2}
                placeholder="Catatan tambahan untuk batch ini..."
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl
                  px-4 py-3 text-sm text-on-surface font-medium resize-none
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all placeholder:text-on-surface-variant/30"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">error</span>
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            {/* Info simulasi */}
            <div className="bg-secondary/5 border border-secondary/15 rounded-xl px-4 py-3 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-secondary text-sm mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                Setelah dibuat, simulasi akan berjalan otomatis melalui tahap{' '}
                <strong className="text-secondary">Persiapan → Ekstraksi → Perebusan → Filtrasi → Botolisasi</strong>.
                Kamu bisa pause atau advance manual kapan saja.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold
                  text-on-surface-variant hover:bg-surface-container-highest transition-colors
                  disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !idJamu || !ukuranBatch}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold
                  shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity
                  disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                    Mulai Produksi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  );
}
