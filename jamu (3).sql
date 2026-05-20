-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 20 Bulan Mei 2026 pada 09.58
-- Versi server: 8.4.3
-- Versi PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jamu`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `bahan`
--

CREATE TABLE `bahan` (
  `id` int NOT NULL,
  `nama` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `satuan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stokAwal` decimal(10,2) DEFAULT '0.00',
  `hargaSatuan` decimal(15,2) DEFAULT '0.00',
  `threshold` decimal(10,2) DEFAULT '10.00',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `bahan`
--

INSERT INTO `bahan` (`id`, `nama`, `kategori`, `satuan`, `stokAwal`, `hargaSatuan`, `threshold`, `created_at`, `updated_at`) VALUES
(1, 'Jahe Merah Segar', 'Rimpang', 'kg', 150.00, 25000.00, 20.00, '2026-05-20 06:43:13', '2026-05-20 06:43:13'),
(2, 'Kunyit Bubuk', 'Rimpang', 'kg', 80.00, 30000.00, 15.00, '2026-05-20 06:43:13', '2026-05-20 06:43:13'),
(3, 'jahe', 'rempah', 'kg', 35.00, 4000.00, 20.00, '2026-05-20 09:34:45', '2026-05-20 09:34:45');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jamu`
--

CREATE TABLE `jamu` (
  `id_jamu` int NOT NULL,
  `id_user` int DEFAULT NULL,
  `nama_jamu` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ket_jamu` text COLLATE utf8mb4_unicode_ci,
  `jenis` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perizinan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_produsen` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `jamu`
--

INSERT INTO `jamu` (`id_jamu`, `id_user`, `nama_jamu`, `ket_jamu`, `jenis`, `perizinan`, `id_produsen`, `created_at`) VALUES
(1, 1, 'Jamu Jahe Merah Kunyit', 'Minuman herbal', 'minuman', 'BPOM', 1, '2026-05-20 06:43:13');

-- --------------------------------------------------------

--
-- Struktur dari tabel `khasiat`
--

CREATE TABLE `khasiat` (
  `id_khasiat` int NOT NULL,
  `khasiat` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ket_khasiat` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `khasiat`
--

INSERT INTO `khasiat` (`id_khasiat`, `khasiat`, `ket_khasiat`) VALUES
(1, 'Meningkatkan Imunitas', 'Membantu tubuh melawan infeksi'),
(2, 'Anti-Inflamasi', 'Mengurangi peradangan');

-- --------------------------------------------------------

--
-- Struktur dari tabel `khasiat_jamu`
--

CREATE TABLE `khasiat_jamu` (
  `id_khasiat_jamu` int NOT NULL,
  `id_khasiat` int NOT NULL,
  `id_jamu` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `khasiat_jamu`
--

INSERT INTO `khasiat_jamu` (`id_khasiat_jamu`, `id_khasiat`, `id_jamu`) VALUES
(1, 1, 1),
(2, 2, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `komposisi`
--

CREATE TABLE `komposisi` (
  `id_komposisi` int NOT NULL,
  `id_rempah` int NOT NULL,
  `id_jamu` int NOT NULL,
  `banyak_rempah` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `komposisi`
--

INSERT INTO `komposisi` (`id_komposisi`, `id_rempah`, `id_jamu`, `banyak_rempah`) VALUES
(1, 1, 1, '200 gram'),
(2, 2, 1, '150 gram');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kota`
--

CREATE TABLE `kota` (
  `id_kota` int NOT NULL,
  `nama_kota` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ket_kota` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `kota`
--

INSERT INTO `kota` (`id_kota`, `nama_kota`, `ket_kota`) VALUES
(1, 'Sampang', 'Kabupaten Sampang, Madura'),
(2, 'Sumenep', 'Kabupaten Sumenep, Madura'),
(3, 'Pamekasan', 'Kabupaten Pamekasan, Madura'),
(4, 'Bangkalan', 'Kabupaten Bangkalan, Madura');

-- --------------------------------------------------------

--
-- Struktur dari tabel `produksi`
--

CREATE TABLE `produksi` (
  `id_produksi` int NOT NULL,
  `id_jamu` int NOT NULL,
  `id_user` int DEFAULT NULL,
  `kode_batch` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ukuran_batch` decimal(10,2) DEFAULT NULL,
  `volume_output` decimal(10,2) DEFAULT NULL,
  `efisiensi` decimal(5,2) DEFAULT NULL,
  `status` enum('antrian','ekstraksi','botolisasi','selesai') COLLATE utf8mb4_unicode_ci DEFAULT 'antrian',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `produksi`
--

INSERT INTO `produksi` (`id_produksi`, `id_jamu`, `id_user`, `kode_batch`, `ukuran_batch`, `volume_output`, `efisiensi`, `status`, `catatan`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'BATCH-001', 100.00, 92.50, 92.50, 'selesai', 'Lancar', '2026-05-20 06:43:13', '2026-05-20 06:43:13');

-- --------------------------------------------------------

--
-- Struktur dari tabel `produsen`
--

CREATE TABLE `produsen` (
  `id_produsen` int NOT NULL,
  `nama_produsen` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `kota` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kontak` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','menunggu','ditangguhkan') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `produsen`
--

INSERT INTO `produsen` (`id_produsen`, `nama_produsen`, `alamat`, `kota`, `kontak`, `email`, `status`, `created_at`) VALUES
(1, 'CV. Rempah Nusantara', 'Jl. Raya Sampang No. 12', 'Sampang', '08123456789', 'rempah.nusantara@gmail.com', 'aktif', '2026-05-20 06:43:13'),
(2, 'UD. Herbal Madura Jaya', 'Jl. Trunojoyo No. 45', 'Sumenep', '08234567890', 'herbal.madura@gmail.com', 'aktif', '2026-05-20 06:43:13');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rempah`
--

CREATE TABLE `rempah` (
  `id_rempah` int NOT NULL,
  `nama_rempah` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ket_rempah` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `rempah`
--

INSERT INTO `rempah` (`id_rempah`, `nama_rempah`, `ket_rempah`) VALUES
(1, 'Jahe Merah', 'Zingiber officinale var. rubrum'),
(2, 'Kunyit', 'Curcuma longa');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id_user` int NOT NULL,
  `id_kota` int DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pw` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','supervisor','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id_user`, `id_kota`, `username`, `email`, `pw`, `role`, `created_at`) VALUES
(1, 1, 'admin', 'admin@penjamuhandal.id', '$2a$10$P/kFZFRFN8E/W.X7HxL6yOERGYZWVwN/XXsSx1.EKfwioHC0GFO3K', 'admin', '2026-05-20 06:43:13'),
(2, 1, 'staf_produksi', 'staf@penjamuhandal.id', '$2a$10$lc1Do3meL10.5a.mfXe6xuoCJljneJY4xJYvqfPHn7HTVpJTQ3Q2G', 'staff', '2026-05-20 06:43:13');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bahan`
--
ALTER TABLE `bahan`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `jamu`
--
ALTER TABLE `jamu`
  ADD PRIMARY KEY (`id_jamu`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_produsen` (`id_produsen`);

--
-- Indeks untuk tabel `khasiat`
--
ALTER TABLE `khasiat`
  ADD PRIMARY KEY (`id_khasiat`);

--
-- Indeks untuk tabel `khasiat_jamu`
--
ALTER TABLE `khasiat_jamu`
  ADD PRIMARY KEY (`id_khasiat_jamu`),
  ADD KEY `id_khasiat` (`id_khasiat`),
  ADD KEY `id_jamu` (`id_jamu`);

--
-- Indeks untuk tabel `komposisi`
--
ALTER TABLE `komposisi`
  ADD PRIMARY KEY (`id_komposisi`),
  ADD KEY `id_rempah` (`id_rempah`),
  ADD KEY `id_jamu` (`id_jamu`);

--
-- Indeks untuk tabel `kota`
--
ALTER TABLE `kota`
  ADD PRIMARY KEY (`id_kota`);

--
-- Indeks untuk tabel `produksi`
--
ALTER TABLE `produksi`
  ADD PRIMARY KEY (`id_produksi`),
  ADD UNIQUE KEY `kode_batch` (`kode_batch`),
  ADD KEY `id_jamu` (`id_jamu`),
  ADD KEY `id_user` (`id_user`);

--
-- Indeks untuk tabel `produsen`
--
ALTER TABLE `produsen`
  ADD PRIMARY KEY (`id_produsen`);

--
-- Indeks untuk tabel `rempah`
--
ALTER TABLE `rempah`
  ADD PRIMARY KEY (`id_rempah`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_kota` (`id_kota`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bahan`
--
ALTER TABLE `bahan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `jamu`
--
ALTER TABLE `jamu`
  MODIFY `id_jamu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `khasiat`
--
ALTER TABLE `khasiat`
  MODIFY `id_khasiat` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `khasiat_jamu`
--
ALTER TABLE `khasiat_jamu`
  MODIFY `id_khasiat_jamu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `komposisi`
--
ALTER TABLE `komposisi`
  MODIFY `id_komposisi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `kota`
--
ALTER TABLE `kota`
  MODIFY `id_kota` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `produksi`
--
ALTER TABLE `produksi`
  MODIFY `id_produksi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `produsen`
--
ALTER TABLE `produsen`
  MODIFY `id_produsen` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `rempah`
--
ALTER TABLE `rempah`
  MODIFY `id_rempah` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `jamu`
--
ALTER TABLE `jamu`
  ADD CONSTRAINT `jamu_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE SET NULL,
  ADD CONSTRAINT `jamu_ibfk_2` FOREIGN KEY (`id_produsen`) REFERENCES `produsen` (`id_produsen`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `khasiat_jamu`
--
ALTER TABLE `khasiat_jamu`
  ADD CONSTRAINT `khasiat_jamu_ibfk_1` FOREIGN KEY (`id_khasiat`) REFERENCES `khasiat` (`id_khasiat`) ON DELETE CASCADE,
  ADD CONSTRAINT `khasiat_jamu_ibfk_2` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `komposisi`
--
ALTER TABLE `komposisi`
  ADD CONSTRAINT `komposisi_ibfk_1` FOREIGN KEY (`id_rempah`) REFERENCES `rempah` (`id_rempah`) ON DELETE CASCADE,
  ADD CONSTRAINT `komposisi_ibfk_2` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `produksi`
--
ALTER TABLE `produksi`
  ADD CONSTRAINT `produksi_ibfk_1` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`) ON DELETE RESTRICT,
  ADD CONSTRAINT `produksi_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`id_kota`) REFERENCES `kota` (`id_kota`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
