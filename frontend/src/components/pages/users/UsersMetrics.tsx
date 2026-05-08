import type { UserRecord } from '../../../services/userService';

interface UsersMetricsProps {
  users: UserRecord[];
  isLoading: boolean;
}

export default function UsersMetrics({ users, isLoading }: UsersMetricsProps) {
  const totalUsers = users.length;
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const supervisorCount = users.filter((user) => user.role === 'supervisor').length;
  const staffCount = users.filter((user) => user.role === 'staff').length;
  const cityCount = new Set(users.map((user) => user.kota?.nama_kota).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
        <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center text-primary mb-6 shadow-inner">
          <span className="material-symbols-outlined">group</span>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-bold mb-1">Total Personel</p>
          <div className={`text-5xl font-extrabold font-headline text-primary tracking-tighter ${isLoading ? 'animate-pulse' : ''}`}>
            {isLoading ? '-' : totalUsers}
          </div>
          <p className="mt-3 text-sm font-medium text-on-surface-variant">
            {isLoading ? 'Memuat direktori staf...' : `${cityCount} kota kerja tercatat di jaringan.`}
          </p>
        </div>
      </div>

      <div className="bg-primary-fixed/40 p-8 rounded-2xl flex flex-col justify-between border border-primary-fixed-dim/20 shadow-sm">
        <div className="w-10 h-10 bg-surface-container-lowest/50 rounded-xl flex items-center justify-center text-primary-container mb-6 shadow-inner">
          <span className="material-symbols-outlined">verified_user</span>
        </div>
        <div>
          <p className="text-xs text-primary-container font-bold mb-1">Akses Tinggi</p>
          <div className={`text-5xl font-extrabold font-headline text-primary-container tracking-tighter ${isLoading ? 'animate-pulse' : ''}`}>
            {isLoading ? '-' : adminCount + supervisorCount}
          </div>
          <p className="mt-3 text-sm font-medium text-primary-container/80">
            {isLoading ? 'Memuat hak akses...' : `${adminCount} admin dan ${supervisorCount} supervisor aktif.`}
          </p>
        </div>
      </div>

      <div className="bg-secondary-container/10 p-8 rounded-2xl flex flex-col justify-between border border-secondary-container/20 shadow-sm relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 opacity-10 text-secondary pointer-events-none">
          <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        </div>
        <div className="relative z-10 w-10 h-10 bg-surface-container-lowest/50 rounded-xl flex items-center justify-center text-secondary mb-10 shadow-inner">
          <span className="material-symbols-outlined">badge</span>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-on-surface-variant font-bold mb-1">Staff Operasional</p>
          <div className={`text-3xl font-extrabold font-headline text-secondary tracking-tight ${isLoading ? 'animate-pulse' : ''}`}>
            {isLoading ? '-' : `${staffCount} Anggota`}
          </div>
          <p className="mt-3 text-sm font-medium text-on-surface-variant">
            Akun staff dipakai untuk aktivitas harian inventaris, resep, dan produksi.
          </p>
        </div>
      </div>
    </div>
  );
}
