# 01 — Design System Foundation

Status: **Selesai (23 Okt 2026), menunggu review** · Sumber: Figma `WEBSITE-2026` (file `plgHei2CRPFohXrt3OLhGk`), node `1523:3214` "Homepage", halaman **Phase - 4**.

Label kepastian yang dipakai di dokumen ini:
- **[T]** Terkonfirmasi: dibaca langsung dari properti layer Figma.
- **[D]** Diturunkan: dihitung dari ukuran/posisi layer, bukan dari pengaturan Figma.
- **[?]** Belum pasti / tidak tersedia: perlu klarifikasi.

---

## 1. Tujuan dan ruang lingkup

**Tujuan:** menyiapkan fondasi styling (tokens, font, reset, typography) agar semua section nanti dibangun dari nilai yang sama dan sesuai Figma.

**Termasuk:**
- Design tokens sebagai CSS custom properties dan SCSS.
- Pemuatan font (Inter dan General Sans).
- Reset/base styles dan kelas typography.
- Task Gulp untuk menyalin aset statis (font, gambar) ke `dist/`.
- `docs/design-system.md` yang mencatat keputusan yang sudah disetujui.

**Tidak termasuk:** navbar, hero, section apa pun, animasi, Barba, dan pengunduhan aset gambar per section. Aset gambar diunduh saat section terkait dikerjakan.

---

## 2. Temuan awal dari Figma

### 2.1 Struktur file
| Halaman | Isi |
|---|---|
| Cover, `-`, Wireframe copywriting, Phase 1–3 | Tidak diperiksa (versi lama/arsip) |
| **Assets** | **Kosong** |
| **Phase - 4** | Desain terbaru: Homepage (`1523:3214`), Contact, Team, About, Services, Career, Work, serta section interaksi: "Section-2 (Button/Text Interaction)", "Section-3 (Details)", "CTA" (6 frame), "CTA - Darkmode" |

- **Tidak ada variables** pada node Homepage (`get_variable_defs` kosong). [T]
- **Tidak ada library** yang terhubung ke file ini, dan tidak ada text/color style lokal. Semua nilai ditulis langsung di layer. [T]
- Semua frame halaman berukuran **1440px**. **Tidak ada desain mobile atau tablet.** [T]
- Di Phase 4 juga ada frame "Homepage" lain (`1516:1547`, `1516:2094`) di dalam section `1519:3213`. Saya menganggap `1523:3214` sebagai versi final. [?]

### 2.2 Section Homepage (1440 × 8584)
1. Hero: menu bar, headline, info perusahaan, showreel
2. Statement ("We specialize…") dan CTA "Schedule a call"
3. What we do: latar gelap, kartu layanan glass, gambar besar
4. Our Work: filter, 2 baris carousel proyek, tombol "More Work"
5. Trusted Clients: grid logo 4×3, carousel testimoni
6. Milestone: angka statistik
7. Motto CTA: latar gelap bertekstur
8. Footer

---

## 3. Design tokens

### 3.1 Warna
| Token (usulan) | Nilai | Dipakai di | |
|---|---|---|---|
| `--color-ink` | `#111111` | Teks utama, latar gelap, tombol | [T] |
| `--color-white` | `#FFFFFF` | Latar terang, teks di latar gelap | [T] |
| `--color-surface-muted` | `#F6F6F6` | Latar section Clients | [T] |
| `--color-surface-soft` | `#EEEEEE` | Kotak ikon sosial (hero) | [T] |
| `--color-ink-2` | `#1F1F1F` | Ujung gradient latar CTA (`#111 → #1F1F1F`) | [T] |
| `--color-divider` | `#E7E7E7` | Garis pembatas di latar terang | [T] |
| `--color-border` | `#EDEDED` | Border kartu testimoni | [T] |
| `--color-border-row` | `#F0F0F0` | Garis bawah baris Milestone | [T] |
| `--color-border-strong` | `#D9D9D9` | Border pill jam (hero) | [T] |
| `--color-border-dark` | `#3D3D3D` | Border tag di latar gelap | [T] |
| `--color-link` | `#3E78FF` | Link di dalam testimoni | [T] |
| `--color-glass` | `rgba(255,255,255,0.04)` + `backdrop-filter: blur(100px)` | Kartu layanan di latar gelap | [T] |
| `--color-glass-button` | `rgba(255,255,255,0.1)` | Tombol "Play Showreel" | [T] |
| `--color-divider-dark` | `rgba(255,255,255,0.1)`, 0.5px | Garis di kartu gelap | [T] |

