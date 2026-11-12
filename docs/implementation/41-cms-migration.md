# 41 — Migrasi ke Astro + Sanity (rancangan, belum dikerjakan)

Status: **rancangan lengkap, siap dikerjakan (12 Nov 2026)**. Responsive
selesai dan digabung ke `dev` (12 Nov 2026); keputusan desain konten sudah
dijawab (di bawah). Migrasi belum dimulai. Branch nanti: `astro/migration`
(dari `dev`).

## Tujuan
Konten tiga section homepage bisa diubah lewat headless CMS tanpa menyentuh
kode: **Services**, **Our Work**, **Trusted**. Syarat pengguna: website tetap
**ringan** dan **mudah dirawat**, dan tetap cocok dengan Lenis, Barba, GSAP,
Three.js yang dipakai sekarang.

## Keputusan
- **Framework: Astro** (output statis). Pug + Gulp sebenarnya bisa diberi
  data CMS saat build, tetapi pipeline Gulp buatan sendiri harus dirawat
  sendiri (ambil data, halaman per project, optimasi gambar), dan halaman
  detail project / "More Work" nanti lebih mudah di Astro.
  Next.js / Nuxt tidak dipilih: routing SPA bentrok dengan Barba dan animasi
  harus mengikuti siklus React/Vue.
- **CMS: Sanity** (bukan Strapi). Tanpa server, database dan backup yang
  diurus sendiri; CDN gambar (WebP/AVIF, `srcset`) dan hotspot gambar
  bawaan; paket gratis cukup. Strapi baru masuk akal bila data harus di
  server sendiri (butuh server Node + DB + penyimpanan media terpisah).
- **Website tetap ringan:** data diambil saat build, bukan di browser; tidak
  ada JS framework yang dikirim ke pengunjung. Studio di-host terpisah
  (`*.sanity.studio`), tidak ikut di bundle website.

## Astro: perawatan sehari-hari
| Pekerjaan | Sekarang (Pug + Gulp) | Setelah Astro |
|---|---|---|
| Dev server | `npm run dev` (Gulp + BrowserSync) | `npm run dev` (Vite) |
| Responsive | `src/scss/**` | **sama, tidak berubah** (`fluid()`, `fs()`, mixin breakpoint) |
| Animasi | `src/js/*.js` | **sama, tidak berubah** |
| Markup section | `src/pug/partials/*.pug` | `src/components/*.astro` (class sama) |
| Mixin | `src/pug/mixins/` | komponen dengan props |
| Aset | `src/assets/` disalin Gulp | `public/assets/` (URL sama) |
| Build | `gulp build` → `dist/` | `astro build` → `dist/` (HTML statis) |

### Aturan wajib (supaya tidak ada yang rusak)
1. **Jangan pakai View Transitions / `ClientRouter` Astro**: bentrok dengan
   Barba. Transisi tetap Barba (`src/js/page-transition.js`).
2. **`build.format: "file"`**: URL tetap `about.html` (link dan Barba memakai
   `.html`), bukan `/about/`.
3. **Tanpa style scoped Astro**: SCSS tetap global, semua aturan responsive di
   satu tempat.
4. **JS dimuat sekali di layout** (`main.js`), seperti sekarang.
5. Model 3D, HDR, video tetap di `public/` dengan path yang sama
   (`coin-scene.js` memuatnya dengan URL).

### Ukuran keberhasilan migrasi
Hasil **sama persis** dengan versi Pug: screenshot per halaman di 375, 768,
1024, 1440, 1920, plus cek manual setiap animasi (preloader, hero, Services
pin/stack, Our Work carousel, Trusted marquee, Motto, Principles, footer
reveal, transisi halaman, koin 3D). Belum sama = belum selesai.

## Rancangan Sanity

### Prinsip
- Hanya **konten** di CMS (teks, gambar, urutan, pilihan item). Ukuran, posisi
  dan animasi tetap di kode.
