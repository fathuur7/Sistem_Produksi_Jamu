import { useDeferredValue, useMemo, useState } from 'react';
import type { UserRecord, UserRole } from '../../../services/userService';

interface UsersTableProps {
  users: UserRecord[];
  isLoading: boolean;
  errorMessage: string | null;
  onAddUser: () => void;
  onEditUser: (user: UserRecord) => void;
  onDeleteUser: (user: UserRecord) => void;
  currentUserId?: number;
  isDeleting: boolean;
}

const ITEMS_PER_PAGE = 6;

function getRoleMeta(role: UserRole) {
  const map: Record<UserRole, { label: string; className: string; icon: string }> = {
    admin: {
      label: 'Administrator',
      className: 'bg-primary text-on-primary',
      icon: 'shield_person',
    },
    supervisor: {
      label: 'Supervisor',
      className: 'bg-secondary-container text-on-secondary-container',
      icon: 'supervisor_account',
    },
    staff: {
      label: 'Staff',
      className: 'bg-surface-container-high text-on-surface-variant',
      icon: 'badge',
    },
  };

  return map[role];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getRangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return '0-0';
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${start}-${end}`;
}

export default function UsersTable({
  users,
  isLoading,
  errorMessage,
  onAddUser,
  onEditUser,
  onDeleteUser,
  currentUserId,
  isDeleting,
}: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'semua' | UserRole>('semua');
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'terlama'>('terbaru');
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredUsers = useMemo(() => {
    const searched = users.filter((user) => {
      const haystack = [
        user.username,
        user.email,
        user.kota?.nama_kota ?? '',
        getRoleMeta(user.role).label,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = deferredSearch ? haystack.includes(deferredSearch) : true;
      const matchesRole = roleFilter === 'semua' ? true : user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    return searched.sort((left, right) => {
      const leftTime = new Date(left.created_at ?? 0).getTime();
      const rightTime = new Date(right.created_at ?? 0).getTime();
      return sortOrder === 'terbaru' ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [deferredSearch, roleFilter, sortOrder, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: 'semua' | UserRole) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: 'terbaru' | 'terlama') => {
    setSortOrder(value);
    setPage(1);
  };

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-[0_28px_70px_-48px_rgba(28,28,19,0.35)]">
      <div className="border-b border-surface-container bg-[linear-gradient(180deg,rgba(248,244,228,0.75),rgba(255,255,255,0.96))] px-5 py-5 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/55">Direktori Personel</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {[
                  { value: 'semua' as const, label: 'Semua Peran' },
                  { value: 'admin' as const, label: 'Admin' },
                  { value: 'supervisor' as const, label: 'Supervisor' },
                  { value: 'staff' as const, label: 'Staff' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleRoleFilterChange(item.value)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                      roleFilter === item.value
                        ? 'bg-surface text-primary shadow-[0_18px_35px_-28px_rgba(0,53,39,0.75)] ring-1 ring-outline-variant/15'
                        : 'text-on-surface-variant/80 hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onAddUser}
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-primary/14 bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/92"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
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
                placeholder="Cari berdasarkan username, email, atau kota..."
                className="w-full rounded-2xl border border-outline-variant/18 bg-surface px-12 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-primary/25"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleSortChange('terbaru')}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                  sortOrder === 'terbaru'
                    ? 'bg-surface text-primary ring-1 ring-outline-variant/15'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">south</span>
                Terbaru
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('terlama')}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                  sortOrder === 'terlama'
                    ? 'bg-surface text-primary ring-1 ring-outline-variant/15'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">north</span>
                Terlama
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-lowest">
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50">Personel</th>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50">Peran yang Ditetapkan</th>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50">Wilayah & Registrasi</th>
              <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-outline-variant/5">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <div className="inline-flex items-center gap-3 text-on-surface/45">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm font-medium">Memuat direktori staf...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && errorMessage && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <div className="mx-auto max-w-md rounded-[1.5rem] bg-error-container/35 px-6 py-8 text-on-error-container">
                    <p className="text-base font-bold">Gagal memuat data staf</p>
                    <p className="mt-2 text-sm opacity-80">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !errorMessage && pagedUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="mx-auto max-w-lg">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-container text-primary shadow-inner">
                      <span className="material-symbols-outlined text-3xl">manage_accounts</span>
                    </div>
                    <h4 className="mt-5 font-headline text-2xl font-bold text-primary">Belum ada staf yang cocok</h4>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      Coba ubah filter pencarian atau tambahkan akun baru agar tim langsung punya akses kerja yang dibutuhkan.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !errorMessage && pagedUsers.map((user) => {
              const role = getRoleMeta(user.role);
              const isCurrentUser = currentUserId === user.id_user;

              return (
                <tr key={user.id_user} className="group transition-colors hover:bg-surface-container-low/30">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-on-primary shadow-sm">
                        {getInitials(user.username)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-primary">{user.username}</p>
                          {isCurrentUser && (
                            <span className="inline-flex items-center rounded-full bg-primary-fixed/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-container">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs font-medium text-on-surface-variant/70">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-widest shadow-sm ${role.className}`}>
                      <span className="material-symbols-outlined text-[14px]">{role.icon}</span>
                      {role.label}
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-on-surface">{user.kota?.nama_kota ?? 'Kota belum dipilih'}</p>
                    <p className="mt-0.5 text-xs font-medium tracking-wide text-on-surface-variant/70">
                      {user.created_at
                        ? `Terdaftar ${new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : 'Tanggal registrasi belum tersedia'}
                    </p>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/14 bg-white px-3.5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        disabled={isDeleting || isCurrentUser}
                        className="inline-flex items-center gap-2 rounded-xl border border-error/18 bg-white px-3.5 py-2.5 text-sm font-bold text-error transition-colors hover:bg-error/6 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-surface-container bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,244,228,0.85))] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
          Menampilkan {getRangeLabel(safePage, ITEMS_PER_PAGE, filteredUsers.length)} dari {filteredUsers.length} personel
        </p>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-on-surface-variant/65">
            Halaman {safePage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={safePage === 1}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/18 bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-primary hover:text-white hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={safePage >= totalPages || filteredUsers.length === 0}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
