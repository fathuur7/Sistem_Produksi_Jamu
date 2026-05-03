-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 03 Bulan Mei 2026 pada 10.59
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
-- Struktur dari tabel `jamu`
--

CREATE TABLE `jamu` (
  `id_jamu` int NOT NULL,
  `id_user` int DEFAULT NULL,
  `nama_jamu` varchar(50) DEFAULT NULL,
  `ket_jamu` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `jamu`
--

INSERT INTO `jamu` (`id_jamu`, `id_user`, `nama_jamu`, `ket_jamu`) VALUES
(1, 1, 'Jamu Kunyit Asam', 'Minuman herbal tradisional berbahan kunyit');

-- --------------------------------------------------------

--
-- Struktur dari tabel `khasiat`
--

CREATE TABLE `khasiat` (
  `id_khasiat` int NOT NULL,
  `khasiat` varchar(100) DEFAULT NULL,
  `ket_khasiat` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `khasiat`
--

INSERT INTO `khasiat` (`id_khasiat`, `khasiat`, `ket_khasiat`) VALUES
(1, 'Menambah stamina', 'Membantu menjaga daya tahan tubuh');

-- --------------------------------------------------------

--
-- Struktur dari tabel `khasiat_jamu`
--

CREATE TABLE `khasiat_jamu` (
  `id_khasiatjamu` int NOT NULL,
  `id_khasiat` int DEFAULT NULL,
  `id_jamu` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `khasiat_jamu`
--

INSERT INTO `khasiat_jamu` (`id_khasiatjamu`, `id_khasiat`, `id_jamu`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `komposisi`
--

CREATE TABLE `komposisi` (
  `id_komposisi` int NOT NULL,
  `id_rempah` int DEFAULT NULL,
  `id_jamu` int DEFAULT NULL,
  `banyak_rempah` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `komposisi`
--

INSERT INTO `komposisi` (`id_komposisi`, `id_rempah`, `id_jamu`, `banyak_rempah`) VALUES
(1, 1, 1, 5);

-- --------------------------------------------------------

--
-- Struktur dari tabel `kota`
--

CREATE TABLE `kota` (
  `id_kota` int NOT NULL,
  `nama_kota` varchar(50) DEFAULT NULL,
  `ket_kota` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `kota`
--

INSERT INTO `kota` (`id_kota`, `nama_kota`, `ket_kota`) VALUES
(1, 'Sampang', 'Kabupaten Sampang, Madura');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rempah`
--

CREATE TABLE `rempah` (
  `id_rempah` int NOT NULL,
  `nama_rempah` varchar(50) DEFAULT NULL,
  `ket_rempah` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `rempah`
--

INSERT INTO `rempah` (`id_rempah`, `nama_rempah`, `ket_rempah`) VALUES
(1, 'Kunyit', 'Rempah untuk formula jamu');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id_user` int NOT NULL,
  `id_kota` int DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `pw` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id_user`, `id_kota`, `username`, `email`, `pw`) VALUES
(1, 1, 'admin', 'admin@penjamuhandal.id', 'admin123');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `jamu`
--
ALTER TABLE `jamu`
  ADD PRIMARY KEY (`id_jamu`),
  ADD KEY `id_user` (`id_user`);

--
-- Indeks untuk tabel `khasiat`
--
ALTER TABLE `khasiat`
  ADD PRIMARY KEY (`id_khasiat`);

--
-- Indeks untuk tabel `khasiat_jamu`
--
ALTER TABLE `khasiat_jamu`
  ADD PRIMARY KEY (`id_khasiatjamu`),
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
-- Indeks untuk tabel `rempah`
--
ALTER TABLE `rempah`
  ADD PRIMARY KEY (`id_rempah`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD KEY `id_kota` (`id_kota`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `jamu`
--
ALTER TABLE `jamu`
  ADD CONSTRAINT `jamu_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`);

--
-- Ketidakleluasaan untuk tabel `khasiat_jamu`
--
ALTER TABLE `khasiat_jamu`
  ADD CONSTRAINT `khasiat_jamu_ibfk_1` FOREIGN KEY (`id_khasiat`) REFERENCES `khasiat` (`id_khasiat`),
  ADD CONSTRAINT `khasiat_jamu_ibfk_2` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`);

--
-- Ketidakleluasaan untuk tabel `komposisi`
--
ALTER TABLE `komposisi`
  ADD CONSTRAINT `komposisi_ibfk_1` FOREIGN KEY (`id_rempah`) REFERENCES `rempah` (`id_rempah`),
  ADD CONSTRAINT `komposisi_ibfk_2` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`);

--
-- Ketidakleluasaan untuk tabel `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`id_kota`) REFERENCES `kota` (`id_kota`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