- Setiap field **dibatasi** (panjang teks, jumlah item, resolusi gambar) agar
  layout tidak bisa rusak.
- **Koleksi** (banyak item) dan **singleton** (teks section + pilihan item).

### Struktur Studio
```
Homepage
├─ Services section      (singleton)
├─ Our Work section      (singleton)
└─ Trusted section       (singleton)
Koleksi
├─ Services              (urutan drag)
├─ Projects
├─ Categories            (urutan drag)
├─ Clients
└─ Testimonials
```

### A. Services (sumber: `src/pug/partials/services.pug`)
Dokumen `service`:
| Field | Tipe | Aturan | Dipakai di |
|---|---|---|---|
| Title | string | wajib, maks. 24 | judul kartu |
| Description | text | wajib, maks. 220 (tinggi kartu stack di HP) | teks kartu |
| Tags | array string | 2–6, masing-masing maks. 24 | tag kartu |
| Media type | pilihan Gambar / Video | wajib | |
| Image | image + hotspot | wajib bila Gambar, lebar min. 1600px | gambar |
| Video | file MP4 | wajib bila Video, maks. ±8 MB | video loop |
| Poster | image | wajib bila Video | poster video |
| Alt text | string | wajib | aksesibilitas |
| Link | link internal / URL | opsional (sekarang `#`) | `data-services-link` |

Singleton `servicesSection`: Eyebrow ("(What we do)"), Note (maks. 200).

Catatan: `services-scroll.js` menghitung langkah dari `cards.length`, jadi
jumlah tidak terkunci di 5; batasi **3–7** (setiap layanan menambah 1,1 layar
scroll; stack HP diuji dengan 5).

### B. Our Work (sumber: `src/pug/partials/our-work.pug`, `mixins/work-carousel.pug`)
Dokumen `category`: Title, Slug; urutan drag.

Dokumen `project`:
| Field | Tipe | Aturan | Dipakai di |
|---|---|---|---|
| Title | string | wajib, maks. 60 | judul kartu |
| Slug | slug | wajib, unik | halaman detail nanti |
| Categories | reference[] → category | min. 1 | filter nanti |
| Cover | image + hotspot | wajib, lebar min. 1200px | gambar kartu |
| Cover style | Normal / Bulat | default Normal | `work-card__crop--round` |
| Alt text | string | wajib | |
| Published at | date | wajib | urutan Recently Added |

Singleton `ourWorkSection`:
| Field | Tipe | Aturan |
|---|---|---|
| Eyebrow | string | "( Our Work )" |
| Heading | 2 baris | maks. 40 per baris |
| Recently Added: judul | string | |
| Recently Added: jumlah | number | 5–8 project terbaru (otomatis) |
| Selected Work: judul | string | |
| Selected Work: isi | reference[] → project, urutan drag | 4–10 |
| More Work link | link | sekarang `#` |

### C. Trusted (sumber: `src/pug/partials/trusted-clients.pug`)
Dokumen `client`:
| Field | Tipe | Aturan | Dipakai di |
|---|---|---|---|
| Name | string | wajib | alt logo |
| Logo | file SVG | wajib, hanya SVG | grid logo |
| Logo height | number (px Figma) | 16–40, default 34 | `--h`; `--w` dari rasio SVG |
| Link | URL | opsional | "See More" |

Dokumen `testimonial`:
| Field | Tipe | Aturan | Dipakai di |
|---|---|---|---|
| Company | string | wajib | alt logo |
| Logo | file SVG | wajib | logo kartu |
| Logo height | number | 14–28 | |
| Quote | portable text (paragraf + link saja) | wajib, maks. 220 | kutipan |
| Person name | string | wajib | |
| Role | string | wajib | |
| Avatar | image + hotspot (bulat) | wajib | foto |
| Card style | Polos / Noise | default Polos | `testimonial-card--noise` |

Singleton `trustedSection`: Eyebrow, Heading (maks. 110), teks "and hundred
more...", Clients (reference[], urutan drag, 4–20), Testimonials (reference[], 3–8).

