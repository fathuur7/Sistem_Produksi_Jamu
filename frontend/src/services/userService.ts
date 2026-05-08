export type UserRole = 'admin' | 'supervisor' | 'staff';

export interface UserRecord {
  id_user: number;
  id_kota: number | null;
  username: string;
  email: string;
  role: UserRole;
  created_at?: string | null;
  kota?: {
    nama_kota: string;
  } | null;
}

export interface CityOption {
  id_kota: number;
  nama_kota: string;
  ket_kota?: string | null;
}

export interface UserPayload {
  username: string;
  email: string;
  role: UserRole;
  id_kota: number | null;
  password?: string;
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((json as { message?: string }).message || fallbackMessage);
  }

  return json as T;
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const response = await fetch('/api/users', {
    credentials: 'include',
  });

  const json = await parseResponse<{ data?: UserRecord[] }>(response, 'Gagal memuat data staf');
  return Array.isArray(json.data) ? json.data : [];
}

export async function fetchCities(): Promise<CityOption[]> {
  const response = await fetch('/api/kota', {
    credentials: 'include',
  });

  const json = await parseResponse<CityOption[]>(response, 'Gagal memuat daftar kota');
  return Array.isArray(json) ? json : [];
}

export async function createUser(payload: UserPayload) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseResponse<{ message: string }>(response, 'Gagal menambahkan pengguna');
}

export async function updateUser(id: number, payload: Omit<UserPayload, 'password'>) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseResponse<{ message: string }>(response, 'Gagal memperbarui pengguna');
}

export async function updateUserPassword(id: number, password: string) {
  const response = await fetch(`/api/users/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  });

  return parseResponse<{ message: string }>(response, 'Gagal memperbarui password');
}

export async function deleteUser(id: number) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return parseResponse<{ message: string }>(response, 'Gagal menghapus pengguna');
}
