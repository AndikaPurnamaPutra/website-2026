# 18 — Mega menu Work

Status: **Selesai (30 Okt 2026), menunggu review**
Figma: "Dropdown - Expand" 1596:442 (1360 × 192, di x 40, y 90 halaman 1440). Desktop.

## Keputusan pengguna (30 Okt 2026, mengikuti usulan)
1. **Buka** saat hover "Work" di desktop. Juga bisa dibuka dengan klik dan keyboard (Enter/Space, dan tutup dengan Esc).
2. **Animasi** (tidak ada di Figma): kotak turun pelan sambil memudar (±0,3 detik), lalu isinya muncul bergantian. Tutup lebih cepat. Tanpa animasi bila reduced motion.
3. **Kartu proyek:** 4 set × 3 kartu (sesuai 4 titik paginasi). Bergeser otomatis ke set berikutnya setiap ±4 detik, titik bisa diklik, dan berhenti selama kursor di atas kartu. Set 1 memakai 3 gambar Figma, set 2–4 memakai gambar proyek yang sudah ada (Our Work).
4. **Link** kategori dan kartu: `#` sementara.
5. **Angka** tetap seperti Figma: Case Study 28, Live Development 20, Design Showcase 28.
6. Saat navbar gelap (di atas What we do dan Motto), mega menu tetap putih.

## Isi (dari Figma 1596:442)
- **Kotak:** putih, radius 8, padding 16, bayangan `0 4px 20px rgba(0,0,0,.1)`, lebar 1360 (selebar konten). Posisinya 18px di bawah menu bar (y 90).
- **Kiri** (203px, "Brand Information"): "Digital Expertise" General Sans 24 / 1.2 / −0.48 (2 baris); jarak 90; "©2026  /  One Week Wonders Studio" Inter 12 / 1 / −0.24.
- **Tengah** (125px setelah kiri): 3 link, jarak 17. Setiap link: Inter Medium 14 + badge angka (#F6F6F6, radius 4, padding 4/10, Inter Medium 10), jarak 8.
- **Kanan:** 3 kartu 210 × 160 (jarak 16), latar #E8E8E8, radius 4. Gambar 294 × 162,6 di tengah (cover). Gradasi hitam → transparan setinggi 43px di atas. Badge "New" (#F6F6F6, radius pill, padding 4/10, Inter Medium 8) di 12,12.
- **Paginasi** vertikal (8px di kanan kartu): 4 titik 6 × 6, jarak 4, radius 4. Aktif #111, lainnya #D9D9D9 opacity .5.

## File
| File | Perubahan |
|---|---|
| `src/pug/partials/header.pug` | Dropdown sementara diganti mega menu |
| `src/scss/components/_header.scss` | Style mega menu (menggantikan `.site-nav__dropdown`) |
| `src/js/work-menu.js`, `src/js/main.js` | Buka/tutup (hover, klik, keyboard), animasi, pergantian set kartu |
| `src/assets/images/menu/` | 3 gambar kartu dari Figma (diperkecil ke 2× ukuran tampil) |

## Langkah
- [x] 1. Aset gambar.
- [x] 2. Markup dan style (bandingkan dengan Figma di 1440).
- [x] 3. Buka/tutup: hover, klik, keyboard, dan klik di luar.
- [x] 4. Animasi buka/tutup.
- [x] 5. Set kartu: otomatis, titik paginasi, berhenti saat hover.
- [x] 6. Build; cek di 1280 / 1440 / 1920 / 2560, juga di atas section gelap dan saat menu bar tersembunyi.

## Kriteria selesai
- Posisi dan ukuran elemen di 1440 sama dengan Figma (dicek dengan screenshot).
- Bisa dibuka dan ditutup dengan mouse dan keyboard. Tidak menutup saat kursor bergerak dari "Work" ke kotak.
- Menu tertutup saat menu bar disembunyikan (scroll ke bawah).
- Tidak ada scroll horizontal. Halaman lain tidak berubah.

## Hasil (30 Okt 2026)
- **1440, sama dengan Figma:** kotak 40,90 1360 × 192; judul 56,106 (203 × 58); copyright y 254; link x 384; kartu pertama 708,106 (210 × 160); titik paginasi 1378,168. Dicek juga dengan screenshot.
- **Buka/tutup:**
  - Hover "Work" membuka. Kursor bisa melewati celah ke kotak tanpa menutup, dan kotak menutup 150 ms setelah kursor keluar.
  - Klik membuka dan menutup. Space/Enter membuka, Esc menutup dan fokus kembali ke "Work". Klik di luar atau fokus keluar menutup.
  - Menutup saat menu bar tersembunyi, atau saat halaman di-scroll lebih dari 40px (menu bar tetap tampil selama ada fokus keyboard di dalamnya).
- **Kartu:** set berganti otomatis setiap 4 detik selama terbuka (memudar, kartu masuk bergantian). Titik bisa diklik. Berhenti selama kursor di atas kartu (terukur: tetap di set 2 selama 5 detik hover).
- **Hover kecil** (tidak ada di Figma): link kategori memudar ke 50%, dan gambar kartu membesar 4%.
- Lebar 1280 / 1920 / 2560: kotak mengikuti lebar konten, tanpa scroll horizontal. Halaman Contact berfungsi. Privacy dan Terms memakai menu bar "Back" (tanpa Work).
- **Panah "Work" berputar** (permintaan pengguna): saat menu terbuka, chevron berputar 180° (0,3 detik, ease-out), lalu kembali saat tertutup.
- **Perbaikan: menu terbuka sebelum kursor sampai di "Work"** (laporan pengguna). Set kartu aktif memakai `visibility: visible`, yang mengalahkan `hidden` dari kotak induk, sehingga kartu yang tak terlihat masih menangkap kursor (terukur: kursor di 1300,150 membuka menu). Sekarang `visibility: inherit`.