### Alur publish
```
Publish di Studio → webhook Sanity → Deploy Hook Vercel
  → astro build mengambil data (GROQ) → HTML statis baru (±1–2 menit)
```
Pratinjau draf (Sanity Presentation) bisa ditambahkan nanti.

## Keputusan desain konten (pengguna, 12 Nov 2026)
1. **Kartu Our Work:** satu bingkai 4:3 (325 × 244) terisi penuh, bagian yang
   tampil diatur hotspot di Studio; crop manual Figma (`crop`, `inner`)
   dihapus; varian bulat tetap pilihan (Cover style).
2. **Recently Added: otomatis**, 5–8 project terbaru menurut *Published at*
   (urutan diubah lewat tanggalnya); tanpa mode manual dulu (saran Claude,
   disetujui). Selected Work tetap dipilih dan diurutkan manual.
3. **Jumlah logo klien boleh berubah** (batas 4–20): grid Trusted diatur
   ulang supaya baris terakhir yang tidak penuh tetap rapi (mis. di tengah).
4. **Satu file SVG per logo** di CMS: Good at Numbers (sekarang mark CSS +
   teks SVG) dan Kaam Care (sekarang dibalik CSS, `flip`) diekspor Claude
   sebagai SVG tunggal dari tampilan sekarang saat migrasi, sampai desainer
   memberi versi resminya; field "flip" dan kasus khusus GAN tidak ada.

## Tahap 2 — Pug + Gulp → Astro, tanpa CMS (rencana implementasi)

Status: **menunggu persetujuan pengguna**. Branch `astro/migration` (dari
`dev`, 12 Nov 2026). Astro 7 (terbaru saat ini 7.4.x, dikunci di
`package.json`).

### Lingkup
- Semua 6 halaman (`index`, `about`, `contact`, `privacy-policy`,
  `terms-of-service`, `styleguide`), layout, 11 partial dan 4 mixin Pug
  (±4.100 baris, `about.pug` saja 888) ditulis ulang sebagai komponen Astro.
- Build Gulp diganti Astro (Vite). Pipeline gambar (JPG/PNG → WebP,
  `IMAGE_STRETCH`, `IMAGE_WIDTHS`) dipindah ke skrip kecil yang jalan sebelum
  `astro dev` / `astro build`.
- **Tidak berubah:** semua `src/js/*.js`, semua `src/scss/**`, aset, Vercel.
- **Di luar lingkup:** Sanity (tahap 3), tampilan atau animasi baru.

### Struktur baru
```
src/
  pages/        index.astro, about.astro, contact.astro, privacy-policy.astro,
                terms-of-service.astro, styleguide.astro
  layouts/      Default.astro            (dari layouts/default.pug)
  components/   Header, Footer, Hero, Statement, Services, OurWork,
                TrustedClients, Milestone, Motto, Preloader, WorkCarousel,
                CtaButton (buttonText), Policy, PageMeta …
  data/         services.js, work.js, clients.js, site-links.js …
                (array yang sekarang di atas file Pug; tahap 3 diganti data
                Sanity di tempat yang sama)
  js/, scss/    tetap
public/         src/static (favicon, robots.txt) + src/assets (font, ikon,
                model, video, gambar) — URL tetap `assets/…`
scripts/
  images.mjs    JPG/PNG → WebP (sama seperti gulp `images`), ke public/
```
`src/pug/` dan `gulpfile.js` dihapus di akhir tahap, setelah lolos cek.

### Langkah (satu commit per langkah, tiap langkah dicek)
1. **Kerangka:** pasang `astro` (+ `sass` yang sudah ada); `astro.config.mjs`
   (`build.format: "file"`, `outDir: dist`, tanpa integrasi lain);
   `scripts/images.mjs`; npm scripts `dev` / `build` (images → astro).
   Aset ke `public/`. Gulp tetap ada sementara untuk pembanding.
