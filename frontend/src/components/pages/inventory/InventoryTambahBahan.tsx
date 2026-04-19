import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export interface BahanForm {
    nama: string
    kategori: string
    satuan: string
    stokAwal: string
    hargaSatuan: string
}

interface InventoryTambahBahanProps {
    onSuccess?: () => void
}

const KATEGORI_OPTIONS = [
    'Rimpang',
    'Akar',
    'Daun',
    'Buah',
    'Biji',
    'Kulit',
    'Bunga',
    'Lainnya'
]

const SATUAN_OPTIONS = ['kg', 'gram', 'liter', 'ml', 'butir', 'tangkai']

function InventoryTambahBahan({ onSuccess }: InventoryTambahBahanProps) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<BahanForm>({
        nama: '',
        kategori: '',
        satuan: '',
        stokAwal: '',
        hargaSatuan: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof BahanForm, string>>>({})

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof BahanForm, string>> = {}

        if (!form.nama.trim()) {
            newErrors.nama = 'Nama bahan wajib diisi'
        }
        if (!form.kategori.trim()) {
            newErrors.kategori = 'Kategori wajib dipilih'
        }
        if (!form.satuan.trim()) {
            newErrors.satuan = 'Satuan wajib dipilih'
        }
        if (!form.stokAwal || Number(form.stokAwal) < 0) {
            newErrors.stokAwal = 'Stok awal harus angka positif'
        }
        if (!form.hargaSatuan || Number(form.hargaSatuan) < 0) {
            newErrors.hargaSatuan = 'Harga satuan harus angka positif'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
        // Hapus error saat user mengetik
        if (errors[name as keyof BahanForm]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const payload = {
                nama: form.nama.trim(),
                kategori: form.kategori.trim(),
                satuan: form.satuan.trim(),
                stokAwal: Number(form.stokAwal),
                hargaSatuan: Number(form.hargaSatuan),
            }

            console.log('Sending payload:', payload)

            const response = await fetch('/api/bahan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)

            const responseText = await response.text()
            console.log('Response body:', responseText)

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: Gagal menambah bahan`
                
                try {
                    const errorData = JSON.parse(responseText)
                    errorMessage = errorData.message || errorMessage
                } catch {
                    // Jika response bukan JSON, gunakan default message
                    if (responseText) {
                        errorMessage = responseText
                    }
                }
                
                console.error('Error:', errorMessage)
                throw new Error(errorMessage)
            }

            try {
                const data = JSON.parse(responseText)
                console.log('Success response:', data)
            } catch {
                console.warn('Response is not JSON but status is ok')
            }

            setSuccess(true)
            setForm({
                nama: '',
                kategori: '',
                satuan: '',
                stokAwal: '',
                hargaSatuan: '',
            })

            // Refetch data inventory dari API
            console.log('Invalidating bahan-inventory query...')
            await queryClient.invalidateQueries({ queryKey: ['bahan-inventory'] })
            console.log('Query invalidated, data will refresh')

            // Panggil callback jika ada
            onSuccess?.()

            // Reset success message setelah 3 detik
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menambah bahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert Messages */}
            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-start gap-3">
                    <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
                    <div>
                        <p className="font-semibold">Terjadi Kesalahan</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-lg flex items-start gap-3">
                    <span className="material-symbols-outlined shrink-0 mt-0.5">check_circle</span>
                    <div>
                        <p className="font-semibold">Berhasil!</p>
                        <p className="text-sm opacity-90">Bahan berhasil ditambahkan ke inventaris</p>
                    </div>
                </div>
            )}

            {/* Nama Bahan */}
            <div>
                <label htmlFor="nama" className="block text-sm font-semibold text-on-surface mb-2">
                    Nama Bahan <span className="text-error">*</span>
                </label>
                <input
                    id="nama"
                    name="nama"
                    type="text"
                    placeholder="Contoh: Jahe Emprit"
                    value={form.nama}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-xl border-2 font-body text-on-surface placeholder:text-on-surface/40 transition-colors ${
                        errors.nama
                            ? 'border-error bg-error-container/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/50 focus:border-primary'
                    } focus:outline-none`}
                />
                {errors.nama && <p className="text-error text-sm mt-1">{errors.nama}</p>}
            </div>

            {/* Kategori */}
            <div>
                <label htmlFor="kategori" className="block text-sm font-semibold text-on-surface mb-2">
                    Kategori <span className="text-error">*</span>
                </label>
                <select
                    id="kategori"
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-xl border-2 font-body text-on-surface transition-colors ${
                        errors.kategori
                            ? 'border-error bg-error-container/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/50 focus:border-primary'
                    } focus:outline-none`}
                >
                    <option value="">Pilih Kategori</option>
                    {KATEGORI_OPTIONS.map((kat) => (
                        <option key={kat} value={kat}>
                            {kat}
                        </option>
                    ))}
                </select>
                {errors.kategori && <p className="text-error text-sm mt-1">{errors.kategori}</p>}
            </div>

            {/* Satuan */}
            <div>
                <label htmlFor="satuan" className="block text-sm font-semibold text-on-surface mb-2">
                    Satuan <span className="text-error">*</span>
                </label>
                <select
                    id="satuan"
                    name="satuan"
                    value={form.satuan}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-xl border-2 font-body text-on-surface transition-colors ${
                        errors.satuan
                            ? 'border-error bg-error-container/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/50 focus:border-primary'
                    } focus:outline-none`}
                >
                    <option value="">Pilih Satuan</option>
                    {SATUAN_OPTIONS.map((sat) => (
                        <option key={sat} value={sat}>
                            {sat}
                        </option>
                    ))}
                </select>
                {errors.satuan && <p className="text-error text-sm mt-1">{errors.satuan}</p>}
            </div>

            {/* Stok Awal */}
            <div>
                <label htmlFor="stokAwal" className="block text-sm font-semibold text-on-surface mb-2">
                    Stok Awal <span className="text-error">*</span>
                </label>
                <input
                    id="stokAwal"
                    name="stokAwal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={form.stokAwal}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-xl border-2 font-body text-on-surface placeholder:text-on-surface/40 transition-colors ${
                        errors.stokAwal
                            ? 'border-error bg-error-container/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/50 focus:border-primary'
                    } focus:outline-none`}
                />
                {errors.stokAwal && <p className="text-error text-sm mt-1">{errors.stokAwal}</p>}
            </div>

            {/* Harga Satuan */}
            <div>
                <label htmlFor="hargaSatuan" className="block text-sm font-semibold text-on-surface mb-2">
                    Harga Satuan (Rp) <span className="text-error">*</span>
                </label>
                <input
                    id="hargaSatuan"
                    name="hargaSatuan"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={form.hargaSatuan}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-xl border-2 font-body text-on-surface placeholder:text-on-surface/40 transition-colors ${
                        errors.hargaSatuan
                            ? 'border-error bg-error-container/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/50 focus:border-primary'
                    } focus:outline-none`}
                />
                {errors.hargaSatuan && <p className="text-error text-sm mt-1">{errors.hargaSatuan}</p>}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">check</span>
                        Tambah Bahan
                    </>
                )}
            </button>
        </form>
    )
}

export default InventoryTambahBahan