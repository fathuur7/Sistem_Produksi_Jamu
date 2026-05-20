import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import FormResep from '../../components/pages/recipes/FormResep';

export default function Recipes() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [detailRecipe, setDetailRecipe] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch list pakai endpoint V2 (raw SQL, tidak pakai model Rempah)
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['admin-recipes-crud'],
    queryFn: async () => {
      const res = await fetch('/api/v2/produksi/jamu');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Gagal memuat data resep');
      }
      return res.json();
    }
  });

  // Delete pakai endpoint V2 (raw SQL)
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v2/produksi/resep/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: 'Gagal menghapus resep' }));
        throw new Error(json.message);
      }
    },
    onSuccess: () => {
      toast.success('Resep berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-recipes-crud'] });
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus resep')
  });

  // Fetch recipe detail pakai endpoint V2 (raw SQL, tidak pakai model Rempah)
  const fetchRecipeDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/v2/produksi/jamu/${id}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Gagal memuat detail');
      }
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat detail resep');
      return null;
    }
  };

  const handleEdit = async (id: number) => {
    const data = await fetchRecipeDetail(id);
    if (data && data.jamu) {
      const formattedForForm = {
        ...data.jamu,
        komposisi: (data.komposisi_detail || []).map((k: any) => ({
          id_bahan: k.id_bahan,
          kebutuhan: k.kebutuhan_resep,
          satuan_kebutuhan: k.satuan_resep
        }))
      };
      setEditingRecipe(formattedForForm);
      setIsFormOpen(true);
    }
  };

  const handleDetail = async (id: number) => {
    const data = await fetchRecipeDetail(id);
    if (data) setDetailRecipe(data);
  };

  return (
    <>
      <Helmet>
        <title>Perpustakaan Resep | Penjamu Handal</title>
        <meta name="description" content="Manajemen formula herbal dan resep jamu tradisional." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-6 md:p-12 max-w-7xl w-full mx-auto pb-24">
          
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manajemen Resep (CRUD)</h2>
              <p className="text-gray-500 text-sm">Kelola master data resep dan komposisi bahan baku.</p>
            </div>
            <button 
              onClick={() => { setEditingRecipe(null); setIsFormOpen(true); }}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm"
            >
              + Buat Resep Baru
            </button>
          </div>

          {/* Tabel Manajemen Resep */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-800">ID</th>
                    <th className="p-4 font-semibold text-gray-800">Nama Jamu</th>
                    <th className="p-4 font-semibold text-gray-800">Jenis</th>
                    <th className="p-4 font-semibold text-gray-800">Perizinan</th>
                    <th className="p-4 font-semibold text-gray-800">Target Output</th>
                    <th className="p-4 font-semibold text-gray-800 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-400">Memuat data...</td></tr>
                  ) : (
                    Array.isArray(recipes) && recipes.map((r: any) => (
                      <tr key={r.id_jamu} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">#{r.id_jamu}</td>
                        <td className="p-4 font-bold text-gray-800">{r.nama_jamu}</td>
                        <td className="p-4 capitalize">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{r.jenis || '-'}</span>
                        </td>
                        <td className="p-4">{r.perizinan || '-'}</td>
                        <td className="p-4">
                          {r.target_output ? `${r.target_output} ${r.satuan_output || ''}` : '-'}
                        </td>
                        <td className="p-4 flex justify-end gap-2">
                          <button onClick={() => handleDetail(r.id_jamu)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Detail</button>
                          <button onClick={() => handleEdit(r.id_jamu)} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">Edit</button>
                          <button onClick={() => { if(confirm('Hapus resep ini secara permanen?')) deleteMutation.mutate(r.id_jamu); }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!isLoading && (!recipes || recipes.length === 0) && (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-400">Belum ada data resep.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Modal Form Resep */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-4xl my-auto animate-in fade-in zoom-in duration-200">
              <FormResep onClose={() => { setIsFormOpen(false); setEditingRecipe(null); }} recipe={editingRecipe} />
            </div>
          </div>
        )}

        {/* Modal Detail Resep */}
        {detailRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl my-auto animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{detailRecipe.jamu.nama_jamu}</h3>
                  <p className="text-sm text-gray-500 capitalize">{detailRecipe.jamu.jenis || 'Umum'} • {detailRecipe.jamu.perizinan || 'Tidak Berizin'}</p>
                </div>
                <button onClick={() => setDetailRecipe(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div><span className="text-gray-500 block mb-1">Target Output (Base Recipe)</span><span className="font-semibold text-gray-800">{detailRecipe.jamu.target_output || '-'} {detailRecipe.jamu.satuan_output || '-'}</span></div>
                <div><span className="text-gray-500 block mb-1">Lokasi Produksi</span><span className="font-semibold text-gray-800">{detailRecipe.jamu.lokasi_produksi || '-'}</span></div>
                <div className="col-span-2"><span className="text-gray-500 block mb-1">Aturan Pakai</span><span className="font-semibold text-gray-800">{detailRecipe.jamu.aturan_pakai || '-'}</span></div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Komposisi Bahan Baku (per Base Recipe)</h4>
                {detailRecipe.komposisi_detail && detailRecipe.komposisi_detail.length > 0 ? (
                  <ul className="space-y-2">
                    {detailRecipe.komposisi_detail.map((k: any) => (
                      <li key={k.id_bahan} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white shadow-sm hover:border-amber-200 transition-colors">
                        <span className="font-medium text-gray-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-500 text-[18px]">science</span>
                          {k.nama_bahan}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                            {k.kebutuhan_resep} {k.satuan_resep}
                          </span>
                          {k.stok_gudang != null && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${k.stok_gudang >= k.kebutuhan_resep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Stok: {k.stok_gudang} {k.satuan_gudang}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">Tidak ada data komposisi bahan baku.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </>
  );
}
