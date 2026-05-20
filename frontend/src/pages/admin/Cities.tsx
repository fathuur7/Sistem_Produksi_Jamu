import { Helmet } from 'react-helmet-async';
import AppShell from '../../components/layout/AppShell';

export default function Cities() {
  const supplyCities = [
    { id: 1, name: 'Bangkalan', type: 'Titik Distribusi', description: 'Jalur distribusi pesisir barat dan pelabuhan.' },
    { id: 2, name: 'Sampang',   type: 'Pemasok Bahan',   description: 'Fokus pasokan rempah dataran rendah.' },
    { id: 3, name: 'Pamekasan', type: 'Pusat Transit',   description: 'Gudang transit bahan baku utama.' },
    { id: 4, name: 'Sumenep',   type: 'Pemasok Bahan',   description: 'Pasokan rempah spesifik kepulauan timur.' },
  ];

  const badgeColor = (type: string) => {
    if (type === 'Pemasok Bahan')   return 'bg-primary-container text-on-primary-container';
    if (type === 'Titik Distribusi') return 'bg-secondary-container text-on-secondary-container';
    return 'bg-tertiary-container text-on-tertiary-container';
  };

  return (
    <>
      <Helmet>
        <title>Rantai Pasok &amp; Distribusi | Penjamu Handal</title>
        <meta name="description" content="Kelola wilayah pasokan bahan baku dan jalur distribusi jamu." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-8 space-y-6 sm:space-y-10 max-w-[1400px] w-full pb-20">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-headline">
                Wilayah Distribusi &amp; Pasokan
              </h1>
              <p className="text-on-surface-variant mt-1 text-sm sm:text-base">
                Kelola titik asal bahan baku dan tujuan distribusi hasil produksi.
              </p>
            </div>
            <button className="self-start sm:self-auto bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm">
              <span className="material-symbols-outlined text-sm">add</span>
              Tambah Wilayah
            </button>
          </div>

          {/* Table — scroll horizontal di mobile */}
          <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-semibold w-14">No</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold">Nama Daerah</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold">Peran Logistik</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold hidden md:table-cell">Keterangan Operasional</th>
                    <th className="px-4 sm:px-6 py-4 font-semibold text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {supplyCities.map((city, index) => (
                    <tr key={city.id} className="hover:bg-surface-container-highest/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                      <td className="px-4 sm:px-6 py-4 font-bold text-primary">{city.name}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor(city.type)}`}>
                          {city.type}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-on-surface-variant text-sm hidden md:table-cell">
                        {city.description}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
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
          </div>

        </main>
      </AppShell>
    </>
  );
}