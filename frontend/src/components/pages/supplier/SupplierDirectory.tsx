import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { SupplierRecord } from '../../../pages/admin/Supplier';
import { queryClient } from '../../../utils/queryClient';

interface SupplierDirectoryProps {
  modalState: {
    isOpen: boolean;
    mode: 'add' | 'edit';
    supplier: SupplierRecord | null;
  };
  onAddSupplier: () => void;
  onEditSupplier: (supplier: SupplierRecord) => void;
  onCloseModal: () => void;
}

interface SupplierFormState {
  nama_produsen: string;
  alamat: string;
  kota: string;
  kontak: string;
  email: string;
  status: 'aktif' | 'menunggu' | 'ditangguhkan';
}

const initialFormState: SupplierFormState = {
  nama_produsen: '',
  alamat: '',
  kota: '',
  kontak: '',
  email: '',
  status: 'aktif',
};

function toSupplierFormState(supplier: SupplierRecord | null): SupplierFormState {
  if (!supplier) {
    return initialFormState;
  }

  return {
    nama_produsen: supplier.nama_produsen,
    alamat: supplier.alamat ?? '',
    kota: supplier.kota ?? '',
    kontak: supplier.kontak ?? '',
    email: supplier.email ?? '',
    status: supplier.status,
  };
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    aktif: 'border-transparent bg-tertiary-fixed text-on-tertiary-fixed-variant',
    menunggu: 'border-transparent bg-secondary-container text-on-secondary-container',
    ditangguhkan: 'border-transparent bg-error-container text-on-error-container',
  };
  return map[status] ?? 'border-outline-variant/20 bg-surface-container text-on-surface-variant';
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    aktif: 'Aktif',
    menunggu: 'Menunggu Kontrak',
    ditangguhkan: 'Ditangguhkan',
  };
  return map[status] ?? status;
}

function getSupplierInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getRegisteredLabel(createdAt?: string | null) {
  if (!createdAt) {
    return 'Data lama';
  }

  return new Date(createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getRangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return '0-0';
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${start}-${end}`;
}

async function fetchSuppliers(filter: string, search: string): Promise<SupplierRecord[]> {
  const params = new URLSearchParams();

  if (filter && filter !== 'semua') {
    params.set('status', filter);
  }

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const query = params.toString();
  const res = await fetch(`/api/supplier${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Gagal memuat pemasok');
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

async function saveSupplier(payload: SupplierFormState, mode: 'add' | 'edit', supplierId?: number) {
  const response = await fetch(mode === 'add' ? '/api/supplier' : `/api/supplier/${supplierId}`, {
    method: mode === 'add' ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || 'Gagal menyimpan pemasok');
  }

  return json;
}

async function deleteSupplier(id: number) {
  const response = await fetch(`/api/supplier/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || 'Gagal menghapus pemasok');
  }

  return json;
}

const ITEMS_PER_PAGE = 5;

export default function SupplierDirectory({
  modalState,
  onAddSupplier,
  onEditSupplier,
  onCloseModal,
}: SupplierDirectoryProps) {
  const [filter, setFilter] = useState('semua');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<SupplierFormState>(initialFormState);
  const normalizedSearch = search.trim();
  const deferredSearch = useDeferredValue(normalizedSearch);

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers', filter, deferredSearch],
    queryFn: () => fetchSuppliers(filter, deferredSearch),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: SupplierFormState) =>
      saveSupplier(payload, modalState.mode, modalState.supplier?.id_produsen),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['supplier-metrics'] });
      toast.success(modalState.mode === 'add' ? 'Pemasok ditambahkan' : 'Pemasok diperbarui');
      handleCloseModal();
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['supplier-metrics'] });
      toast.success('Pemasok dihapus');
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  const totalPages = Math.max(1, Math.ceil(suppliers.length / ITEMS_PER_PAGE));
  const paged = suppliers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCloseModal = () => {
    setFormData(initialFormState);
    onCloseModal();
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    onAddSupplier();
  };

  const handleOpenEditModal = (supplier: SupplierRecord) => {
    setFormData(toSupplierFormState(supplier));
    onEditSupplier(supplier);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.nama_produsen.trim()) {
      toast.error('Nama pemasok wajib diisi');
      return;
    }

    saveMutation.mutate({
      nama_produsen: formData.nama_produsen.trim(),
      alamat: formData.alamat.trim(),
      kota: formData.kota.trim(),
      kontak: formData.kontak.trim(),
      email: formData.email.trim(),
      status: formData.status,
    });
  };

  const handleDelete = (supplier: SupplierRecord) => {
    const confirmed = window.confirm(`Hapus pemasok "${supplier.nama_produsen}"?`);
    if (confirmed) {
      deleteMutation.mutate(supplier.id_produsen);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <>
      <section className="overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-[0_28px_70px_-48px_rgba(28,28,19,0.35)]">
        <div className="border-b border-surface-container bg-[linear-gradient(180deg,rgba(248,244,228,0.75),rgba(255,255,255,0.96))] px-5 py-5 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/55">Direktori Mitra</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {['semua', 'aktif', 'menunggu', 'ditangguhkan'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleFilterChange(item)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                        filter === item
                          ? 'bg-surface text-primary shadow-[0_18px_35px_-28px_rgba(0,53,39,0.75)] ring-1 ring-outline-variant/15'
                          : 'text-on-surface-variant/80 hover:bg-surface-container-low hover:text-primary'
                      }`}
                    >
                      {item === 'semua' ? 'Semua Pemasok' : getStatusLabel(item)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-secondary/18 bg-secondary/8 px-4 py-3 text-sm font-bold text-secondary transition-colors hover:bg-secondary/12"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tambah
              </button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full max-w-xl">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/45">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Cari nama pemasok atau kota..."
                  className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-12 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-primary/25"
                />
              </label>

              <p className="text-xs font-medium leading-relaxed text-on-surface-variant/65 lg:max-w-xs lg:text-right">
                Saring pemasok yang siap dipakai produksi, lalu kelola data kontrak tanpa pindah halaman.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-surface-container/70">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 px-6 py-20 text-on-surface/40">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm font-medium">Memuat pemasok...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto max-w-md rounded-[1.5rem] bg-error-container/35 px-6 py-8 text-on-error-container">
                <p className="text-base font-bold">Gagal memuat data pemasok</p>
                <p className="mt-2 text-sm opacity-80">Periksa koneksi backend lalu muat ulang daftar.</p>
              </div>
            </div>
          )}

          {!isLoading && !error && paged.length === 0 && (
            <div className="px-6 py-[4.5rem] text-center">
              <div className="mx-auto max-w-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-container text-primary shadow-inner">
                  <span className="material-symbols-outlined text-3xl">local_shipping</span>
                </div>
                <h4 className="mt-5 font-headline text-2xl font-bold text-primary">Belum ada pemasok yang cocok</h4>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Ubah filter, coba kata kunci lain, atau tambahkan pemasok baru agar tim produksi punya jalur pasok yang siap dipakai.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && paged.map((supplier) => (
            <article
              key={supplier.id_produsen}
              className="px-5 py-6 transition-colors hover:bg-surface-container-low/32 sm:px-7 sm:py-7"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
                <div className="flex gap-4 sm:gap-5">
                  <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.4rem] bg-primary text-2xl font-extrabold text-on-primary shadow-[inset_0_0_0_4px_rgba(255,255,255,0.78)]">
                    {getSupplierInitials(supplier.nama_produsen)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h5 className="font-headline text-[clamp(1.25rem,2.5vw,2rem)] font-bold leading-tight text-primary">
                        {supplier.nama_produsen}
                      </h5>
                      <span className={`rounded-xl border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getStatusStyle(supplier.status)}`}>
                        {getStatusLabel(supplier.status)}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-base font-medium text-on-surface-variant">
                        {supplier.kota ?? 'Lokasi belum dicatat'}
                      </p>
                      {supplier.alamat && (
                        <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant/78">
                          {supplier.alamat}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      {supplier.kontak && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface-variant shadow-inner">
                          <span className="material-symbols-outlined text-[18px]">call</span>
                          <span>{supplier.kontak}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface-variant shadow-inner">
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                          <span className="break-all">{supplier.email}</span>
                        </div>
                      )}
                      {!supplier.kontak && !supplier.email && (
                        <span className="inline-flex items-center rounded-xl bg-surface-container-low px-3 py-2 text-sm italic text-on-surface-variant/65">
                          Kontak belum tersedia
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:justify-items-end">
                  <div className="rounded-[1.35rem] bg-surface-container-low px-4 py-4 shadow-inner xl:w-full xl:max-w-[210px]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/55">Terdaftar</p>
                    <p className="mt-2 font-headline text-xl font-bold text-secondary">{getRegisteredLabel(supplier.created_at)}</p>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant/65">
                      Status {getStatusLabel(supplier.status).toLowerCase()}
                    </p>
                  </div>

                  <div className="flex gap-2 xl:w-full xl:max-w-[210px] xl:flex-col">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(supplier)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] border border-primary/12 bg-white px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(supplier)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] border border-error/18 bg-white px-4 py-3 text-sm font-bold text-error transition-colors hover:bg-error/6 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-surface-container bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,244,228,0.85))] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
            Menampilkan {getRangeLabel(page, ITEMS_PER_PAGE, suppliers.length)} dari {suppliers.length} pemasok
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-on-surface-variant/65">
              Halaman {Math.min(page, totalPages)} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/18 bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-primary hover:text-white hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page >= totalPages || suppliers.length === 0}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalState.isOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-primary/22 p-4 backdrop-blur-sm">
          <div className="mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-5xl items-center">
            <div className="overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-surface-container-lowest shadow-[0_42px_120px_-48px_rgba(28,28,19,0.55)] md:grid md:grid-cols-[0.92fr_1.08fr]">
              <aside className="hidden border-r border-outline-variant/10 bg-[linear-gradient(160deg,rgba(248,244,228,0.95),rgba(236,232,217,0.82))] p-8 md:flex md:flex-col">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">Supplier Workspace</p>
                <h4 className="mt-5 font-headline text-4xl font-extrabold leading-[0.98] text-primary">
                  {modalState.mode === 'add' ? 'Tambah pemasok baru' : 'Perbarui profil pemasok'}
                </h4>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  Simpan profil mitra, status kontrak, dan detail komunikasi agar tim pengadaan dan produksi selalu melihat sumber yang sama.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'Nama pemasok sebagai identitas utama jaringan',
                    'Status kontrak untuk menentukan prioritas tindak lanjut',
                    'Kontak dan alamat agar koordinasi lapangan lebih cepat',
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl bg-white/65 px-4 py-4 shadow-[0_16px_34px_-28px_rgba(28,28,19,0.4)]">
                      <span className="material-symbols-outlined text-secondary">check_circle</span>
                      <p className="text-sm font-medium leading-relaxed text-on-surface">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <div className="rounded-[1.6rem] bg-primary px-5 py-5 text-on-primary shadow-[0_26px_44px_-30px_rgba(0,53,39,0.7)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-primary/70">Kualitas data</p>
                    <p className="mt-2 text-sm leading-relaxed text-on-primary/88">
                      Semakin lengkap profil pemasok, semakin ringan proses restock, negosiasi, dan audit mutu bahan baku.
                    </p>
                  </div>
                </div>
              </aside>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-4 border-b border-surface-container px-6 py-6 sm:px-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">Supplier</p>
                    <h4 className="mt-2 font-headline text-2xl font-extrabold text-primary">
                      {modalState.mode === 'add' ? 'Tambah Pemasok Baru' : 'Edit Pemasok'}
                    </h4>
                  </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-2xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col">
                  <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-bold text-primary">Nama pemasok</span>
                      <input
                        value={formData.nama_produsen}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nama_produsen: e.target.value }))}
                        className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                        placeholder="CV Herbal Madura"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-primary">Kota</span>
                      <input
                        value={formData.kota}
                        onChange={(e) => setFormData((prev) => ({ ...prev, kota: e.target.value }))}
                        className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                        placeholder="Sumenep"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-primary">Status</span>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as SupplierFormState['status'] }))}
                        className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/28"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="menunggu">Menunggu</option>
                        <option value="ditangguhkan">Ditangguhkan</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-primary">Kontak</span>
                      <input
                        value={formData.kontak}
                        onChange={(e) => setFormData((prev) => ({ ...prev, kontak: e.target.value }))}
                        className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                        placeholder="0812xxxxxxx"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-primary">Email</span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                        placeholder="supplier@contoh.id"
                      />
                    </label>

                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-bold text-primary">Alamat</span>
                      <textarea
                        value={formData.alamat}
                        onChange={(e) => setFormData((prev) => ({ ...prev, alamat: e.target.value }))}
                        rows={5}
                        className="w-full resize-none rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                        placeholder="Alamat lengkap pemasok"
                      />
                    </label>
                  </div>

                  <div className="mt-auto flex flex-col-reverse gap-3 border-t border-surface-container bg-surface-container-low/28 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-2xl border border-outline-variant/18 px-5 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-white shadow-[0_24px_42px_-26px_rgba(133,83,0,0.72)] transition-colors hover:bg-secondary/92 disabled:opacity-60"
                    >
                      {saveMutation.isPending
                        ? 'Menyimpan...'
                        : modalState.mode === 'add'
                          ? 'Simpan Pemasok'
                          : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
