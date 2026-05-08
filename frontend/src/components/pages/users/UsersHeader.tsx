interface UsersHeaderProps {
  totalUsers: number;
  adminCount: number;
  supervisorCount: number;
  onAddUser: () => void;
}

export default function UsersHeader({ totalUsers, adminCount, supervisorCount, onAddUser }: UsersHeaderProps) {
  return (
    <>
      <div className="mb-10 flex gap-8 overflow-x-auto border-b border-outline-variant/15">
        <button className="pb-4 text-on-surface-variant font-bold text-sm tracking-wide">Ringkasan</button>
        <button className="border-b-4 border-primary pb-4 text-primary font-bold text-sm tracking-wide">Semua Staf</button>
        <button className="pb-4 text-on-surface-variant font-bold text-sm tracking-wide">Peran Akses</button>
      </div>

      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-extrabold text-secondary tracking-widest uppercase">Tata Kelola & Akses</p>
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight">Personel & Peran</h2>
          <p className="text-on-surface-variant font-medium text-sm md:text-base max-w-xl">
            Kelola akun staf apotekeri, tetapkan hak akses kerja, dan jaga direktori tim tetap rapi dari satu layar.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="inline-flex items-center rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-primary">
              {totalUsers} akun terdaftar
            </span>
            <span className="inline-flex items-center rounded-full bg-primary-fixed/35 px-3 py-1.5 text-xs font-bold text-primary-container">
              {adminCount} admin
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary-container/30 px-3 py-1.5 text-xs font-bold text-secondary">
              {supervisorCount} supervisor
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddUser}
          className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-on-primary font-bold shadow-[0_24px_50px_-32px_rgba(0,53,39,0.72)] transition-all hover:bg-primary-container hover:text-on-primary-container md:w-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Tambah Pengguna
        </button>
      </div>
    </>
  );
}
