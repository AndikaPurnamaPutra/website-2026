# 41 — Migrasi ke Astro + Sanity

Versi terakhir sebelum migrasi (Pug + Gulp) disimpan di branch
**`archive/pug-final`** (= `dev` di `b0c059a`, 12 Nov 2026).

Status: **tahap 2 (Pug + Gulp → Astro) selesai dan ada di `dev` (13 Nov
2026)**; tahap 3 (CMS) belum dimulai — pilihan CMS dibuka lagi (Sanity Free,
Keystatic, atau Content Collections; tergantung siapa yang mengisi). Responsive
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
- [x] Langkah 3 — halaman per halaman (12 Nov 2026):
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
  - [x] About (`components/about/Principles.astro`; data
    `src/data/about.js`: prinsip, foto galeri, tim). Keenam ilustrasi
    Principles (`components/about/figures/`: Tasks, Integrations, Design,
    Feedback, Progress, Handoff) diambil langsung dari HTML hasil Pug
    (dekoratif, ratusan elemen kecil; `{ }` ditulis sebagai entitas): mixin
    Pug-nya (`tmCard` dll.) tidak dipertahankan. HTML identik; piksel
    identik di 5 ukuran; tinggi halaman sama dengan Pug di 7 ukuran; tanpa
    error JS.
  - [x] Transisi halaman (Barba) di build Astro: Home → About → Contact →
    Privacy tanpa muat ulang, `<main>` berganti, tanpa error — sama dengan
    build Pug.
- [x] Langkah 4 — cek, hapus Pug + Gulp:
  - [x] `src/pug/`, `gulpfile.js`, `src/static/` dihapus; paket `gulp`,
    `gulp-pug`, `gulp-sass`, `esbuild` dilepas (Vite punya esbuild
    sendiri); 7 komentar kode yang merujuk file Pug diarahkan ke komponen
    Astro; AGENTS.md diperbarui; `engines.node >= 22` (skrip gambar memakai
    `glob` dari `node:fs/promises`).
  - [x] Build dari nol: 6 halaman, 195 gambar; aset 26,94 MB identik byte
    demi byte dengan hasil Gulp.
  - [x] Cek otomatis 5 halaman × 19 ukuran: tanpa error JS, 404, scroll
    samping, elemen keluar layar, teks < 12px; tinggi halaman sama dengan
    build Pug di 95 kombinasi.
  - [x] Preview Vercel `astro/migration` (5 halaman 200) + Lighthouse
    mobile, diukur bergantian dengan `dev`. Home 7×: Astro 55 / 93 / 66 /
    65 / 93 / 98 / 97, dev 86 / 89 / 89 / 89 / 82 / 97 / 97. Tiga yang awal
    tepat setelah deploy (cache CDN masih dingin: FCP sampai 14,6 s);
    sesudahnya setara, sisa angka rendah dari jaringan (fase TTFB LCP 3,4 s
    di keduanya). About 77 / 81, Contact 83 / 75, Privacy 98 / 99. A11y
    96–100, BP 96–100 di keduanya; SEO 66 = `noindex` preview.
  - [x] Animasi dan footer dicek pengguna di preview ("sudah aman", 13 Nov
    2026). Di sela itu ditemukan dan diperbaiki bug footer lama (load
    pertama, desktop: GSAP membaca `y` footer = −½ tingginya sebagai
    `yPercent: -50`; kini transform footer ditulis langsung, koin membaca
    lewat `DOMMatrix`).
- [x] **Digabung ke `dev`** (13 Nov 2026, fast-forward; preview `dev` kini
  Astro, 5 halaman 200). Versi Pug terakhir: branch `archive/pug-final` dan
  tag `pug-final` (`cc37519`). `main` belum disentuh.

### Belum pasti
- ~~Apakah dev server Astro 7 membuka `about.html`.~~ Ya (langkah 1).
- Celah spasi inline: bila ada beda piksel yang tidak bisa dihindari,
  dilaporkan per kasus.

## Tahap 3 — Sanity (rencana implementasi)

