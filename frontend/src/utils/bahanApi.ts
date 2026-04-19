/**
 * API calls untuk fitur Bahan (Ingredient)
 * Digunakan untuk semua operasi CRUD bahan di inventory
 */

export interface Bahan {
  id?: string | number;
  nama: string;
  kategori: string;
  satuan: string;
  stokAwal: number;
  hargaSatuan: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BahanResponse {
  success: boolean;
  message: string;
  data?: Bahan | Bahan[];
}

const API_BASE_URL = '/api';

/**
 * Tambah bahan baru ke inventory
 */
export const addBahan = async (bahan: Omit<Bahan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bahan> => {
  const response = await fetch(`${API_BASE_URL}/bahan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bahan),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Gagal menambah bahan' }));
    throw new Error(errorData.message || 'Gagal menambah bahan');
  }

  const data = await response.json() as BahanResponse;
  if (Array.isArray(data.data) || !data.data) {
    throw new Error('Invalid response format');
  }
  return data.data;
};

/**
 * Dapatkan semua bahan di inventory
 */
export const getBahanList = async (): Promise<Bahan[]> => {
  const response = await fetch(`${API_BASE_URL}/bahan`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data bahan');
  }

  const data = await response.json() as BahanResponse;
  return Array.isArray(data.data) ? data.data : [];
};

/**
 * Dapatkan detail bahan berdasarkan ID
 */
export const getBahanById = async (id: string | number): Promise<Bahan> => {
  const response = await fetch(`${API_BASE_URL}/bahan/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data bahan');
  }

  const data = await response.json() as BahanResponse;
  if (Array.isArray(data.data) || !data.data) {
    throw new Error('Invalid response format');
  }
  return data.data;
};

/**
 * Update bahan yang sudah ada
 */
export const updateBahan = async (
  id: string | number,
  bahan: Partial<Omit<Bahan, 'id'>>
): Promise<Bahan> => {
  const response = await fetch(`${API_BASE_URL}/bahan/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bahan),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Gagal mengupdate bahan' }));
    throw new Error(errorData.message || 'Gagal mengupdate bahan');
  }

  const data = await response.json() as BahanResponse;
  if (Array.isArray(data.data) || !data.data) {
    throw new Error('Invalid response format');
  }
  return data.data;
};

/**
 * Hapus bahan dari inventory
 */
export const deleteBahan = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/bahan/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus bahan' }));
    throw new Error(errorData.message || 'Gagal menghapus bahan');
  }
};
