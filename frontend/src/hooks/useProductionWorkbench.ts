import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

export interface JamuOption {
  id_jamu: number;
  nama_jamu: string;
  jenis?: string | null;
  perizinan?: string | null;
  target_output?: number | null;
  satuan_output?: string | null;
}

export interface ProdusenInfo {
  nama_produsen: string;
  alamat?: string | null;
  kota?: string | null;
  kontak?: string | null;
  email?: string | null;
  status?: string | null;
}

export interface RequirementItem {
  id_rempah: number;
  nama_rempah: string;
  banyak_rempah: string | null;
  satuan_resep: string | null;
  kebutuhan_total: number | null;
  bahan: {
    id: number;
    nama: string;
    kategori: string | null;
    satuan: string | null;
    stok: number;
    threshold: number;
  } | null;
  kebutuhan_in_stok_unit: number | null;
  sisa_stok_estimasi: number | null;
  status: 'OK' | 'LOW' | 'KURANG' | 'BUTUH INPUT' | 'TIDAK TERDAFTAR' | string;
}

export interface ProductionRequirements {
  jamu: {
    id_jamu: number;
    nama_jamu: string;
    ket_jamu: string | null;
    jenis: string | null;
    perizinan: string | null;
    produsen: ProdusenInfo | null;
    komposisi: Array<{ id_rempah: number; nama_rempah: string; banyak_rempah: string | null }>;
  };
  ukuran_batch: number | null;
  komposisi_detail: RequirementItem[];
}

function normalizeUnit(unit?: string | null): string | null {
  const raw = String(unit ?? '').trim().toLowerCase();
  if (!raw) return null;
  const map: Record<string, string> = {
    g: 'g', gram: 'g', gr: 'g',
    kg: 'kg',
    mg: 'mg',
    ml: 'ml',
    l: 'l', liter: 'l',
    pcs: 'pcs', buah: 'pcs', butir: 'pcs',
  };
  return map[raw] ?? raw;
}

function convertQty(value: number, fromUnit: string, toUnit: string): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from || !to) return null;
  if (from === to) return value;

  const massFactorToG: Record<string, number> = { mg: 0.001, g: 1, kg: 1000 };
  const volFactorToMl: Record<string, number> = { ml: 1, l: 1000 };

  if (massFactorToG[from] != null && massFactorToG[to] != null) {
    const inG = value * massFactorToG[from];
    return inG / massFactorToG[to];
  }
  if (volFactorToMl[from] != null && volFactorToMl[to] != null) {
    const inMl = value * volFactorToMl[from];
    return inMl / volFactorToMl[to];
  }
  return null;
}

function formatNumber(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toLocaleString('id-ID', { maximumFractionDigits: digits }) : '—';
}