**Teks redup:** desain memakai `opacity: 0.5` pada teks (label, caption), bukan warna abu-abu. Ada satu pengecualian: paragraf Milestone memakai `rgba(0,0,0,0.4)`. [T]

**Brand gradient** (dipakai di headline hero, "$139M+", dan "believers."): [T]
- Latar terang: `linear-gradient(≈201–207deg, #033DC5 18.9%, #FFDC7B 52.4%, #FD1D1D 80.9%)`
- Latar gelap (CTA): biru diganti `#457BF9`, sudut ≈185deg

Sudutnya sedikit berbeda di tiap elemen. Usulan: satu token gradient dengan warna yang sama, sudut diatur per elemen.

### 3.2 Typography

**Font family:** [T]
- **General Sans** (Regular 400, Medium 500): heading dan display.
- **Inter** (Regular 400, Medium 500): body, label, navigasi, tombol.
- "Inter Display Medium" muncul sekali (paragraf Milestone), tetapi isinya di-override ke Inter Medium. [T]

**Type scale yang ditemukan:**

| Usulan nama | Font | Size / line-height / letter-spacing | Contoh | |
|---|---|---|---|---|
| `display-80` | General Sans 400 | 80 / 1.1 / -2.4px (-3%), `#111` | Headline hero | [T]* |
| `display-48` | General Sans 400 | 48 / 1.1 / -1.44px (-3%) | "$139M+", "120+" | [T] |
| `heading-42` | General Sans 400 | 42 / normal / -1.26px (-3%) | Judul section | [T] |
| `heading-42-statement` | General Sans 400 | 42 / 1.6 / -1.68px (-4%) | "We specialize…" | [T] |
| `heading-42-tight` | General Sans 400 | 42 / 1.1 / -1.26px | "Design to advocates…" | [T] |
| `heading-28` | General Sans 400 | 28 / 1 / -0.56px (-2%) | "Recently Added", "Branding" | [T] |
| `title-22` / `title-20` | General Sans 400 | 22 dan 20 / 1 / -2% | Kartu layanan bertumpuk | [T] |
| `text-20-display` | General Sans 400 | 20 / normal / -0.4px | Link footer, tagline footer | [T] |
| `text-20` | Inter 500 | 20 / 1.4 / -0.4px | Paragraf Milestone | [T] |
| `text-18` | Inter 500 | 18 / normal / -0.36px | Label tombol | [T] |
| `text-16` | Inter 500 | 16 / 1 atau 1.7 / -0.32px | Eyebrow "( Our Work )", filter, label statistik | [T] |
| `text-14` | Inter 400/500 | 14 / 1.4–1.7 / -0.28px | Nav, body, tag, footer meta | [T] |
| `text-13` | Inter 500 | 13 / 1 / -0.26px | Caption proyek | [T] |
| `text-12` | Inter 400/500 | 12 / 1.4 / -0.24px | Nama dan jabatan di testimoni | [T] |

\* Nilai headline hero diberikan langsung oleh pengguna (dari Figma), karena di MCP layer-nya berupa SVG. Headline dibuat sebagai **teks asli**, bukan SVG. Gradient pada kata "Elite digital" tetap mengikuti desain.

**Pola:** letter-spacing hampir selalu **-2% dari font-size**, dan -3% sampai -4% untuk heading besar. Bisa dibuat satu aturan umum dengan beberapa pengecualian. [D]

**Line-height text-14 bervariasi:** 1.4 (quote), 1.5 (paragraf gelap), 1.6 (deskripsi hero), 1.7 (tanggal/label), normal (nav). Ini memang berbeda di Figma. [T]

