import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

interface Kota {
  id_kota: number;
  nama_kota: string | null;
  ket_kota: string | null;
}

async function fetchKota(): Promise<Kota[]> {
  const res = await fetch('/api/kota');
  if (!res.ok) throw new Error('Gagal memuat data kota');
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export default function Cities() {
  const { data: kota = [], isLoading, error } = useQuery({
    queryKey: ['kota-list'],
    queryFn: fetchKota,
  });

  return (
    <>
      <Helmet>
        <title>Daftar Kota | Penjamu Handal</title>
        <meta name="description" content="Kelola data kota (master) pada sistem." />
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body">
        <Sidebar />

        <div className="ml-72 min-h-screen flex flex-col">
          <TopBar />

          <main className="p-8 space-y-10 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-headline">Daftar Kota</h1>
                <p className="text-on-surface-variant mt-2">Data kota yang digunakan untuk relasi user.</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
              {isLoading && (
                <div className="p-8 text-on-surface-variant">Memuat data kota...</div>
              )}

              {error && !isLoading && (
                <div className="p-8 text-error">Gagal memuat data kota. Pastikan backend berjalan.</div>
              )}

              {!isLoading && !error && (
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-16">No</th>
                      <th className="px-6 py-4 font-semibold">Nama Kota</th>
                      <th className="px-6 py-4 font-semibold">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {kota.map((row, index) => (
                      <tr key={row.id_kota} className="hover:bg-surface-container-highest/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                        <td className="px-6 py-4 font-bold text-primary">{row.nama_kota ?? '—'}</td>
                        <td className="px-6 py-4 text-on-surface-variant text-sm">{row.ket_kota ?? '—'}</td>
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