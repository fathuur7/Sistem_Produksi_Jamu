import { useQuery } from '@tanstack/react-query';

interface Metrics {
  totalJamu: number;
  totalRempah: number;
  totalKhasiat: number;
}

async function fetchMetrics(): Promise<Metrics> {
  const [jamuRes, rempahRes, khasiatRes] = await Promise.all([
    fetch('/api/jamu'),
    fetch('/api/rempah'),
    fetch('/api/khasiat'),
  ]);

  if (!jamuRes.ok) throw new Error('Gagal memuat data jamu');
  if (!rempahRes.ok) throw new Error('Gagal memuat data rempah');
  if (!khasiatRes.ok) throw new Error('Gagal memuat data khasiat');

  const jamuJson = await jamuRes.json();
  const rempahJson = await rempahRes.json();
  const khasiatJson = await khasiatRes.json();

  const jamuList = Array.isArray(jamuJson) ? jamuJson : Array.isArray(jamuJson?.data) ? jamuJson.data : [];
  const rempahList = Array.isArray(rempahJson) ? rempahJson : Array.isArray(rempahJson?.data) ? rempahJson.data : [];
  const khasiatList = Array.isArray(khasiatJson) ? khasiatJson : Array.isArray(khasiatJson?.data) ? khasiatJson.data : [];

  return {
    totalJamu: jamuList.length,
    totalRempah: rempahList.length,
    totalKhasiat: khasiatList.length,
  };
}

export default function DashboardMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 30_000, // refresh tiap 30 detik
  });

  const totalJamu    = isLoading ? '—' : (data?.totalJamu ?? 0);
  const totalRempah  = isLoading ? '—' : (data?.totalRempah ?? 0);
  const totalKhasiat = isLoading ? '—' : (data?.totalKhasiat ?? 0);

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2 font-headline">
          Ikhtisar Data Jamu
        </h2>
        <p className="text-on-surface-variant">Ringkasan data dari database jamu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Jamu */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col gap-4 shadow-sm border-l-4 border-primary">
          <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Total Jamu</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-extrabold text-primary font-headline ${isLoading ? 'animate-pulse' : ''}`}>
              {totalJamu}
            </span>
            <span className="text-tertiary-fixed-dim font-bold text-sm">resep tercatat</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[65%]"></div>
          </div>
        </div>

        {/* Total Rempah */}
        <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden border border-outline-variant/10">
          <div className="z-10 flex flex-col gap-4">
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              Total Rempah
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-extrabold text-primary font-headline ${isLoading ? 'animate-pulse' : ''}`}>
                {totalRempah}
              </span>
              <span className="text-on-surface-variant/70 font-semibold text-sm">item terdaftar</span>
            </div>
            <p className="text-sm text-on-surface-variant/80">Data diambil langsung dari tabel rempah.</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-on-surface/5">
            eco
          </span>
        </div>

        {/* Total Khasiat */}
        <div className="bg-secondary-container p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
          <span className="text-sm font-bold text-on-secondary-container uppercase tracking-widest">
            Total Khasiat
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-extrabold text-on-secondary-container font-headline ${isLoading ? 'animate-pulse' : ''}`}>
              {totalKhasiat}
            </span>
            <span className="text-on-secondary-container/70 font-semibold text-sm">entri khasiat</span>
          </div>
          <div className="flex -space-x-2 overflow-hidden mt-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-secondary-container">
              <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center ring-2 ring-secondary-container">
              <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            {(data?.totalKhasiat ?? 0) > 2 && (
              <div className="h-8 w-8 rounded-full bg-on-secondary-container/10 flex items-center justify-center ring-2 ring-secondary-container text-[10px] font-bold text-on-secondary-container">
                +{(data?.totalKhasiat ?? 0) - 2}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
