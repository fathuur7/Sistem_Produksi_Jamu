// ============================================
// Inventory Service Layer - API Calls
// ============================================

import type { BahanItem, SaveBahanData, APIResponse, InventoryItem } from '../types/inventory';
import { getStatus, getStatusStyles, calculateBarPercentage } from '../utils/inventory';

/**
 * Fetch all bahan (raw materials) from API
 */
export async function fetchBahanData(): Promise<InventoryItem[]> {
  try {
    const response = await fetch('/api/bahan');
    if (!response.ok) {
      throw new Error('Gagal mengambil data bahan');
    }

    const data: APIResponse<BahanItem[]> = await response.json();
    const bahanList = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];

    return bahanList.map((item, index) => {
      const threshold = Number(item.threshold) || 10;
      const stock = Number(item.stokAwal) || 0;
      const status = getStatus(stock, threshold);
      const statusStyles = getStatusStyles(status);

      return {
        id: item.id || index + 1,
        name: item.nama || 'Unknown',
        variety: item.kategori && item.satuan ? `${item.kategori} - ${item.satuan}` : '',
        category: item.kategori || 'Umum',
        stock,
        threshold,
        unit: item.satuan || 'kg',
        hargaSatuan: Number(item.hargaSatuan) || 0,
        status,
        icon: statusStyles.icon,
        bgColor: statusStyles.bgColor,
        iconColor: statusStyles.iconColor,
        statusClass: statusStyles.statusClass,
        statusDot: statusStyles.statusDot,
        barFill: statusStyles.barFill,
        barPercentage: calculateBarPercentage(stock, threshold),
      };
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal mengambil data bahan');
  }
}

/**
 * Save (create/update) bahan
 */
export async function saveBahan(data: SaveBahanData, mode: 'add' | 'edit', id?: string | number): Promise<BahanItem> {
  try {
    const url = mode === 'add' ? '/api/bahan' : `/api/bahan/${id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Gagal ${mode === 'add' ? 'menambah' : 'mengubah'} bahan`);
    }

    const result: APIResponse<BahanItem> = await response.json();
    return result.data || ({} as BahanItem);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal menyimpan data bahan');
  }
}

/**
 * Delete bahan
 */
export async function deleteBahan(id: string | number): Promise<void> {
  try {
    const response = await fetch(`/api/bahan/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Gagal menghapus bahan');
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal menghapus data');
  }
}

/**
 * Adjust stock (add or reduce)
 */
export async function adjustStock(
  id: string | number,
  quantity: number,
  type: 'add' | 'reduce',
  reason: string = 'Restock dari inventory'
): Promise<void> {
  try {
    const response = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity, type, reason }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Gagal menyesuaikan stok');
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal adjust stok');
  }
}
