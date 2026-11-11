# 39 — Services: tumpukan di HP & tablet

Permintaan pengguna (11 Nov 2026): efek menumpuk di section Services, untuk
HP & tablet (< 1024 dan semua layar sentuh), kartu + gambar jadi satu panel.
Desktop (layar hover ≥ 1024, pin dan langkah) tidak berubah. Tidak ada di
Figma (usulan, disetujui).

Catatan: versi "tumpukan sticky" pernah ditolak (9 Nov 2026, doc 32): ubin
menempel di posisi yang sama dan hanya saling menutupi. Versi ini berbeda:

1. **Satu panel per layanan**: `src/js/services-scroll.js` (`stack()`, lewat
   `gsap.matchMedia("(max-width: 1023.98px), (hover: none)")`) memindahkan
   kartu dan gambarnya ke `.services__panel` (markup tetap dua grup untuk
   desktop); dikembalikan saat lebar melewati 1024. Tanpa JS: alur lama.
2. **Menempel bertingkat**: `top: 16 + i × 10` (fluid), jadi tepi atas
   panel-panel di belakang tetap terlihat sebagai tumpukan. Latar panel =
   warna kartu, sudut 4px; gambar 4:3 (HP) / 16:9 (tablet) tanpa sudut sendiri.
3. **Panel yang tertutup mundur**: `scale` 1 → 0,94 dan lapisan gelap
   (`::after`, opacity 0 → 0,55) selama panel berikutnya naik, dari tepinya
   masuk layar sampai menempel.
4. **Dijalankan browser bersama scroll** (CSS scroll-driven animation, seperti
   footer di HP): `view-timeline` pada `.services__mark` (penanda setinggi 0
   tepat di atas tiap panel, karena panel yang menempel tidak bergerak),
   `timeline-scope` di `.services__inner`. Tanpa dukungan: tetap menempel dan
   menumpuk, tanpa mengecil. `prefers-reduced-motion`: tanpa mengecil.
5. Header tersembunyi selama section ini (src/js/header.js), muncul lagi saat
   bawah section mencapai bawah layar (catatan Services terlihat).

## Dicek (Chrome headless, sentuh)

- 390×844: panel 490–543px, menempel 16/26/36/46, mundur ke 0,94 / 0,55.
- 375×667 (iPhone SE): panel ≤ 543px, muat di bawah tumpukan.
- 834×1194: panel 601–639px, muat.
- 1440 (mouse): tanpa panel, pin desktop seperti sebelumnya.
- 390 → 1440 → 390: panel dibongkar dan dibangun lagi, urutan kartu benar.
- Tanpa error.

Perlu dicek pengguna di iPhone (Safari 26 mendukung scroll-driven animation).

## Perbaikan (11 Nov 2026, laporan pengguna)

- **Catatan "Visual trends…" bertumpuk dengan panel**: panel menempel sampai
  akhir section, jadi catatan naik di bawah tumpukan yang masih menempel.
  Panel kini di wadah sendiri (`.services__stack`) yang berakhir di panel
  terakhir: seluruh tumpukan ikut tergulir pergi begitu panel terakhir
  menempel, catatan menyusul di bawahnya.
- **Tumpukan pergi tidak bersamaan** (ditemukan saat cek): panel yang lebih
  tinggi di tumpukan atau lebih pendek dari panel terakhir tetap menempel
  sementara yang lain pergi, judulnya mengintip di atas. Jarak bawah tiap
  panel kini diukur (JS, ResizeObserver) supaya tepi bawahnya sampai ke
  titik tepi bawah panel terakhir menempel: semua lepas pada saat yang sama.
- Dicek 390×844, 375×667, 834×1194 (40/24 posisi scroll): catatan selalu
  ≥ 38px di bawah panel, urutan tumpukan tidak pernah terbalik, tanpa error.