async function fetchJamuList(): Promise<JamuOption[]> {
  const res = await fetch('/api/v2/produksi/jamu', { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal memuat daftar jamu');
  const json = await res.json();
  if (Array.isArray(json)) return json as JamuOption[];
  if (json && Array.isArray((json as any).data)) return (json as any).data as JamuOption[];
  return [];
}

async function fetchRequirements(id_jamu: number, ukuran_batch: number): Promise<ProductionRequirements> {
  const params = new URLSearchParams({ id_jamu: String(id_jamu), ukuran_batch: String(ukuran_batch) });
  const res = await fetch(`/api/v2/produksi/requirements?${params.toString()}`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Gagal memuat kebutuhan bahan');
  return (json.data ?? json) as ProductionRequirements;
}

export interface MaterialInput {
  qty: string;
  unit: string; // unit input
}

export interface ExecutePayload {
  id_jamu: number;
  ukuran_batch: number;
  catatan?: string;
  materials: Array<{ id_bahan: number; qty: number; unit: string }>;
}

async function postExecute(payload: ExecutePayload) {
  const res = await fetch('/api/v2/produksi/execute', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Gagal eksekusi batch');
  return json.data;
}

export function useProductionWorkbench() {
  const [selectedJamuId, setSelectedJamuId] = useState<number | null>(null);
  const [targetProduksiStr, setTargetProduksiStr] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');

  const targetProduksi = Number(targetProduksiStr);
  const isTargetValid = Number.isFinite(targetProduksi) && targetProduksi > 0;

  const jamuQuery = useQuery({
    queryKey: ['jamu-list-for-production'],
    queryFn: fetchJamuList,
    staleTime: 60_000,
  });

  const selectedJamu = useMemo(() => {
    return jamuQuery.data?.find(j => j.id_jamu === selectedJamuId) ?? null;
  }, [jamuQuery.data, selectedJamuId]);

  const multiplier = useMemo(() => {
    if (!isTargetValid) return null;
    if (selectedJamu && selectedJamu.target_output) {
      return targetProduksi / selectedJamu.target_output;
    }
    return targetProduksi; // Fallback jika tidak ada base output
  }, [targetProduksi, isTargetValid, selectedJamu]);

  const isMultiplierValid = multiplier !== null && multiplier > 0;

  const reqQuery = useQuery({
    queryKey: ['produksi-requirements', selectedJamuId, multiplier],
    queryFn: () => fetchRequirements(selectedJamuId!, multiplier!),
    enabled: !!selectedJamuId && isMultiplierValid,
  });

  // Inputs per bahan (key = bahanId)
  const [inputs, setInputs] = useState<Record<number, MaterialInput>>({});

  useEffect(() => {
    if (!reqQuery.data) return;

    const next: Record<number, MaterialInput> = {};
    for (const item of reqQuery.data.komposisi_detail ?? []) {
      if (!item.bahan?.id) continue;
      const unit = String(item.bahan.satuan ?? '').trim() || 'kg';
      const defaultQty = item.kebutuhan_in_stok_unit;
      next[item.bahan.id] = {
        qty: defaultQty != null && Number.isFinite(defaultQty) ? String(Number(defaultQty.toFixed(2))) : '',
        unit,
      };
    }
    setInputs(next);
  }, [reqQuery.data?.jamu?.id_jamu, reqQuery.data?.ukuran_batch]);

  const computed = useMemo(() => {
    const items = reqQuery.data?.komposisi_detail ?? [];

    const rows = items.map((item) => {
      const bahan = item.bahan;
      const input = bahan ? inputs[bahan.id] : undefined;

      const inputQty = input?.qty ? Number(input.qty) : null;
      const inputUnit = input?.unit ?? bahan?.satuan ?? null;

      const stock = bahan?.stok ?? null;
      const threshold = bahan?.threshold ?? null;
      const stockUnit = bahan?.satuan ?? null;

      let qtyInStockUnit: number | null = null;
      if (bahan && inputQty != null && Number.isFinite(inputQty) && inputQty > 0 && stockUnit && inputUnit) {
        qtyInStockUnit = convertQty(inputQty, inputUnit, stockUnit);
      }

      const remaining = (bahan && stock != null && qtyInStockUnit != null) ? stock - qtyInStockUnit : null;

      let status: 'OK' | 'LOW' | 'KURANG' | 'BUTUH INPUT' | 'TIDAK TERDAFTAR' = 'BUTUH INPUT';
      if (!bahan) status = 'TIDAK TERDAFTAR';
      else if (qtyInStockUnit == null) status = 'BUTUH INPUT';
      else if (remaining != null && remaining < 0) status = 'KURANG';
      else if (remaining != null && threshold != null && remaining <= threshold) status = 'LOW';
      else status = 'OK';

      // helper display: convert to gram if mass
      const massToG = (bahan && qtyInStockUnit != null && stockUnit) ? convertQty(qtyInStockUnit, stockUnit, 'g') : null;

      return {
        item,
        bahan,
        category: bahan?.kategori ?? 'Rempah',
        stock,
        stockUnit,
        threshold,
        inputQty: input?.qty ?? '',
        inputUnit: input?.unit ?? (bahan?.satuan ?? ''),
        qtyInStockUnit,
        remaining,
        status,
        display: {
          stock: stock != null && stockUnit ? `${formatNumber(stock, 2)} ${stockUnit}` : '—',
          target: item.kebutuhan_total != null ? `${formatNumber(item.kebutuhan_total, 2)} ${item.satuan_resep || ''}` : '—',
          remaining: remaining != null && stockUnit ? `${formatNumber(remaining, 2)} ${stockUnit}` : '—',
          usedHint: massToG != null && Number.isFinite(massToG) ? `${formatNumber(massToG, 0)} g` : null,
        },
      };
    });

    const blockingIssues: string[] = [];
    const missing = rows.filter(r => !r.bahan);
    if (missing.length > 0) blockingIssues.push(`Ada ${missing.length} bahan belum terdaftar di inventory (bahan).`);

    const invalidInputs = rows.filter(r => r.bahan && (!r.inputQty || Number(r.inputQty) <= 0 || !Number.isFinite(Number(r.inputQty))));
    if (invalidInputs.length > 0) blockingIssues.push(`Ada ${invalidInputs.length} bahan belum diisi jumlah pemakaiannya.`);

    const insufficient = rows.filter(r => r.status === 'KURANG');
    if (insufficient.length > 0) blockingIssues.push(`Stok tidak mencukupi untuk ${insufficient.length} bahan.`);

    return { rows, blockingIssues };
  }, [reqQuery.data?.komposisi_detail, inputs]);

  const executeMutation = useMutation({
    mutationFn: postExecute,
  });

  async function executeBatch() {
    if (!selectedJamuId) throw new Error('Pilih jamu terlebih dulu');
    if (!isTargetValid || !isMultiplierValid) throw new Error('Target produksi tidak valid');
    if (!reqQuery.data) throw new Error('Kebutuhan bahan belum dimuat');

    const materials: ExecutePayload['materials'] = [];
    for (const r of computed.rows) {
      if (!r.bahan) continue;
      const qty = Number(r.inputQty);
      const unit = r.inputUnit;
      if (!Number.isFinite(qty) || qty <= 0) continue;
      materials.push({ id_bahan: r.bahan.id, qty, unit });
    }

    const payload: ExecutePayload = {
      id_jamu: selectedJamuId,
      ukuran_batch: multiplier,
      catatan: catatan || undefined,
      materials,
    };

    return executeMutation.mutateAsync(payload);
  }

  function updateInput(bahanId: number, patch: Partial<MaterialInput>) {
    setInputs(prev => ({
      ...prev,
      [bahanId]: {
        qty: patch.qty ?? prev[bahanId]?.qty ?? '',
        unit: patch.unit ?? prev[bahanId]?.unit ?? 'kg',
      },
    }));
  }

  return {
    jamuList: jamuQuery.data ?? [],
    isLoadingJamuList: jamuQuery.isLoading,
    jamuListError: jamuQuery.error instanceof Error ? jamuQuery.error.message : null,

    selectedJamuId,
    setSelectedJamuId,
    selectedJamu,
    targetProduksiStr,
    setTargetProduksiStr,
    targetProduksi,
    isTargetValid,
    multiplier,
    catatan,
    setCatatan,

    requirements: reqQuery.data ?? null,
    isLoadingRequirements: reqQuery.isLoading,
    requirementsError: reqQuery.error instanceof Error ? reqQuery.error.message : null,

    inputs,
    updateInput,
    computed,

    executeBatch,
    isExecuting: executeMutation.isPending,
    executeError: executeMutation.error instanceof Error ? executeMutation.error.message : null,
  };
}
