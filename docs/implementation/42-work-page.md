# 42 — Halaman Work (`/work`)

Status: **disetujui 23 Nov 2026, dikerjakan.** Branch nanti: `work/page` (dari
`cms/sanity`, karena halaman ini memakai data Sanity).

## Acuan Figma (file `plgHei2CRPFohXrt3OLhGk`)
| Node | Isi |
| --- | --- |
| 2337:715 | Halaman lengkap 1440: hero, Selected Work, tab, Case Study, Live Sites, Design Showcase, footer |
| 2351:744 | Saat di-scroll: baris tab + cari menempel di bawah header, tab section aktif menyala |
| 2351:1304 | Hasil cari, mode Grid: "Showing: 5 Result · rincian", angka tab ikut hasil, hero + Selected Work hilang |
| 2351:2330 | Hasil cari, mode List |
| 2361:2586 | List saat hover: baris abu-abu + thumbnail di kiri judul |
| 2361:2740 | Hasil kosong: "Nothing like "…" yet." + tombol "Tell us about it" |

Tidak ada desain HP/tablet: disesuaikan sendiri (pola halaman lain).

## Keputusan pengguna (23 Nov 2026)
1. **Selected Work digeser dengan drag**, kursor berubah jadi label "Drag"
   (gaya kaca seperti "View Project" di homepage). Trackpad / swipe tetap.
2. **Kolase hero bergerak** (berjalan pelan, berulang; diam dengan reduced
   motion).
3. **"Most recent search" = pencarian terakhir pengunjung**, disimpan di
   browser (maks. 4). Kunjungan pertama / kosong: saran tetap dari CMS.
4. **Pola kartu Case Study disesuaikan**: pola 9 kartu Figma (3 baris
   berbeda) berulang; jumlah sedikit tetap rapi.
5. **"Read the case study →" hanya di baris ketiga** pola itu.
6. **Klik kartu → halaman detail project** — belum ada, jadi untuk
   sekarang kartu Case Study / Showcase belum berupa link (tanpa link mati).
   Kartu Live membuka situs aslinya di tab baru.
7. Responsive: disesuaikan.
8. **View mode (Grid/List) hanya di hasil cari**, seperti Figma. Halaman
   biasa punya tata letak yang dikurasi (carousel, pola Case Study), List
   akan menghapusnya. Pilihan Grid/List diingat di browser.

## Yang tetap dari kode (bukan Figma)
Menu "Contact" (bukan Career), footer "Terms of Service" tanpa "Legal" —
keputusan sebelumnya. Header, footer, transisi halaman (Barba) dipakai
apa adanya.

## CMS (Sanity)
- **Project** ditambah:
  - `kind` — Case Study / Live / Design Showcase (wajib, satu).
  - `format` — mis. Landing Page, Mobile App, Dashboard, Pitch Deck
    (dokumen baru yang bisa di-drag, seperti Category; opsional).
  - `liveUrl` — wajib bila `kind` = Live.
  - `keywords` — kata untuk pencarian (mis. "bank, fintech"), maks. 8.
  - Baris meta kartu = Category · Format · tahun (dari Tanggal publish).
- **Section Work** (dokumen tunggal): judul hero 2 baris, teks, judul +
  placeholder cari, saran cari (maks. 4), judul/teks Selected Work, judul
  tiga section, teks hasil kosong + link tombolnya, gambar kolase (3–10
  gambar sendiri: di Figma bukan cover project).
- Selected Work = tombol "Tampilkan di Selected Work" + urutan drag yang
  sudah ada (sama dengan homepage).
- Jumlah per section dari CMS: Case Study 9, Live 9, Showcase 12 di
  halaman; pencarian mencari **semua** project. Angka di tab dan mega menu
  dihitung otomatis.
- Filter webhook ditambah `workPage`, `format`.

## File
- Baru: `src/pages/work.astro`, `src/components/work/` (Hero, Collage,
  SelectedWork, Tabs, CaseStudyGrid, ProjectGrid, Results), `src/js/`
  (work-collage, work-drag, work-tabs, work-search), `src/styles/` (work).
- Ubah: `studio/schemaTypes/` (project, format, workPage), `scripts/cms.mjs`
  (data halaman Work + indeks cari), `src/data/navigation.js` (mega menu,
  footer "Works" → `/work`), link "More Work" homepage → `/work`.

## Langkah (satu commit per langkah, dicek, dikonfirmasi)
1. **Skema + isi.** Field baru, Section Work, impor isi (lihat pertanyaan 1).
2. **Halaman + hero**: teks, kolom cari, chip, kolase bergerak.
3. **Selected Work**: carousel drag + kursor "Drag".
4. **Tab menempel** + section aktif menyala + lompat ke section.
5. **Case Study** (pola 9), **Live Sites** (3 kolom, label Live),
   **Design Showcase** (4 kolom).
