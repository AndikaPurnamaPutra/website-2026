# 02 — Menu Bar + Hero

Status: **Selesai (23 Okt 2026), menunggu review** · Figma: Homepage `1523:3214` → Hero `1523:3215` (1440 × 1439).
Bergantung pada: [01-design-system.md](01-design-system.md) (selesai).

Label: **[T]** dari layer Figma · **[D]** diturunkan dari posisi/ukuran · **[?]** belum pasti.

---

## 1. Tujuan dan ruang lingkup

**Tujuan:** membangun menu bar dan hero homepage yang sama dengan Figma di lebar 1440px.

**Termasuk:**
- Menu bar: logo dan 5 link navigasi.
- Hero: headline (teks asli), dua ikon sosial, deskripsi perusahaan, tanggal/jam, gambar koin, showreel dengan tombol "Play Showreel".

**Tidak termasuk:**
- Dropdown "Work": tidak ada desainnya.
- Pemutar video showreel: belum ada file atau desainnya.
- Animasi apa pun: tidak ada desain animasi untuk hero.
- Tampilan mobile: menunggu desain.
- Section lain.

---

## 2. Requirement dari desain

### 2.1 Struktur vertikal (total 1439px) [T]
| Bagian | Tinggi | Jarak |
|---|---|---|
| Padding atas | 40 | |
| Menu bar | 24 | |
| Gap | 80 | |
| Hero content (headline dan info) | 394 | |
| Gap | 80 | |
| Showreel | 781 | |
| Padding bawah | 40 | |

Padding kiri-kanan 40px, lebar isi 1360px. [T]

### 2.2 Menu bar [T]
- Logo SVG 50.25 × 24 di kiri.
- Navigasi di kanan, gap 40px: **Work** (dengan ikon chevron 16px), About, Team, Services, Career.
- Teks: Inter Medium 14px, line-height normal, -0.02em, `#111` → `.text-14.text-medium` dengan line-height normal.
- Menu bar yang sama muncul di semua halaman lain (Contact, Team, About, dan seterusnya), jadi dibuat sebagai **partial di layout**.

### 2.3 Hero content [T]
Flex, `justify-content: space-between`, `align-items: center`.

**Kiri (lebar 789.75px, gap 80px):**
- Headline `h1` → `.text-display-80`. Baris 1: "Elite digital products", baris 2–3: "designed at venture speed" (terbungkus otomatis pada lebar 790px). Total 3 baris × 88px = 264px.
- Gradient brand hanya pada "Elite digital". Di Figma, gradient-nya berupa bidang 385 × 93px di pojok kiri atas, dengan sudut ≈201deg.
- Ikon sosial: 2 kotak 50 × 50, gap 11px, latar `--color-surface-soft`, radius 4px.
  - Behance: PNG 32 × 21.12.
  - Dribbble: SVG 24 × 24.

**Kanan (lebar 321px, gap 45px):**
- Deskripsi: Inter Medium 14px, line-height 1.6. Ada baris baru paksa setelah "branding,".
- Tanggal "Wednesday, October 14": Inter Medium 14px, line-height 1.7.
- Baris zona waktu (gap 5px): "IDN  /  GMT +7" dan pill jam.
  - Pill: border 1px `--color-border-strong`, radius 4px, padding 6px 10px, tinggi 24px.
  - Teks jam: **General Sans Medium** 14px.

### 2.4 Koin [T]
- PNG 448 × 420, `object-position: bottom`, shadow `0 4px 4px rgba(0,0,0,.25)`.
- Posisi absolut: 638px dari kiri dan 325px dari atas kontainer isi. Jadi tengahnya 182px di kanan titik tengah.
- Berada **di belakang** showreel: bagian bawah koin tertutup showreel.
- Shadow dibuat dengan `filter: drop-shadow`, bukan `box-shadow`, agar mengikuti bentuk koin dan bukan kotak gambar. [D]

