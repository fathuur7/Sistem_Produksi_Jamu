SISTEM PRODUKSI JAMU

Sistem manajemen data jamu tradisional Madura berbasis web.

Fokus fitur yang sudah disesuaikan dengan schema DB `jamu` saat ini: login, master data (kota, user, rempah, khasiat) dan data jamu + relasinya.

CARA MENJALANKAN PROJECT

Persiapan Awal (sekali saja)

1. Pastikan sudah terinstall:
   - XAMPP atau Laragon untuk MySQL
   - Node.js versi 16 atau lebih baru
   - npm (otomatis terinstall dengan Node.js)

2. Jalankan MySQL
   - Buka XAMPP Control Panel atau Laragon
   - Klik tombol Start pada MySQL
   - Pastikan statusnya Running

3. Import Database
   - Buka browser, akses http://localhost/phpmyadmin
   - Klik tab Import
   - Pilih file jamu.sql yang ada di folder project ini
   - Klik Go
   - Tunggu sampai muncul pesan sukses

4. Konfigurasi Backend (.env)
   - Masuk folder backend
   - Copy `backend/.env.example` menjadi `backend/.env`
   - Sesuaikan `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD` jika perlu (Laragon biasanya `root` tanpa password)

5. Install Dependencies Backend
   Buka Command Prompt atau Terminal:

   cd backend
   npm install

6. Seed Data Minimal (wajib untuk login)

   cd backend
   node scripts/seedJamuDb.js

7. Install Dependencies Frontend
   Buka Command Prompt atau Terminal baru:

   cd frontend
   npm install

Menjalankan Aplikasi (setiap kali mau pakai)

1. Jalankan Backend Server
   Di terminal pertama:

   cd backend
   npm run dev

   Tunggu sampai muncul: Server berjalan di http://localhost:3000
   Jangan tutup terminal ini, biarkan tetap jalan.

2. Jalankan Frontend Server
   Buka terminal baru (jangan tutup yang backend):

   cd frontend
   npm run dev

   Tunggu sampai muncul: Local: http://localhost:5173/
   Jangan tutup terminal ini, biarkan tetap jalan.

3. Buka di Browser
   - Buka browser (Chrome/Firefox/Edge)
   - Akses http://localhost:5173
   - Halaman login akan muncul

LOGIN CREDENTIALS

Email: admin@penjamuhandal.id
Password: admin123

Atau bisa juga pakai username:

Username: admin
Password: admin123

URL PENTING

Aplikasi Web: http://localhost:5173 (buka ini di browser)
Backend API: http://localhost:3000 (untuk internal, jangan dibuka)
Health Check: http://localhost:3000/health (test backend jalan atau tidak)
phpMyAdmin: http://localhost/phpmyadmin (untuk cek database)

STRUKTUR PROJECT

backend/
src/
routes/ Semua endpoint API
middleware/ JWT authentication
config/ Database connection
scripts/
importExcel.js Import data dari Excel
.env Konfigurasi database

frontend/
src/
pages/ Halaman utama
components/ Komponen UI
config/ Konfigurasi routing

jamu.sql Database schema (import ini)
jamu206.xlsx Data Excel (opsional)

TEKNOLOGI YANG DIGUNAKAN

Backend:

- Express.js - Web framework
- MySQL - Database
- JWT - Authentication
- bcryptjs - Compare password (mendukung bcrypt jika sudah terlanjur ada)
- XLSX - Import Excel

Frontend:

- React 19 - UI framework
- Vite - Build tool
- TailwindCSS - Styling
- React Router - Routing

DATABASE

Nama Database: jamu

Tabel:

- kota: Master kota
- user: Kredensial untuk akses sistem
- rempah: Data master rempah
- khasiat: Data khasiat
- jamu: Data jamu
- komposisi: Relasi jamu dan rempah
- khasiat_jamu: Relasi jamu dan khasiat

ENDPOINT API UTAMA

Auth:

- POST /api/auth/login - Login
- POST /api/auth/register - Register user baru

Jamu:

- GET /api/jamu - List semua jamu
- GET /api/jamu/:id - Detail jamu
- POST /api/jamu - Tambah jamu baru

Search:

- GET /api/search?q=kunyit - Pencarian global

TROUBLESHOOTING

Problem: Cannot connect to database
Solusi: Pastikan MySQL di XAMPP/Laragon sudah Running

Problem: Port 3000 already in use
Solusi Windows:
netstat -ano | findstr :3000
taskkill /PID <nomor_PID> /F

Problem: Port 5173 already in use
Solusi Windows:
netstat -ano | findstr :5173
taskkill /PID <nomor_PID> /F

Problem: vite is not recognized
Solusi:
cd frontend
npm install
npm run dev

Problem: Table jamu.user doesn't exist
Solusi: Import ulang database jamu.sql di phpMyAdmin

Problem: Login gagal Invalid credentials
Solusi: Gunakan email admin@penjamuhandal.id atau username admin dengan password admin123

Problem: Frontend tidak bisa fetch data dari backend
Solusi:

1. Pastikan backend sudah jalan di port 3000
2. Buka http://localhost:3000/health di browser
3. Jika muncul {"status":"ok"}, berarti backend OK
4. Jika tidak, restart backend server

IMPORT DATA DARI EXCEL (OPSIONAL)

Jika ingin import data dari file jamu206.xlsx:

cd backend
node scripts/importExcel.js

File jamu206.xlsx harus ada di root folder project (sejajar dengan folder backend/ dan frontend/).

CATATAN PENTING

- Fitur inventory/bahan, supplier, dan produksi saat ini memakai data mock di frontend (karena schema DB `jamu` tidak menyediakan tabel-tabel tersebut).

- Backend harus jalan di port 3000
- Frontend harus jalan di port 5173
- Kedua server harus jalan bersamaan
- MySQL harus running sebelum jalankan backend
- Jangan tutup terminal yang menjalankan server
- Untuk stop server: tekan Ctrl + C di terminal

CHECKLIST SEBELUM MENJALANKAN

- MySQL di XAMPP/Laragon sudah Running
- Database jamu.sql sudah diimport
- File backend/.env sudah ada
- npm install sudah dijalankan di folder backend/
- npm install sudah dijalankan di folder frontend/
- Backend server sudah jalan di terminal 1
- Frontend server sudah jalan di terminal 2
- Browser sudah dibuka di http://localhost:5173
