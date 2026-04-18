import { Helmet } from 'react-helmet-async';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

export default function Benefits() {
  const benefits = [
    { id: 1, name: 'Menambah stamina tubuh', description: 'Khasiat Umum' },
    { id: 2, name: 'Merapatkan area kewanitaan', description: 'Khasiat Khusus' },
    { id: 3, name: 'Mengurangi bau badan', description: 'Khasiat Umum' },
    { id: 4, name: 'Mengatasi keputihan', description: 'Khasiat Khusus' },
    { id: 5, name: 'Melancarkan haid', description: 'Khasiat Khusus' },
  ];

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
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Tambah Khasiat
              </button>
            </div>

            <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">No</th>
                    <th className="px-6 py-4 font-semibold">Nama Khasiat</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {benefits.map((benefit, index) => (
                    <tr key={benefit.id} className="hover:bg-surface-container-highest/50">
                      <td className="px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-primary">{benefit.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{benefit.description}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button className="text-secondary"><span className="material-symbols-outlined text-xl">edit</span></button>
                          <button className="text-error"><span className="material-symbols-outlined text-xl">delete</span></button>
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