6. **Pencarian**: cari di judul / category / format / keywords, alamat
   `/work?q=bank` (bisa dibagikan, tombol Back jalan), Grid / List, hover
   thumbnail, hasil kosong, pencarian terakhir.
7. **Link**: mega menu, footer, "More Work" → `/work` (+ `#case-study` dst.).
8. **Cek**: Figma vs hasil di 1440; responsive; isian ekstrem; cek otomatis
   6 halaman × 19 ukuran; transisi Barba masuk/keluar; Lighthouse.

## Kriteria selesai
- Tampilan 1440 sama dengan Figma (kecuali menu/footer di atas).
- Drag, kolase, tab menempel, pencarian jalan; tanpa JS halaman tetap
  menampilkan semua section (pencarian butuh JS).
- Reduced motion: kolase diam, tanpa animasi geser.
- Isian ekstrem (judul terpanjang, 1 dan jumlah maks. kartu per section,
  0 hasil) tetap rapi; tidak ada scroll ke samping.

## Keputusan tambahan (23 Nov 2026, pengguna mengikuti usulan)
1. Isi project **diimpor dari Figma** (gambar + teks), bisa diedit di Studio.
2. Nama jenis kedua: **Live Sites** (juga di mega menu).
3. **"See all"** → `/work?type=…`: tampilan hasil, hanya jenis itu, Grid/List.
4. Ukuran kartu Selected Work: **pola tetap per posisi**, bukan diatur editor.
5. "Clear search" **dan** tombol ✕ dipertahankan.

## Progres
- [x] 1. Skema + isi (23 Nov 2026)
- [x] 2. Halaman + hero (23 Nov 2026)
- [x] 3. Selected Work (23 Nov 2026)
- [x] 4. Tab menempel (23 Nov 2026)
- [ ] 5. Tiga section
- [ ] 6. Pencarian
- [ ] 7. Link
- [ ] 8. Cek

### Catatan langkah 1 (23 Nov 2026)
- Skema: Project + `kind`, `format` (dokumen Format, drag), `liveUrl`
  (wajib bila Live), `keywords` (maks. 8); Section **Halaman Work**
  (tab Hero / Section / Pencarian). Studio di-deploy; filter webhook
  ditambah `format`, `workPage`.
- Impor `studio/scripts/seed-work-page.mjs` (gambar diambil dari Figma ke
  folder sementara, path folder sebagai argumen): 4 format, 27 project baru (Case Study 8, Live 9, Showcase 10) + 10 lama
  diberi jenis/format; urutan drag = urutan Figma; teks halaman dan 3 gambar
  kolase. Kata kunci awal ditebak dari judul — perlu dicek.
- Homepage tetap: Recently Added dan Selected Work sama (dibandingkan
  sebelum/sesudah); project baru bertanggal sebelum yang terbaru dan tidak
  di Selected Work. Ealing Project ("Installation" di Figma) masuk Graphic
  Design: satu project terlalu sedikit untuk kategori yang tampil di
  homepage (keputusan pengguna); kategori Installation dihapus lagi.
- Selected Work halaman Work = Selected Work homepage (train ticket, seafood
  sambal, symata, kidoo, wellmo 2), bukan 4 kartu Figma (MADEFACT di Figma
  memakai gambar REX: placeholder, tidak diimpor).
- Kata kategori Figma dipetakan: UX → UI/UX, Graphic → Graphic Design,
  3D → 2D/3D (teks kartu sedikit beda dari Figma).
- Belum ada: alamat 9 project Live (tidak ada di Figma; validasi Studio
  menandainya merah). Gambar BREX dan REX Panels hanya render Figma ukuran
  kartu (555×424, 325×244): file aslinya tidak ada di Figma.

### Catatan langkah 2 (23 Nov 2026)
- `src/pages/work.astro`, `src/components/work/WorkHero.astro`,
  `src/scss/pages/_work.scss`; data `src/data/cms/work-page.json` (cadangan
  `src/data/work-page.js`: teks saja, tanpa kolase). Token baru
  `--color-field`, `--color-line` (design-system.md).
- **Kolase = roda**: di Figma kelima kartu ada di lingkar roda besar (pusat
  di luar halaman, kanan; jari-jari 714; kartu searah jari-jari: 0°, ±15°,
  ±31°). Roda berputar pelan (CSS saja, 5 detik per kartu), kartu naik
  menyusuri lengkungan dan memudar di atas/bawah. Kartu yang lebih tinggi
  menumpuk di atas yang lebih rendah (Figma); supaya urutan itu tetap
  benar, roda hanya berputar satu putaran gambar lalu mulai lagi (tanpa
  sambungan terlihat). Reduced motion: diam di posisi Figma. Jumlah kartu
  ≈24 (kelipatan jumlah gambar; 10 gambar → 20 kartu, 18°).