### 2.5 Showreel [T]
- Kotak 1360 × 781, radius 4px, `overflow: hidden`, gambar `object-fit: cover`.
- Tombol di tengah: latar `--color-glass-button`, radius pill, padding 10px 16px, gap 4px.
  - Label "Play Showreel": Inter Medium 14px, line-height 1.7, putih.
  - Ikon play 16px.
- Render Figma menunjukkan pinggiran terang/efek glass pada tombol yang **tidak ada di data MCP**. [?]

### 2.6 Aset (diunduh dari Figma saat implementasi)
| Aset | Format | Tujuan |
|---|---|---|
| Logo | SVG | `src/assets/images/logo.svg` |
| Koin | PNG | `src/assets/images/hero/coin.png` |
| Gambar showreel | PNG | `src/assets/images/hero/showreel.png` |
| Behance | PNG | `src/assets/icons/behance.png` |
| Dribbble | SVG | `src/assets/icons/dribbble.svg` |
| Chevron "Work" | SVG | `src/assets/icons/chevron-down.svg` |
| Ikon play | SVG | `src/assets/icons/play.svg` |

Link aset dari Figma kedaluwarsa dalam 7 hari. Jika lewat, saya ambil ulang dari Figma.

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/header.pug` | Baru | Menu bar |
| `src/pug/partials/hero.pug` | Baru | Hero |
| `src/pug/layouts/default.pug` | Ubah | Memanggil `header.pug` di atas `main`. (Perbaikan baris kosong di `<title>` dibatalkan: browser sudah memangkasnya, jadi tidak perlu mengubah halaman lain.) |
| `src/pug/pages/index.pug` | Ubah | "Hello, OWW" diganti dengan hero |
| `src/scss/base/_layout.scss` | Baru | Kelas `.container` (lebar 1360px, padding 40px) |
| `src/scss/components/_header.scss` | Baru | Style menu bar |
| `src/scss/sections/_hero.scss` | Baru | Style hero |
| `src/scss/main.scss` | Ubah | Menambah 3 `@use` |
| `src/js/hero-clock.js` | Baru, **jika jam dibuat live** | Tanggal dan jam waktu Jakarta |
| `src/js/main.js` | Ubah, **jika jam dibuat live** | Memanggil `hero-clock.js` |
| `src/assets/images/…`, `src/assets/icons/…` | Baru | Aset di tabel 2.6 |

**Kenapa header di layout:** semua halaman memakai menu bar yang sama. Saat Barba.js dipakai nanti, menu bar juga sebaiknya berada di luar area yang berganti, supaya tidak ikut dimuat ulang.

---

## 4. Urutan implementasi
1. Unduh aset dari Figma dan periksa (file tidak kosong, ukuran sesuai).
2. Buat `_layout.scss` (`.container`).
3. Buat `header.pug` dan `_header.scss`, lalu pasang di layout.
4. Buat `hero.pug` dan `_hero.scss`: headline, ikon sosial, info, koin, showreel.
5. (Jika disetujui) buat `hero-clock.js`.
6. Build, ambil screenshot di 1440px, bandingkan dengan screenshot Figma, lalu perbaiki selisihnya.
7. Perbarui checklist.

---

## 5. Pertimbangan teknis
- **Headline teks asli:** baris baru setelah "products" dibuat dengan `<br>`. Baris kedua dan ketiga terbungkus otomatis pada lebar 790px, sama seperti di Figma.
- **Pill jam:** Figma memotong ruang kosong di atas dan bawah teks (`text-box-trim`), dan fitur ini belum didukung semua browser. Saya memakai tinggi tetap 24px dan teks di tengah, jadi hasilnya sama di semua browser.
- **Urutan tumpukan:** koin ditulis sebelum showreel di HTML, dan showreel diberi `position: relative`, sehingga showreel menutupi koin, sama seperti di Figma.
- **Lebar layar selain 1440px:** lihat pertanyaan 8.

---

## 6. Keputusan (dijawab pengguna, 23 Okt 2026)
1. **Link navigasi:** `#` dulu.
2. **Dropdown "Work":** dibuat **dummy**. Isinya 5 kategori yang ada di desain (filter Our Work: Branding, UI/UX, Illustration, 2D/3D, Graphic Design), semua link `#`. Muncul saat hover atau fokus keyboard, dengan CSS saja (tanpa JS). Style dari token yang ada: latar putih, border `--color-border`, radius 4px, teks `.text-14.text-medium`. *Ini interpretasi sementara, bukan dari Figma.*
3. **Menu bar saat scroll:** ikut tergulir.
4. **Tanggal dan jam:** live, waktu Jakarta (`Asia/Jakarta`), diperbarui setiap menit, dengan format yang sama seperti Figma.
5. **Behance/Dribbble:** sementara mengarah ke `https://www.behance.net` dan `https://dribbble.com`, dibuka di tab baru.
6. **Tombol showreel:** tampil saja, belum melakukan apa-apa.
7. **Efek tombol showreel:** glass ala Apple. Latar `--color-glass-button` (dari Figma), ditambah `backdrop-filter: blur + saturate` dan pinggiran tipis terang. *Nilai blur dan pinggiran adalah interpretasi, karena tidak terbaca lewat MCP.*
8. **Lebar layar:** di atas 1440px isi tetap 1360px di tengah. Di 1024–1439px lebar isi menyesuaikan, margin 40px.
9. **Gambar showreel:** boleh dikonversi ke JPG/WebP.

