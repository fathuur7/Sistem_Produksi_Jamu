import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';

interface JamuItem {
  id_jamu: number;
  nama_jamu: string;
  ket_jamu?: string | null;
  jenis?: string | null;
  perizinan?: string | null;
  aturan_pakai?: string | null;
  kandungan?: string | null;
  lokasi_produksi?: string | null;
  target_output?: number | null;
  satuan_output?: string | null;
}

interface KomposisiDetail {
  id_bahan: number;
  nama_bahan: string;
  kebutuhan_resep: number;
  satuan_resep: string;
  kebutuhan_total: number;
  kebutuhan_in_stok_unit: number;
  stok_gudang: number;
  satuan_gudang: string;
  sisa_stok_estimasi: number;
  status: 'AMAN' | 'KURANG';
}

interface RequirementsData {
  jamu: JamuItem;
  ukuran_batch: number;
  total_estimasi_output: number | null;
  satuan_output: string | null;
  komposisi_detail: KomposisiDetail[];
}

interface ProductionBatch {
  id_produksi: number;
  kode_batch: string;
  ukuran_batch: number;
  status: 'antrian' | 'ekstraksi' | 'botolisasi' | 'selesai';
  volume_output: number | null;
  efisiensi: number | null;
  catatan: string | null;
  created_at: string;
  jamu: {
    nama_jamu: string;
    jenis: string | null;
    satuan_output?: string | null;
  } | null;
  operator: {
    username: string;
  } | null;
}

