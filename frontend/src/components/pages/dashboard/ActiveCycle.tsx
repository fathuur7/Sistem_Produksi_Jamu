import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProductionSimulator, type ClientStage } from '../../../hooks/useProductionSimulator';
import StageTimer from './StageTimer';
import ProductionLogPanel from './ProductionLogPanel';

// ── Types ────────────────────────────────────────────────────────────────────
interface Jamu { nama_jamu: string; jenis?: string; }
interface Batch {
  id_produksi: number;
  kode_batch:  string;
  jamu:        Jamu | null;
  status:      'antrian' | 'ekstraksi' | 'botolisasi' | 'selesai';
  ukuran_batch: number;
}

// ── Stepper config (6 tahap) ─────────────────────────────────────────────────
const STEPS: { label: string; stage: ClientStage; icon: string }[] = [
  { label: 'Persiapan',  stage: 'persiapan',  icon: 'inventory_2'         },
  { label: 'Ekstraksi',  stage: 'ekstraksi',  icon: 'local_fire_department'},
  { label: 'Perebusan',  stage: 'perebusan',  icon: 'outdoor_grill'        },
  { label: 'Filtrasi',   stage: 'filtrasi',   icon: 'science'              },
  { label: 'Botolisasi', stage: 'botolisasi', icon: 'liquor'               },
  { label: 'Selesai',    stage: 'selesai',    icon: 'task_alt'             },
];

const STAGE_ORDER: ClientStage[] = STEPS.map(s => s.stage);

// Map DB status → client stage untuk infer starting point
const DB_TO_CLIENT: Record<string, ClientStage> = {
  antrian:    'persiapan',
  ekstraksi:  'ekstraksi',
  botolisasi: 'botolisasi',
  selesai:    'selesai',
};

