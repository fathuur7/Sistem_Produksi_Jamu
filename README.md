SISTEM PRODUKSI JAMU

Sistem manajemen produksi jamu tradisional Madura berbasis web untuk mengelola resep, inventaris bahan, supplier, dan batch produksi.

TEKNOLOGI

Backend: Express.js, MySQL, JWT, bcryptjs
Frontend: React 19, Vite, TailwindCSS, React Router

CARA MENJALANKAN

1. Persiapan
   - Install XAMPP/Laragon, Node.js 16+
   - Jalankan MySQL di XAMPP/Laragon
   - Import jamu.sql di phpMyAdmin

2. Install Dependencies
   cd backend
   npm install
   
   cd frontend
   npm install

3. Jalankan Aplikasi
   Terminal 1 (Backend):
   cd backend
   npm run dev
   
   Terminal 2 (Frontend):
   cd frontend
   npm run dev
   
   Buka browser: http://localhost:5173

LOGIN

ADMIN (Akses Penuh):
Username: admin
Password: admin123

STAFF (Akses Terbatas):
Username: staff
Password: staff123

Catatan: Bisa login dengan email atau username.

DATABASE

Nama: jamu

Tabel Utama:
- user: Admin dan staff
- jamu: Resep/produk jamu
- bahan: Inventaris stok bahan baku
- produsen: Supplier/pemasok
- produksi: Batch produksi
- rempah: Master rempah/ingredient
- khasiat: Master khasiat

API ENDPOINT

Auth: POST /api/auth/login, POST /api/auth/register
Jamu: GET/POST/PUT/DELETE /api/jamu
Bahan: GET/POST/PUT/DELETE /api/bahan
Supplier: GET/POST/PUT/DELETE /api/supplier
Produksi: GET/POST/PUT/DELETE /api/produksi
Search: GET /api/search?q=keyword

TROUBLESHOOTING

MySQL tidak jalan: Start MySQL di XAMPP/Laragon
Port sudah dipakai: netstat -ano | findstr :3000 lalu taskkill /PID <nomor>
Login gagal: Gunakan username admin/staff dengan password admin123/staff123
Backend error: Pastikan MySQL running dan database sudah diimport
