# 24 — Trusted Clients: animasi masuk

Status: **Selesai (4 Nov 2026), menunggu review**, disetujui pengguna ("simpel namun elegan"). Branch: `trusted/v1` (dari `our-work/v2`).

## Rencana
- Eyebrow naik, judul naik per baris (seperti section lain).
- Logo klien hanya memudar masuk, berurutan dari kiri atas ke kanan bawah (jeda 0,05 dtk), tanpa naik atau zoom. Hover logo tidak diubah.
- "and hundred more..." naik setelah logo; garis pembatas tergambar dari kiri; marquee testimoni memudar masuk (gerakannya tidak diubah).
- Tiap bagian mulai saat masuk layar (85%), berbalik saat scroll ke atas. Reduced motion: langsung tampil.

## File
- `src/js/trusted-intro.js` (baru), `src/js/main.js`

## Langkah
- [x] Script dan pendaftarannya.
- [x] Build, cek di browser (1440 × 900): logo memudar berurutan (0,4 dtk: 0,8 → 0,0 dari kiri atas ke kanan bawah; 1,8 dtk: semua penuh), judul dan "and hundred more..." naik, garis tergambar, marquee memudar masuk dan tetap bergerak (−518 → −558px per detik), hover logo tetap ("See More" muncul).


## Akhirnya (pengguna, opsi 4)
Lampu sorot logo dan fokus tengah testimoni dicoba lalu dihapus: section ini dibuat tenang sebagai jeda setelah Services dan Our Work. Tetap: animasi masuk dan marquee testimoni yang terdorong scroll (seperti galeri Contact).
