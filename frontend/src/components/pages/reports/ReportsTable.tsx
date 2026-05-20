import { useQuery } from '@tanstack/react-query';

interface Jamu {
  nama_jamu: string;
  jenis?: string | null;
}

interface Batch {
  id_produksi: number;
  kode_batch: string;
  jamu: Jamu | null;
  volume_output: number | null;
  efisiensi: number | null;
  status: string;
  created_at: string;
}

function getStatusStyle(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    selesai:    { label: 'SELESAI',    cls: 'bg-tertiary-fixed border-tertiary-fixed/20 text-on-tertiary-fixed-variant' },
    botolisasi: { label: 'BOTOLISASI', cls: 'bg-secondary-container/30 text-on-secondary-container border-secondary-container/20' },
    ekstraksi:  { label: 'EKSTRAKSI',  cls: 'bg-primary-fixed/40 text-on-primary-fixed-variant border-primary-fixed/20' },
    antrian:    { label: 'ANTRIAN',    cls: 'bg-surface-container text-on-surface-variant border-outline-variant/20' },
  };
  return map[status] ?? { label: status.toUpperCase(), cls: 'bg-surface-container text-on-surface-variant border-outline-variant/20' };
}

function getEffClass(eff: number | null) {
  if (!eff) return 'bg-outline';
  if (eff >= 90) return 'bg-tertiary-fixed-dim';
  if (eff >= 75) return 'bg-secondary';
  return 'bg-primary';
}

async function fetchBatches(): Promise<Batch[]> {
  const res = await fetch('/api/produksi');
  if (!res.ok) throw new Error('Gagal memuat batch');
  const json = await res.json();
  return Array.isArray(json.data) ? json.data.slice(0, 10) : [];
}

export default function ReportsTable() {
  const { data: batches = [], isLoading, error } = useQuery({
    queryKey: ['reports-batches'],
    queryFn: fetchBatches,
    refetchInterval: 30_000,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h3 className="text-2xl font-bold font-headline text-primary">Ringkasan Batch Terkini</h3>
        <button className="text-sm font-bold text-secondary hover:underline transition-all underline-offset-4">
          Lihat Semua Batch
        </button>
      </div>

      <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface/40">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Memuat data batch...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-8 text-center text-sm text-on-error-container bg-error-container/20">
            Gagal memuat data batch
          </div>
        )}

        {!isLoading && !error && batches.length === 0 && (
          <div className="p-12 text-center text-sm text-on-surface/40 font-medium">
            Belum ada data batch produksi
          </div>
        )}

        {!isLoading && !error && batches.length > 0 && (
          <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant/80 text-xs font-bold uppercase tracking-widest border-b border-outline-variant/10">
                <th className="px-8 py-5">ID Batch</th>
                <th className="px-8 py-5">Nama Resep</th>
                <th className="px-8 py-5">Volume</th>
                <th className="px-8 py-5">Efisiensi</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {batches.map((batch) => {
                const { label, cls } = getStatusStyle(batch.status);
                const eff = batch.efisiensi ?? 0;
                return (
                  <tr key={batch.id_produksi} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-8 py-6 font-bold text-primary font-mono">{batch.kode_batch}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-on-surface capitalize">{batch.jamu?.nama_jamu ?? '—'}</div>
                      {batch.jamu?.jenis && (
                        <div className="text-xs text-on-surface-variant font-medium capitalize">{batch.jamu.jenis}</div>
                      )}
                    </td>
                    <td className="px-8 py-6 font-bold text-on-surface-variant">
                      {batch.volume_output != null ? `${batch.volume_output} L` : '—'}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`${getEffClass(batch.efisiensi)} h-full rounded-full transition-all`}
                            style={{ width: `${eff}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{eff > 0 ? `${eff}%` : '—'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 ${cls} border text-[10px] font-extrabold rounded-full tracking-wider shadow-sm`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-xs text-on-surface-variant font-medium">
                      {new Date(batch.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
