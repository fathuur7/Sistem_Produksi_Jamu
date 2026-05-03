-- phpMyAdmin SQL Dump
-- Host: localhost:3306
-- Database: jamu

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `jamu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `jamu`;

CREATE TABLE IF NOT EXISTS `kota` (
  `id_kota` int NOT NULL,
  `nama_kota` varchar(50) DEFAULT NULL,
  `ket_kota` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_kota`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `id_user` int NOT NULL,
  `id_kota` int DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `pw` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  KEY `id_kota` (`id_kota`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`id_kota`) REFERENCES `kota` (`id_kota`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `rempah` (
  `id_rempah` int NOT NULL,
  `nama_rempah` varchar(50) DEFAULT NULL,
  `ket_rempah` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_rempah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `khasiat` (
  `id_khasiat` int NOT NULL,
  `khasiat` varchar(100) DEFAULT NULL,
  `ket_khasiat` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_khasiat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `jamu` (
  `id_jamu` int NOT NULL,
  `id_user` int DEFAULT NULL,
  `nama_jamu` varchar(50) DEFAULT NULL,
  `ket_jamu` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_jamu`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `jamu_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `komposisi` (
  `id_komposisi` int NOT NULL,
  `id_rempah` int DEFAULT NULL,
  `id_jamu` int DEFAULT NULL,
  `banyak_rempah` int DEFAULT NULL,
  PRIMARY KEY (`id_komposisi`),
  KEY `id_rempah` (`id_rempah`),
  KEY `id_jamu` (`id_jamu`),
  CONSTRAINT `komposisi_ibfk_1` FOREIGN KEY (`id_rempah`) REFERENCES `rempah` (`id_rempah`),
  CONSTRAINT `komposisi_ibfk_2` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `khasiat_jamu` (
  `id_khasiatjamu` int NOT NULL,
  `id_khasiat` int DEFAULT NULL,
  `id_jamu` int DEFAULT NULL,
  PRIMARY KEY (`id_khasiatjamu`),
  KEY `id_khasiat` (`id_khasiat`),
  KEY `id_jamu` (`id_jamu`),
  CONSTRAINT `khasiat_jamu_ibfk_1` FOREIGN KEY (`id_khasiat`) REFERENCES `khasiat` (`id_khasiat`),
  CONSTRAINT `khasiat_jamu_ibfk_2` FOREIGN KEY (`id_jamu`) REFERENCES `jamu` (`id_jamu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT;