Status: **disetujui pengguna (13 Nov 2026), dikerjakan di branch
`cms/sanity`** (dari `dev`). Pilihan: **Sanity
Free** — pengguna ingin CMS yang mudah dan gratis; pengisinya pengguna + 1–2
orang; titik fokus gambar penting (hanya Sanity yang punya). Keystatic dan
Content Collections ditimbang dan tidak dipilih (tanpa hotspot; gambar dan
video masuk repo; Keystatic butuh login GitHub per pengisi).

### Cara kerja
```
Studio (oww.sanity.studio)  →  Publish
  → webhook Sanity → Deploy Hook Vercel → npm run build:
      scripts/cms.mjs   ambil data (GROQ lewat HTTP, tanpa paket Sanity di
                        website) → src/data/cms/*.json; unduh gambar (sudah
                        dipotong menurut hotspot, WebP, beberapa lebar) dan
                        video → public/assets/cms/
      scripts/images.mjs  (seperti sekarang)
      astro build         komponen membaca src/data/ seperti sekarang
```
- **Website tidak memuat apa pun dari Sanity saat dikunjungi**: gambar dan
  video disajikan dari website sendiri. Kuota Sanity (bandwidth 100 GB)
  hampir tidak terpakai; website tetap jalan walau Sanity bermasalah.
- **Tanpa paket baru di website**: data diambil dengan `fetch` biasa
  (dataset publik, tanpa token baca).
- **Cadangan**: bila Sanity tidak terjangkau atau belum diatur (mis. dev
  lokal tanpa internet), build memakai data terakhir yang tersimpan, lalu
  data di `src/data/` sekarang — build tidak pernah gagal karena CMS.

### Studio
- Folder `studio/` di repo yang sama, dengan `package.json` sendiri (tidak
  ikut build website). Sanity 6 (6.23.x), Node ≥ 22.12 (sudah).
- Di-host gratis oleh Sanity (`sanity deploy` → mis. `oww.sanity.studio`).
- ⚠️ Studio adalah aplikasi React. AGENTS.md §3 melarang React **di
  website**; Studio adalah alat admin terpisah yang tidak dikirim ke
  pengunjung. Disetujui pengguna sebagai pengecualian, tertulis di
  AGENTS.md §3.
- Skema: sesuai "Rancangan Sanity" di atas (Services, Projects, Categories,
  Clients, Testimonials + 3 singleton section), dengan batas setiap field
  (AGENTS.md §16) dan keputusan desain konten 1–4.

### Langkah (satu commit per langkah, dicek, dikonfirmasi)
1. **Akun dan proyek** (pengguna, dipandu): akun gratis sanity.io, proyek
   baru, dataset `production` (publik). Yang dibutuhkan: **Project ID**
   (tidak rahasia). Token tulis hanya untuk impor konten awal, disimpan di
   `.env` lokal (tidak di-commit, tidak dikirim lewat chat).
2. **Studio + skema Services**, deploy Studio.
3. **Impor konten Services yang ada sekarang** (teks, gambar, video, poster)
   lewat skrip, supaya Studio langsung berisi.
4. **Website membaca Services dari Sanity** (`scripts/cms.mjs`, cadangan
   data lama). Cek: HTML / piksel sama dengan sekarang, pin Services dan
   stack HP jalan.
5. **Webhook → Vercel Deploy Hook**; pengguna mencoba mengubah satu layanan
   dan melihatnya di preview. **Titik keputusan: lanjut atau ganti CMS.**
6. **Our Work**: skema Project / Category / section; kartu menjadi bingkai
   4:3 + hotspot (crop manual Figma dihapus; tampilan sedikit berubah,
   disetujui); Recently Added otomatis (5–8 terbaru); impor 10 project.
7. **Trusted**: Client / Testimonial / section; grid logo 4–20 dengan
   baris terakhir yang rapi; SVG tunggal Good at Numbers dan Kaam Care
   (diekspor dari tampilan sekarang); impor.
8. Dokumentasi: cara mengisi CMS (singkat, Bahasa Indonesia) untuk tim.

### Catatan pengerjaan
- **Langkah 1–3 selesai (20 Nov 2026).** Proyek `ao8vrenr` (dataset
  `production`, publik). Studio di https://oww.sanity.studio (deploy dengan
  token *Deploy Studio* dari `.env`, tanpa login CLI). 5 layanan + teks
  section diimpor dengan `studio/scripts/seed-services.mjs`; dicek pengguna
  di Studio.
