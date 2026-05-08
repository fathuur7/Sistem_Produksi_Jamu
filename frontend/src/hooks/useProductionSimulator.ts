import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ── Tahap UI (termasuk perebusan & filtrasi yang tidak ada di DB) ──────────
export type ClientStage =
  | 'persiapan'
  | 'ekstraksi'
  | 'perebusan'
  | 'filtrasi'
  | 'botolisasi'
  | 'selesai';

// Mapping client stage → DB status (untuk commit ke backend)
const CLIENT_TO_DB: Record<ClientStage, string> = {
  persiapan:  'antrian',
  ekstraksi:  'ekstraksi',
  perebusan:  'ekstraksi',   // masih di ekstraksi di DB
  filtrasi:   'botolisasi',  // commit botolisasi saat mulai filtrasi
  botolisasi: 'botolisasi',
  selesai:    'selesai',
};

// Durasi tiap tahap dalam detik
const STAGE_DURATIONS: Record<ClientStage, number> = {
  persiapan:  8,
  ekstraksi:  12,
  perebusan:  10,
  filtrasi:   8,
  botolisasi: 10,
  selesai:    0,
};

const STAGE_ORDER: ClientStage[] = [
  'persiapan', 'ekstraksi', 'perebusan', 'filtrasi', 'botolisasi', 'selesai',
];

export interface LogEntry {
  stage: ClientStage;
  label: string;
  timestamp: Date;
  duration?: number; // detik yang dihabiskan di tahap ini
}

const STAGE_LABELS: Record<ClientStage, string> = {
  persiapan:  'Persiapan Bahan',
  ekstraksi:  'Ekstraksi Rempah',
  perebusan:  'Perebusan & Pemasakan',
  filtrasi:   'Filtrasi & Penyaringan',
  botolisasi: 'Botolisasi',
  selesai:    'Selesai',
};

async function callAdvance(id_produksi: number): Promise<void> {
  await fetch(`/api/produksi/${id_produksi}/advance`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}

// DB stages yang memerlukan API call advance saat masuk
const DB_ADVANCE_STAGES = new Set<ClientStage>(['ekstraksi', 'filtrasi', 'selesai']);

export interface UseProductionSimulatorOptions {
  id_produksi: number | null;
  onComplete?: () => void;
}

export function useProductionSimulator({ id_produksi, onComplete }: UseProductionSimulatorOptions) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<ClientStage>('persiapan');
  const [elapsed, setElapsed] = useState(0);         // detik yang sudah berjalan di tahap ini
  const [paused, setPaused] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [active, setActive] = useState(false);       // simulasi sedang jalan

  const stageRef = useRef(stage);
  const pausedRef = useRef(paused);
  const elapsedRef = useRef(elapsed);
  const stageStartRef = useRef<Date>(new Date());

  stageRef.current = stage;
  pausedRef.current = paused;
  elapsedRef.current = elapsed;

  // Tick setiap 1 detik
  useEffect(() => {
    if (!active) return;
    const tick = setInterval(() => {
      if (pausedRef.current) return;
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [active]);

  // Auto-advance saat elapsed >= durasi tahap
  useEffect(() => {
    if (!active || paused) return;
    const duration = STAGE_DURATIONS[stage];
    if (duration === 0) return; // selesai, tidak ada auto-advance
    if (elapsed >= duration) {
      advanceStage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, stage, active, paused]);

  const advanceStage = useCallback(async () => {
    const currentStage = stageRef.current;
    const currentIdx = STAGE_ORDER.indexOf(currentStage);
    if (currentIdx === -1 || currentIdx >= STAGE_ORDER.length - 1) return;

    const nextStage = STAGE_ORDER[currentIdx + 1];
    const duration = elapsedRef.current;

    // Log entry untuk tahap yang baru selesai
    setLog(prev => [
      ...prev,
      {
        stage: currentStage,
        label: STAGE_LABELS[currentStage],
        timestamp: new Date(),
        duration,
      },
    ]);

    // Commit ke backend hanya untuk tahap tertentu
    if (id_produksi && DB_ADVANCE_STAGES.has(nextStage)) {
      try {
        await callAdvance(id_produksi);
        await queryClient.invalidateQueries({ queryKey: ['active-cycle'] });
        await queryClient.invalidateQueries({ queryKey: ['production-queue'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      } catch {
        // Simulasi tetap jalan meski API gagal
      }
    }

    setStage(nextStage);
    setElapsed(0);
    stageStartRef.current = new Date();

    if (nextStage === 'selesai') {
      setLog(prev => [
        ...prev,
        { stage: 'selesai', label: 'Selesai', timestamp: new Date() },
      ]);
      setActive(false);
      onComplete?.();
      await queryClient.invalidateQueries({ queryKey: ['active-cycle'] });
      await queryClient.invalidateQueries({ queryKey: ['production-queue'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  }, [id_produksi, queryClient, onComplete]);

  function start() {
    setStage('persiapan');
    setElapsed(0);
    setPaused(false);
    setLog([{ stage: 'persiapan', label: STAGE_LABELS['persiapan'], timestamp: new Date() }]);
    stageStartRef.current = new Date();
    setActive(true);
  }

  function pause() { setPaused(true); }
  function resume() { setPaused(false); }
  function togglePause() { setPaused(p => !p); }

  function reset() {
    setActive(false);
    setStage('persiapan');
    setElapsed(0);
    setPaused(false);
    setLog([]);
  }

  const totalDuration = STAGE_DURATIONS[stage];
  const progressPercent = totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 100;
  const dbStatus = CLIENT_TO_DB[stage];

  return {
    stage,
    elapsed,
    totalDuration,
    progressPercent,
    paused,
    active,
    log,
    dbStatus,
    stageLabel: STAGE_LABELS[stage],
    start,
    pause,
    resume,
    togglePause,
    advanceStage,
    reset,
    STAGE_ORDER,
    STAGE_LABELS,
    STAGE_DURATIONS,
  };
}
