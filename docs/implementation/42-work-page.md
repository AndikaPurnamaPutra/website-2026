# 42 — Halaman Work (`/work`)

Status: **selesai 23 Nov 2026 (langkah 1–8), di branch `work/page`; belum digabung.** Branch nanti: `work/page` (dari
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
- [x] 5. Tiga section (23 Nov 2026)
- [x] 6. Pencarian (23 Nov 2026)
- [x] 7. Link (23 Nov 2026)
- [x] 8. Cek (23 Nov 2026)

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

### Catatan langkah 5 (23 Nov 2026)
- `WorkGrid.astro` di tiap `WorkSection`; kartu `ProjectCard` (langkah 3).
  Case Study: pola Figma 3 baris × 3 (lebar 555/325/440, 382,5/382,5/555,
  3 × 440; tinggi 424/244/327…), maks. 9. Live Sites: 3 kolom 440 × 244,
  label putih "Live" bertitik hijau di atas gradasi gelap tipis (Figma
  2351:696), gambar menampilkan bagian atas situs (bisa diubah dengan titik
  fokus Studio), maks. 9. Design Showcase: 4 kolom 325 × 244, maks. 12.
  Urutan = drag Studio. Baris tidak penuh rata kiri.
- **"Read the case study →" belum ditampilkan**: belum ada halaman project
  (keputusan 6), jadi tidak ada tujuan. Muncul nanti di baris ketiga
  (keputusan 5) saat halaman project dibuat. Karena itu Case Study ±26px
  lebih pendek dari Figma.
- Tablet 2 kolom, HP 1 kolom (semua section; bentuk kartu Case Study tetap).
- Dicek: posisi section 1440 (Case Study 1554 / Figma 1550, Live 3177 /
  3202 — selisih = baris "Read the case study", Showcase 4501 / 4510); 834,
  390; isian ekstrem (1 Live, 5 Showcase, judul 60 huruf); cek otomatis
  6 × 19: 0 masalah.

### Catatan langkah 6 (23 Nov 2026)
- `WorkResults.astro`, `src/js/work-search.js`; `work-tabs.js` membaca
  tujuan tab saat diklik (hasil: grup / baris pertama List; tab tanpa hasil
  redup). Teks hasil kosong dari Studio (Halaman Work → Pencarian).
- Semua project dirender sekali sebagai kartu (grup per jenis) dan sekali
  sebagai baris List, tersembunyi; skrip menampilkan yang cocok (gambar
  tersembunyi tidak dimuat). Indeks = JSON di halaman (judul, kategori,
  format, kata kunci, jenis, tahun).
- Cocok: tiap kata yang diketik harus mengawali kata project ("bank" →
  "banking", "banking" → kata kunci "bank"); tidak ada yang cocok semua →
  yang cocok salah satu kata ("fintech app").
- `/work?q=…` dan `/work?type=…` ("See all") berganti tanpa memuat ulang;
  Back/Forward jalan; dibuka langsung, hasil tampil sejak cat pertama
  (skrip kecil di `work.astro`). Chip, "See all", "Clear search", ✕ dilewati
  Barba. Chip = 4 pencarian terakhir di browser ini, lalu saran Studio.
  Grid/List diingat.
- Grid: Case Study dan Live 3 kolom, Showcase 4 (Figma 2351:1304); grup
  pertama 60 di bawah "Showing", berikutnya garis + 120. List (2351:2330):
  baris 98, kolom jenis di 690, keterangan rata kanan; hover abu-abu +
  gambar 140 × 78 membuka di kiri (2361:2586). Kosong (2361:2740).
  "5 Result" Figma → "5 Results"/"1 Result"; jenis ditulis seperti judul
  section ("1 Case Study, …").
- Tablet: Grid 2 kolom, List tanpa gambar (judul, lalu jenis + keterangan);
  HP: Grid 1 kolom, titik ringkasan disembunyikan.
- Dicek (Playwright): q=bank (2), kosong, mengetik di hero (tersimpan jadi
  chip), Clear, See all Live (9), Back/Forward, cadangan "fintech app",
  klik tab di Grid dan List (grup tepat di bawah bar), tanpa tab aktif saat
  kosong, pindah ke About lewat Barba lalu Back; 390; cek otomatis 10
  alamat (termasuk 3 hasil + kata cari sangat panjang) × 19 ukuran: 0
  masalah.

### Catatan langkah 7 (23 Nov 2026)
- Mega menu Work: jenis dan angkanya dari CMS (judul section + jumlah
  project), tiap jenis → `/work?type=…`; jadi "Live Development 20" lama →
  "Live Sites 9" (Case Study 10, Design Showcase 18). Kartu gambar → `/work`;
  "Work" di bar `href="/work"` (klik tetap membuka/menutup menu, seperti
  sebelumnya). Tanpa data CMS menu tidak berisi jenis.
- Menu HP "Work" dan footer "Works" → `/work`.
- Homepage: "More Work" → `/work` (diisi di Sanity, Section Our Work);
  kategori di samping judul Our Work → `/work?q=<kategori>` (dulu `#`).
- Dicek (Playwright, lewat Barba): mega menu Live Sites (9), dari halaman
  Work ke Case Study (10), kategori Branding (10), More Work, menu HP;
  cek otomatis 10 alamat × 19: 0 masalah.

### Catatan langkah 8 — cek akhir (23 Nov 2026)
- Figma vs hasil di 1440: hero, Selected Work, bar (biasa dan menempel),
  tiga section, hasil Grid, List, List hover, kosong — sama, kecuali yang
  dicatat di langkah 2–7 (menu/footer versi situs, header 64, "Read the
  case study" menunggu halaman project, angka tab 12px, "Results").
- Responsive 320–2560; isian ekstrem per section; cek otomatis 10 alamat
  (6 halaman + 4 alamat hasil cari) × 19 ukuran: 0 masalah.
- Transisi Barba: About ↔ Work (biasa dan hasil cari), menu dan link ke
  `/work?type=…`; tanpa error JS. Reduced motion: kolase diam, drag tanpa
  luncuran.
- Lighthouse HP (lokal, 2×, sama): **Work 81 / 100 / 100 / 100**, About
  76 / 100 / 96 / 100 (pembanding). LCP = judul hero (4,7 s; CSS dan font
  situs, sama di semua halaman). DOM 1.486 elemen (hasil cari disiapkan di
  HTML: 37 kartu + 37 baris) — wajar sekarang; bila project jauh lebih
  banyak (ratusan), baris List bisa dibuat oleh skrip.
- Sisa / nanti: alamat 9 project Live (Studio), gambar asli BREX dan REX,
  "Read the case study" + klik kartu saat halaman project ada, Deploy Hook
  ke `main` saat merge (rencana 41).

### Perbaikan (23 Nov 2026): bar tab di dekat footer
- Masalah (pengguna): menjelang footer header naik dan hilang (perilaku
  situs, `header.js`), tetapi putih di atas bar tab (tempat header) tetap
  tinggal — pita kosong 64px di atas layar.
- Kini bar ikut naik setinggi header dengan gerak yang sama (0,8 s), lalu
  turun lagi saat header kembali; tanpa gerak dengan reduced motion.
- Dicek: 1440 dan 390, turun ke footer lalu naik lagi; cek otomatis 10
  alamat × 19: 0 masalah.

### Perbaikan (23 Nov 2026): Selected Work — drag halus, infinite, kursor
- Masukan pengguna: drag terasa kasar; kursor masih panah biasa; minta
  infinite. Pilihan kursor: lingkaran "← Drag →" (bukan tangan bawaan).
- `src/js/work-drag.js` ditulis ulang: baris digerakkan dengan transform
  (bukan scroll bawaan), mengikuti kursor/jari sedikit tertinggal dan halus
  (lerp), dilepas meluncur lalu melambat; mouse, sentuh (geser ke atas tetap
  menggulir halaman), trackpad ke samping, panah keyboard.
- Infinite: kartu disalin di depan dan belakang (salinan `aria-hidden`,
  `inert`), posisi berputar per lebar satu set; tepi kiri menampakkan ujung
  kartu sebelumnya (seperti Figma).
- Kursor: lingkaran **kaca** 84 "← Drag →" (pengguna) menggantikan kursor
  di atas baris, mengecil saat ditekan: blur + saturasi + tepi terang seperti
  tombol kaca situs, diberi gelap 45% supaya tulisan putih tetap terbaca di
  atas putih.
  Reduced motion / layar sentuh: tanpa lingkaran (tangan "grab"), tanpa
  luncuran. `work-cursor.js` kembali hanya "View Project" (bukan di baris
  drag).
- Dicek: drag mouse 6× berturut (> 6.000 px) tetap berputar; lingkaran di
  ujung kursor, mengecil saat ditekan; sentuh 390 (samping menggeser, atas
  menggulir halaman); "View Project" homepage tetap; cek otomatis 10
  alamat × 19: 0 masalah.
- **Tanpa loncat (pengguna: "seamless")**: ditangkap saat masih meluncur,
  baris dulu melompat ke tujuan luncuran (diukur: terus jalan ±800px saat
  ditahan diam); kini berhenti di tempat yang terlihat (diukur: diam).
  Gambar baris dimuat langsung (bukan lazy) supaya salinan tidak muncul
  kosong; salinan dibangun ulang hanya bila lebar baris berubah.

### Cek responsive menyeluruh (24 Nov 2026)
- Permintaan pengguna: pastikan semua komponen halaman Work bebas bug
  responsive.
- Dicek: cek otomatis 10 alamat × 19 ukuran; cek tambahan per komponen
  (5 alamat Work × 19 ukuran, animasi menyala dan reduced motion): teks
  tumpang tindih atau meluber, gambar rusak/gepeng, area sentuh < 24px,
  bar tab menempel; foto tiap komponen di 320–1920; alur klik tab, hasil
  cari Grid/List, kosong, cari ulang dan Clear search di 320–1440.
- **Bug (HP): di hasil cari tidak ada kolom cari.** Di HP bar hanya berisi
  tab (kolom cari ada di hero, langkah 4), tetapi hasil cari menyembunyikan
  hero, jadi kata yang dicari tidak terlihat dan tidak bisa diubah atau
  dihapus. Kini di HP, hanya saat hasil cari, kolom muncul selebar layar di
  baris kedua bar (di bawah tab); jarak lompat section disesuaikan.
- **Area sentuh kecil (layar sentuh):** kotak ketik hanya 22px di dalam
  kolom 50px (ketuk tepi kolom tidak membuka keyboard) → setinggi kolom;
  "Clear search" 19px → area ketuk ±43px (tanpa menggeser tata letak);
  pilihan Grid/List 22px → 44px (tanpa menggeser).
- Bukan bug: jarak judul di bawah bar setelah klik tab lebih besar untuk
  Live Sites dan Design Showcase (jarak antar section 120, sesuai Figma).

### Animasi antar section — rencana (24 Nov 2026, disetujui pengguna)
Bahasa gerak situs (About, Contact, Our Work): teks naik di jendelanya,
garis digambar dari kiri, gambar kartu terbuka dari bawah; sekali saja,
dibuka di tengah halaman → yang di atas langsung tampil; reduced motion diam.
1. Hero (saat dibuka). 2. Selected Work. 3. Bar tab + tiga section (kartu
per baris). 4. Cek akhir. Hasil cari: tanpa animasi masuk.

### Animasi langkah 1 — hero (24 Nov 2026)
- `src/js/work-intro.js`: baris judul naik (0,15 s antar baris), lalu
  baris intro, "What are you building?", kolom cari, label + chip satu per
  satu; kolase (desktop) "berputar masuk" bersamaan (0,15 s): muncul pelan
  (0,9 s) sementara roda berputar 36° lebih dulu ke arah putaran biasanya,
  cepat lalu melambat menyatu dengan putaran CSS (1,8 s; properti `rotate`
  lewat `--work-wheel-in`, terpisah dari `transform` putaran). Versi awal
  (dibuka garis lurus dari bawah) terasa aneh (pengguna) — pilihan
  pengguna: berputar masuk. Menunggu font dan 6 gambar
  kolase pertama (paling lama 1,5 s), seperti About.
- Disembunyikan CSS sampai siap (`is-work-ready`), muncul sendiri setelah
  3 s bila skrip gagal. Alamat hasil cari: tidak dimainkan (hero tersembunyi);
  Clear search → hero langsung tampil.
- Jendela naik untuk kolom dan chip (naik 100%) ditutup penuh di awal
  (sebelumnya tepi atasnya sudah terlihat sebelum gilirannya).
- Dicek: rekaman 1440 dan 390 (150–3200 ms), reduced motion (langsung
  tampil, tanpa split), About → Work lewat Barba, Back/Forward, tanpa error
  JS, tanpa sisa clip/transform; cek otomatis 10 alamat × 19: 0 masalah.

### Animasi langkah 2 — Selected Work (24 Nov 2026)
- Di `src/js/work-intro.js` (`setUpSelected`), seperti kartu Our Work di
  homepage: judul dan teks naik; kartu yang terlihat (termasuk salinan yang
  mengintip di tepi kiri) terbuka dari bawah satu per satu dari kiri
  (0,08 s antar kartu, 1,1 s), gambarnya naik 8% di dalam bingkai, lalu
  judul + keterangan naik. Sekali saja; kartu di luar layar dibiarkan.
- Judul dan baris kartu punya pemicu masing-masing (top 85%): di 1440 × 900
  judul sudah di layar pertama, baris belum — dulu kartu beranimasi tanpa
  terlihat. Di layar pertama: mulai ≥ 0,6 s setelah hero. Dibuka di bawah
  (sudah dilewati): langsung tampil.
- Gerak gambar memakai `translate` (hover kartu memakai `transform`); setelah
  selesai semua kartu dibersihkan, termasuk salinan yang dibangun ulang
  saat ukuran layar berubah (`work-drag.js`). Disembunyikan CSS sampai siap
  bersama hero.
- Dicek: rekaman 1440 (layar pertama dan digulir), 390, 2560; drag tetap
  jalan setelahnya; dibuka di `#design-showcase` lalu naik (langsung
  tampil); ubah lebar di tengah animasi (tanpa sisa, 15 salinan); reduced
  motion; tanpa error JS; cek otomatis 10 alamat × 19: 0 masalah.

### Animasi langkah 3 — bar tab + tiga section (24 Nov 2026)
- `src/js/work-intro.js` (`setUpBrowse`): bar — garis atas/bawah digambar
  dari kiri (1,2 s; garis kini `::after` dengan `--work-tabs-line`, border
  transparan menjaga ruangnya, tampilan akhir sama), lalu tab dan kolom
  cari naik. Tiap section: judul dan "See all" naik; kartu dibuka **per
  baris** (kartu dengan posisi atas sama: 3–4 kolom desktop, 2 tablet, 1 HP)
  saat baris itu masuk layar, dari kiri, gerak sama dengan Selected Work.
- Pemicu sampai ujung halaman (`end: "max"`): lompatan tab/hash melewati
  baris tetap menampilkannya. Mencari sebelum semuanya main: semua yang
  belum main langsung ditampilkan (Clear search tidak meninggalkan kartu
  tersembunyi). Disembunyikan CSS sampai siap bersama hero.
- Dicek: gulir seluruh halaman 390/834/1440/2560 (tanpa sisa), klik tab ke
  Design Showcase lalu naik, cari → Clear search → gulir, dibuka di
  `#live-sites`, reduced motion, About → Work lewat Barba; tanpa error JS;
  cek otomatis 10 alamat × 19: 0 masalah.

### Animasi langkah 4 — cek akhir (24 Nov 2026)
- Lighthouse HP (lokal, 12.8.2, 2×, sama): **Work 86 / 100 / 100 / 100**
  (sebelum animasi 81), LCP 3,8 s, TBT 0–10 ms, CLS 0 — animasi tidak
  menambah beban.
- Gulir seluruh halaman dengan animasi menyala di 19 ukuran (320–2560): tanpa
  scroll ke samping selama animasi, tanpa kartu tertinggal tersembunyi,
  tanpa error JS; satu-satunya gaya tersisa = baris SplitText hero di posisi
  akhir (sama seperti About/Contact, tidak terlihat).
- Sudah dicek di langkah 1–3: reduced motion, alamat hasil cari, Clear
  search, lompatan tab/hash, Barba, ubah lebar di tengah animasi; cek
  otomatis 10 alamat × 19: 0 masalah.
- Animasi halaman Work selesai. Sisa (bukan animasi): alamat 9 project Live
  (Studio), gambar asli BREX dan REX, halaman project ("Read the case
  study" + klik kartu), Deploy Hook ke `main` saat merge.
