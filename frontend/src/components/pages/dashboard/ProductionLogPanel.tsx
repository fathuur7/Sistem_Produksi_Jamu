import type { LogEntry } from '../../../hooks/useProductionSimulator';

interface ProductionLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  log: LogEntry[];
  batchCode?: string;
  jamuName?: string;
}

const STAGE_ICONS: Record<string, string> = {
  persiapan:  'inventory_2',
  ekstraksi:  'local_fire_department',
  perebusan:  'outdoor_grill',
  filtrasi:   'science',
  botolisasi: 'liquor',
  selesai:    'task_alt',
};

const STAGE_COLORS: Record<string, string> = {
  persiapan:  'text-blue-500 bg-blue-500/10',
  ekstraksi:  'text-amber-500 bg-amber-500/10',
  perebusan:  'text-orange-500 bg-orange-500/10',
  filtrasi:   'text-teal-500 bg-teal-500/10',
  botolisasi: 'text-emerald-500 bg-emerald-500/10',
  selesai:    'text-primary bg-primary/10',
};

function formatTime(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ProductionLogPanel({
  isOpen, onClose, log, batchCode, jamuName,
}: ProductionLogPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50
          flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <div>
            <h2 className="text-lg font-bold text-primary font-headline">Log Produksi</h2>
            {batchCode && (
              <p className="text-xs text-on-surface-variant/60 mt-0.5">
                {batchCode} {jamuName ? `· ${jamuName}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Log entries */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {log.length === 0 && (
            <div className="text-center py-16 text-on-surface/30">
              <span className="material-symbols-outlined text-4xl block mb-2">history</span>
              <p className="text-sm font-medium">Belum ada aktivitas</p>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            {log.length > 1 && (
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-outline-variant/20" />
            )}

            {log.map((entry, idx) => {
              const colorClass = STAGE_COLORS[entry.stage] ?? 'text-primary bg-primary/10';
              const icon = STAGE_ICONS[entry.stage] ?? 'radio_button_checked';
              const isLast = idx === log.length - 1;

              return (
                <div key={idx} className="flex gap-4 py-3 relative">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${colorClass}`}>
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-on-surface">{entry.label}</span>
                      {isLast && entry.stage !== 'selesai' && (
                        <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Aktif
                        </span>
                      )}
                      {entry.stage === 'selesai' && (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ✓ Selesai
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-0.5 text-[11px] text-on-surface-variant/50">
                      <span>{formatClock(entry.timestamp)}</span>
                      {entry.duration != null && (
                        <span>Durasi: {formatTime(entry.duration)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 text-center">
          <p className="text-[11px] text-on-surface-variant/40">
            {log.length} event tercatat
          </p>
        </div>
      </div>
    </>
  );
}
