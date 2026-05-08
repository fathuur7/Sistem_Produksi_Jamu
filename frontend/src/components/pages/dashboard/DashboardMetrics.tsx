import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBahanSummary } from '../../../hooks/useSpiceStock';

interface Metrics {
  totalBatch:      number;
  produksiAktif:   number;
  produksiSelesai: number;
  stokKritis:      number;
  stokKosong:      number;
}

async function fetchMetrics(): Promise<Metrics> {
  const res = await fetch('/api/produksi/metrics', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat metrics');
  const json = await res.json();
  return json.data;
}

// Hook animasi angka (count-up saat nilai berubah)
function useCountUp(value: number, duration = 600) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (!ref.current || value === prev.current) {
      prev.current = value;
      return;
    }
    const start  = prev.current;
    const end    = value;
    const diff   = end - start;
    const startT = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startT) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const cur = Math.round(start + diff * eased);
      if (ref.current) ref.current.textContent = String(cur);
      if (t < 1) requestAnimationFrame(step);
      else prev.current = value;
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return ref;
}

export default function DashboardMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 10_000, // sync dengan simulasi (tiap 10 detik)
    staleTime:       5_000,
  });

  const { summary, isLoading: isLoadingBahan } = useBahanSummary();

  const totalBatch    = data?.totalBatch      ?? 0;
  const selesai       = data?.produksiSelesai ?? 0;
  const produksiAktif = data?.produksiAktif   ?? 0;
  const stokKritis    = isLoadingBahan ? 0 : summary.totalPerhatian;
  const stokKosong    = summary.totalKosong;

  // Progress bar: rasio selesai vs total
  const batchProgress = totalBatch > 0 ? Math.round((selesai / totalBatch) * 100) : 0;

  // Count-up animation refs
  const totalRef  = useCountUp(isLoading ? 0 : totalBatch);
  const aktifRef  = useCountUp(isLoading ? 0 : produksiAktif);
  const kritisRef = useCountUp(isLoadingBahan ? 0 : stokKritis);

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2 font-headline">
          Ikhtisar Produksi
        </h2>
        <p className="text-on-surface-variant">Memantau denyut nadi ekstraksi herbal terbaik Madura.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Total Batch ──────────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col gap-4 shadow-sm border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              Total Batch
            </span>
            {!isLoading && selesai > 0 && (
              <span className="text-[10px] font-bold text-primary/50 bg-primary/5 px-2 py-0.5 rounded-full">
                {selesai} selesai
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span
              ref={totalRef}
              className={`text-5xl font-extrabold text-primary font-headline transition-all ${
                isLoading ? 'animate-pulse opacity-40' : ''
              }`}
            >
              {isLoading ? '—' : totalBatch}
            </span>
            <span className="text-tertiary-fixed-dim font-bold text-sm">batch tercatat</span>
          </div>

          {/* Progress bar — % yang sudah selesai */}
          <div className="space-y-1">
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: isLoading ? '0%' : `${batchProgress}%` }}
              />
            </div>
            {!isLoading && totalBatch > 0 && (
              <p className="text-[10px] text-on-surface-variant/40 font-medium">
                {batchProgress}% batch selesai
              </p>
            )}
          </div>
        </div>

        {/* ── Stok Kritis ───────────────────────────────────────────────────── */}
        <div className="bg-error-container p-8 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="z-10 flex flex-col gap-4">
            <span className="text-sm font-bold text-on-error-container uppercase tracking-widest">
              Stok Kritis
            </span>
            <div className="flex items-baseline gap-2">
              <span
                ref={kritisRef}
                className={`text-5xl font-extrabold text-on-error-container font-headline ${
                  isLoadingBahan ? 'animate-pulse opacity-40' : ''
                }`}
              >
                {isLoadingBahan ? '—' : String(stokKritis).padStart(2, '0')}
              </span>
              <span className="text-on-error-container/70 font-semibold text-sm">Tindakan diperlukan</span>
            </div>
            <p className="text-sm text-on-error-container/80">
              {stokKosong > 0 ? `${stokKosong} bahan habis. ` : ''}
              {summary.totalPerhatian > 0
                ? `${summary.totalKritis} bahan di bawah batas minimum.`
                : 'Semua stok aman.'}
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-on-error-container/10">
            warning
          </span>
        </div>

        {/* ── Produksi Aktif ────────────────────────────────────────────────── */}
        <div className="bg-secondary-container p-8 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <span className="text-sm font-bold text-on-secondary-container uppercase tracking-widest">
            Produksi Aktif
          </span>

          <div className="flex items-baseline gap-2">
            <span
              ref={aktifRef}
              className={`text-5xl font-extrabold text-on-secondary-container font-headline ${
                isLoading ? 'animate-pulse opacity-40' : ''
              }`}
            >
              {isLoading ? '—' : produksiAktif}
            </span>
            <span className="text-on-secondary-container/70 font-semibold text-sm">Siklus berjalan</span>
          </div>

          {/* Avatar dots — tiap batch aktif dapat icon */}
          <div className="flex -space-x-2 overflow-hidden mt-2">
            {produksiAktif === 0 && !isLoading && (
              <span className="text-xs text-on-secondary-container/40 font-medium">
                Tidak ada produksi aktif
              </span>
            )}
            {produksiAktif >= 1 && (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-secondary-container">
                <span
                  className="material-symbols-outlined text-on-primary text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >spa</span>
              </div>
            )}
            {produksiAktif >= 2 && (
              <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center ring-2 ring-secondary-container">
                <span
                  className="material-symbols-outlined text-on-primary-container text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >eco</span>
              </div>
            )}
            {produksiAktif > 2 && (
              <div className="h-8 w-8 rounded-full bg-on-secondary-container/10 flex items-center justify-center ring-2 ring-secondary-container text-[10px] font-bold text-on-secondary-container">
                +{produksiAktif - 2}
              </div>
            )}
          </div>

          {/* Pulse indicator saat ada batch aktif */}
          {produksiAktif > 0 && !isLoading && (
            <div className="absolute top-6 right-6 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-secondary relative" />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
