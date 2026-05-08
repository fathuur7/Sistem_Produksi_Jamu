// ============================================
// Inventory Utility Functions
// ============================================

import type { StatusType, StatusStyle } from '../types/inventory';

/**
 * Determine status berdasarkan stock dan threshold
 */
export function getStatus(stock: number, threshold: number): StatusType {
  if (stock === 0) return 'Kosong';
  if (stock <= threshold) return 'Kritis';
  if (stock <= threshold * 1.5) return 'Peringatan';
  return 'Sehat';
}

/**
 * Get status styling configuration
 */
export function getStatusStyles(status: StatusType): StatusStyle {
  const styles: Record<StatusType, StatusStyle> = {
    'Sehat': {
      bgColor: 'bg-tertiary-fixed',
      iconColor: 'text-on-tertiary-fixed-variant',
      statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      statusDot: 'bg-on-tertiary-container',
      barFill: 'bg-on-tertiary-container',
      icon: 'eco',
    },
    'Peringatan': {
      bgColor: 'bg-secondary-fixed',
      iconColor: 'text-on-secondary-fixed-variant',
      statusClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
      statusDot: 'bg-secondary-container',
      barFill: 'bg-secondary-container',
      icon: 'spa',
    },
    'Kritis': {
      bgColor: 'bg-error-container',
      iconColor: 'text-on-error-container',
      statusClass: 'bg-error-container text-on-error-container',
      statusDot: 'bg-error',
      barFill: 'bg-error',
      icon: 'fireplace',
    },
    'Kosong': {
      bgColor: 'bg-outline',
      iconColor: 'text-on-surface/50',
      statusClass: 'bg-outline text-on-surface/70',
      statusDot: 'bg-outline',
      barFill: 'bg-outline',
      icon: 'delete_sweep',
    },
  };
  return styles[status];
}

/**
 * Format progress bar percentage
 */
export function calculateBarPercentage(stock: number, threshold: number): string {
  return `${Math.min(100, (stock / threshold) * 100)}%`;
}

/**
 * Validate form data
 */
export function validateBahanForm(nama: string, kategori: string, satuan: string): { valid: boolean; error?: string } {
  if (!nama || !kategori || !satuan) {
    return { valid: false, error: 'Nama, kategori, dan satuan wajib diisi' };
  }
  return { valid: true };
}
