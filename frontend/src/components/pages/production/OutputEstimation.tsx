export interface OutputEstimationProps {
  jamu?: {
    nama_jamu: string;
    jenis: string | null;
    perizinan: string | null;
    produsen: {
      nama_produsen: string;
      alamat?: string | null;
      kota?: string | null;
    } | null;
  } | null;
  batchKg: number;
  batchValid: boolean;
}

function formatNumber(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toLocaleString('id-ID', { maximumFractionDigits: digits }) : '—';
}

export default function OutputEstimation({ jamu, batchKg, batchValid }: OutputEstimationProps) {
  const eff = 0.85;
  const volumeL = batchValid ? batchKg * eff : 0;
  const bottles250ml = volumeL > 0 ? Math.floor((volumeL / 0.25) * 10) / 10 : 0;

  return (
    <section className="bg-primary text-on-primary p-8 rounded-xl shadow-2xl relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary-container rounded-full opacity-30"></div>
      
      <h3 className="text-sm font-bold uppercase tracking-widest text-on-primary/70 mb-6 font-headline">
        Produk Jadi & Output
      </h3>

      <div className="space-y-4 mb-6 relative z-10">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-primary/70">Nama Jamu</p>
          <p className="text-xl font-extrabold tracking-tight capitalize">
            {jamu?.nama_jamu ?? '—'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="bg-on-primary/10 text-on-primary px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
            {jamu?.jenis ?? 'Umum'}
          </span>
          {jamu?.perizinan && (
            <span className="bg-on-primary/10 text-on-primary px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
              {jamu.perizinan}
            </span>
          )}
          {jamu?.produsen?.nama_produsen && (
            <span className="bg-on-primary/10 text-on-primary px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
              {jamu.produsen.nama_produsen}
            </span>
          )}
        </div>

        {(jamu?.produsen?.alamat || jamu?.produsen?.kota) && (
          <div className="text-[11px] text-on-primary/70 font-medium leading-relaxed">
            <span className="font-bold">Lokasi produksi:</span> {jamu?.produsen?.alamat ?? '—'}
            {jamu?.produsen?.kota ? ` · Kabupaten: ${jamu.produsen.kota}` : ''}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-4 relative z-10">
        <span className="text-7xl font-black tracking-tighter">
          {batchValid ? formatNumber(bottles250ml, 1) : '—'}
        </span>
        <span className="text-xl font-bold text-on-primary/80">Botol</span>
      </div>
      
      <p className="text-xs text-on-primary/60 leading-relaxed mb-6 font-medium relative z-10">
        {batchValid
          ? `Dihitung dari batch ${formatNumber(batchKg, 2)} KG dengan efisiensi ${Math.round(eff * 100)}% (estimasi volume ${formatNumber(volumeL, 2)} L, botol 250ml).`
          : 'Masukkan ukuran batch untuk melihat estimasi.'}
      </p>
      
      <div className="h-1.5 w-full bg-on-primary/20 rounded-full overflow-hidden relative z-10 shadow-inner">
        <div className="h-full bg-secondary w-[85%] rounded-full shadow-sm"></div>
      </div>
      
      <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-tighter text-on-primary/70 relative z-10">
        <span>Efisiensi Produksi</span>
        <span className="text-secondary-fixed">{Math.round(eff * 100)}% (Target)</span>
      </div>
    </section>
  );
}
