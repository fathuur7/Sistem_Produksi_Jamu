import { Helmet } from 'react-helmet-async';
import AppShell from '../../components/layout/AppShell';

export default function Benefits() {
  const benefits = [
    { id: 1, name: 'Menambah stamina tubuh',        description: 'Khasiat Umum' },
    { id: 2, name: 'Merapatkan area kewanitaan',    description: 'Khasiat Khusus' },
    { id: 3, name: 'Mengurangi bau badan',           description: 'Khasiat Umum' },
    { id: 4, name: 'Mengatasi keputihan',            description: 'Khasiat Khusus' },
    { id: 5, name: 'Melancarkan haid',               description: 'Khasiat Khusus' },
  ];

  return (
    <>
      <Helmet>
        <title>Kelola Khasiat | Penjamu Handal</title>
        <meta name="description" content="Manajemen daftar khasiat produk jamu Penjamu Handal." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-8 space-y-6 sm:space-y-10 max-w-[1400px] w-full pb-20">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Daftar Khasiat</h1>
            <button className="self-start sm:self-auto bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm">
              <span className="material-symbols-outlined text-sm">add</span>
              Tambah Khasiat
            </button>
          </div>

          {/* Table — scroll horizontal di mobile */}
          <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[420px]">
                <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-semibold w-14">No</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold">Nama Khasiat</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {benefits.map((benefit, index) => (
                    <tr key={benefit.id} className="hover:bg-surface-container-highest/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                      <td className="px-4 sm:px-6 py-4 font-bold text-primary">{benefit.name}</td>
                      <td className="px-4 sm:px-6 py-4 text-on-surface-variant text-sm">{benefit.description}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-center gap-3">
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
          </div>

        </main>
      </AppShell>
    </>
  );
}