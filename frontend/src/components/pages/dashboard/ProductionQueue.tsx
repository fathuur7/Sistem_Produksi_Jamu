import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CreateBatchModal from './CreateBatchModal';

interface Jamu { nama_jamu: string; }

interface Batch {
  id_produksi: number;
  kode_batch:  string;
  jamu:        Jamu | null;
  ukuran_batch: number;
  volume_output: number | null;
  status: 'antrian' | 'ekstraksi' | 'botolisasi' | 'selesai';
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  antrian:    'ANTRIAN',
  ekstraksi:  'EKSTRAKSI',
  botolisasi: 'BOTOLISASI',
  selesai:    'SELESAI',
};

const STATUS_COLOR: Record<string, string> = {
  antrian:    'text-primary/60 bg-primary/5',
  ekstraksi:  'text-amber-600 bg-amber-500/10',
  botolisasi: 'text-emerald-600 bg-emerald-500/10',
  selesai:    'text-primary bg-primary/10',
};

async function fetchAntrian(): Promise<Batch[]> {
  const res = await fetch('/api/produksi?status=antrian', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat antrian');
  const json = await res.json();
  return Array.isArray(json.data) ? json.data.slice(0, 3) : [];
}

export default function ProductionQueue() {
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['production-queue'],
    queryFn: fetchAntrian,
    refetchInterval: 15_000,
  });

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="xl:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-primary font-headline">Antrean Produksi</h3>
          {batches.length > 0 && (
            <span className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest">
              {batches.length} batch
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-10 gap-3 text-on-surface/40">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Memuat antrian...</span>
            </div>
          )}

          {/* Batch cards */}
          {!isLoading && batches.map((batch) => {
            const colorClass = STATUS_COLOR[batch.status] ?? 'text-primary/60 bg-primary/5';
            return (
              <div
                key={batch.id_produksi}
                className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-xl
                  hover:translate-x-2 transition-all group cursor-default"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-container text-on-primary-container px-3 py-1
                    rounded-md text-[10px] font-bold tracking-widest uppercase">
                    {batch.kode_batch}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${colorClass}`}>
                    {STATUS_LABEL[batch.status] ?? batch.status}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-primary mb-1 capitalize">
                  {batch.jamu?.nama_jamu ?? '—'}
                </h4>
                <p className="text-sm text-on-surface-variant mb-4">
                  Batch: {batch.ukuran_batch ?? '—'} kg
                  {batch.volume_output ? ` | Output: ${batch.volume_output} L` : ''}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <div className="h-1 flex-1 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/20 w-0 group-hover:w-1/4 transition-all duration-500" />
                  </div>
                  <span className="text-[11px] text-on-surface-variant/50 font-medium">
                    {new Date(batch.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {!isLoading && batches.length === 0 && (
            <div className="bg-surface-container-highest/20 p-8 rounded-xl text-center
              text-sm text-on-surface/40 font-medium border border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">
                inbox
              </span>
              Tidak ada batch dalam antrian
            </div>
          )}

          {/* Tambah batch baru — buka modal */}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full bg-surface-container-highest/40 p-10 border-2 border-dashed
              border-outline-variant/20 rounded-xl flex flex-col items-center justify-center
              text-center cursor-pointer hover:bg-surface-container-highest/60
              hover:border-primary/30 hover:scale-[1.01] transition-all group"
          >
            <span
              className="material-symbols-outlined text-4xl text-outline-variant mb-2
                group-hover:text-primary group-hover:scale-110 transition-all"
            >
              add_task
            </span>
            <p className="text-sm font-bold text-on-surface-variant/40 group-hover:text-primary/60 transition-colors">
              Tambah Batch Produksi Baru
            </p>
          </button>
        </div>
      </div>

      {/* Modal */}
      <CreateBatchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(_id, code) => {
          console.info(`[Simulasi] Batch ${code} siap dijalankan`);
        }}
      />
    </>
  );
}
