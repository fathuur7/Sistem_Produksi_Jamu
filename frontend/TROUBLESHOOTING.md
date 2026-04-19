## Troubleshooting Guide - Fitur Tambah Bahan

### Error: "Gagal menambah bahan"

Error ini bisa terjadi karena beberapa alasan:

---

## 1. Backend API Belum Running

**Gejala:**
- Error: `Error 404: Gagal menambah bahan`
- atau `Failed to fetch`

**Solusi:**
- Pastikan backend API sudah running di server yang benar
- Check endpoint: `POST /api/bahan`
- Verify CORS settings jika backend di domain berbeda

---

## 2. Response Format Tidak Sesuai

**Gejala:**
- Form terkirim tapi API response tidak sesuai format yang diharapkan

**Expected Format:**
```json
{
  "success": true,
  "message": "Bahan berhasil ditambahkan",
  "data": {
    "id": 123,
    "nama": "Jahe Emprit",
    "kategori": "Rimpang",
    "satuan": "kg",
    "stokAwal": 100,
    "hargaSatuan": 50000,
    "createdAt": "2026-04-19T..."
  }
}
```

**Pastikan:**
- Response status: `200` atau `201`
- Response adalah valid JSON
- Field `message` atau `success` ada di response

---

## 3. Debug Steps

### Step 1: Buka Browser Console
- Tekan `F12` atau `Ctrl+Shift+I`
- Pilih tab **Console**

### Step 2: Coba Submit Form
- Fill form dan submit
- Lihat console output yang di-print

### Step 3: Check Console Logs
Akan melihat:
```
[MOCK API] POST /api/bahan
[MOCK API] Request body: { nama: "...", kategori: "...", ... }
[MOCK API] Response: { success: true, ... }
```

### Step 4: Check Network Tab
- Buka **Network** tab di developer tools
- Cari request `bahan`
- Check:
  - Status code (200/201 = OK)
  - Response headers
  - Response body

---

## 4. Development Mode: Mock API

Saat development, ada **Mock API** yang enabled by default untuk testing.

**Location:** `src/utils/mockApi.ts`

**Untuk disable mock API (gunakan backend real):**
```typescript
// Di mockApi.ts
const MOCK_ENABLED = false; // Change to false
```

**Konsole Output:**
```
[MOCK API] Mock API initialized. MOCK_ENABLED: true
```

---

## 5. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `Error 404` | Endpoint tidak ada | Buat endpoint `/api/bahan` di backend |
| `Error 500` | Server error | Check backend logs |
| `CORS Error` | Domain berbeda | Setup CORS di backend |
| `Network Error` | Koneksi gagal | Check network, API URL |
| Blank error | Response format wrong | Pastikan response JSON valid |

---

## 6. Testing Form Validation

Validation dilakukan client-side. Akan error jika:

- **Nama Bahan**: Kosong
- **Kategori**: Tidak dipilih  
- **Satuan**: Tidak dipilih
- **Stok Awal**: Negatif atau kosong
- **Harga Satuan**: Negatif atau kosong

Error akan muncul under setiap field.

---

## 7. Backend Implementation Checklist

Jika membuat backend, pastikan:

- [ ] Endpoint `POST /api/bahan` exists
- [ ] Accept `application/json` content type
- [ ] Validate semua fields (nama, kategori, satuan, stokAwal, hargaSatuan)
- [ ] Save ke database
- [ ] Return response dengan format yang benar
- [ ] Handle errors dengan message yang jelas
- [ ] Setup CORS jika frontend di domain berbeda

**Contoh Backend (Express.js):**
```javascript
app.post('/api/bahan', async (req, res) => {
  try {
    const { nama, kategori, satuan, stokAwal, hargaSatuan } = req.body;
    
    // Validate
    if (!nama || !kategori || !satuan) {
      return res.status(400).json({
        success: false,
        message: 'Field tidak lengkap'
      });
    }
    
    // Save to database
    const bahan = await Bahan.create({
      nama,
      kategori,
      satuan,
      stokAwal,
      hargaSatuan
    });
    
    res.status(201).json({
      success: true,
      message: 'Bahan berhasil ditambahkan',
      data: bahan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 8. Check These Files

- `src/components/pages/inventory/InventoryTambahBahan.tsx` - Form component
- `src/pages/TambahBahan.tsx` - Page wrapper
- `src/utils/bahanApi.ts` - API utilities
- `src/utils/mockApi.ts` - Mock API (untuk development)
- `src/main.tsx` - Mock API initialization

---

## 9. Questions to Ask

1. Apa exact error message di browser console?
2. Apa status code response (200? 404? 500?)?
3. Apa isi response body?
4. Backend running di mana? (localhost:3000? server lain?)
5. API endpoint sudah di-implement?

---

Jika masih error, screenshot:
- Browser console output
- Network tab response
- Form yang sudah di-isi

Akan bisa debug lebih mudah! 🔍
