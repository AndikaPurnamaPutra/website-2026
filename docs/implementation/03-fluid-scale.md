# 03 — Full Width dengan Skala Proporsional

Status: **Selesai (23 Okt 2026), menunggu review**
Keputusan pengguna (23 Okt 2026): **Opsi B**. Seluruh halaman diskalakan proporsional dari desain 1440px, dengan **batas atas 1920px**.

---

## 1. Tujuan dan ruang lingkup

**Tujuan:** komposisi halaman selalu sama dengan Figma di layar desktop berapa pun lebarnya.

| Lebar layar | Perilaku |
|---|---|
| **1440px** | Sama persis dengan Figma (skala 1×). Tidak ada perubahan dari kondisi sekarang |
| **1440–1920px** | Semua ukuran membesar proporsional (1920px = 1,333×) |
| **> 1920px** | Ukuran berhenti di skala 1920px. Isi selebar 1920px berada di tengah, latar section tetap selebar layar |
| **< 1440px** | Mengecil proporsional sampai batas bawah (lihat pertanyaan 1) |

**Termasuk:** token, typography, `.container`, header, dan hero yang sudah dibuat.
**Tidak termasuk:** tampilan mobile/tablet, yang tetap menunggu desain.

---

## 2. Cara kerja

Satu variabel CSS `--px` mewakili "1px di desain Figma":

```scss
// 1 design px = 1/1440 of the viewport, clamped between the min and max scale.
--px: clamp(<min>px, 100vw / 1440, 1.3333px);
```

Fungsi SCSS `fluid()` mengubah angka dari Figma menjadi ukuran yang ikut skala:

```scss
font-size: fluid(80);   // = calc(80 * var(--px)) → 80px di 1440, 106.7px di 1920
```

Dengan cara ini, angka di kode **tetap angka dari Figma**, jadi mudah dicocokkan.

**Yang ikut skala:** font-size, spacing, ukuran elemen (lebar/tinggi), posisi (misalnya koin), radius, dan lebar kontainer.
**Yang tidak ikut skala:**
- Garis border 1px: tetap 1px agar tidak kabur.
- Line-height: sudah relatif terhadap font-size, jadi otomatis ikut.
- Letter-spacing: memakai `em`, jadi otomatis ikut.

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/scss/abstracts/_functions.scss` | Baru | Fungsi `fluid()` |
| `src/scss/base/_tokens.scss` | Ubah | Tambah `--px`. Spacing, layout, radius, dan blur memakai `fluid()` |
| `src/scss/base/_typography.scss` | Ubah | Semua font-size memakai `fluid()` |
| `src/scss/base/_layout.scss` | Ubah | Lebar maksimal `.container` = 1440 × `--px` (berhenti di 1920px) |
| `src/scss/components/_header.scss` | Ubah | Ukuran px diganti `fluid()` |
| `src/scss/sections/_hero.scss` | Ubah | Ukuran px diganti `fluid()` |
| `src/pug/partials/hero.pug` | Ubah | Kelas untuk ikon sosial. Atribut `width`/`height` dipertahankan (mencegah layout bergeser saat gambar dimuat), dan ukuran sebenarnya diatur CSS |
| `docs/design-system.md` | Ubah | Catat aturan skala |

---

## 4. Urutan implementasi
1. Buat `_functions.scss` dan tambahkan `--px` di token.
2. Ubah token, typography, dan `.container`.
3. Ubah header dan hero.
4. Build dan verifikasi (bagian 6).
5. Perbarui `docs/design-system.md` dan checklist.

---

## 5. Hal yang perlu klarifikasi

1. ~~Batas bawah skala~~: **1280px** (0,889×), disetujui. Di bawah 1280px ukuran tetap dan layout menyesuaikan lebar layar.

---

## 6. Verifikasi dan acceptance criteria
- [x] `npm run build` tanpa error.
- [x] **1440px:** semua posisi elemen hero sama dengan pengukuran sebelumnya (tabel di `02-hero.md`).
- [x] **1920px:** semua posisi dan ukuran = nilai 1440px × 1,333 (selisih terbesar 0,7px, pada pill jam).
- [x] **2560px:** tampilan sama dengan 1920px, isi di tengah (margin 320px).
- [x] **1280px:** skala berhenti di 0,889× (selisih terbesar 0,2px).
- [x] **1024px:** tidak ada scroll horizontal. Headline tetap 3 baris, dan koin tidak menutupi teks.
- [x] Border tetap 1px di semua ukuran layar.
- [x] Halaman `styleguide.html` tetap berfungsi.

**Catatan:** di Windows dengan scrollbar yang selalu terlihat, `100vw` termasuk lebar scrollbar (±17px), jadi skala bisa sekitar 1% lebih besar dari lebar konten. `.container` tetap `width: 100%`, jadi tidak muncul scroll horizontal.

---

## 7. Checklist progres
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: `fluid()` + `--px`
- [x] Langkah 2: Token, typography, `.container` (tidak perlu diubah, karena sudah memakai token)
- [x] Langkah 3: Header dan hero
- [x] Langkah 4: Verifikasi
- [x] Langkah 5: Dokumentasi
