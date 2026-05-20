export interface IngredientRow {
  item: {
    id_rempah: number;
    nama_rempah: string;
  };
  bahan: {
    id: number;
    nama: string;
    kategori: string | null;
    satuan: string | null;
  } | null;
  category: string;
  inputQty: string;
  inputUnit: string;
  status: 'OK' | 'LOW' | 'KURANG' | 'BUTUH INPUT' | 'TIDAK TERDAFTAR' | string;
  display: {
    target: string;
    stock: string;
    remaining: string;
    usedHint: string | null;
  };
}

export interface IngredientCompositionProps {
  rows: IngredientRow[];
  isLoading?: boolean;
  error?: string | null;
  onChangeQty: (bahanId: number, qty: string) => void;
}

function getStatusPill(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    OK: { label: 'STOK OK', className: 'bg-tertiary-fixed border border-on-tertiary-fixed-variant/20 text-on-tertiary-fixed-variant' },
    LOW: { label: 'LOW STOCK', className: 'bg-secondary-container text-on-secondary-container' },
    KURANG: { label: 'KURANG', className: 'bg-error-container text-on-error-container' },
    'BUTUH INPUT': { label: 'BUTUH INPUT', className: 'bg-surface-container text-on-surface-variant' },
    'TIDAK TERDAFTAR': { label: 'BELUM DI INVENTORY', className: 'bg-surface-container-high text-on-surface-variant' },
  };

  return map[status] ?? { label: status, className: 'bg-surface-container text-on-surface-variant' };
}

export default function IngredientComposition({ rows, isLoading = false, error, onChangeQty }: IngredientCompositionProps) {
  const grouped = rows.reduce<Record<string, IngredientRow[]>>((acc, r) => {
    const key = r.category || 'Lainnya';
    acc[key] = acc[key] ?? [];
    acc[key].push(r);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <section className="bg-surface-container-low p-8 rounded-xl shadow-sm border border-outline-variant/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2 className="text-2xl font-bold text-primary font-headline">Komposisi Bahan</h2>
        <span className="text-xs font-bold text-secondary bg-secondary-container/30 px-3 py-1 rounded-full italic">Presisi: ±0.1g Diwajibkan</span>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-error text-sm">error</span>
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-10 gap-3 text-on-surface/40">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Memuat komposisi & stok…</span>
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="bg-surface-container-highest/20 p-8 rounded-xl text-center text-sm text-on-surface/40 font-medium border border-dashed border-outline-variant/20">
          <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">nutrition</span>
          Pilih jamu untuk melihat komposisi.
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="space-y-6">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-widest hidden sm:grid">
            <div className="col-span-12 sm:col-span-4">Nama Bahan</div>
            <div className="col-span-12 sm:col-span-2">Total Kebutuhan</div>
            <div className="col-span-12 sm:col-span-2">Pengambilan Aktual</div>
            <div className="col-span-12 sm:col-span-2">Stok Saat Ini</div>
            <div className="col-span-12 sm:col-span-2 text-right">Status</div>
          </div>

          {categories.map((cat) => (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                  {cat}
                </span>
                <span className="h-px flex-1 bg-outline-variant/20" />
              </div>

              {grouped[cat].map((r) => {
                const pill = getStatusPill(r.status);
                const disabled = !r.bahan;
                const opacity = disabled ? 'opacity-70' : 'opacity-100';
                return (
                  <div
                    key={`${r.item.id_rempah}-${r.bahan?.id ?? 'x'}`}
                    className={`grid grid-cols-12 gap-4 items-center bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant/10 ${opacity} transition-all hover:border-primary/20`}
                  >
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-container text-on-primary-container shadow-inner">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          nutrition
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-on-surface text-sm sm:text-base capitalize">
                          {r.bahan?.nama ?? r.item.nama_rempah}
                        </span>
                        <div className="text-[11px] text-on-surface-variant/60 font-medium">
                          {r.bahan?.kategori ?? 'Rempah'}{r.bahan?.satuan ? ` · Unit: ${r.bahan.satuan}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2 text-sm font-bold text-on-surface-variant">
                      <div className="font-mono">{r.display.target}</div>
                      <div className="text-[10px] text-on-surface-variant/50">
                        {r.display.remaining !== '—' ? `Sisa: ${r.display.remaining}` : ''}
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <div className="relative">
                        <input
                          className={`w-full py-2 px-2 pr-14 text-sm rounded border border-outline-variant/20 text-right focus:ring-1 focus:ring-primary shadow-inner font-mono font-bold ${disabled ? 'cursor-not-allowed bg-surface-container' : 'bg-surface-container-lowest'}`}
                          type="number"
                          min={0}
                          step={0.01}
                          value={r.inputQty}
                          onChange={(e) => r.bahan && onChangeQty(r.bahan.id, e.target.value)}
                          placeholder={disabled ? '—' : '0'}
                          disabled={disabled}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant/50">
                          {r.inputUnit || r.bahan?.satuan || ''}
                        </span>
                      </div>
                      {r.display.usedHint && (
                        <div className="text-[10px] text-on-surface-variant/50 mt-1 font-medium">
                          ≈ {r.display.usedHint}
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 sm:col-span-2 text-sm font-bold text-on-surface-variant">
                      <div className="font-mono">{r.display.stock}</div>
                    </div>

                    <div className="col-span-12 sm:col-span-2 flex justify-end mt-2 sm:mt-0">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${pill.className} shadow-sm text-right`}>
                        {pill.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
