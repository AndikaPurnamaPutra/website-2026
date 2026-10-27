# 13 — Halaman Privacy Policy

Status: **Selesai (27 Okt 2026), menunggu review**
Figma: "Privacy and Policy" 1611:7774 (1440 × 3893). Desktop dulu; mobile menunggu desain.

## Keputusan pengguna
1. **Back:** kembali ke halaman sebelumnya; ke homepage bila pengunjung datang langsung.
2. **Bar atas:** perilaku sama dengan menu bar homepage (menempel, sembunyi saat scroll ke bawah, muncul saat scroll ke atas, padding 24px sesuai keputusan header sebelumnya).
3. **Font Inter SemiBold (600)** ditambahkan dari rilis resmi Inter (OFL).
4. **Teks persis Figma**, termasuk judul bagian 9 "Cookies and Tracking Technologies" (sama dengan bagian 6).

## Isi (dari Figma)
- **Bar atas** (1611:12268): "‹ Back" (ikon CaretLeft 20px, Inter Medium 14) di kiri, logo di tengah, salinan Back tak terlihat di kanan sebagai penyeimbang.
- **Judul** (1611:11555), 40px di bawah bar: H1 General Sans Regular 42 (2 baris), jarak 24, lalu 5 baris info Inter 14 (label SemiBold #111, nilai Medium #555, line-height 1.6, jarak 8).
- **11 bagian** (1611:11567), 100px di bawah judul, lebar 900, jarak antarbagian 24:
  - Nomor (lebar 32) + jarak 8 + isi. Judul General Sans Medium 28 (letter-spacing −0.03em). Jarak judul → isi 8.
  - Isi Inter 16 #555, line-height 1.6, letter-spacing −0.03em. Subjudul dan label poin SemiBold. Daftar berpoin/bernomor dengan indentasi 24, jarak paragraf → daftar 2.
- **Footer** sama dengan homepage, 128px di bawah isi.

## File
| File | Perubahan |
|---|---|
| `src/pug/pages/privacy-policy.pug` | Halaman baru; isi sebagai data Pug |
| `src/pug/layouts/default.pug` | `block header` (default: menu bar biasa) |
| `src/pug/partials/header-back.pug` | Bar "Back + logo" |
| `src/pug/partials/footer.pug` | Tautan "Privacy Policy" → `privacy-policy.html` |
| `src/scss/pages/_privacy-policy.scss`, `src/scss/main.scss` | Style halaman |
| `src/scss/components/_header.scss` | Varian bar Back |
| `src/scss/base/_tokens.scss`, `_fonts.scss` | Token #555, Inter SemiBold |
| `src/js/back-link.js`, `src/js/main.js` | Back ke halaman sebelumnya |
| `src/assets/icons/caret-left.svg`, `src/assets/fonts/Inter-SemiBold.woff2` | Aset |

## Verifikasi
- [x] Posisi elemen kunci di 1440 dibandingkan Figma (bar, judul 144, info, bagian 1 di 524, footer).
- [x] Teks sama persis dengan Figma.
- [x] Back: kembali ke halaman sebelumnya / homepage bila langsung.
- [x] Bar atas sembunyi/muncul seperti homepage.
- [x] Homepage tidak berubah. Build tanpa error. 1280 / 1920 / 2560 tanpa scroll horizontal.

## Hasil
- **1440px, sama persis dengan Figma:** bar (Back 40,26 · logo 694,9,24), judul 40,144 599×114, info 282 (tinggi 142), awal bagian 524 / 828 / 1204 / 1458 / 1738 / 1992 / 2222 / 2526 / 2808 / 2956 / 3104, akhir isi 3202, footer 3330, tinggi halaman 3893.
- **Line-height** isi `26/16` dan info `22/14`: Figma membulatkan 160% ke 26px dan 22px per baris. Dengan 1.6 (25,6px), selisihnya menumpuk sampai 27px di bagian terakhir.
- Baris info tidak dipotong (`nowrap`), seperti di Figma (alamat lebih lebar dari kolom judul).
- **Back:** homepage → footer "Privacy Policy" → Back kembali ke homepage di posisi scroll terakhir (history). Dibuka langsung → Back ke `index.html`.
- **Bar:** tersembunyi saat scroll ke bawah, muncul saat scroll ke atas (sama dengan homepage).
- Homepage tidak berubah (menu bar biasa tetap dipakai). Tidak ada scroll horizontal di 1280, 1440, 1920, dan 2560px.
- Ikon CaretLeft adalah aset Figma apa adanya. Inter SemiBold diambil dari rilis resmi Inter 4.1 (sama dengan file Inter yang sudah ada).
- **Koin footer di belakang isi** (permintaan pengguna, sama seperti di belakang Motto pada homepage): `.policy` diberi `position: relative; z-index: 1` dan latar putih. Terukur di 1440: atas koin 125px di atas footer, dan bagian itu tertutup isi (batas bawah isi = atas footer). Karena kedua latar putih, koin terlihat muncul dari garis lurus di atas footer.
