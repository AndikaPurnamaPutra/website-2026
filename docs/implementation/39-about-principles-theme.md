# 39 — About: halaman menjadi gelap untuk Principles

Status: dicoba atas permintaan pengguna (10 Nov 2026: "kita coba").

## Tujuan
Principles di About sebelumnya blok gelap bertepi tegas di tengah halaman
terang. Kini seluruh halaman menjadi gelap saat Principles datang dan terang
lagi saat ia pergi, seperti homepage untuk Services (`page-theme.js`,
rencana 21).

## Pengerjaan
- `page-theme.js`: rentang gelap kedua, dari atas Principles di tengah
  layar sampai atas galeri di 40% layar (25% bila Principles tidak dipin:
  tablet, HP, layar sentuh). Pertama dicoba seperti Services (85% dan awal
  keluarnya pin); pengguna: "terlalu cepat posisi berubahnya", lalu masuk
  sudah oke tapi keluar ke galeri "masih terlalu cepat".
- `_about.scss`: `.about` dan `.principles` memakai `--theme-bg` /
  `--theme-fg`; teks abu intro dicampur dari warna tema (#555 di terang, abu
  terang di gelap), berganti halus bersama tema (0,35 s); tombol "Schedule a
  call" gelap di terang dan terang di gelap, warnanya ditukar seketika di 40%
  pergantian seperti tombol Statement di homepage (pengguna: "seperti
  delay" — dipudarkan bersama halaman, tombol, teksnya dan halaman sempat
  sama abu-abu sehingga tombol seolah hilang).
- `_tokens.scss`: tanpa JS, Principles tetap gelap (seperti Services).

- Jarak (pengguna: "karena transisi, jarak antar section menjadi terlalu
  jauh"): dengan latar gelap menyatu, ruang bawah intro (200) dan atas galeri
  (201) bertumpuk dengan ruang Principles sendiri (setinggi layar, isinya di
  tengah): 478 / 441 px di 1440. Dihapus, terlalu pendek (278 / 257 px);
  di laptop ke atas kini separuhnya (100 dan 100). Layar sentuh lebar (Principles
  mengalir, tidak setinggi layar), tablet dan HP tetap seperti Figma.

## Cek
- Desktop 1440 dan HP 390: gelap saat atas Principles di tengah layar,
  terang saat atas galeri di 40% / 25% layar.
- About dan homepage 320–1920 tanpa error dan tanpa scroll samping.
