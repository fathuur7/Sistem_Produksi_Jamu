import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface FormResepProps {
  onClose?: () => void;
  recipe?: {
    id_jamu: number;
    nama_jamu: string;
    jenis: string | null;
    perizinan: string | null;
    aturan_pakai: string | null;
    kandungan: string | null;
    lokasi_produksi: string | null;
    target_output: number | null;
    satuan_output: string | null;
    komposisi: Array<{
      id_bahan: number;
      kebutuhan: number;
      satuan_kebutuhan: string;
    }>;
  };
}

export default function FormResep({ onClose, recipe }: FormResepProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!recipe;

  // 1. State Input Master Jamu (Sesuai kolom baru database)
  const [jamuData, setJamuData] = useState({
    nama_jamu: '',
    jenis: 'cair',
    perizinan: 'BPOM',
    aturan_pakai: '',
    kandungan: '',
    lokasi_produksi: 'Laboratorium Utama',
    target_output: '',
    satuan_output: 'botol'
  });

  // 2. State Komposisi Bahan Baku (Bisa bertambah baris secara dinamis)
  const [komposisi, setKomposisi] = useState([
    { id_bahan: '', kebutuhan: '', satuan_kebutuhan: 'kg' }
  ]);

  // Pre-fill form when editing
  useEffect(() => {
    if (recipe) {
      setJamuData({
        nama_jamu: recipe.nama_jamu,
        jenis: recipe.jenis || 'cair',
        perizinan: recipe.perizinan || 'BPOM',
        aturan_pakai: recipe.aturan_pakai || '',
        kandungan: recipe.kandungan || '',
        lokasi_produksi: recipe.lokasi_produksi || 'Laboratorium Utama',
        target_output: recipe.target_output ? String(recipe.target_output) : '',
        satuan_output: recipe.satuan_output || 'botol'
      });
      if (recipe.komposisi && recipe.komposisi.length > 0) {
        setKomposisi(recipe.komposisi.map(k => ({
          id_bahan: String(k.id_bahan),
          kebutuhan: String(k.kebutuhan),
          satuan_kebutuhan: k.satuan_kebutuhan
        })));
      }
    }
  }, [recipe]);

  // Fetch daftar seluruh bahan baku dari gudang untuk dropdown resep
  const { data: bahanList, isLoading: isLoadingBahan } = useQuery({
    queryKey: ['bahan-list-for-dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/bahan', { credentials: 'include' });
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    }
  });

  // Handle perubahan input master jamu
  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJamuData(prev => ({ ...prev, [name]: value }));
  };

  // Handle perubahan input baris resep/komposisi
  const handleKomposisiChange = (index: number, field: string, value: string) => {
    const nextKomposisi = [...komposisi];
    nextKomposisi[index] = { ...nextKomposisi[index], [field]: value };
    
    // Auto-fill satuan resep mengikuti satuan dasar bahan di gudang saat dipilih
    if (field === 'id_bahan' && bahanList) {
      const selectedBahan = bahanList.find((b: any) => String(b.id) === value);
      if (selectedBahan) {
        nextKomposisi[index].satuan_kebutuhan = selectedBahan.satuan || 'kg';
      }
    }
    setKomposisi(nextKomposisi);
  };

  // Tambah baris input bahan baku baru
  const addBahanRow = () => {
    setKomposisi(prev => [...prev, { id_bahan: '', kebutuhan: '', satuan_kebutuhan: 'kg' }]);
  };

  // Hapus baris input bahan baku
  const removeBahanRow = (index: number) => {
    if (komposisi.length === 1) {
      toast.error('Resep jamu minimal harus memiliki 1 jenis bahan baku!');
      return;
    }
    setKomposisi(prev => prev.filter((_, i) => i !== index));
  };

  // Mutation untuk mengirim seluruh data resep ke API Backend
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/v2/produksi/resep/${recipe!.id_jamu}` : '/api/v2/produksi/resep';
      
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} resep`);
      return json;
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Resep berhasil diperbarui!' : 'Resep Master Jamu baru berhasil disimpan!');
      queryClient.invalidateQueries({ queryKey: ['admin-recipes-crud'] });
      queryClient.invalidateQueries({ queryKey: ['jamu-list-for-production'] });
      if (onClose) onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Terjadi kesalahan sistem backend');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jamuData.nama_jamu.trim()) return toast.error('Nama jamu tidak boleh kosong!');
    
    // Validasi baris resep yang diisi
    const filteredKomposisi = komposisi.filter(item => item.id_bahan && Number(item.kebutuhan) > 0);
    if (filteredKomposisi.length === 0) {
      return toast.error('Harap isi minimal 1 bahan baku dengan takaran yang valid!');
    }

    const payload = {
      ...jamuData,
      target_output: jamuData.target_output ? Number(jamuData.target_output) : 0,
      komposisi: filteredKomposisi.map(item => ({
        id_bahan: Number(item.id_bahan),
        kebutuhan: parseFloat(item.kebutuhan),
        satuan_kebutuhan: item.satuan_kebutuhan
      }))
    };

    saveMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Perbarui Base Recipe Jamu' : 'Form Pembuatan Base Recipe Jamu'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isEditMode ? 'Ubah data target output dan komposisi resep dasar.' : 'Definisikan 1 resep dasar (Base Recipe). Misal: 1 resep menghasilkan 100 botol.'}
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* SECTION 1: MASTER DATA JAMU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Produk Jamu *</label>
          <input 
            type="text" name="nama_jamu" required value={jamuData.nama_jamu} onChange={handleMasterChange}
            placeholder="Misal: Jamu Kunyit Asam Segar"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Sediaan</label>
            <select name="jenis" value={jamuData.jenis} onChange={handleMasterChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500">
              <option value="cair">Cair / Jamu Gendong</option>
              <option value="serbuk">Serbuk Instan</option>
              <option value="kapsul">Kapsul</option>
              <option value="pil">Pil Tradisional</option>
              <option value="selai">Selai / Pasta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sertifikasi / Izin</label>
            <select name="perizinan" value={jamuData.perizinan} onChange={handleMasterChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500">
              <option value="BPOM">Izin BPOM</option>
              <option value="Kemenkes">Kemenkes RI</option>
              <option value="P-IRT">P-IRT Industri Rumah Tangga</option>
              <option value="None">Belum Berizin</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Output (Hasil dari 1 Base Recipe)</label>
            <input 
              type="number" name="target_output" placeholder="Misal: 50" value={jamuData.target_output} onChange={handleMasterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Satuan Output</label>
            <input 
              type="text" name="satuan_output" placeholder="Misal: botol, sachet, pcs" value={jamuData.satuan_output} onChange={handleMasterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi Workshop Produksi</label>
            <input 
              type="text" name="lokasi_produksi" value={jamuData.lokasi_produksi} onChange={handleMasterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Aturan Konsumsi / Aturan Pakai</label>
          <textarea 
            name="aturan_pakai" rows={2} value={jamuData.aturan_pakai} onChange={handleMasterChange}
            placeholder="Misal: Diminum 2x sehari 1 botol setelah makan malam secara rutin."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Informasi Kandungan Tambahan (Opsional)</label>
          <textarea 
            name="kandungan" rows={2} value={jamuData.kandungan} onChange={handleMasterChange}
            placeholder="Catatan kandungan makro atau senyawa aktif tanaman obat..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* SECTION 2: DINAMIS FORM INPUT REPAHAN RESEP */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Kebutuhan Bahan per Base Recipe</h3>
            <p className="text-gray-500 text-xs">Pilih bahan baku dan takaran pasti yang dibutuhkan untuk menghasilkan output di atas.</p>
          </div>
          <button 
            type="button" onClick={addBahanRow}
            className="inline-flex items-center gap-1 text-sm bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Tambah Bahan
          </button>
        </div>

        <div className="space-y-3">
          {komposisi.map((row, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {/* Dropdown Pilihan Bahan */}
              <div className="flex-1">
                <select 
                  required
                  value={row.id_bahan}
                  onChange={(e) => handleKomposisiChange(idx, 'id_bahan', e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Bahan Baku / Kemasan --</option>
                  {isLoadingBahan ? (
                    <option disabled>Memuat data gudang...</option>
                  ) : (
                    bahanList?.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.nama} (Stok: {b.stokAwal} {b.satuan})</option>
                    ))
                  )}
                </select>
              </div>

              {/* Input Takaran Kebutuhan */}
              <div className="w-1/4">
                <input 
                  type="number" step="0.01" required placeholder="Takaran" value={row.kebutuhan}
                  onChange={(e) => handleKomposisiChange(idx, 'kebutuhan', e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Satuan Kebutuhan (Teks / Bisa di-override) */}
              <div className="w-24">
                <input 
                  type="text" required placeholder="Satuan" value={row.satuan_kebutuhan}
                  onChange={(e) => handleKomposisiChange(idx, 'satuan_kebutuhan', e.target.value)}
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-center text-gray-600 font-semibold"
                />
              </div>

              {/* Tombol Hapus Baris */}
              <button 
                type="button" onClick={() => removeBahanRow(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SUBMIT BUTTON PANEL */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        {onClose && (
          <button 
            type="button" onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        )}
        <button 
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-1 px-8 py-2.5 bg-amber-500 text-gray-900 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-amber-400 disabled:bg-gray-300 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">{isEditMode ? 'edit' : 'save'}</span>
          {saveMutation.isPending ? (isEditMode ? 'Memperbarui...' : 'Menyimpan...') : (isEditMode ? 'Perbarui Resep' : 'Simpan Resep')}
        </button>
      </div>
    </form>
  );
}