- **Langkah 4 (20 Nov 2026).** `scripts/cms.mjs` (jalan sebelum
  `images.mjs` di `npm run dev` / `build`) → `src/data/cms/services.json`
  dan media di `src/assets/images/cms/services/` (keduanya tidak di git).
  `src/data/cms.js` memilih data CMS, atau `src/data/services.js` bila
  tidak ada. Titik fokus (hotspot) menjadi `object-position` pada gambar
  (tidak ditulis bila di tengah), bukan pemotongan file.
  - Gambar diunduh sebagai PNG (`?fm=png`): CDN Sanity menyajikan JPG yang
    disimpan ulang (kualitas lebih rendah, tanpa profil warna); PNG memberi
    piksel yang persis sama dengan aslinya.
  - Dicek: tanpa data CMS, HTML 5 halaman sama persis dengan sebelumnya;
    dengan data CMS, HTML sama kecuali path `cms/services/…`; WebP ukuran
    penuh dan poster sama per piksel; video sama per byte. Salinan 800px
    untuk HP beda sangat kecil (rata-rata < 2/255; satu gambar 800×450
    bukan 800×449) karena sharp memperkecil JPG lewat jalan pintas yang
    tidak ada untuk PNG — tidak terlihat (object-fit: cover).
  - CSS: urutan kartu/gambar di HP kini sampai 7 layanan (batas CMS), dulu 5.
  - Sanity tidak terjangkau → build tetap jalan dengan data terakhir.
  - Data dibaca dari API langsung (`api.sanity.io`), bukan CDN (`apicdn`):
    CDN sempat menyajikan data dari sebelum Publish terakhir.
  - File media layanan yang dihapus di Studio ikut dihapus saat build
    (juga salinannya di `public/`), jadi tidak ikut ter-deploy.
- **Urutan layanan (pengguna, 20 Nov 2026), kembali ke rancangan awal di
  atas:** daftar "Layanan yang tampil" di Section Services dihapus (terasa
  dobel: layanan baru harus dibuat lalu ditambahkan ke daftar). Kini **semua
  layanan yang di-Publish tampil**, urutannya **digeser (drag)** di daftar
  Services (plugin `@sanity/orderable-document-list` 2.0.28, hanya di
  Studio, field `orderRank`), dan tiap layanan punya tombol **"Tampilkan di
  homepage"** (default menyala) untuk menyembunyikan tanpa menghapus.
  Website mengambil maksimal 7 (yang ke-8 dst. tidak tampil). Section
  Services kini hanya label kecil dan catatan.
  - Dicek dengan data uji 6 dan 7 layanan (termasuk isian terpanjang yang
    diizinkan) di 1440, 1024×768 dan HP 390: rapi, tanpa error, tanpa
    geser ke samping. Scroll desktop bertambah ±1 layar per layanan.
- **Langkah 5 (20 Nov 2026).** Vercel Deploy Hook `sanity` (dibuat
  pengguna, branch `cms/sanity`; URL-nya hanya di `.env` sebagai
  `VERCEL_DEPLOY_HOOK`, tidak di git). Webhook Sanity "Vercel deploy"
  (dibuat lewat API): dataset `production`, create/update/delete, filter
  `_type in ["service", "servicesSection"]`, tanpa draf. Dicek: Publish →
  teks baru di preview `cms/sanity` dalam ±40 detik; dikembalikan dan
  kembali normal. **Saat merge ke `main`: ganti branch Deploy Hook ke
  `main`** (buat hook baru, perbarui URL webhook). Filter perlu ditambah
  tipe Our Work dan Trusted di langkah 6–7.
