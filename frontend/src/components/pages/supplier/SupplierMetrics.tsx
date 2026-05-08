import { useQuery } from '@tanstack/react-query';

interface Metrics {
  total: number;
  aktif: number;
  menunggu: number;
  ditangguhkan: number;
}

async function fetchMetrics(): Promise<Metrics> {
  const res = await fetch('/api/supplier/metrics');
  if (!res.ok) throw new Error('Gagal memuat metrics');
  const json = await res.json();
  return json.data;
}

export default function SupplierMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['supplier-metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 60_000,
  });

  const total = data?.total ?? 0;
  const aktif = data?.aktif ?? 0;
  const menunggu = data?.menunggu ?? 0;
  const ditangguhkan = data?.ditangguhkan ?? 0;
  const perhatian = menunggu + ditangguhkan;
  const percentage = total > 0 ? Math.round((aktif / total) * 100) : 0;

  const rows = [
    { label: 'Aktif', value: aktif, dot: 'bg-tertiary-fixed', valueClass: 'text-primary' },
    { label: 'Menunggu', value: menunggu, dot: 'bg-secondary-container', valueClass: 'text-on-surface-variant' },
    { label: 'Ditangguhkan', value: ditangguhkan, dot: 'bg-error-container', valueClass: 'text-on-surface-variant' },
  ];

  return (
    <div className="h-full space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-7 shadow-[0_28px_70px_-46px_rgba(28,28,19,0.35)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-tertiary-fixed to-secondary-container" />
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">Total Pemasok</p>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-3">
              <span className={`font-headline text-6xl font-light leading-none text-primary ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '-' : total}
              </span>
              <span className="mb-2 inline-flex items-center rounded-full bg-tertiary-fixed/14 px-3 py-1 text-sm font-bold text-on-tertiary-fixed-variant">
                {aktif} aktif
              </span>
            </div>

            <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-right shadow-inner">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/55">Kesiapan Jaringan</p>
              <p className="mt-1 font-headline text-2xl font-bold text-primary">{percentage}%</p>
            </div>
          </div>

          <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-surface-container shadow-inner">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#003527_0%,#4edea3_100%)] transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-on-surface-variant/75">
            <span>Jaringan sehat didominasi pemasok aktif yang siap dipakai tim produksi.</span>
            {perhatian > 0 && (
              <span className="inline-flex items-center rounded-full bg-secondary-container/25 px-3 py-1 font-bold text-secondary">
                {perhatian} perlu perhatian
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-outline-variant/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.45),rgba(242,238,222,0.88))] p-7 shadow-[0_20px_55px_-42px_rgba(133,83,0,0.45)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-headline text-2xl font-bold text-primary">Status Pemasok</h4>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pecah status kontrak supaya tim tahu mana yang siap, menunggu, atau perlu ditindaklanjuti.
            </p>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-secondary shadow-sm sm:flex">
            <span className="material-symbols-outlined">monitoring</span>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          {rows.map((row) => {
            const share = total > 0 ? Math.round((row.value / total) * 100) : 0;

            return (
              <div key={row.label} className="rounded-2xl bg-white/65 px-4 py-4 shadow-[0_10px_30px_-24px_rgba(28,28,19,0.35)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-3.5 w-3.5 rounded-full ${row.dot}`} />
                    <span className="text-sm font-semibold text-on-surface">{row.label}</span>
                  </div>

                  <div className="text-right">
                    <p className={`text-xl font-bold ${row.valueClass}`}>{isLoading ? '-' : row.value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/55">{share}% total</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
