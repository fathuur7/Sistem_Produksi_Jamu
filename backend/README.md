Backend API - Sistem Produksi Jamu

Backend REST API untuk sistem manajemen produksi jamu tradisional Madura.

TEKNOLOGI

- Express.js - Web framework
- MySQL - Database
- mysql2 - MySQL driver (tanpa ORM, query langsung)
- JWT - Autentikasi
- bcryptjs - Hash password
- XLSX - Import data Excel

STRUKTUR FOLDER

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Koneksi MySQL pool
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── index.js           # Router utama
│   │   ├── auth.js            # Login, register
│   │   ├── users.js           # Manajemen user
│   │   ├── jamu.js            # CRUD jamu/resep
│   │   ├── rempah.js          # CRUD rempah
│   │   ├── khasiat.js         # CRUD khasiat
│   │   ├── bahan.js           # Inventaris bahan baku
│   │   ├── supplier.js        # Manajemen pemasok
│   │   ├── produksi.js        # Batch produksi
│   │   ├── kota.js            # Master kota
│   │   └── search.js          # Pencarian global
│   └── index.js               # Entry point server
├── scripts/
│   ├── schema.sql             # SQL schema database
│   ├── importExcel.js         # Script import Excel ke MySQL
│   └── readExcel.js           # Utility baca Excel
├── .env                       # Konfigurasi (jangan commit!)
├── .env.example               # Template konfigurasi
└── package.json
```

CARA MENJALANKAN

1. Install Dependencies

```bash
cd backend
npm install
```

2. Setup Database

Cara 1 - phpMyAdmin (direkomendasikan):
1. Buka phpMyAdmin
2. Klik tab Import
3. Pilih file jamu.sql (ada di root project)
4. Klik Go

Cara 2 - Terminal:
```bash
mysql -u root -p < jamu.sql
```

3. Konfigurasi Environment

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jamu

JWT_SECRET=your_jwt_secret_key_min_32_chars
PORT=3000
```

4. Import Data dari Excel

Pastikan file jamu206.xlsx ada di root project (sejajar folder backend/), lalu jalankan:

```bash
node scripts/importExcel.js
```

Output:
```
Terhubung ke database: jamu
Sheet ditemukan: Sheet1, BPOM, pil, serbuk, kapsul, cair, selai, krim
Total baris data: 206
Produsen diproses: 15
Rempah/kandungan diproses: 120
Khasiat diproses: 85
Import selesai!
   Jamu baru dimasukkan : 206
   Jamu dilewati (duplikat): 0
   Bahan inventaris baru: 120
```

5. Jalankan Server

Development mode (auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server berjalan di: http://localhost:3000

Test health check:
```bash
curl http://localhost:3000/health
```

AUTENTIKASI

Login Default

Setelah menjalankan seeder (`npm run seed`), tersedia 3 jenis akun:

**1. Admin (Full Access)**
- Username: `admin`
- Email: `admin@penjamuhandal.id`
- Password: `admin123`
- Role: `admin`

**2. Supervisor**
- Username: `supervisor1`
- Email: `supervisor1@penjamuhandal.id`
- Password: `super123`
- Role: `supervisor`

**3. Staff**
- Username: `staff_budi`
- Email: `budi@penjamuhandal.id`
- Password: `staff123`
- Role: `staff`

Opsi 1 - Login dengan Email:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@penjamuhandal.id",
  "password": "admin123"
}
```

Opsi 2 - Login dengan Username:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Keduanya bisa digunakan! Backend mendukung login dengan email atau username.

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_user": 1,
    "username": "admin",
    "email": "admin@penjamuhandal.id",
    "role": "admin"
  }
}
```

Menggunakan Token

Untuk endpoint yang memerlukan autentikasi, kirim token di header:

```bash
Authorization: Bearer <token>
```

ENDPOINT API

Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register user baru

Users
- `GET /api/users` - List semua user (auth)
- `GET /api/users/me` - Profil user login (auth)
- `GET /api/users/:id` - Detail user (auth)
- `PUT /api/users/:id` - Update user (auth)
- `PUT /api/users/:id/password` - Ganti password (auth)
- `DELETE /api/users/:id` - Hapus user (auth)

Jamu (Resep)
- `GET /api/jamu` - List jamu (filter: `?jenis=pil&search=kunyit&khasiat=stamina&rempah=jahe`)
- `GET /api/jamu/:id` - Detail jamu + komposisi + khasiat
- `POST /api/jamu` - Tambah jamu baru (auth)
- `PUT /api/jamu/:id` - Update jamu (auth)
- `DELETE /api/jamu/:id` - Hapus jamu (auth)

