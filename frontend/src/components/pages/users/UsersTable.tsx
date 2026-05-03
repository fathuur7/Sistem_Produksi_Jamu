import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

interface UserRow {
  id_user: number;
  username: string | null;
  email: string | null;
  id_kota: number | null;
  nama_kota: string | null;
}

async function fetchUsers(): Promise<UserRow[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Anda belum login');

  const res = await fetch('/api/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((json as { message?: string } | null)?.message || 'Gagal memuat data user');
  }

  const data = (json as { data?: UserRow[] } | null)?.data;
  return Array.isArray(data) ? data : [];
}

export default function UsersTable() {
  const [filter, setFilter] = useState('');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users-list'],
    queryFn: fetchUsers,
  });

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.username ?? ''} ${u.email ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, filter]);

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden mb-10">
      {/* Table Toolbar */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/50 border-b border-outline-variant/5">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter berdasarkan username atau email..."
            className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-8 text-on-surface-variant">Memuat data user...</div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="p-8 text-error">
          {error instanceof Error ? error.message : 'Gagal memuat data user'}
        </div>
      )}

      {/* Table Content */}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50">User</th>
                <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50">Kota</th>
                <th className="px-8 py-5 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/50 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.map((u) => (
                <tr key={u.id_user} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant/10">
                        <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                          person
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-primary">{u.username ?? '—'}</p>
                        <p className="text-xs text-on-surface-variant/70 font-medium font-mono">{u.email ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-on-surface">{u.nama_kota ?? '—'}</p>
                    <p className="text-xs text-on-surface-variant/70 font-medium tracking-wide mt-0.5">ID Kota: {u.id_kota ?? '—'}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-on-surface-variant/50 hover:bg-surface-container-high hover:text-primary rounded-lg transition-colors shadow-sm border border-transparent hover:border-outline-variant/20">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="px-8 py-10 text-on-surface-variant" colSpan={3}>
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!isLoading && !error && (
        <div className="px-8 py-6 bg-surface-container-lowest border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-on-surface-variant/60 tracking-wide uppercase">
            Menampilkan {filtered.length} dari {users.length} user
          </p>
        </div>
      )}
    </div>
  );
}
