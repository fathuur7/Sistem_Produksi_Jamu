import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface JamuOption {
  id_jamu: number;
  nama_jamu: string;
  jenis?: string;
}

export interface CreateBatchPayload {
  id_jamu: number;
  ukuran_batch: number;
  catatan?: string;
}

export interface CreatedBatch {
  id_produksi: number;
  kode_batch: string;
  status: string;
}

async function fetchJamuList(): Promise<JamuOption[]> {
  const res = await fetch('/api/jamu', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat daftar jamu');
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

async function postCreateBatch(payload: CreateBatchPayload): Promise<CreatedBatch> {
  const res = await fetch('/api/produksi', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Gagal membuat batch');
  return json.data as CreatedBatch;
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: jamuList = [], isLoading: isLoadingJamu } = useQuery({
    queryKey: ['jamu-list-for-batch'],
    queryFn: fetchJamuList,
    staleTime: 60_000,
  });

  async function createBatch(payload: CreateBatchPayload): Promise<CreatedBatch> {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await postCreateBatch(payload);
      // Invalidate semua query yang bergantung pada data produksi
      await queryClient.invalidateQueries({ queryKey: ['production-queue'] });
      await queryClient.invalidateQueries({ queryKey: ['active-cycle'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { jamuList, isLoadingJamu, createBatch, isSubmitting, error };
}
