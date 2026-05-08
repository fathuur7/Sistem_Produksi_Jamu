import type { Dispatch, SetStateAction } from 'react';
import type { CityOption, UserRecord, UserRole } from '../../../services/userService';

export interface UserFormState {
  username: string;
  email: string;
  role: UserRole;
  id_kota: string;
  password: string;
}

interface UsersDialogProps {
  modalState: {
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: UserRecord | null;
  };
  formData: UserFormState;
  setFormData: Dispatch<SetStateAction<UserFormState>>;
  cities: CityOption[];
  isCitiesLoading: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}

const roleOptions: Array<{ value: UserRole; label: string; helper: string }> = [
  { value: 'admin', label: 'Administrator', helper: 'Akses penuh ke seluruh modul dan direktori staf.' },
  { value: 'supervisor', label: 'Supervisor', helper: 'Mengawasi operasional dan mengelola koordinasi produksi.' },
  { value: 'staff', label: 'Staff', helper: 'Menjalankan aktivitas operasional harian dengan akses terbatas.' },
];

export default function UsersDialog({
  modalState,
  formData,
  setFormData,
  cities,
  isCitiesLoading,
  onClose,
  onSubmit,
  isSaving,
}: UsersDialogProps) {
  if (!modalState.isOpen) {
    return null;
  }

  const isEditMode = modalState.mode === 'edit';
  const panelTitle = isEditMode ? 'Edit akses personel' : 'Tambah personel baru';

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-primary/22 p-4 backdrop-blur-sm">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-5xl items-center">
        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-surface-container-lowest shadow-[0_42px_120px_-48px_rgba(28,28,19,0.55)] md:grid md:grid-cols-[0.92fr_1.08fr]">
          <aside className="hidden border-r border-outline-variant/10 bg-[linear-gradient(160deg,rgba(248,244,228,0.95),rgba(236,232,217,0.82))] p-8 md:flex md:flex-col">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">Staff Workspace</p>
            <h4 className="mt-5 font-headline text-4xl font-extrabold leading-[0.98] text-primary">{panelTitle}</h4>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Simpan profil pengguna, peran akses, dan kota kerja supaya otorisasi tetap rapi saat tim produksi bertambah.
            </p>

            <div className="mt-8 space-y-3">
              {roleOptions.map((option) => (
                <div key={option.value} className="rounded-2xl bg-white/65 px-4 py-4 shadow-[0_16px_34px_-28px_rgba(28,28,19,0.4)]">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary">admin_panel_settings</span>
                    <div>
                      <p className="text-sm font-bold text-primary">{option.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-on-surface">{option.helper}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <div className="rounded-[1.6rem] bg-primary px-5 py-5 text-on-primary shadow-[0_26px_44px_-30px_rgba(0,53,39,0.7)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-primary/70">Catatan akses</p>
                <p className="mt-2 text-sm leading-relaxed text-on-primary/88">
                  Gunakan password sementara yang kuat saat menambah akun, lalu perbarui seperlunya saat rotasi tim.
                </p>
              </div>
            </div>
          </aside>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-surface-container px-6 py-6 sm:px-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">Direktori staf</p>
                <h4 className="mt-2 font-headline text-2xl font-extrabold text-primary">
                  {isEditMode ? 'Perbarui Pengguna' : 'Tambah Pengguna'}
                </h4>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-1 flex-col">
              <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-primary">Username</span>
                  <input
                    value={formData.username}
                    onChange={(event) => setFormData((prev) => ({ ...prev, username: event.target.value }))}
                    className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                    placeholder="staff_baru"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-primary">Email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                    placeholder="tim@penjamuhandal.id"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-primary">Peran</span>
                  <select
                    value={formData.role}
                    onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                    className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/28"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-primary">Kota kerja</span>
                  <select
                    value={formData.id_kota}
                    onChange={(event) => setFormData((prev) => ({ ...prev, id_kota: event.target.value }))}
                    className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/28"
                  >
                    <option value="">{isCitiesLoading ? 'Memuat kota...' : 'Pilih kota'}</option>
                    {cities.map((city) => (
                      <option key={city.id_kota} value={String(city.id_kota)}>
                        {city.nama_kota}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-bold text-primary">
                    {isEditMode ? 'Password baru (opsional)' : 'Password sementara'}
                  </span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/40 focus:border-primary/28"
                    placeholder={isEditMode ? 'Isi hanya jika ingin mengganti password' : 'Minimal 6 karakter'}
                  />
                  <p className="text-xs leading-relaxed text-on-surface-variant/70">
                    {isEditMode
                      ? 'Biarkan kosong jika hanya ingin memperbarui profil atau peran.'
                      : 'Password ini bisa diganti lagi nanti lewat aksi edit pengguna.'}
                  </p>
                </label>
              </div>

              <div className="mt-auto flex flex-col-reverse gap-3 border-t border-surface-container bg-surface-container-low/28 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-outline-variant/18 px-5 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_24px_42px_-26px_rgba(0,53,39,0.72)] transition-colors hover:bg-primary/92 disabled:opacity-60"
                >
                  {isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