### 3.3 Spacing
| Nilai | Dipakai untuk | |
|---|---|---|
| 4, 8, 16, 20, 24, 32, 40, 60, 80 | Gap dan padding yang paling sering muncul | [T] |
| 11, 22, 45, 110, 254 | Kasus khusus (gap ikon sosial, filter, footer, CTA) | [T] |
| **40px** | Padding horizontal halaman (kontainer 1360 di 1440) | [T] |
| 180 / 200 / 220px | Padding vertikal section (Work, Clients, CTA / Milestone / Statement) | [T] |

Usulan: token spacing hanya untuk nilai yang sering dipakai (`4 8 16 20 24 32 40 60 80`). Nilai khusus ditulis langsung di section terkait.

### 3.4 Layout dan grid
- Lebar desain: **1440px**, kontainer utama **1360px** (margin 40px). [T]
- Kontainer sempit: **1050px** (Statement, CTA) dan **1130px** (Clients). [T]
- Layout grid Figma tidak bisa dibaca lewat MCP. Dari posisi elemen, polanya cocok dengan **12 kolom, gutter 20px, margin 40px** (kolom ≈95px). Contoh: kartu proyek 325px = 3 kolom, kolom kanan Milestone mulai di 690px = 6 kolom. [D]

### 3.5 Border, radius, efek
| Token | Nilai | |
|---|---|---|
| `--radius-sm` | **4px**: hampir semua (gambar, tombol, tag, kartu) | [T] |
| `--radius-md` | **8px**: bingkai luar tombol CTA | [T] |
| `--radius-pill` | **1000px**: tombol "Play Showreel" | [T] |
| Border | 1px solid; divider footer 0.5px | [T] |
| Shadow | `0 4px 4px rgba(0,0,0,0.25)`: hanya pada gambar koin | [T] |
| Texture | gambar bertekstur, `mix-blend-mode: screen`, opacity 0.1 (CTA) | [T] |

### 3.6 Breakpoint
- **Hanya desktop 1440px yang tersedia.** [T]
- Desainer akan membuat desain mobile nanti. **Breakpoint ditunda** sampai desain itu tersedia. Fondasi ini dibuat untuk desktop dulu, tanpa mengunci keputusan responsive.

### 3.7 Aset (inventaris, belum diunduh)
| Jenis | Contoh | Catatan |
|---|---|---|
| Logo OWW | SVG dengan radial gradient | Di menu bar dan footer |
| Headline hero | SVG di Figma (teks di-outline) | Tidak dipakai. Dibuat sebagai teks asli (80px) |
| Gambar | Koin, showreel, thumbnail proyek, botol parfum, folder, texture, avatar | PNG |
| Ikon | Chevron nav, play, ArrowCircleDownRight, CaretRight, Behance (PNG), Dribbble (SVG) | Campuran PNG/SVG |
| Logo klien | 12 logo | Banyak yang tersusun dari potongan vector/mask. Lebih baik diekspor utuh per logo |

Halaman Assets di Figma kosong, jadi aset diambil langsung dari layer di Homepage.

---

## 4. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/scss/base/_tokens.scss` | Baru | CSS custom properties: warna, gradient, font, spacing, radius, kontainer |
| `src/scss/base/_fonts.scss` | Baru | `@font-face` Inter dan General Sans |
| `src/scss/base/_reset.scss` | Baru | Reset yang sekarang ada di `main.scss`, ditambah reset dasar (img, button, a) |
| `src/scss/base/_typography.scss` | Baru | Kelas typography sesuai tabel 3.2 |
| `src/scss/abstracts/_breakpoints.scss` | **Ditunda** sampai desain mobile tersedia | Mixin media query |
| `src/pug/pages/styleguide.pug` | Baru (sementara) | Halaman cek font, warna, dan typography di browser. Tidak ditautkan dari halaman lain |
| `src/scss/main.scss` | Ubah | Menjadi file `@use` saja |
| `src/assets/fonts/` | Baru | File font `.woff2` |
| `gulpfile.js` | Ubah | Task `assets` (salin `src/assets/**` ke `dist/assets/`) dan perbaikan watch JS |
| `docs/design-system.md` | Baru | Ringkasan keputusan yang disetujui |

