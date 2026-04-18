import { Helmet } from 'react-helmet-async';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

export default function Cities() {
  const supplyCities = [
    { id: 1, name: 'Bangkalan', type: 'Titik Distribusi', description: 'Jalur distribusi pesisir barat dan pelabuhan.' },
    { id: 2, name: 'Sampang', type: 'Pemasok Bahan', description: 'Fokus pasokan rempah dataran rendah.' },
    { id: 3, name: 'Pamekasan', type: 'Pusat Transit', description: 'Gudang transit bahan baku utama.' },
    { id: 4, name: 'Sumenep', type: 'Pemasok Bahan', description: 'Pasokan rempah spesifik kepulauan timur.' },
  ];

  return (
    <>
      <Helmet>
        <title>Rantai Pasok & Distribusi | Penjamu Handal</title>
        <meta name="description" content="Kelola wilayah pasokan bahan baku dan jalur distribusi jamu." />
      </Helmet>

      <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body">
        <Sidebar />

        <div className="ml-72 min-h-screen flex flex-col">
          <TopBar />

          <main className="p-8 space-y-10 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-headline">Wilayah Distribusi & Pasokan</h1>
                <p className="text-on-surface-variant mt-2">Kelola titik asal bahan baku dan tujuan distribusi hasil produksi.</p>
              </div>
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                Tambah Wilayah
              </button>
            </div>

            <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high text-on-surface-variant text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">No</th>
                    <th className="px-6 py-4 font-semibold">Nama Daerah</th>
                    <th className="px-6 py-4 font-semibold">Peran Logistik</th>
                    <th className="px-6 py-4 font-semibold">Keterangan Operasional</th>
                    <th className="px-6 py-4 font-semibold text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {supplyCities.map((city, index) => (
                    <tr key={city.id} className="hover:bg-surface-container-highest/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-on-surface-variant">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-primary">{city.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          city.type === 'Pemasok Bahan' ? 'bg-primary-container text-on-primary-container' : 
                          city.type === 'Titik Distribusi' ? 'bg-secondary-container text-on-secondary-container' : 
                          'bg-tertiary-container text-on-tertiary-container'
                        }`}>
                          {city.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{city.description}</td>
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