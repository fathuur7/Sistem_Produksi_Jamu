import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

interface Khasiat {
  id_khasiat: number;
  khasiat: string | null;
  ket_khasiat: string | null;
}

async function fetchKhasiat(): Promise<Khasiat[]> {
  const res = await fetch('/api/khasiat');
  if (!res.ok) throw new Error('Gagal memuat data khasiat');
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export default function Benefits() {
  const { data: khasiat = [], isLoading, error } = useQuery({
    queryKey: ['khasiat-list'],
    queryFn: fetchKhasiat,
  });

  return (
    <>
      <Helmet>
        <title>Kelola Khasiat | Penjamu Handal</title>
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body">
        <Sidebar />

        <div className="ml-72 min-h-screen flex flex-col">
          <TopBar />

          <main className="p-8 space-y-10 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold font-headline">Daftar Khasiat</h1>
            </div>

            <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
              {isLoading && (
                <div className="p-8 text-on-surface-variant">Memuat data khasiat...</div>
              )}

              {error && !isLoading && (
                <div className="p-8 text-error">Gagal memuat data khasiat. Pastikan backend berjalan.</div>
              )}

              {!isLoading && !error && (
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-16">No</th>
                      <th className="px-6 py-4 font-semibold">Nama Khasiat</th>
                      <th className="px-6 py-4 font-semibold">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {khasiat.map((row, index) => (
                      <tr key={row.id_khasiat} className="hover:bg-surface-container-highest/50">
                        <td className="px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                        <td className="px-6 py-4 font-bold text-primary">{row.khasiat ?? '—'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{row.ket_khasiat ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}