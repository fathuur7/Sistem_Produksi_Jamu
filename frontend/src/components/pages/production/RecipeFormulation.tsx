export interface RecipeFormulationProps {
  jamuList: Array<{ id_jamu: number; nama_jamu: string; jenis?: string | null; perizinan?: string | null }>;
  isLoadingJamuList?: boolean;
  error?: string | null;
  selectedJamuId: number | null;
  onChangeJamu: (id: number | null) => void;
  targetProduksiStr: string;
  onChangeTargetProduksi: (value: string) => void;
  selectedJamu?: { target_output?: number | null; satuan_output?: string | null } | null;
}

export default function RecipeFormulation({
  jamuList,
  isLoadingJamuList = false,
  error,
  selectedJamuId,
  onChangeJamu,
  targetProduksiStr,
  onChangeTargetProduksi,
  selectedJamu,
}: RecipeFormulationProps) {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-9xl">science</span>
      </div>
      
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3 font-headline">
        Formulasi Resep
        <span className="h-px flex-1 bg-outline-variant/20"></span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Pilihan Resep</label>
          <div className="relative">
            <select
              value={selectedJamuId ?? ''}
              onChange={(e) => onChangeJamu(e.target.value ? Number(e.target.value) : null)}
              disabled={isLoadingJamuList}
              className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer shadow-inner disabled:opacity-60"
            >
              <option value="">
                {isLoadingJamuList ? 'Memuat daftar jamu…' : '— Pilih jamu —'}
              </option>
              {jamuList.map((j) => (
                <option key={j.id_jamu} value={j.id_jamu}>
                  {j.nama_jamu}{j.jenis ? ` (${j.jenis})` : ''}{j.perizinan ? ` · ${j.perizinan}` : ''}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm">
              expand_more
            </span>
          </div>
          {error && (
            <p className="text-xs text-error font-bold">{error}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Target Produksi</label>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-surface-container border-none rounded-lg px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary transition-all shadow-inner" 
              placeholder={selectedJamu?.target_output ? String(selectedJamu.target_output) : "Misal: 50"} 
              type="number"
              min={0.1}
              step={0.1}
              value={targetProduksiStr}
              onChange={(e) => onChangeTargetProduksi(e.target.value)}
            />
            <div className="bg-secondary-container px-4 py-3 rounded-lg text-on-secondary-container font-bold flex items-center shadow-sm uppercase">
              {selectedJamu?.satuan_output || 'Unit'}
            </div>
          </div>
          {selectedJamu?.target_output && (
            <p className="text-[10px] text-on-surface-variant/60 font-bold mt-1">
              *Resep dasar menghasilkan {selectedJamu.target_output} {selectedJamu.satuan_output || 'Unit'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