export default function Production() {
  const [jamuList, setJamuList] = useState<JamuItem[]>([]);
  const [isLoadingJamuList, setIsLoadingJamuList] = useState(true);
  const [selectedJamuId, setSelectedJamuId] = useState<number | ''>('');
  const [ukuranBatch, setUkuranBatch] = useState<number>(1);
  const [catatan, setCatatan] = useState<string>('');

  const [requirements, setRequirements] = useState<RequirementsData | null>(null);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [execSuccessData, setExecSuccessData] = useState<{ id_produksi: number; kode_batch: string } | null>(null);

  // Production History states
  const [historyList, setHistoryList] = useState<ProductionBatch[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [advancingId, setAdvancingId] = useState<number | null>(null);

  // Fetch Jamu List & Production History
  useEffect(() => {
    async function loadJamu() {
      try {
        setIsLoadingJamuList(true);
        const res = await fetch('/api/v2/produksi/jamu');
        if (!res.ok) {
          throw new Error('Gagal memuat daftar resep jamu.');
        }
        const data = await res.json();
        setJamuList(Array.isArray(data) ? data : []);
      } catch (err: any) {
        toast.error(err.message || 'Gagal memuat daftar jamu');
      } finally {
        setIsLoadingJamuList(false);
      }
    }

    loadJamu();
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setIsLoadingHistory(true);
      const res = await fetch('/api/produksi');
      if (!res.ok) {
        throw new Error('Gagal mengambil data riwayat produksi.');
      }
      const json = await res.json();
      setHistoryList(json.data || json || []);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat riwayat produksi');
    } finally {
      setIsLoadingHistory(false);
    }
  }

  // Fetch Requirements in Real-time when select or batch changes
  useEffect(() => {
    if (!selectedJamuId) {
      setRequirements(null);
      setReqError(null);
      return;
    }

    const controller = new AbortController();
    async function loadRequirements() {
      try {
        setIsLoadingRequirements(true);
        setReqError(null);
        const params = new URLSearchParams({
          id_jamu: String(selectedJamuId),
          ukuran_batch: String(ukuranBatch || 1),
        });
        const res = await fetch(`/api/v2/produksi/requirements?${params.toString()}`, {
          signal: controller.signal,
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Gagal memuat kebutuhan bahan baku.');
        }
        setRequirements(json.data || json);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setReqError(err.message || 'Gagal mengambil data kebutuhan.');
          setRequirements(null);
        }
      } finally {
        setIsLoadingRequirements(false);
      }
    }

    const timeoutId = setTimeout(() => {
      loadRequirements();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedJamuId, ukuranBatch]);

  // Selected Jamu Info helper
  const selectedJamu = jamuList.find((j) => j.id_jamu === Number(selectedJamuId)) || null;

  // Validation checks
  const hasShortage = requirements?.komposisi_detail?.some((k) => k.status === 'KURANG') ?? false;
  const noIngredients = !requirements?.komposisi_detail || requirements.komposisi_detail.length === 0;
  const isProcessDisabled =
    !selectedJamuId ||
    ukuranBatch <= 0 ||
    hasShortage ||
    noIngredients ||
    isLoadingRequirements ||
    isExecuting;

  // Handle Production Execution
  async function handleProcessProduction() {
    if (isProcessDisabled) return;

    try {
      setIsExecuting(true);
      const res = await fetch('/api/v2/produksi/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_jamu: Number(selectedJamuId),
          ukuran_batch: ukuranBatch,
          catatan: catatan.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal memproses produksi.');
      }

      const successData = json.data || json;
      setExecSuccessData(successData);
      toast.success(`Produksi Berhasil! Batch ${successData.kode_batch || ''} telah dicatat.`);

      // Refresh history list
      loadHistory();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses batch produksi');
    } finally {
      setIsExecuting(false);
    }
  }

  // Handle Advance Status
  async function handleAdvanceStatus(id: number) {
    try {
      setAdvancingId(id);
      const res = await fetch(`/api/produksi/${id}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal menaikkan status batch.');
      }
      toast.success(json.message || 'Status batch diperbarui!');
      loadHistory();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui status');
    } finally {
      setAdvancingId(null);
    }
  }

  function handleReset() {
    setSelectedJamuId('');
    setUkuranBatch(1);
    setCatatan('');
    setRequirements(null);
    setReqError(null);
    setExecSuccessData(null);
  }

  return (
    <>
      <Helmet>
        <title>Konsol Produksi Staf | Penjamu Handal</title>
        <meta name="description" content="Halaman produksi jamu madura bagi staf produksi." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto pb-24 space-y-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-sm font-bold text-amber-500 uppercase tracking-widest">
                <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
                <span>Konsol Produksi Staf</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Eksekusi Batch Produksi</h2>
              <p className="text-gray-500 text-sm">
                Pilih resep jamu, tentukan ukuran batch, dan validasi stok bahan baku secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Staff Mode
              </span>
            </div>
          </div>

          {/* Workbench Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form & Recipe Details (40% width on large screen) */}
            <div className="col-span-1 lg:col-span-5 space-y-6">
              {/* Form Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <span className="material-symbols-outlined text-amber-500">receipt_long</span>
                  Konfigurasi Produksi
                </h3>

                <div className="space-y-5">
                  {/* Select Jamu */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih Resep Jamu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedJamuId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedJamuId(val ? Number(val) : '');
                        }}
                        disabled={isLoadingJamuList}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none pr-10 font-medium"
                      >
                        <option value="">-- Pilih Jamu --</option>
                        {jamuList.map((j) => (
                          <option key={j.id_jamu} value={j.id_jamu}>
                            {j.nama_jamu} {j.jenis ? `(${j.jenis})` : ''}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                    {isLoadingJamuList && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="animate-spin text-xs material-symbols-outlined">sync</span>
                        Memuat daftar resep...
                      </p>
                    )}
                  </div>

                  {/* Input Batch */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jumlah Batch Produksi <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUkuranBatch((b) => Math.max(1, b - 1))}
                        disabled={ukuranBatch <= 1}
                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px] font-bold">remove</span>
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={ukuranBatch}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setUkuranBatch(isNaN(val) ? 1 : Math.max(1, val));
                        }}
                        className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl py-3 font-bold text-gray-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setUkuranBatch((b) => b + 1)}
                        className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px] font-bold">add</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Setiap batch melipatgandakan seluruh kebutuhan bahan resep.
                    </p>
                  </div>

                  {/* Catatan Produksi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Produksi <span className="text-gray-400">(Opsional)</span>
                    </label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tulis instruksi tambahan, detail shift kerja, atau catatan kualitas..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Jamu Detail Card */}
              {selectedJamu && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">info</span>
                    Detail Spesifikasi Jamu
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="col-span-2 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <span className="text-gray-400 block mb-0.5">Nama Formula</span>
                      <span className="text-base font-bold text-gray-800">{selectedJamu.nama_jamu}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Jenis Jamu</span>
                      <span className="font-semibold text-gray-700 capitalize bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block">
                        {selectedJamu.jenis || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Izin Edar BPOM</span>
                      <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block">
                        {selectedJamu.perizinan || 'Tidak Ada'}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-gray-400 block mb-0.5">Kandungan Utama</span>
                      <span className="font-medium text-gray-700 block bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        {selectedJamu.ket_jamu || 'Tidak ada keterangan kandungan.'}
                      </span>
                    </div>

                    {selectedJamu.aturan_pakai && (
                      <div className="col-span-2">
                        <span className="text-gray-400 block mb-0.5">Aturan Pakai</span>
                        <span className="font-medium text-gray-700 block bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          {selectedJamu.aturan_pakai}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Real-time Stock Validation Table & Execute (70% width on large screen) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col space-y-6">
              {/* Validation Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">fact_check</span>
                    Tabel Validasi Stok Real-Time
                  </h3>
                  {selectedJamu && requirements && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                      {requirements.komposisi_detail.length} Komponen
                    </span>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col justify-center">
                  {!selectedJamuId ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <span className="material-symbols-outlined text-[32px]">science</span>
                      </div>
                      <h4 className="text-base font-bold text-gray-700 mb-1">Menunggu Pemilihan Jamu</h4>
                      <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Silakan pilih resep jamu di sebelah kiri untuk menganalisis kecukupan stok bahan di gudang secara otomatis.
                      </p>
                    </div>
                  ) : isLoadingRequirements ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-500 text-sm font-medium">Menganalisis kebutuhan resep & stok gudang...</p>
                    </div>
                  ) : reqError ? (
                    <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-800 space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="material-symbols-outlined">warning</span>
                        Error Validasi
                      </div>
                      <p className="text-sm">{reqError}</p>
                    </div>
                  ) : requirements ? (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      {/* Table wrapper */}
                      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                        <table className="w-full text-left text-sm text-gray-600">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="p-4 font-semibold text-gray-800">Nama Bahan</th>
                              <th className="p-4 font-semibold text-gray-800 text-center">Kebutuhan (Resep × Batch)</th>
                              <th className="p-4 font-semibold text-gray-800 text-center">Stok Gudang</th>
                              <th className="p-4 font-semibold text-gray-800 text-center">Estimasi Sisa</th>
                              <th className="p-4 font-semibold text-gray-800 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {noIngredients ? (
                              <tr>
                                <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                                  Resep ini tidak memiliki komponen bahan terdaftar.
                                </td>
                              </tr>
                            ) : (
                              requirements.komposisi_detail.map((k) => {
                                const isAman = k.status === 'AMAN';
                                return (
                                  <tr key={k.id_bahan} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">{k.nama_bahan}</td>
                                    <td className="p-4 text-center">
                                      <div className="font-semibold text-gray-700">
                                        {k.kebutuhan_total.toLocaleString('id-ID', { maximumFractionDigits: 3 })} {k.satuan_resep}
                                      </div>
                                      <div className="text-[10px] text-gray-400">
                                        Base: {k.kebutuhan_resep} {k.satuan_resep}
                                      </div>
                                    </td>
                                    <td className="p-4 text-center font-medium text-gray-600">
                                      {k.stok_gudang.toLocaleString('id-ID', { maximumFractionDigits: 3 })} {k.satuan_gudang}
                                    </td>
                                    <td className={`p-4 text-center font-bold ${k.sisa_stok_estimasi >= 0 ? 'text-gray-600' : 'text-red-500'}`}>
                                      {k.sisa_stok_estimasi.toLocaleString('id-ID', { maximumFractionDigits: 3 })} {k.satuan_gudang}
                                    </td>
                                    <td className="p-4 text-center">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase inline-flex items-center gap-1 ${
                                          isAman
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}
                                      >
                                        <span className="material-symbols-outlined text-[14px]">
                                          {isAman ? 'check_circle' : 'cancel'}
                                        </span>
                                        {k.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Calculations summary & execution panel */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        {/* Target output details */}
                        {requirements.total_estimasi_output != null && (
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex justify-between items-center text-amber-900">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm flex items-center justify-center">
                                <span className="material-symbols-outlined">inventory_2</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold">Total Estimasi Output Produksi</h4>
                                <p className="text-xs text-amber-700">Dihitung otomatis berdasarkan base resep × jumlah batch.</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-extrabold text-amber-600">
                                {requirements.total_estimasi_output}
                              </span>
                              <span className="text-xs font-bold block text-amber-700">
                                {requirements.satuan_output || 'botol'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Shortage warning */}
                        {hasShortage && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-900 flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                            <div className="text-sm">
                              <h4 className="font-bold mb-1">Stok Bahan Baku Tidak Mencukupi!</h4>
                              <p className="text-red-700 text-xs">
                                Tombol "Proses Produksi" dinonaktifkan karena satu atau lebih bahan baku tidak memenuhi kuota resep. Silakan ajukan pengadaan bahan atau edit formula.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleReset}
                            className="px-5 py-3.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm w-full sm:w-auto text-center"
                          >
                            Reset Form
                          </button>
                          <button
                            type="button"
                            onClick={handleProcessProduction}
                            disabled={isProcessDisabled}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                              isProcessDisabled
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                                : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]'
                            }`}
                          >
                            {isExecuting ? (
                              <>
                                <span className="animate-spin text-sm material-symbols-outlined">sync</span>
                                Memproses Produksi...
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                                Proses Produksi Sekarang
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Riwayat Batch Produksi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">history</span>
                  Riwayat Alur Batch Produksi
                </h3>
                <p className="text-xs text-gray-400 mt-1">Pantau dan kendalikan proses per tahapan batch produksi aktif Anda.</p>
              </div>
              <button
                onClick={loadHistory}
                disabled={isLoadingHistory}
                className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                title="Refresh Riwayat"
              >
                <span className={`material-symbols-outlined text-[20px] ${isLoadingHistory ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-800">Kode Batch</th>
                    <th className="p-4 font-semibold text-gray-800">Nama Jamu</th>
                    <th className="p-4 font-semibold text-gray-800 text-center">Batch Size</th>
                    <th className="p-4 font-semibold text-gray-800 text-center">Output Riil</th>
                    <th className="p-4 font-semibold text-gray-800 text-center">Operator / Tanggal</th>
                    <th className="p-4 font-semibold text-gray-800 text-center">Status Tahapan</th>
                    <th className="p-4 font-semibold text-gray-800 text-center">Aksi Kendali</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center space-y-2">
                        <span className="animate-spin text-2xl text-amber-500 material-symbols-outlined">sync</span>
                        <p className="text-xs text-gray-400">Memuat data riwayat...</p>
                      </td>
                    </tr>
                  ) : historyList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                        Belum ada riwayat batch produksi terdaftar.
                      </td>
                    </tr>
                  ) : (
                    historyList.map((batch) => {
                      const date = new Date(batch.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      
                      let statusBadge = '';
                      let statusLabel = '';
                      if (batch.status === 'antrian') {
                        statusBadge = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                        statusLabel = 'Antrian';
                      } else if (batch.status === 'ekstraksi') {
                        statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                        statusLabel = 'Ekstraksi';
                      } else if (batch.status === 'botolisasi') {
                        statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                        statusLabel = 'Botolisasi';
                      } else if (batch.status === 'selesai') {
                        statusBadge = 'bg-green-50 text-green-700 border-green-200';
                        statusLabel = 'Selesai';
                      }

                      return (
                        <tr key={batch.id_produksi} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg text-xs">
                              {batch.kode_batch}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{batch.jamu?.nama_jamu || '—'}</div>
                            {batch.catatan && (
                              <div className="text-[11px] text-gray-400 italic mt-0.5">
                                "{batch.catatan}"
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center font-semibold text-gray-700">
                            {batch.ukuran_batch} Batch
                          </td>
                          <td className="p-4 text-center">
                            {batch.status === 'selesai' ? (
                              <div>
                                <span className="font-bold text-green-600">
                                  {batch.volume_output != null ? `${parseFloat(String(batch.volume_output)).toLocaleString('id-ID')} ${batch.jamu?.satuan_output || 'botol'}` : '—'}
                                </span>
                                {batch.efisiensi != null && (
                                  <span className="text-[10px] text-gray-400 block">
                                    Efisiensi: {batch.efisiensi}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">—</span>
                            )}
                          </td>
                          <td className="p-4 text-center text-xs">
                            <div className="font-medium text-gray-700">@{batch.operator?.username || 'operator'}</div>
                            <div className="text-gray-400 mt-0.5">{date}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 border rounded-full text-xs font-bold ${statusBadge}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {batch.status === 'selesai' ? (
                              <span className="text-green-500 font-bold text-xs inline-flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                Sukses
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdvanceStatus(batch.id_produksi)}
                                disabled={advancingId !== null}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                              >
                                {advancingId === batch.id_produksi ? (
                                  <>
                                    <span className="animate-spin text-xs material-symbols-outlined">sync</span>
                                    Proses...
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    {batch.status === 'antrian' && 'Mulai Ekstraksi'}
                                    {batch.status === 'ekstraksi' && 'Mulai Botolisasi'}
                                    {batch.status === 'botolisasi' && 'Selesaikan'}
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </AppShell>

      {/* Success Visual Confirmation Modal */}
      {execSuccessData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center border border-gray-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Elegant Background Glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-50"></div>

            {/* Checkmark Circle */}
            <div className="w-20 h-20 bg-green-50 text-green-500 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm scale-110">
              <span className="material-symbols-outlined text-[48px] animate-bounce">check_circle</span>
            </div>

            {/* Modal Titles */}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Produksi Sukses & Tercatat!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Batch produksi berhasil dijalankan dan semua pemakaian stok bahan baku telah dipotong dari inventory secara otomatis.
            </p>

            {/* Summary Details */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left space-y-2.5 mb-8 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Kode Batch</span>
                <span className="font-mono font-bold text-gray-700 bg-gray-200/50 px-2 py-0.5 rounded text-xs">
                  {execSuccessData.kode_batch}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Jamu Diproduksi</span>
                <span className="font-bold text-gray-800">{selectedJamu?.nama_jamu}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Jumlah Batch</span>
                <span className="font-bold text-gray-800">{ukuranBatch} Batch</span>
              </div>
              {requirements?.total_estimasi_output != null && (
                <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                  <span className="text-gray-400 font-medium">Estimasi Output</span>
                  <span className="font-extrabold text-green-600">
                    {requirements.total_estimasi_output} {requirements.satuan_output || 'botol'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Close */}
            <button
              onClick={handleReset}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-[0.98]"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
