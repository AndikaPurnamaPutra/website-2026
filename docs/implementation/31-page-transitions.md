# 31 — Perpindahan halaman (Barba.js)

Branch: `transition/v1` (dari `about/v1`). Referensi pengguna:
a24.raviklaassens.com, kommakomma.is, jasminegunarto.com, fluid.glass/collection.

## Tujuan
Pindah halaman terasa tidak pindah halaman: tanpa layar putih, kedip, atau
muat ulang. URL, tombol Back dan tautan tetap normal (halaman tetap file
terpisah; tanpa JS semuanya tetap tautan biasa).

## Keputusan (diskusi dengan pengguna)
- **Gambar Services → halaman layanan:** pola kommakomma / fluid.glass. Gambar
  yang aktif tidak hilang: ia berpindah dan membesar ke tempat hero halaman
  layanan, sisa halaman lama memudar, lalu judul dan isi halaman baru naik.
- **Navbar dan tautan lain:** pudar dengan blur, bahasa gerak situs (pilihan
  C pengguna, bukan tirai brand atau halaman yang naik menimpa): konten lama
  naik 16 px, memudar dan mengabur (8 px) dalam 0,5 dtk, seperti tahun di
  preloader; konten baru naik 40 px dan menajam dalam 1 dtk, seperti motto 1;
  navbar tetap. Koin 3D ikut memudar; latar gelap berubah terang bersamaan.
- **Halaman layanan:** belum ada di Figma, jadi dummy dulu (hero gambar/video
  layanan, judul, satu paragraf, footer).
- **Back dari halaman layanan:** transisi tenang biasa (gambar tidak mengecil
  kembali) untuk tahap ini.

## Tahap
### 1. Dasar Barba + transisi tenang
- `default.pug`: `body` = wrapper, `main` = container (namespace per halaman).
- `main.js`: per halaman semua init dijalankan ulang setelah konten baru masuk
  dan dibersihkan sebelum konten lama keluar (sudah ada `initPage` /
  `destroyPage`). Smooth scroll (Lenis) tetap satu untuk seluruh sesi.
  Preloader hanya pada pembukaan pertama homepage.
- Judul, meta description, Open Graph dan canonical diganti dari halaman baru.
- Scroll ke atas pada halaman baru; Back/Forward kembali ke posisi semula.
- Tidak lewat Barba: `mailto:`/`tel:`, `target="_blank"`, `href="#"`, unduhan.
- Reduced motion: hanya memudar.
- File: `src/pug/layouts/default.pug`, `src/js/main.js`,
  `src/js/page-transition.js` (baru), `src/js/smooth-scroll.js`,
  `src/js/scroll-memory.js` bila perlu.

### 2. Halaman layanan dummy + transisi gambar
- `src/pug/layouts/service.pug` (atau mixin) dan 5 halaman
  `src/pug/pages/service-*.pug`; `services.pug` menautkan ke sana.
- Transisi: salinan gambar/video yang aktif ditaruh tetap di layar, berpindah
  dari kotaknya di Services ke kotak hero halaman baru (FLIP, `transform`
  dan `clip-path`), lalu digantikan hero aslinya.

## Cek
- [x] Tahap 1: Home → About → Contact → Home → About → Privacy → Terms dan
      tombol Back; satu `main` setiap saat; jumlah ScrollTrigger sama dengan
      saat halaman dibuka langsung (Home 38, About 51, Contact 2, Privacy 1),
      jadi tidak ada yang tertinggal; pin Services dan Motto jalan setelah
      pindah ke Home; judul, description dan bar Privacy/Terms berganti;
      Back kembali ke posisi scroll; tanpa error.
- [ ] Tahap 2: transisi gambar dari tiap langkah Services (gambar dan video);
      Back; tanpa error.
- [ ] Lighthouse tidak turun.

## Catatan tahap 1
- Halaman lama dihapus sebelum halaman baru disiapkan (Barba baru
  menghapusnya sesudah `enter`, dan bagian-bagiannya ikut disiapkan ulang).
- Datang ke Home lewat transisi: tanpa preloader, teks hero langsung tampil
  (animasi hero hanya setelah preloader).

## Belum jelas
- Konten halaman layanan yang sebenarnya (menunggu desain).
