import type { InventoryItem } from '../../../types/inventory';

interface InventoryBentoProps {
  items: InventoryItem[];
}

export default function InventoryBento({ items }: InventoryBentoProps) {
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.status === 'Kritis' || item.status === 'Kosong');
  const warningItems = items.filter(item => item.status === 'Peringatan');

  const volatilityScore = totalItems
    ? Math.round(
        items.reduce((sum, item) => {
          const threshold = Math.max(item.threshold, 1);
          const gap = Math.max(0, threshold - item.stock) / threshold;
          return sum + gap;
        }, 0) * 100 / totalItems,
      )
    : 0;

  const volatilityLabel = `${volatilityScore >= 0 ? '+' : ''}${volatilityScore}% Minggu Ini`;

  const chartItems = [...items]
    .sort((left, right) => {
      const leftGap = Math.abs(left.stock - left.threshold);
      const rightGap = Math.abs(right.stock - right.threshold);
      return rightGap - leftGap;
    })
    .slice(0, 6);

  const chartValues = chartItems.map(item => {
    const threshold = Math.max(item.threshold, 1);
    return Math.min(100, Math.max(18, Math.round((Math.abs(item.stock - threshold) / threshold) * 100)));
  });

  const riskSummary = totalItems
    ? `${lowStockItems.length + warningItems.length} dari ${totalItems} bahan perlu perhatian`
    : 'Belum ada data inventaris';

  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Automated Ordering */}
      <div className="lg:col-span-8 bg-primary-container text-on-primary-container p-8 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden relative shadow-md">
        <div className="relative z-10 w-full">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 font-headline">Pemesanan Otomatis</h3>
          <p className="text-on-primary-container/80 max-w-sm mb-6 text-sm md:text-base">
            {riskSummary}. Aktifkan Auto-PO untuk menjembatani celah dengan pemasok secara otomatis.
          </p>
          <button className="w-full sm:w-auto px-6 py-3 bg-secondary text-on-secondary font-bold rounded-xl shadow-lg shadow-black/10 hover:brightness-110 active:scale-95 transition-all">
            Konfigurasi Sumber Cerdas
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 scale-[1.5] md:scale-[2]">
          <span className="material-symbols-outlined text-[200px] md:text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            hub
          </span>
        </div>
      </div>

      {/* Supply Volatility */}
      <div className="lg:col-span-4 bg-secondary-fixed p-8 rounded-[2rem] flex flex-col justify-between shadow-md">
        <div>
          <div className="w-12 h-12 bg-on-secondary-fixed rounded-2xl flex items-center justify-center text-secondary-fixed-dim mb-6 shadow-inner">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-secondary-fixed/60">Volatilitas Pasokan</p>
          <h3 className="text-3xl font-extrabold text-on-secondary-fixed mt-1 font-headline">
            {volatilityScore}% <span className="text-lg font-medium opacity-60 ml-1">Minggu Ini</span>
          </h3>
          <p className="mt-2 text-xs font-medium text-on-secondary-fixed/70">
            {volatilityLabel}
          </p>
        </div>
        
        <div className="mt-8 flex items-end gap-1.5 h-20">
          {chartValues.map((value, index) => (
            <div
              key={`${chartItems[index]?.id ?? index}`}
              className={`w-full rounded-t-sm transition-all hover:opacity-100 ${
                index === chartValues.length - 1
                  ? 'bg-on-secondary-fixed shadow-sm opacity-90'
                  : 'bg-on-secondary-fixed/15'
              }`}
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
