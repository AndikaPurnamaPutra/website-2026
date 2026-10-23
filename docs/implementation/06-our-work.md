# 06 — Section Our Work

Status: **Selesai (23 Okt 2026), menunggu review** · Figma: Homepage `1523:3214` → `1523:3316` (1440 × 1418).
Frame lain di Phase 4 (`1517:2876`, `1516:1833`, "Latest Work" dengan layout masonry) adalah **versi lama** dan tidak dipakai.
Data animasi Figma: kosong. Tidak ada desain untuk hover, state tombol panah, atau interaksi kategori.

Label: **[T]** dari layer Figma · **[D]** diturunkan · **[U]** usulan.

**Catatan dari pengguna:** kategori (Branding, UI/UX, Illustration, 2D/3D, Graphic Design) **bukan filter** untuk kartu di carousel.

---

## 1. Tujuan dan ruang lingkup
**Termasuk:** judul section, daftar kategori, dua carousel proyek ("Recently Added" dan "Selected Work", masing-masing 5 kartu), dua garis pemisah, dan tombol "More Work".
**Tidak termasuk:** halaman detail proyek, halaman Work, filter, mobile, dan section lain.

---

## 2. Requirement dari desain

### 2.1 Layout [T]
- Latar putih. Padding 180px atas/bawah, 40px kiri/kanan (kontainer 1360px).
- Isi tersusun vertikal, gap 40px: header (146px), garis, dua carousel (710px), garis, tombol.

### 2.2 Header [T]
- **Kiri** (gap 16px):
  - Eyebrow "( Our Work )": `.text-16.text-muted`, line-height 1.
  - Judul "Thoughtful Design, / Real Impact": `.text-heading-42`, 2 baris.
- **Kanan**, sejajar bawah: 5 kategori, Inter Medium 16px, line-height 1, opacity 0.5, gap 22px.

