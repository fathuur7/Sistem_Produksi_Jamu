import type { ClientStage } from '../../../hooks/useProductionSimulator';

interface StageTimerProps {
  stage: ClientStage;
  stageLabel: string;
  elapsed: number;
  totalDuration: number;
  progressPercent: number;
  paused: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const STAGE_COLORS: Record<ClientStage, string> = {
  persiapan:  'bg-blue-500',
  ekstraksi:  'bg-amber-500',
  perebusan:  'bg-orange-500',
  filtrasi:   'bg-teal-500',
  botolisasi: 'bg-emerald-500',
  selesai:    'bg-primary',
};

const STAGE_ICONS: Record<ClientStage, string> = {
  persiapan:  'inventory_2',
  ekstraksi:  'local_fire_department',
  perebusan:  'outdoor_grill',
  filtrasi:   'science',
  botolisasi: 'liquor',
  selesai:    'task_alt',
};

export default function StageTimer({
  stage, stageLabel, elapsed, totalDuration, progressPercent, paused,
}: StageTimerProps) {
  if (stage === 'selesai') return null;

  const remaining = Math.max(totalDuration - elapsed, 0);
  const barColor = STAGE_COLORS[stage] ?? 'bg-primary';

  return (
    <div className="mt-6 bg-surface-container-highest/60 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-lg text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {STAGE_ICONS[stage]}
          </span>
          <span className="text-sm font-bold text-on-surface">{stageLabel}</span>
          {paused && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Dijeda
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-on-surface-variant/60 font-medium">Sisa waktu</div>
          <div className={`text-sm font-extrabold tabular-nums ${paused ? 'text-amber-500' : 'text-secondary'}`}>
            {formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-outline-variant/20 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-linear ${paused ? '' : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Elapsed info */}
      <div className="flex justify-between text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest">
        <span>Berjalan: {formatTime(elapsed)}</span>
        <span>Total: {formatTime(totalDuration)}</span>
      </div>
    </div>
  );
}