const PROGRESS_MAP: Record<ClientStage, string> = {
  persiapan:  '0%',
  ekstraksi:  '20%',
  perebusan:  '40%',
  filtrasi:   '60%',
  botolisasi: '80%',
  selesai:    '100%',
};

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchAktif(): Promise<Batch | null> {
  const res = await fetch('/api/produksi?status=ekstraksi', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat siklus aktif');
  const json = await res.json();
  const list: Batch[] = Array.isArray(json.data) ? json.data : [];
  // Juga cek antrian (batch yang baru dibuat sebelum advance pertama)
  if (list.length === 0) {
    const res2 = await fetch('/api/produksi?status=antrian', { credentials: 'include' });
    const json2 = await res2.json();
    const list2: Batch[] = Array.isArray(json2.data) ? json2.data : [];
    return list2[0] ?? null;
  }
  return list[0] ?? null;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ActiveCycle() {
  const { data: batch, isLoading } = useQuery({
    queryKey: ['active-cycle'],
    queryFn: fetchAktif,
    refetchInterval: 15_000,
  });

  const sim = useProductionSimulator({
    id_produksi: batch?.id_produksi ?? null,
    onComplete: () => {
      // Opsional: tampilkan notifikasi selesai
    },
  });

  const [logOpen, setLogOpen] = useState(false);
  const prevBatchId = useRef<number | null>(null);

  // Auto-start simulator saat batch pertama kali terdeteksi
  useEffect(() => {
    if (!batch) return;
    if (batch.id_produksi === prevBatchId.current) return;

    prevBatchId.current = batch.id_produksi;
    const startStage = DB_TO_CLIENT[batch.status] ?? 'persiapan';

    // Reset ke stage yang sesuai dengan status DB
    sim.reset();
    // Delay kecil agar reset selesai sebelum start
    setTimeout(() => sim.start(), 50);

    // Jika DB sudah di tengah (misal ekstraksi), langsung jump ke stage itu
    if (startStage !== 'persiapan') {
      const targetIdx = STAGE_ORDER.indexOf(startStage);
      // Advance cepat (tanpa timer) ke stage yang benar — hanya update state
      let i = 0;
      const jump = setInterval(() => {
        if (i >= targetIdx) { clearInterval(jump); return; }
        sim.advanceStage();
        i++;
      }, 30);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch?.id_produksi]);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const currentStageIdx = STAGE_ORDER.indexOf(sim.stage);

  function getStepState(idx: number): 'done' | 'active' | 'pending' {
    if (idx < currentStageIdx) return 'done';
    if (idx === currentStageIdx) return 'active';
    return 'pending';
  }

  const hasBatch = !!batch && !isLoading;
  const isComplete = sim.stage === 'selesai';

  return (
    <>
      <section className="bg-surface-container-low p-8 rounded-2xl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-1 font-headline">Siklus Saat Ini</h3>
            <p className="text-on-surface-variant text-sm">
              {isLoading
                ? 'Memuat data...'
                : batch
                ? `Batch Aktif: ${batch.kode_batch} (${batch.jamu?.nama_jamu ?? '—'})`
                : 'Tidak ada batch yang sedang berjalan'}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Lihat Log */}
            <button
              onClick={() => setLogOpen(true)}
              disabled={sim.log.length === 0}
              className="px-4 py-2 text-primary font-bold text-sm hover:bg-surface-container-highest
                rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">history</span>
              Lihat Log
              {sim.log.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {sim.log.length}
                </span>
              )}
            </button>

            {/* Lanjutkan Tahap (manual advance) */}
            {hasBatch && !isComplete && (
              <button
                onClick={() => sim.advanceStage()}
                className="px-4 py-2 text-secondary font-bold text-sm border border-secondary/30
                  hover:bg-secondary/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">skip_next</span>
                Lanjut Tahap
              </button>
            )}

            {/* Pause / Resume */}
            {hasBatch && !isComplete && (
              <button
                onClick={() => sim.togglePause()}
                className={`px-6 py-2 font-bold text-sm rounded-lg shadow-lg transition-all flex items-center gap-2
                  ${sim.paused
                    ? 'bg-secondary text-on-secondary shadow-secondary/20 hover:opacity-90'
                    : 'bg-primary text-on-primary shadow-primary/20 hover:opacity-90'}`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {sim.paused ? 'play_arrow' : 'pause'}
                </span>
                {sim.paused ? 'Lanjutkan' : 'Jeda Siklus'}
              </button>
            )}

            {/* Selesai badge */}
            {isComplete && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  task_alt
                </span>
                Produksi Selesai
              </div>
            )}

            {/* Tidak ada batch */}
            {!hasBatch && !isLoading && (
              <button
                disabled
                className="px-6 py-2 bg-primary text-on-primary font-bold text-sm rounded-lg
                  shadow-lg shadow-primary/20 opacity-40 cursor-not-allowed"
              >
                Jeda Siklus
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── Progress Stepper ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="relative py-12">
              {/* Track */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-outline-variant -translate-y-1/2 opacity-30" />
              {/* Fill */}
              <div
                className="absolute top-1/2 left-0 h-1 bg-secondary -translate-y-1/2 transition-all duration-700"
                style={{ width: hasBatch ? PROGRESS_MAP[sim.stage] : '0%' }}
              />
              {/* Steps */}
              <div className="relative flex justify-between">
                {STEPS.map((step, i) => {
                  const state = hasBatch ? getStepState(i) : 'pending';
                  return (
                    <div key={step.stage} className="flex flex-col items-center gap-3">
                      {state === 'done' && (
                        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center z-10 shadow-lg">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >check</span>
                        </div>
                      )}
                      {state === 'active' && (
                        <div className="w-12 h-12 rounded-full border-4 border-secondary bg-surface text-secondary
                          flex items-center justify-center z-10 shadow-xl ring-8 ring-secondary/10 -mt-1">
                          <span
                            className="material-symbols-outlined animate-pulse"
                            style={{ fontVariationSettings: sim.paused ? "'FILL' 0" : "'FILL' 1" }}
                          >{step.icon}</span>
                        </div>
                      )}
                      {state === 'pending' && (
                        <div className="w-10 h-10 rounded-full bg-surface border-2 border-outline-variant text-outline
                          flex items-center justify-center z-10">
                          <span className="material-symbols-outlined text-sm">{step.icon}</span>
                        </div>
                      )}
                      <span className={`text-xs font-bold uppercase tracking-widest ${
                        state === 'done'   ? 'text-primary' :
                        state === 'active' ? 'text-secondary' :
                        'text-on-surface-variant opacity-50'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Timer */}
            {hasBatch && sim.active && (
              <StageTimer
                stage={sim.stage}
                stageLabel={sim.stageLabel}
                elapsed={sim.elapsed}
                totalDuration={sim.totalDuration}
                progressPercent={sim.progressPercent}
                paused={sim.paused}
              />
            )}

            {/* Tidak ada batch — empty state */}
            {!hasBatch && !isLoading && (
              <div className="mt-2 text-center py-6 text-on-surface/30">
                <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">
                  hourglass_empty
                </span>
                <p className="text-sm font-medium">Tambahkan batch dari antrian produksi untuk memulai simulasi</p>
              </div>
            )}
          </div>

          {/* ── Info Batch ───────────────────────────────────────────────── */}
          <div className="bg-surface-container-highest p-6 rounded-xl space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase text-on-surface-variant opacity-60">
              <span>Ukuran Batch</span>
              <span>Target</span>
            </div>
            <div className="text-3xl font-extrabold text-primary font-headline">
              {isLoading ? '—' : batch ? `${batch.ukuran_batch} kg` : '—'}
            </div>

            <div className="text-xs font-bold uppercase text-on-surface-variant opacity-60">
              Status
            </div>
            <div className="text-xl font-extrabold text-secondary font-headline capitalize">
              {isLoading
                ? '—'
                : hasBatch
                ? sim.stageLabel
                : 'Tidak ada'}
            </div>

            {/* Elapsed total */}
            {hasBatch && sim.active && (
              <>
                <div className="text-xs font-bold uppercase text-on-surface-variant opacity-60 pt-2 border-t border-outline-variant/20">
                  Tahap ke-
                </div>
                <div className="text-lg font-extrabold text-on-surface font-headline">
                  {currentStageIdx + 1} / {STEPS.length}
                </div>
              </>
            )}

            {/* Pause indicator */}
            {sim.paused && hasBatch && (
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Dijeda</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Log Panel */}
      <ProductionLogPanel
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        log={sim.log}
        batchCode={batch?.kode_batch}
        jamuName={batch?.jamu?.nama_jamu}
      />
    </>
  );
}