2. **Layout + komponen bersama:** `Default.astro` (head, skrip inline `js`,
   preload font, `<main data-barba="container">`, Header, Footer), PageMeta,
   CtaButton. SCSS diimpor sekali; `url("../assets/…")` di SCSS menjadi
   `/assets/…` (font, noise, mark GAN). `main.js` dimuat sekali di layout.
3. **Halaman per halaman**, dari yang sederhana: Privacy → Terms → Styleguide
   → Contact → Home (preloader + 7 section) → About (terbesar). Data array
   pindah ke `src/data/`.
4. **Cek tiap halaman** (lihat Verifikasi). Lolos semua → hapus Pug + Gulp,
   perbarui AGENTS.md (§ build), `docs/`, `vercel.json` bila perlu.

### Hal teknis yang diperhatikan
- **Barba:** tidak memakai `ClientRouter` Astro; atribut `data-barba`
  sama.
- **URL `.html`:** `build.format: "file"` → `dist/about.html`. Di dev server
  dicek `about.html` tetap terbuka (Barba dan link memakai `.html`).
- **Skrip:** `main.js` lewat `<script>` Astro dibundel Vite ke `/_astro/…`
  (module, defer, sama seperti sekarang). `import("./coin-scene.js")` tetap
  terpisah (code splitting Vite). Skrip inline (`js`, `is-preloading`) pakai
  `is:inline`.
- **CSS:** satu file, global, tanpa style scoped; nama file berubah (hash)
  — tidak ada yang merujuknya selain layout.
- **Spasi antar elemen inline:** Pug (`pretty`) dan Astro memperlakukan
  spasi berbeda; celah antar inline-block bisa berubah → dibandingkan
  piksel (Verifikasi).
- **`!=` Pug** (HTML mentah: kutipan testimonial, teks policy) → `set:html`.
- **Gambar WebP** dibuat ke `public/assets/images/` (diabaikan git, seperti
  `dist/` sekarang); sumber JPG/PNG tetap di `src/assets/`.

### Verifikasi dan kriteria selesai
1. **HTML sama:** untuk tiap halaman, HTML hasil Pug dan Astro dibandingkan
   secara otomatis (urutan elemen, class, atribut, teks; spasi dan urutan
   atribut diabaikan). Beda yang tersisa hanya yang disengaja (path CSS/JS
   ber-hash, atribut Astro bila ada) dan dicatat.
2. **Piksel sama:** screenshot tiap halaman di 375, 768, 1024, 1440, 1920
   (reduced motion, supaya diam), Pug vs Astro, dibandingkan.
3. **Cek otomatis langkah 8** (5 halaman × 19 ukuran): tanpa error JS, 404,
   scroll samping, elemen keluar layar.
4. **Animasi:** preloader, hero, Services pin/stack, Our Work carousel,
   Trusted marquee, Motto, Principles, galeri, footer reveal, transisi
   halaman (Barba), koin 3D — dicek di browser dan oleh pengguna.
5. Lighthouse mobile tidak turun dibanding `dev`.
6. `npm run dev` dan `npm run build` berjalan; Vercel preview branch ini
   tampil sama dengan preview `dev`.

### Progres
- [x] **Langkah 1 — kerangka** (12 Nov 2026): Astro 7.4.11 (dikunci),
  `astro.config.mjs` (static, `build.format: "file"`, `outDir: dist`, CSS
  tidak di-inline, tanpa source map); `scripts/images.mjs` (pengganti gulp
  `images` + `assets` untuk gambar; lewati file yang sudah terbaru);
  `npm run dev` / `build` = images → astro. `fonts/`, `icons/`, `models/`,
  `favicon.svg`, `robots.txt` dipindah ke `public/`; `src/assets/images/`
  tetap sumber, hasilnya di `public/assets/images/` (diabaikan git).
  BrowserSync dilepas (membawa `cookie@0.7` yang bentrok dengan Astro).
  Pembanding: hasil build Pug terakhir disimpan di luar repo (Gulp tidak
  lagi bisa build setelah aset dipindah). Dicek: 226 file aset hasil skrip
  identik byte demi byte dengan hasil Gulp; dev server membuka
  `nama.html` (200).
