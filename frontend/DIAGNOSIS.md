## Diagnosis Checklist - Error "Gagal menambah bahan"

### Ikuti langkah berikut untuk diagnosa:

---

## STEP 1: Refresh Browser
```
- Tekan Ctrl+F5 (hard refresh)
- Atau Ctrl+Shift+Delete untuk clear cache
```

**Expected:** Dev server compile ulang dan siap testing

---

## STEP 2: Buka Browser Console
```
- Tekan F12
- Pilih tab "Console"
- Clear console (ada icon trash)
```

**Expected:** Console clean, siap untuk test

---

## STEP 3: Coba Submit Form
```
1. Navigate ke /inventory
2. Click button "Tambah Bahan"
3. Isi form:
   - Nama Bahan: "Jahe Test"
   - Kategori: Pilih "Rimpang"
   - Satuan: Pilih "kg"
   - Stok Awal: 10
   - Harga Satuan: 50000
4. Click "Tambah Bahan"
```

---

## STEP 4: Check Console Output

### ✅ JIKA BERHASIL (Mock API):
```
[MOCK API] POST /api/bahan
[MOCK API] Request body: { 
  nama: "Jahe Test", 
  kategori: "Rimpang", 
  satuan: "kg", 
  stokAwal: 10, 
  hargaSatuan: 50000 
}
Response status: 201
Response ok: true
[MOCK API] Response: { success: true, ... }
```

**UI:** Akan muncul pesan sukses + redirect ke inventory

---

### ❌ JIKA ERROR:

Cari output seperti:
```
Response status: 404 (atau 500, dsb)
Response ok: false
Error: Error 404: Gagal menambah bahan
```

---

## STEP 5: Check Network Tab
1. Buka **Network** tab (sebelah Console)
2. Coba submit form lagi
3. Cari request `bahan` atau `api/bahan`
4. Click request, lihat:
   - **Headers**: Method POST, Content-Type application/json
   - **Payload**: Data yang dikirim (Request body)
   - **Response**: Response dari server

---

## STEP 6: Collect Information

**Kumpulkan ini dan share:**

1. **Console Output:**
   - Screenshot dari console saat error
   - Tuliskan exact error message

2. **Network Response:**
   - Status code (200? 404? 500?)
   - Response body (JSON atau text?)
   - Response headers

3. **Backend Status:**
   - Backend running di mana? (localhost:3000?)
   - API endpoint `/api/bahan` sudah ada?
   - CORS configured?

4. **Environment:**
   - Dev server running di port berapa? (5174?)
   - Backend API URL apa?

---

## TROUBLESHOOTING FLOWCHART

```
Form Submit
    ↓
Validation passed?
    ├─ NO  → Error di console, stop
    └─ YES → Continue
            ↓
        Fetch /api/bahan
            ↓
        Response OK (200/201)?
            ├─ NO (404/500) → Check console error
            │                 Check backend running?
            │                 Check endpoint exists?
            └─ YES → Success!
                    ↓
                Show success message
                Reset form
                Redirect to inventory
```

---

## Quick Fix Suggestions

### 1. Mock API (Development)
Sudah enabled by default. Lihat di console:
```
[MOCK API] Mock API initialized. MOCK_ENABLED: true
```

Jika tidak ada, berarti `setupMockApi()` belum di-import di `main.tsx`

### 2. Disable Mock API (Use Real Backend)
Di `src/utils/mockApi.ts`:
```typescript
const MOCK_ENABLED = false; // Change this to false
```

Kemudian restart dev server.

### 3. Check Backend Endpoint
Pastikan backend punya endpoint:
```
POST /api/bahan
Content-Type: application/json

{
  "nama": "string",
  "kategori": "string",
  "satuan": "string",
  "stokAwal": number,
  "hargaSatuan": number
}
```

### 4. CORS Issue
Jika error: `Access to XMLHttpRequest blocked by CORS policy`

Backend perlu setup CORS:
```javascript
// Express.js example
const cors = require('cors');
app.use(cors());
```

---

## Next Steps

**If Mock API works:**
- ✅ Form logic OK
- ✅ Client-side OK
- ❌ Need to implement real backend

**If Mock API fails:**
- Check `src/utils/mockApi.ts` imported di `main.tsx`
- Check console for `[MOCK API]` prefix
- Make sure mock is enabled: `const MOCK_ENABLED = true`

---

**Ready? Let's test! 🧪**
