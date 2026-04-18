// src/pages/Cities.tsx
import { Helmet } from 'react-helmet-async';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

export default function Cities() {
  // Dummy data sementara sebelum disambung ke backend
  const cities = [
    { id: 1, name: 'Bangkalan', description: 'Madura' },
    { id: 2, name: 'Sampang', description: 'Madura' },
    { id: 3, name: 'Pamekasan', description: 'Madura' },
    { id: 4, name: 'Sumenep', description: 'Madura' },
  ];

  return (
    <>
      <Helmet>
        <title>Kelola Kota | Penjamu Handal</title>
        <meta name="description" content="Kelola data master kota asal jamu." />
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body">
        <Sidebar />

        <div className="ml-72 min-h-screen flex flex-col">
          <TopBar />

          <main className="p-8 space-y-10 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold font-headline">Daftar Kota</h1>
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                Tambah Kota
              </button>
            </div>

            <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">No</th>
                    <th className="px-6 py-4 font-semibold">Nama Kota</th>
                    <th className="px-6 py-4 font-semibold">Keterangan</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {cities.map((city, index) => (
                    <tr key={city.id} className="hover:bg-surface-container-highest/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-primary">{city.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{city.description}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button className="text-secondary hover:text-secondary/80 transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button className="text-error hover:text-error/80 transition-colors" title="Hapus">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}