- **Langkah 6 — Our Work (20 Nov 2026).** Keputusan pengguna hari ini:
  **Selected Work lewat tombol "Tampilkan di Selected Work" di tiap
  project**, urutan = drag di daftar Projects (bukan daftar di section,
  sama seperti Services); **varian kartu bulat dihapus** (semua kartu
  bingkai 4:3 penuh). Field alt project dihapus: gambar ada di link yang
  sama dengan judulnya, jadi tetap `alt=""`.
  - Studio: Projects (drag), Categories (drag, maks. 16 karakter; website
    ambil 6 pertama), Section Our Work (label, judul 2 baris maks. 24
    karakter, judul carousel, jumlah terbaru 5–8, link More Work).
  - Impor `studio/scripts/seed-work.mjs`: 5 category, 10 project (WELLMO
    dua kali: dua gambar berbeda), teks section. Recently Added kini
    otomatis menurut tanggal publish: 5 project di sana diberi tanggal
    terbaru dalam urutan sekarang; Selected Work diberi tanggal lebih
    lama, tombol menyala dan urutan drag sama dengan sekarang. **Category
    tiap project ditebak dari judulnya** (website belum punya data itu) —
    perlu dicek pengguna di Studio.
  - Website: `scripts/cms.mjs` menulis `work.json` (gambar PNG di
    `cms/work/`); `src/data/work.js` jadi cadangan bentuk baru;
    `WorkCarousel` satu `<img>` memenuhi bingkai, titik fokus jadi
    `object-position`; crop Figma (`crop`, `inner`, `--card-scale`, varian
    bulat) dihapus dari kode dan CSS.
  - Ditemukan dan diperbaiki: **di 1024 kartu tidak sama lebar** (231/260/
    276 px) karena judul yang lebih panjang dari kartu melebarkannya (sudah
    ada sebelum CMS, dulu tersamar oleh crop). Kini `min-width: 0`, judul
    yang terlalu panjang diakhiri "…" (di 1024 a.l. Papersky dan
    Chainlytics).
  - Isian ekstrem (6 category × 16 karakter, judul 2 × 24, judul project
    60, 8 + 10 project) di 1024, 1440, HP 390: rapi, tanpa geser ke
    samping. Judul section tidak pernah terlipat di desktop; category yang
    tidak muat turun baris, rata kanan (HP/tablet tetap rata kiri). Di HP
    judul 24 huruf lebar bisa jadi 2 baris per baris judul (terlipat
    rapi).
  - Dicek: HTML Our Work dari CMS = dari cadangan; header Our Work dengan
    data asli sama per piksel dengan sebelum CMS (1024, 1440, 390);
    halaman lain sama. Kartu berubah sesuai keputusan 1 (gambar memenuhi
    bingkai; Train Ticket tidak lagi bulat).
  - Filter webhook ditambah `project`, `category`, `ourWorkSection`.
    Studio di-deploy.
  - Di luar lingkup: mega menu Work (gambar dan category-nya) masih dari
    `src/data/navigation.js`.

### Verifikasi
- Tiap section: HTML dan piksel dibandingkan dengan sebelum CMS (kecuali
  perubahan yang disetujui: kartu Our Work, grid Trusted), animasi (pin,
  carousel, marquee) jalan, cek otomatis 5 halaman × 19 ukuran.
- Isian ekstrem: teks terpanjang, jumlah item terkecil dan terbesar yang
  diizinkan — tata letak tetap rapi (AGENTS.md §16).
- Publish → website berubah dalam ±2 menit; Sanity mati → build tetap
  berhasil dengan data terakhir.

### Yang dibutuhkan dari pengguna
- Membuat akun sanity.io (gratis) dan memberikan Project ID.
- Menyetujui pengecualian React untuk Studio (alat admin, bukan website).
- Menambahkan 1–2 nilai di pengaturan Vercel (Project ID, Deploy Hook) —
  dipandu.

### Di luar lingkup
Halaman detail project, "More Work", Blog, pratinjau draf (Presentation),
form Contact.

## Tahapan
1. ~~Selesaikan responsive (Pug).~~ Selesai 12 Nov 2026.
2. Pindah ke Astro **tanpa CMS**, hasil sama persis (lihat ukuran
   keberhasilan). Hapus Gulp setelah lolos.
3. Buat Sanity Studio + skema di atas; isi dengan konten yang ada sekarang.
4. Sambungkan per section, satu tahap masing-masing, dicek animasinya:
   Services → Our Work → Trusted.
5. Webhook Sanity → Deploy Hook Vercel.
6. Nanti bila perlu: halaman detail project dan halaman "More Work".
