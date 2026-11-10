# 37 — Principles 05: dari proyek kuartal sampai tugas selesai

Status: disetujui (10 Nov 2026) dan dikerjakan.

## Tujuan
Ilustrasi Principles 05 di About diganti dari gambar sementara
(`principle-5.jpg`) ke animasi dari Figma: satu proyek dibuka menjadi
timeline-nya, satu tugas dibuka menjadi daftar langkahnya, lalu dicentang
sampai 100%.

## Figma (WEBSITE-2026, 670 × 420)
1. **P-1** `2034:2093` — panel "Quarter 4, October – December 2026": Finova
   Banking App, Lumio Brand Identity, dua kerangka.
2. **P-2** `2034:2338` — kartu Finova terangkat (×1,2178, bayangan, ↗).
3. **P-3** `2044:2407` — jendela "Finova Banking App / Timeline" 550 × 370:
   tanggal Nov 1 – Dec 13, garis biru hari ini (Nov 15), bilah tugas.
4. **P-4** `2095:3658` — lebih dekat (×1,1737) ke Frontend Development,
   sekelilingnya memudar (masker elips).
5. **P-5** `2095:2965` — kartu tugas: langkah-langkah, 0%.
6. **P-6** `2095:4031` — semua langkah dicentang dan dicoret, 100%.

## Keputusan pengguna (10 Nov 2026)
- Alur yang diusulkan disetujui ("ya"): berulang mulus, dipicu kursor, kartu
  menjadi timeline, bilah menjadi kartu tugas, ±14 s.
- "Cursor grab tapi klik: jika klik gunakan cursor biasa" — tangan (Figma
  P-2) diganti panah biasa yang menyorot dan mengklik.
- Kartu tugas membuka **ke bawah** dari bilahnya sehingga judulnya tetap di
  tempat (di Figma P-5 kartu 51,82 px lebih tinggi dari bilahnya, judulnya
  jadi melompat naik).
- Teks prinsip 05 di halaman tetap (salinan 01) sampai ada teks asli.

## Alur (±14 s per putaran)
1. Kursor datang ke Finova; kartu terangkat saat kursor masuk (P-2); klik.
2. Kartu melebar menjadi jendela timeline (isinya berganti dari wajah kartu
   ke timeline); garis hari ini turun, bilah tugas tumbuh dari kiri (P-3).
3. Mendekat ke Frontend Development, sekelilingnya memudar; kursor
   mengklik bilahnya (P-4).
4. Bilah membuka ke bawah menjadi kartu tugas (P-5).
5. Kursor mencentang tiap langkah: centang muncul, teks tercoret, progres
   +25% sampai 100% (P-6); kursor pergi.
6. Kembali lewat jalan yang sama ke daftar Quarter 4; mulai lagi.

## Pengerjaan
- `about.pug`: `data-story="progress"`; daftar (`.tl-list`), jendela yang
  berubah dari kartu ke timeline (`.tl-box` dalam `.tl-view` bermasker),
  kartu tugas (`.tl-task`), kursor.
- `_about.scss`: `.tl-*`; tepi lavender (`cm-edge`), arsiran hari-hari ke
  depan dengan `repeating-linear-gradient`, masker elips P-4 dengan
  `radial-gradient` (`--mr`).
- `principles-scroll.js`: `createProgressStory`, terdaftar di `STORIES`.
- Aset (`assets/images/about/principles/tl/`): logo Finova dan Lumio, ↗,
  titik tiga 16, panah tanggal, garis hari ini, centang kosong dan terisi, 3
  avatar; dipakai ulang: kalender, titik tiga 14, kursor, cahaya bawah
  (`tm/`), cahaya jendela (`des/light.svg`). `principle-5.jpg` dihapus.

## Bug yang ditemukan dan diperbaiki saat mengecek
- Garis hari ini tak tampil (wadahnya tanpa ukuran terpotong habis).
- Cahaya bawah tetap ada di P-3 – P-6 (di Figma hanya P-1 dan P-2).
- Kursor menutupi angka 100% di P-6 (Figma P-6 tanpa kursor).
- Tangan hilang di bawah kartu yang terangkat (urutan tumpukan).
- Jendela sempat kosong saat kartu mulai melebar.
- Judul kartu Frontend melompat naik saat membuka (lihat keputusan).
- Bilah progres memendek tiap angka persen bertambah lebar (label kini
  selebar "100%").

## Cek
- Frame dibandingkan dengan render Figma (selisih rata-rata per kanal): P-1
  1,5, P-2 1,7, P-3 3,5, P-4 1,6; P-5 4,2 dan P-6 6,1 karena kartu tugas
  sengaja 51,82 px lebih rendah.
- Seluruh putaran ditangkap tiap 0,1 s: tak ada loncatan; sambungan putaran
  tak terlihat.
- Desktop: diputar saat 05 tampil, berhenti saat tidak; kembali dari 04/06
  sama dengan kunjungan pertama; reduced motion: P-6 diam. HP: berulang.
- Gulir cepat, ganti lebar desktop → tablet → desktop: tanpa error.
- About 320–1920 tanpa error dan tanpa scroll samping. Belum: iPhone
  pengguna.

- [x] Disetujui.
- [x] Dikerjakan dan dicek.
