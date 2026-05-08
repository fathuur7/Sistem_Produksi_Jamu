// ============================================
// Types and Interfaces - Inventory System
// ============================================

/**
 * Raw data from backend
 */
export interface BahanItem {
  id: string | number;
  nama: string;
  kategori: string;
  satuan: string;
  stokAwal: number;
  threshold: number;
  hargaSatuan?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Display-ready inventory item with calculated properties
 */
export interface InventoryItem {
  id: string | number;
  name: string;
  variety: string;
  category: string;
  stock: number;
  threshold: number;
  unit: string;
  status: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  statusClass: string;
  statusDot: string;
  barFill: string;
  barPercentage: string;
}

/**
 * Form submission data for save operation
 */
export interface SaveBahanData {
  nama: string;
  kategori: string;
  satuan: string;
  stokAwal: number;
  threshold: number;
  hargaSatuan: number;
}

/**
 * Stock adjustment data
 */
export interface AdjustStockData {
  id: string | number;
  quantity: number;
  type: 'add' | 'reduce';
}

/**
 * Status styling configuration
 */
export interface StatusStyle {
  bgColor: string;
  iconColor: string;
  statusClass: string;
  statusDot: string;
  barFill: string;
  icon: string;
}

/**
 * Generic API response wrapper
 */
export interface APIResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

/**
 * Stock status enum
 */
export type StatusType = 'Sehat' | 'Peringatan' | 'Kritis' | 'Kosong';