- Tablet dan HP: kolase disembunyikan (tidak ada tempat di samping teks;
  tidak ada desainnya). Judul HP 32px (seperti About), baris seimbang.
- Kolom cari: form biasa (`/work?q=…`), chip = link `/work?q=…`; pencarian
  sungguhan di langkah 6. Teks intro: Enter di Studio = pindah baris
  (desktop/tablet; HP mengikuti lebar layar).
- Dicek: 1440 sama dengan Figma (posisi teks, kolom cari, chip, kolase,
  urutan tumpuk); roda berputar ±3°/detik; 390, 834, 1024, 2560 rapi;
  isian terpanjang (judul 2 × 40, intro 120, judul cari 40, 4 chip × 30) dan
  kolase 10 gambar rapi — chip terlalu panjang di HP 320 dipotong "…", teks
  di desktop berhenti sebelum kolase; cek otomatis 6 halaman × 19 ukuran:
  0 masalah.
- Belum: animasi masuk (judul naik seperti About/Contact) — tidak diminta;
  bisa ditambah nanti bila diinginkan.

### Catatan langkah 3 (23 Nov 2026)
- `SelectedWork.astro`, kartu bersama `ProjectCard.astro` (dipakai lagi di
  langkah 5), `src/js/work-drag.js`; `work-cursor.js` kini juga menampilkan
  **"Drag"** di atas baris yang bisa di-drag (homepage tetap "View
  Project"). Data: `scripts/cms.mjs` menulis semua project berjenis ke
  `work-page.json` (cover = file yang sama dengan homepage); `images.mjs`
  membuat salinan 800px untuk cover (srcset) — kini tiap salinan dicek
  sendiri, jadi salinan baru untuk gambar lama tetap dibuat.
- Ukuran kartu: pola Figma **kecil 325×244, besar 555×424, kecil, lebar
  440×244**, berulang (rencana menyebut "ke-2, 5, 8 besar"; Figma ternyata
  pola 4, jadi besar di kartu ke-2, 6, 10). Tablet/HP: pola sama, lebih kecil.
- Drag mouse: baris mengikuti kursor, dilepas meluncur lalu melambat; drag
  bukan klik. Sentuh/trackpad/panah keyboard: scroll bawaan.
- Teks kartu satu gaya untuk semua section: judul Inter Medium 16 (Figma
  di kartu kecil Selected 14 — dibuat sama), maks. 2 baris + "…";
  keterangan 14, opacity 0.6 (aturan kontras situs), satu baris + "…".
  Label "Live" gelap di kartu Live (Figma: "Live Development").
- Baris dimulai sejajar container (Figma: kartu pertama terpotong di kiri —
  posisi setelah digeser).
- Dicek: 1440 sama dengan Figma (y 759, kartu di +118, ukuran); drag
  (Playwright: ikut 300px, meluncur ke 594, tanpa klik, label "Drag");
  390, 834; 10 project berjudul 60 huruf; cek otomatis 6 × 19: 0 masalah.

### Catatan langkah 4 (23 Nov 2026)
- `WorkTabs.astro`, `WorkSection.astro` (kerangka section: judul + "See all"
  → `/work?type=…`; kartunya langkah 5), `src/data/work-kinds.js`,
  `src/js/work-tabs.js`; ikon `arrow-right.svg` (Figma).
- Bar menempel di bawah header (4rem = tinggi header situs; Figma 104):
  putih di atasnya mengisi tempat header, jadi header transparan terbaca di
  atas putih seperti frame Figma saat di-scroll (2351:744). Tab section
  yang ada di bawah bar menyala (tab pertama sebelum itu, seperti Figma);
  klik tab → scroll halus (Lenis) sampai section tepat di bawah bar, alamat
  jadi `#live-sites` dst. (link tab dilewati Barba).
- Angka tab = semua project jenis itu (Case Study 10, Live 9, Showcase 18),
  bukan yang tampil saja. Figma 10px → 12px (batas teks terkecil situs).
  Tab tanpa project tidak tampil.
- HP: tab saja (kolom cari ada di hero), baris bisa digeser, tab aktif
  digulir ke tengah. Tablet: kolom cari mengecil. Judul tab terpanjang
  (24 huruf): kolom cari min. 200, tab bisa digeser; judul section boleh
  turun baris di HP 320.
- Dicek: bar di y 1470 (Figma 1468; garis 1px), menempel di 64, klik Live
  Sites → section di bawah bar, tab menyala, hash; 390, 834, 1024; isian
  ekstrem; cek otomatis 6 × 19: 0 masalah.
