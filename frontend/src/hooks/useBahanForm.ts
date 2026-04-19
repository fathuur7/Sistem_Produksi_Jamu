import { useState } from 'react';
import type { BahanForm } from '../components/pages/inventory/InventoryTambahBahan';

interface UseBahanFormReturn {
  form: BahanForm;
  loading: boolean;
  error: string | null;
  success: boolean;
  errors: Partial<Record<keyof BahanForm, string>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  resetMessages: () => void;
}

export function useBahanForm(onSuccess?: () => void): UseBahanFormReturn {
  const [form, setForm] = useState<BahanForm>({
    nama: '',
    kategori: '',
    satuan: '',
    stokAwal: '',
    hargaSatuan: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BahanForm, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BahanForm, string>> = {};

    if (!form.nama.trim()) {
      newErrors.nama = 'Nama bahan wajib diisi';
    }
    if (!form.kategori.trim()) {
      newErrors.kategori = 'Kategori wajib dipilih';
    }
    if (!form.satuan.trim()) {
      newErrors.satuan = 'Satuan wajib dipilih';
    }
    if (!form.stokAwal || Number(form.stokAwal) < 0) {
      newErrors.stokAwal = 'Stok awal harus angka positif';
    }
    if (!form.hargaSatuan || Number(form.hargaSatuan) < 0) {
      newErrors.hargaSatuan = 'Harga satuan harus angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Hapus error saat user mengetik
    if (errors[name as keyof BahanForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/bahan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: form.nama.trim(),
          kategori: form.kategori.trim(),
          satuan: form.satuan.trim(),
          stokAwal: Number(form.stokAwal),
          hargaSatuan: Number(form.hargaSatuan),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Gagal menambah bahan';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Jika response bukan JSON, gunakan default message
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      resetForm();

      // Panggil callback jika ada
      onSuccess?.();

      // Reset success message setelah 3 detik
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menambah bahan'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nama: '',
      kategori: '',
      satuan: '',
      stokAwal: '',
      hargaSatuan: '',
    });
    setErrors({});
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    form,
    loading,
    error,
    success,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    resetMessages,
  };
}