**Catatan teknis untuk `gulpfile.js`:**
- Gulp 5 membaca file sebagai teks secara default. Untuk font dan gambar wajib `src(..., { encoding: false })`, karena tanpa itu file biner akan rusak.
- Watch JS saat ini hanya memantau `src/js/main.js`. Jika JS nanti dipecah menjadi beberapa file, perubahan tidak akan terdeteksi. Usulan: ubah ke `src/js/**/*.js` (entry esbuild tetap `main.js`).

**Kenapa CSS custom properties:** nilainya bisa dipakai langsung oleh SCSS dan oleh GSAP/JS. Breakpoint tetap memakai SCSS karena media query tidak bisa memakai custom properties.

---

## 5. Urutan implementasi
1. Tambahkan task `assets` di Gulp dan perbaiki watch JS. Pastikan build tetap berjalan.
2. Unduh General Sans (fontshare.com) dan Inter (rilis resmi rsms/inter) dalam format `.woff2`, berat 400 dan 500 saja. Simpan di `src/assets/fonts/` dan tulis `_fonts.scss`.
3. Tulis `_tokens.scss`.
4. Pindahkan reset ke `_reset.scss`, lalu atur `main.scss` menjadi daftar `@use`.
5. Tulis `_typography.scss`.
6. Buat `styleguide.pug` untuk mengecek hasil di browser.
7. Tulis `docs/design-system.md`.
8. Verifikasi (bagian 7).

---

## 6. Hal yang perlu klarifikasi

**Sudah dijawab:**
1. ~~Desain mobile/tablet~~: desainer akan membuatnya nanti.
2. ~~Breakpoint~~: ditunda sampai desain mobile tersedia.
3. ~~Font General Sans~~: belum punya file; boleh diunduh dari fontshare.com.
4. ~~Headline hero~~: teks asli, General Sans 400, 80px / 110% / -2.4px, `#111`.
5. ~~Halaman verifikasi~~: boleh membuat `styleguide.pug`.

6. ~~Frame Homepage yang benar~~: `1523:3214` adalah versi final.
7. ~~Logo klien~~: desainer akan mengekspor tiap logo sebagai satu SVG.

---

## 7. Verifikasi dan acceptance criteria

**Verifikasi:**
- `npm run build` selesai tanpa error.
- `dist/assets/fonts/*.woff2` ada dan ukurannya sama dengan file di `src/` (tidak rusak).
- `npm run dev`: di browser, tab Network menunjukkan font termuat (status 200), dan computed style memakai General Sans/Inter, bukan font cadangan.
- Setiap nilai di `_tokens.scss` dicocokkan dengan tabel di bagian 3.
- Mengubah file `.js` selain `main.js` memicu reload.

**Acceptance criteria:**
- [x] Semua token bertanda [T] tersedia dan nilainya sama persis dengan Figma.
- [x] Tidak ada token karangan. Nilai [?] tidak diisi tebakan.
- [x] Kedua font tampil benar (400 dan 500), dicek lewat screenshot `styleguide.html`.
- [x] Kelas typography menghasilkan size, line-height, dan letter-spacing yang sama dengan tabel 3.2.
- [x] Build berjalan, dan halaman yang ada tetap berfungsi.
- [x] `docs/design-system.md` ditulis dan membedakan nilai terkonfirmasi dari asumsi.

**Catatan untuk tahap section:** sudut gradient pada "Elite digital" dan "believers." perlu disetel saat hero dan CTA dibangun, lalu dibandingkan dengan screenshot Figma. Token warnanya sudah benar.

---

## 8. Checklist progres
- [x] Audit project
- [x] Analisis Figma (struktur, 8 section, variables, styles, aset)
- [x] Rencana ini ditulis
- [x] Jawaban klarifikasi utama
- [x] Persetujuan untuk mulai implementasi
- [x] Langkah 1: Gulp assets + watch JS
- [x] Langkah 2: Font
- [x] Langkah 3: Tokens
- [x] Langkah 4: Reset + `main.scss`
- [x] Langkah 5: Typography
- [x] Langkah 6: `styleguide.pug`
- [x] Langkah 7: `docs/design-system.md`
- [x] Langkah 8: Verifikasi