### 2.3 Garis pemisah [T]
1px `--color-divider` (#E7E7E7), selebar kontainer.

### 2.4 Carousel (×2, jarak antar carousel 60px) [T]
- **Baris judul** (tinggi 28px):
  - Judul `.text-heading-28`.
  - Di kanan: dua tombol panah (ikon CaretRight 24px, gap 8px). Panah kiri adalah ikon yang sama, diputar.
- Gap 24px ke deretan kartu.
- **Kartu:** lebar 325px, gap 20px.
  - Gambar 325 × 244. Setiap gambar punya potongan (crop) sendiri di Figma, dan crop itu akan diikuti persis.
  - Gap 16px ke caption.
  - Caption Inter Medium 13px, line-height 1.
- **Kartu ke-5 melewati batas kontainer** dan terpotong di tepi kanan halaman. Ini menunjukkan bahwa carousel bisa digeser.

| Recently Added | Selected Work |
|---|---|
| HealthTech Website Design — WELLMO | Train Tricket Illustration |
| 3D Motion Design - Beyond Boundaries | Indonesian Seafood Sambal |
| UI components for Papersky - SaaS Dashboard | Symata - Landing Page Creative Studio |
| NexaDash Sales Analytics & Revenue | Kidoo - Character Design |
| Chainlytics — Crypto Market Analytics Dashboard | HealthTech Website Design — WELLMO |

Teks caption ditulis persis seperti di Figma, termasuk "Tricket" dan campuran tanda "—" dan "-". Lihat pertanyaan 6.

### 2.5 Tombol "More Work" [T]
Latar `#111`, radius 4px, padding 10px 20px, teks `.text-18` putih. **Sama persis dengan label tombol CTA** di section Statement, jadi style-nya dipakai bersama (tanpa bingkai, ikon, dan efek hover CTA).

### 2.6 Aset
| Aset | Tujuan |
|---|---|
| 10 gambar thumbnail proyek | `src/assets/images/work/*.jpg` |
| Ikon CaretRight (2 versi dari Figma, dicek apakah identik) | `src/assets/icons/caret-right.svg` |

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/our-work.pug` | Baru | Data proyek dan markup |
| `src/pug/mixins/work-carousel.pug` | Baru | Mixin carousel (dipakai 2×) |
| `src/scss/sections/_our-work.scss` | Baru | Header, garis, tombol |
| `src/scss/components/_work-carousel.scss` | Baru | Carousel dan kartu |
| `src/scss/components/_cta-button.scss` | Ubah | Style label dipakai bersama dengan kelas `.button` |
| `src/js/work-carousel.js` | Baru | Tombol panah menggeser carousel. Mengembalikan fungsi cleanup |
| `src/js/main.js` | Ubah | Memanggil `work-carousel.js` |
| `src/scss/main.scss`, `src/pug/pages/index.pug`, `src/pug/layouts/default.pug` | Ubah | Menambah `@use` dan include |
| `src/assets/…` | Baru | Aset di tabel 2.6 |

**Kenapa carousel dibuat sebagai mixin:** dua carousel di section ini identik, dan carousel serupa kemungkinan dipakai lagi di halaman Work.

---

## 4. Urutan implementasi
1. Unduh aset, catat data crop setiap gambar, dan konversi gambar ke JPG.
2. Header, garis, dan tombol.
3. Carousel statis (kartu, crop gambar, caption, kartu ke-5 terpotong).
4. Bandingkan dengan Figma (posisi ≤ 2px di 1440px).
5. JS tombol panah.
6. Uji panah, geser dengan trackpad, resize, dan 1920px.
7. Uji ulang perpindahan keluar dari section What we do (tertunda dari 05).
8. Perbarui checklist.

---

## 5. Usulan untuk bagian yang tidak ada di Figma [U]
1. **Cara carousel bergeser:** scroll horizontal bawaan browser (trackpad, swipe, shift+scroll), dengan snap ke setiap kartu dan scrollbar disembunyikan. Tombol panah menggeser satu kartu (345px) dengan animasi halus.
2. **Batas geser:** kartu pertama sejajar kontainer (40px dari kiri). Saat digeser, kartu boleh keluar sampai tepi layar, baik kiri maupun kanan, seperti kartu ke-5 di Figma.
3. **Panah di ujung carousel:** saat tidak bisa digeser lagi ke arah itu, panahnya dibuat redup (opacity 0.3) dan tidak bisa diklik.
4. **Hover kartu:** tidak ada efek, karena tidak ada di desain.
5. **Kartu dan tombol "More Work":** link `#` dulu, sampai halaman proyek dan halaman Work dibuat.
6. **Reduce motion:** geser panah tanpa animasi halus.

---

## 6. Keputusan (dijawab pengguna, 23 Okt 2026)
1. **Kategori:** link ke halaman Work untuk kategori itu (`#` dulu).
2. **Hover kategori:** opacity 0.5 → 1.
3. Semua usulan di bagian 5 disetujui.
4. Thumbnail dikonversi ke JPG dan dibatasi ukurannya.
5. **Jumlah kartu:** boleh ditambah nanti. Untuk sekarang tetap 5 per carousel, sesuai Figma (tidak mengarang konten).
6. **Caption:** ditulis persis seperti di Figma dulu.

---

## 7. Verifikasi dan acceptance criteria
- [x] `npm run build` tanpa error.
- [x] Tinggi section 1418px di 1440px. Header, garis, judul carousel, panah, kartu, caption, dan tombol tepat sama dengan Figma (selisih ≤ 1,4px). **Pengecualian:** deretan kategori 4,4px lebih ke kanan, karena teks Inter di browser sedikit lebih sempit dari Figma. Ujung kanannya tetap tepat di 1400.
- [x] Crop setiap gambar sama dengan Figma (dibandingkan berdampingan dengan screenshot Figma).
- [x] Kartu ke-5 terpotong di x = 1420, sama seperti di Figma.
- [x] Panah menggeser tepat satu kartu (345px). Di awal panah kiri redup, setelah digeser panah kanan redup.
- [x] Swipe/scroll horizontal: geseran pendek kembali ke posisi semula (snap), geseran panjang maju satu kartu. Halaman tidak ikut ter-scroll vertikal.
- [x] 1920px: kartu 433,3px, kartu pertama di 53,3px. 2560px: kartu pertama sejajar kontainer (373,3px).
- [x] Scroll dari langkah terakhir What we do langsung lanjut ke Our Work, dan scroll ke atas kembali masuk ke section yang tertahan.
- [x] Section sebelumnya tidak berubah (posisi hero, statement, dan services diukur ulang).

**Perbaikan selama pengujian:**
1. Kartu menempel di tepi kiri: aturan reset `ul[class]` menimpa padding carousel. Reset diubah ke `:where()` (prioritas nol). Ini berlaku untuk semua komponen ke depannya.
2. Judul 2px lebih pendek: Figma menghitung line-height "normal" General Sans 42px sebagai 57px. `.text-heading-42` sekarang memakai nilai itu.
3. Garis pemisah tidak terlihat: `<hr>` bawaan Chrome memakai `overflow: hidden`.
4. **(Setelah review pengguna)** Carousel bisa bergerak naik-turun 1px saat di-scroll vertikal. `overflow-x: auto` otomatis membuat sumbu y juga bisa di-scroll, dan isinya 1px lebih tinggi karena huruf caption menjorok ke bawah. Diperbaiki dengan `overflow-y: hidden`. Diuji: scroll vertikal di atas carousel sekarang menggerakkan halaman, sementara geser horizontal tetap bekerja.

**Aset:** 9 thumbnail (±21 MB PNG) dikonversi ke JPG, maksimal 1280px (±1,9 MB). Gambar "Train Tricket" identik dengan ilustrasi di What we do, jadi file itu dipakai ulang. Ikon panah: dua file Figma identik, jadi dipakai satu file dan dibalik dengan CSS.

---

## 8. Checklist progres
- [x] Analisis Figma (section final, versi lama, data animasi)
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: Aset
- [x] Langkah 2–4: Layout statis dan verifikasi
- [x] Langkah 5–6: JS carousel dan pengujian
- [x] Langkah 7: Uji perpindahan dari What we do
- [x] Langkah 8: Dokumentasi
