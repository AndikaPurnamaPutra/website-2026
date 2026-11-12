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

## Tahapan
1. ~~Selesaikan responsive (Pug).~~ Selesai 12 Nov 2026.
2. Pindah ke Astro **tanpa CMS**, hasil sama persis (lihat ukuran
   keberhasilan). Hapus Gulp setelah lolos.
3. Buat Sanity Studio + skema di atas; isi dengan konten yang ada sekarang.
4. Sambungkan per section, satu tahap masing-masing, dicek animasinya:
   Services → Our Work → Trusted.
5. Webhook Sanity → Deploy Hook Vercel.
6. Nanti bila perlu: halaman detail project dan halaman "More Work".