- [x] **Langkah 2 — layout + komponen bersama** (12 Nov 2026):
  `layouts/Default.astro` (slot `meta`, `preloader-start`, `preloader`,
  `header`), `Header`, `HeaderBack`, `Footer`, `PageMeta`,
  `OrganizationData`, `CtaButton`, `ButtonText`; data `src/data/site.js`,
  `site-links.js`, `navigation.js`. `compressHTML: false` (Astro merapatkan
  spasi; "©2026  /  …" memakai `white-space: pre`). CSS dikompres Sass
  sendiri, `cssMinify: false`: pengecil CSS Vite menulis ulang angka dan
  aturan, teks bergeser 1 px di 1920. URL di SCSS `../assets/` → `/assets/`
  (9). Sesudah: CSS identik dengan Gulp selain 9 URL itu. JS: Vite
  menggabung `main.js` + chunk bersama (299 KB), `coin-scene` tetap terpisah.
- [ ] Langkah 3 — halaman per halaman:
  - [x] Privacy, Terms (`Policy`, `PolicyItem`; data
    `src/data/privacy-policy.js`, `terms-of-service.js`): HTML identik dengan
    Pug, piksel identik di 375 / 768 / 1024 / 1440 / 1920, tanpa error JS.
  - [x] Styleguide, Contact (`contact/TextField`, `contact/Chips`; data
    `src/data/contact.js`): HTML identik. Piksel: Styleguide identik;
    Contact identik di 375 / 768 / 1024, di 1440 / 1920 22–27 piksel di
    dalam foto galeri (penskalaan foto, tampak sama). Tanpa error JS.
    Catatan: Pug menaruh baris baru di sekitar `label`, `input`, `button`,
    `legend` (bukan elemen inline baginya); Astro meniru itu dengan `"\n"`
    di tempat yang sama, supaya celah antar elemen tidak berubah.
  - [x] Home (`components/home/`: Preloader, Hero, Statement, Services,
    OurWork, TrustedClients, Milestone, Motto; `WorkCarousel`; data
    `src/data/services.js`, `work.js`, `clients.js`, `milestone-motto.js`,
    `preloader.js`; ikon Dribbble inline dari `components/icons/`): HTML
    identik selain 8 atribut kosong (`data-work-carousel`, `-viewport`,
    `-prev`, `-next`: Pug menulis `="data-work-…"`, Astro tanpa nilai; JS
    hanya memeriksa keberadaannya). Piksel identik di 375 / 768 / 1440 /
    1920, 20 piksel tersebar di 1024 (penskalaan gambar). Tinggi halaman
    sama persis dengan Pug di 7 ukuran (pin Services / Motto sama); tanpa
    error JS; koin 3D tampil. Alat pembanding piksel kini menunggu semua
    gambar (lazy) termuat dulu: beda awal di Our Work hanya soal waktu.
  - [ ] About.
- [ ] Langkah 4 — cek, hapus Pug + Gulp.

### Belum pasti
- ~~Apakah dev server Astro 7 membuka `about.html`.~~ Ya (langkah 1).
- Celah spasi inline: bila ada beda piksel yang tidak bisa dihindari,
  dilaporkan per kasus.

## Tahapan
1. ~~Selesaikan responsive (Pug).~~ Selesai 12 Nov 2026.
2. Pindah ke Astro **tanpa CMS**, hasil sama persis (lihat ukuran
   keberhasilan). Hapus Gulp setelah lolos.
3. Buat Sanity Studio + skema di atas; isi dengan konten yang ada sekarang.
4. Sambungkan per section, satu tahap masing-masing, dicek animasinya:
   Services → Our Work → Trusted.
5. Webhook Sanity → Deploy Hook Vercel.
6. Nanti bila perlu: halaman detail project dan halaman "More Work".