---

## 7. Verifikasi dan acceptance criteria

**Verifikasi:**
- `npm run build` tanpa error.
- Screenshot halaman di 1440px dibandingkan berdampingan dengan screenshot Figma hero.
- Posisi dan ukuran elemen utama dicek di browser (logo, nav, headline, info, koin, showreel).
- Semua aset termuat (status 200) dan tidak ada link Figma sementara di kode.

**Acceptance criteria:**
- [x] Tinggi hero 1439px di layar 1440px (header 64 + hero 1375).
- [x] Posisi elemen utama selisihnya ≤ 2px dari Figma (selisih terbesar: navigasi 1,7px lebih sempit).
- [x] Headline 3 baris, pemenggalan baris sama dengan Figma, gradient hanya pada "Elite digital".
- [x] Koin di posisi yang benar (678, 365) dan sebagian tertutup showreel.
- [x] Semua aset dari Figma dipakai di tempat yang sama, tanpa pengganti. Showreel dikonversi ke JPG (disetujui).
- [x] Menu bar tampil di semua halaman lewat layout.
- [x] Tidak ada elemen, animasi, atau interaksi yang tidak ada di desain, kecuali dropdown dummy dan efek glass yang diminta.
- [x] Halaman `styleguide.html` tetap berfungsi.

**Hasil pengukuran di browser (1440px), dibandingkan dengan Figma:**
| Elemen | Hasil (x, y, w, h) | Figma |
|---|---|---|
| Logo | 40, 40, 50.25, 24 | 40, 40, 50.25, 24 |
| Navigasi | 1015.7, 40, 384.3, 17 | 1014, 40, 386, 17 |
| Headline | 40, 144, 789.75, 264 | 40, 144, 789.75, 264 |
| Info | 1079, 257, 321, 168 | 1079, 257.5, 321, 167 |
| Pill jam | 1177.8, 401, 77.8, 24 | 1178, 400.5, 79, 24 |
| Koin | 678, 365, 448, 420 | 678, 365, 448, 420 |
| Showreel | 40, 618, 1360, 781 | 40, 618, 1360, 781 |
| Tombol showreel | 648.6, 986.6, 142.8, 43.8 | 649, 987, 143, 44 |

**Pengujian lain:** jam live cocok dengan waktu Jakarta, dropdown muncul saat Work difokus atau di-hover, semua aset status 200, tidak ada link Figma di `src/`, tidak ada scroll horizontal di 1280px dan 1920px.

---

## 8. Checklist progres
- [x] Analisis Figma hero
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: Aset
- [x] Langkah 2: `.container`
- [x] Langkah 3: Header
- [x] Langkah 4: Hero
- [x] Langkah 5: Jam live
- [x] Langkah 6: Verifikasi dan perbaikan