Bahan (Inventaris)
- `GET /api/bahan` - List semua bahan
- `GET /api/bahan/:id` - Detail bahan
- `POST /api/bahan` - Tambah bahan (auth)
- `PUT /api/bahan/:id` - Update bahan (auth)
- `DELETE /api/bahan/:id` - Hapus bahan (auth)

Supplier (Pemasok)
- `GET /api/supplier` - List supplier (filter: `?status=aktif&search=sumenep`)
- `GET /api/supplier/metrics` - Statistik supplier
- `GET /api/supplier/:id` - Detail supplier
- `POST /api/supplier` - Tambah supplier (auth)
- `PUT /api/supplier/:id` - Update supplier (auth)
- `DELETE /api/supplier/:id` - Hapus supplier (auth)

Produksi (Batch)
- `GET /api/produksi` - List batch (filter: `?status=selesai`)
- `GET /api/produksi/metrics` - Statistik dashboard
- `GET /api/produksi/:id` - Detail batch
- `POST /api/produksi` - Buat batch baru (auth)
- `PUT /api/produksi/:id` - Update batch (auth)
- `DELETE /api/produksi/:id` - Hapus batch (auth)

Rempah
- `GET /api/rempah` - List rempah
- `GET /api/rempah/:id` - Detail rempah
- `POST /api/rempah` - Tambah rempah (auth)
- `PUT /api/rempah/:id` - Update rempah (auth)
- `DELETE /api/rempah/:id` - Hapus rempah (auth)

Khasiat
- `GET /api/khasiat` - List khasiat
- `GET /api/khasiat/:id` - Detail khasiat
- `POST /api/khasiat` - Tambah khasiat (auth)
- `PUT /api/khasiat/:id` - Update khasiat (auth)
- `DELETE /api/khasiat/:id` - Hapus khasiat (auth)

Kota
- `GET /api/kota` - List kota
- `POST /api/kota` - Tambah kota (auth)
- `PUT /api/kota/:id` - Update kota (auth)
- `DELETE /api/kota/:id` - Hapus kota (auth)

Search
- `GET /api/search?q=kunyit` - Pencarian global (jamu, bahan, supplier, khasiat, rempah)

DESAIN DATABASE

Tabel Utama

user - Admin dan staff
- `id_user`, `username`, `email`, `pw` (bcrypt), `role` (admin/supervisor/staff), `id_kota`

jamu - Resep/produk jamu
- `id_jamu`, `nama_jamu`, `ket_jamu`, `jenis` (pil/serbuk/kapsul/cair/selai/krim), `perizinan`, `id_user`, `id_produsen`

rempah - Master rempah/ingredient
- `id_rempah`, `nama_rempah`, `ket_rempah`

bahan - Inventaris stok bahan baku
- `id`, `nama`, `kategori`, `satuan`, `stokAwal`, `hargaSatuan`, `threshold`

khasiat - Master khasiat
- `id_khasiat`, `khasiat`, `ket_khasiat`

produsen - Supplier/pemasok
- `id_produsen`, `nama_produsen`, `alamat`, `kota`, `kontak`, `email`, `status`

produksi - Batch produksi
- `id_produksi`, `id_jamu`, `id_user`, `kode_batch`, `ukuran_batch`, `volume_output`, `efisiensi`, `status`, `catatan`

komposisi - Relasi jamu dan rempah
- `id_komposisi`, `id_rempah`, `id_jamu`, `banyak_rempah`

khasiat_jamu - Relasi jamu dan khasiat
- `id_khasiat_jamu`, `id_khasiat`, `id_jamu`

kota - Master kota
- `id_kota`, `nama_kota`, `ket_kota`

TESTING

Test endpoint dengan curl:

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get jamu (dengan token)
curl http://localhost:3000/api/jamu \
  -H "Authorization: Bearer <your_token>"

# Search
curl "http://localhost:3000/api/search?q=kunyit"
```

CATATAN

- Tanpa ORM: Semua query menggunakan raw SQL untuk kesederhanaan
- JWT Token: Expired dalam 8 jam
- Password: Di-hash dengan bcrypt (10 rounds)
- CORS: Enabled untuk semua origin (sesuaikan di production)
- Port default: 3000 (bisa diubah di .env)

TROUBLESHOOTING

Error: Cannot find module 'xlsx'
```bash
npm install
```

Error: Access denied for user
Cek kredensial MySQL di .env

Error: Table doesn't exist
Import jamu.sql di phpMyAdmin terlebih dahulu

Port 3000 sudah digunakan
Ubah PORT di .env atau kill process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

LICENSE

Private - Penjamu Handal 2024
