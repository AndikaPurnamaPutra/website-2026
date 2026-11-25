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

### Collage: kartu bergerak satu per satu (25 Nov 2026)

Gerakan collage diadaptasi dari video hero outstandingbranding.co. Gambar, posisi, dan animasi masuk tetap sama. Yang berubah hanya cara roda berputar:

- Sebelumnya roda berputar terus dengan kecepatan rata (CSS).
- Sekarang setiap kartu bergeser satu tempat (15°) dengan kurva `expo.inOut` selama 2,3 detik. Kurva ini sangat pelan di awal dan di akhir, jadi gerakan yang terlihat ±1,8 detik dan sisanya terasa diam. Jeda antar gerakan hanya 0,1 detik.
- Kurva dan durasi dipilih dengan mencocokkan profil kecepatan ke referensi. Ukurannya adalah lebar profil di 2% dan 10% kecepatan puncak.
  - Diukur dari screencast Chrome, tiga gerakan: 1,55–1,96 / 1,20–1,22 detik. Referensi 1,80 / 1,20.
  - Diam antar gerakan ±0,75–0,9 detik. Referensi bergantian 1,2 dan 0,3 detik.
  - Sebelumnya `power3.inOut` 1,6 detik: 1,46 / 1,17 detik. Mulai dan berhentinya terlalu cepat.
- Gerakan pertama menunggu 1,5 detik setelah halaman siap (`is-work-ready`), supaya tidak bertabrakan dengan animasi masuk collage.
- Geserannya bergiliran: kartu paling atas bergerak duluan, lalu kartu di bawahnya menyusul setiap 0,05 detik. Karena itu kartu sempat merapat dan merenggang, seperti di referensi.
- Angka-angka ini diukur dari video referensi frame demi frame (perubahan piksel per frame):
  - satu gerakan ±1,8 detik dari kartu pertama sampai terakhir,
  - kartu depan ±0,25 detik lebih dulu dari kartu terakhir yang terlihat,
  - diam ±1,2 detik.
- Referensi bergerak bolak-balik. Di sini arahnya tetap maju, supaya roda terus berputar.

Cara kerjanya (`src/js/work-collage.js`, GSAP):

- Setiap `.work-collage__arm` diputar lewat `rotate: var(--turn)` (`_work.scss`). Ini terpisah dari letaknya dan dari putaran masuk (`--work-wheel-in`).
- Satu putaran timeline = satu putaran gambar (`--loop` tempat), lalu ulang dari 0 tanpa sambungan.
- Timeline jeda saat collage tidak terlihat (di bawah layout laptop atau di luar layar). Dengan reduced motion, collage diam.
- Angka bisa disetel di bagian atas file: `REST`, `GLIDE`, `GAP`, `EASE`, `AFTER_READY`.

### Selected Work: drag berhenti rapi di kartu (25 Nov 2026)

Pilihan user: "Berhenti rapi di kartu". Drag tetap bebas dan meluncur seperti biasa, tapi baris selalu mendarat dengan awal kartu di garis istirahat, yaitu posisi awal baris seperti di Figma. Sebelumnya baris bisa berhenti di tengah kartu.

- **Lepas setelah drag:** mendarat di kartu terdekat dari titik akhir luncuran. Lemparan cepat bisa melewati beberapa kartu.
- **Drag pelan:** kalau ditarik minimal 20% lebar kartu (`NUDGE`), baris maju paling sedikit satu kartu ke arah tarikan. Tarikan lebih pendek kembali ke kartu semula.
- **Swipe trackpad:** baris mendarat di kartu 140 ms setelah swipe berhenti (`SWIPE_END`).
- **Tombol panah:** tepat satu kartu.
- **Saat ukuran layar berubah:** baris tetap berada di kartu.
- **Cara kerjanya (`src/js/work-drag.js`):** titik berhenti diambil dari `offsetLeft` setiap kartu asli dalam satu set, lalu diulang per set, jadi tetap berlaku untuk baris yang tidak berujung.
- **Hasil uji di Chrome:**
  - 1440 dengan mouse:
    - drag pelan 60 px → 1 kartu,
    - drag 25 px → 0 (kembali),
    - lempar cepat → 2,
    - drag 300 px ke kanan → −2,
    - swipe trackpad → 2,
    - panah kanan → 1.
  - 390 dengan sentuhan: drag 80 px → 1, flick → 1.
  - Semuanya mendarat tepat di kartu (selisih 0 px), dan tidak ada error JS.

### Kolom search: satu tingkat lebih tipis (25 Nov 2026)

Permintaan user, pilihan "Lebih tipis". Berlaku untuk kedua kolom search: hero dan bar tab (`.work-search__input`).

- Placeholder dan kolom kosong: 500 (Medium) → **400 (Regular)**.
- Teks yang diketik: 600 (SemiBold) → **500 (Medium)**.
- Kedua font sudah dimuat situs. Dicek di Chrome: 400 dan 500.

### Kolom search: tanpa garis focus (25 Nov 2026)

Permintaan user. Aturan `.work-search__field:has(.work-search__input:focus-visible)` (outline 2px hitam) dihapus. Kolom di hero dan di bar tab tidak lagi diberi garis saat aktif, baik diklik maupun lewat keyboard. Kursor teks yang berkedip menjadi penanda posisi ketik. Tombol search dan Clear search tetap punya garis focus.

### Search: transisi saat menampilkan hasil (25 Nov 2026)

Masukan user: menampilkan hasil pencarian terasa kasar. Penyebabnya, semua terjadi dalam satu frame:

- isi halaman langsung ditukar,
- halaman langsung melompat ke atas,
- hasil tidak punya animasi masuk (aturan lama di rencana animasi).

Sekarang (`src/js/work-search.js`, fungsi `swap()` dan `enter()`):

- **Keluar:** isi yang sedang tampil memudar dalam 0,25 detik (`OUT`).
- **Pindah:** saat tidak ada yang terlihat, alamat dan hasil diperbarui, lalu halaman dipindah ke atas. Lompatannya tidak tampak.
- **Masuk ke hasil (Grid):** baris "Showing … / View mode" naik, lalu judul grup naik, lalu kartu di layar pertama terbuka dari bawah, baris demi baris (`ROW_GAP` 0,12 detik). Kartu di bawah layar pertama langsung berada di tempatnya.
- **Masuk ke hasil (List):** baris-baris di layar pertama naik bergantian.
- **Hasil kosong:** pesan kosong memudar sambil naik.
- **Kembali ke halaman lengkap** (Clear search, Back): hero dan Selected Work memudar sambil naik 40 px.
- **Kecepatan:** gerak masuk 1,4× lebih cepat dari animasi halaman (`PACE`), karena pengguna sedang menunggu hasil.
- **Berlaku untuk:** cari dari hero dan dari bar tab, chip, See all, Clear search dan ✕, Back/Forward, serta pilihan Grid/List. Pilihan Grid/List tidak memindah halaman ke atas.
- **Pencarian beruntun:** pencarian kedua di tengah transisi menggantikan yang pertama, tanpa bentrok.
- **Reduced motion:** langsung tanpa animasi, seperti sebelumnya.

Gerak teks naik dan kartu terbuka dipindah ke modul bersama `src/js/work-motion.js` (`rise`, `openCards`, `clearCards`, `rowsOf`). `work-intro.js` sekarang memakainya, dan gerakannya tidak berubah.

**Uji di Chrome**, 1440 dan 390, motion menyala dan reduced motion:

- Diuji: cari dari hero, List dan Grid, dua pencarian cepat, cari dari bar tab saat halaman sudah di-scroll, Back, dan Clear search.
- Hasilnya:
  - Hasil selalu tampil, posisi scroll selalu 0, dan tidak ada kartu yang tertinggal tertutup.
  - Style animasi bersih setelah ±2 detik.
  - Tidak ada error JS.
- Cek animasi halaman (`final.mjs`, 19 ukuran): sama seperti sebelumnya. Yang tersisa hanya 4 baris judul hero dari SplitText yang sudah berada di posisi akhir.

### Search: tombol tertekan saat Enter atau klik ikon (25 Nov 2026)

Pilihan user: "Tombol ditekan + ikon bergerak". Saat form search dikirim (Enter atau klik ikon), `press()` di `work-search.js` menjalankan gerak ini:

- Tombol search di kolom itu mengecil ke 0,86 dalam 0,12 detik (`PRESS`), lalu memantul kembali ke 1 (`back.out(3)`, 0,5 detik).
- Ikon kaca pembesar bergeser 3 px ke kanan atas, lalu kembali bersama tombol.
- Isi halaman baru mulai memudar setelah tombol tertekan (`swap(…, { after: PRESS })`), supaya tekanannya terlihat. Hasil tampil hanya 0,12 detik lebih lambat.
- Di bar tab saat hasil tampil, tombol search diganti ✕, jadi tidak ada tombol yang ditekan dan transisi langsung jalan.
- Dengan reduced motion, tombol tidak bergerak.

Diuji di Chrome:

- Enter di hero (1440 dan 390): skala 0,87–0,88, ikon bergeser (2,7, −2,7), isi mulai memudar setelah ±0,12 detik.
- Klik ikon di bar tab (1440): skala terkecil 0,86.
- Enter di bar tab saat hasil tampil: pencarian tetap jalan.
- Style tombol bersih setelah gerakan selesai, dan tidak ada error JS.

### Search: View mode jadi dropdown sendiri (25 Nov 2026)

Pilihan user: "Dropdown custom". Sebelumnya View mode memakai `<select>` bawaan, jadi menu yang terbuka bergaya sistem. Sekarang dropdown-nya kita gambar sendiri, mengikuti pola Turnaround di Contact:

- Markup (`WorkResults.astro`): tombol "Grid ⌄" (`.work-view__button`, `aria-haspopup="listbox"`) dan daftar `role="listbox"` berisi Grid dan List, masing-masing dengan ikon kecil.
- Gaya (`_work.scss`, `.work-view__*`):
  - Panel putih dengan sudut membulat dan bayangan lembut, 12 di bawah tombol.
  - Panel turun dan memudar saat dibuka/ditutup. Chevron berputar 180°.
  - Pilihan yang aktif atau ditunjuk berwarna hitam penuh dengan latar abu muda. Yang lain 50%.
  - Di desktop dan tablet panel rata kanan dengan tombol. Di HP rata kiri, supaya tidak keluar layar di 320.
  - `.work-results__bar` diberi `z-index: 3` supaya panel di atas kartu.
- Logika (`work-search.js`): `setView`, `openView`, `closeView`, `chooseView` menggantikan `select.value`.
  - Mouse: klik untuk membuka, klik pilihan untuk memilih, klik di luar untuk menutup.
  - Keyboard: ↓/↑ membuka, ↑/↓/Home/End menunjuk, Enter/Spasi memilih, Esc menutup.
  - Pilihan yang sama hanya menutup panel. Pilihan baru disimpan (`oww-work-view`) dan menjalankan transisi hasil seperti sebelumnya.
- Reduced motion: tanpa transisi panel.

Diuji di Chrome (1440, 834, 390, 320): panel tampil di atas kartu dan tidak keluar layar. Klik dan keyboard berfungsi, Esc dan klik di luar menutup panel, pilihan bertahan setelah reload. `swap.mjs` (motion on/off) lolos tanpa error JS.

### Search: hover tombol search dan ✕ (25 Nov 2026)

Sebelumnya tombol search (kaca pembesar) dan ✕ tidak berubah saat diarahkan.

- Percobaan 1: tombol naik 2 px, ikon search miring, ✕ berputar. User: "terlalu aneh".
- Percobaan 2: tombol jadi hitam dengan ikon putih. User: "terlalu aneh".
- Akhir (pilihan user: abu-abu tipis, dan ✕ lebih baik seperti sebelumnya):
  - Latar tombol berubah dari putih ke abu muda (`--color-surface-soft`, #eee) dalam 0,3 detik. Sedikit lebih gelap dari kolom (#f3f3f3), supaya tombol tidak menyatu dengannya.
  - ✕ berputar 90° (0,45 detik). Kaca pembesar diam.
  - Lalu (user: abu-abu di ikon search aneh, lebih baik tidak ada): tombol search tidak berubah sama sekali saat diarahkan. Abu-abu dan putaran hanya untuk ✕.
  - Reduced motion: ✕ tidak berputar, hanya warnanya yang berubah.

Diuji di Chrome 1440 (hero dan bar tab): warna dan putaran benar, klik search tetap jalan, tanpa error JS.

### Search: ruang di bawah mode List (25 Nov 2026)

User: mode List terasa aneh karena tidak ada ruang di bawahnya. Penyebabnya, grup Grid adalah `.work-section` (120 di bawah), sedangkan daftar List tidak punya padding. `.work-list` sekarang punya `padding-bottom: fluid(120)`.

Diuji di Chrome (1440, 834, 390): jarak baris terakhir ke akhir hasil 120, sama dengan Grid.

### Badge "Live": titik hijau berdenyut (25 Nov 2026)

User: badge `project-card__badge--light` lebih baik "bling". Titik hijaunya (`::before`) sekarang berdenyut seperti tanda siaran langsung (`@keyframes live-pulse`, 2 detik, berulang):

- Cincin hijau keluar dari titik, membesar sampai 6, lalu hilang.
- Titiknya sedikit meredup (0,6) di tengah, lalu terang lagi.
- Dengan reduced motion: titik diam.
- Titiknya diperkecil dari 8 (Figma) ke 6 (user: dot solidnya lebih kecil).

Berlaku di semua kartu Live Sites (section halaman dan hasil search). Diuji di Chrome 1440: animasi jalan, tanpa error JS.

### Tes banyak project: `WORK_STRESS` (25 Nov 2026)

User ingin melihat halaman Work dengan 100, 200, atau lebih project. `src/data/cms.js` sekarang membaca `WORK_STRESS`:

- `WORK_STRESS=200 npm run dev` (atau `build`) menyalin project yang ada sampai setiap jenis punya 200.
- Judul salinan diberi nomor.
- Project asli tetap di depan dengan urutannya. Salinan tidak masuk Selected Work.
- Tanpa variabel itu, tidak ada yang berubah. Sanity dan data asli juga tidak tersentuh.

Hasil ukur di Chrome (200 per jenis = 600 project, Mac tanpa CPU throttle):

| | 1440 | 390 |
|---|---|---|
| HTML `work.html` | 1 MB | 1 MB |
| Elemen di halaman | ±13.300 | ±13.300 |
| Gambar dimuat saat buka | 28 (1,6 MB) | 15 (0,9 MB) |
| Search "branding" (194 hasil), sampai tampil | 0,43 detik | 0,56 detik |
| Ganti ke List (194 baris), long task | 0,24 detik | 0,83 detik |
| Scroll daftar / grid | 60 fps | 60 fps |

Gambar tetap lazy, jadi yang dimuat hanya yang terlihat. Yang terasa berat adalah saat banyak hasil tampil sekaligus (terutama List di HP). Di HP sungguhan bisa 3–4× lebih lama.

### Search: "Load more" di hasil (25 Nov 2026)

Dari tes `WORK_STRESS`, ratusan hasil yang tampil sekaligus terasa berat, terutama mode List di HP. User setuju menambahkan "Load more" di hasil search dan "See all". Section di halaman Work tidak diubah karena sudah dibatasi 9 atau 12 kartu.

- Setiap jenis menampilkan 24 hasil dulu (`PAGE`, habis dibagi 3 dan 4 kolom).
  - Grid: tombol "Load more" ada di bawah kartu grupnya.
  - List: tombol ada setelah baris jenis itu.
  - Tombolnya memakai gaya tombol situs (`button text-18`, seperti "More Work"). Di bawahnya ada teks "24 of 160".
- Klik menambah 24 lagi di tempat, tanpa halaman bergeser.
  - Kartu baru terbuka seperti kartu lain (`openCards` per baris). Baris List naik (`rise`).
  - Kalau kartu punya link, fokus pindah ke kartu baru pertama.
  - Tombol hilang saat semua sudah tampil.
- Jumlah yang sudah dibuka tetap saat ganti Grid ↔ List. Search baru mulai lagi dari 24.
- Dengan data sekarang (maksimal 18 per jenis), tombol tidak pernah muncul. Tombol baru terlihat kalau satu jenis punya lebih dari 24 hasil.

Diuji di Chrome (1440 dan 390, `WORK_STRESS=200`, search "branding" = 194 hasil):

- Mulai: 58 kartu, "24 of 160". Setelah Load more: 82 kartu, "48 of 160", scroll tidak bergeser.
- List: 82 baris. Setelah Load more: 106 baris.
- Search baru ("app"): kembali ke 24 per jenis.
- Style animasi bersih dan tidak ada error JS.

#### Load more terasa tertahan (25 Nov 2026)

User: setiap klik Load more terasa tertahan atau lag. Hasil ukur dengan 600 project:

- **Penyebab 1:** saat animasi selesai, `clearCards(results)` membersihkan style di semua kartu hasil (600 × 3 elemen). Satu frame tertahan ±170–180 ms tepat di akhir. Hal yang sama terjadi setelah setiap search.
- **Penyebab 2:** kartu baru dibuka dengan `power2.inOut`, yang mulainya pelan. Sesaat setelah klik seolah tidak terjadi apa-apa.

Perbaikan:

- `clearCards` (`work-motion.js`) sekarang menerima satu elemen atau daftar elemen. Search dan Load more hanya membersihkan kartu yang benar-benar bergerak.
- `openCards(items, { ease })`: Load more memakai `power3.out`, jadi kartu langsung bergerak saat diklik. Masuknya halaman dan search tetap `power2.inOut`.

Hasil (1440, Grid dan List): tidak ada frame di atas 17 ms dan tidak ada long task. Search "branding" dengan 600 project: hanya satu frame 50 ms (sebelumnya ada ±180 ms di akhir). `swap.mjs` dan `more.mjs` lolos tanpa error.

### "See all" satu tingkat lebih kecil (25 Nov 2026)

User: ukuran "See all" terlalu besar. Ukurannya sekarang:

- Desktop dan tablet: 16 (sebelumnya 20, sesuai Figma).
- HP: 14 (sebelumnya 16).
- Panah: 14 (sebelumnya 18). Jarak teks ke panah: 6 (sebelumnya 8).

Diuji di Chrome 1440 dan 390.

### Tombol search dan ✕ dibuat seragam (25 Nov 2026)

User bertanya kenapa ✕ tidak seperti tombol search, dan setuju dibuat seragam:

- Hover: kedua tombol tetap putih (abu-abu di ✕ dihapus). Hanya ✕ yang berputar 90°.
- Klik: ✕ juga tertekan seperti tombol search. `pressButton(button, { nudge })` di `work-search.js` dipakai bersama.
  - Tombol search: tertekan, dan kaca pembesar bergeser.
  - ✕: hanya tertekan.
  - Halaman kembali ke `/work` setelah `PRESS` (0,12 detik).
- Teks "Clear search" tidak tertekan.

Diuji di Chrome 1440:

- Hover ✕: latar putih dan ikon berputar 90°.
- Klik ✕: skala terkecil 0,86, lalu kembali ke `/work`.
- Hover search: putih.
- "Clear search" tetap berfungsi, dan tidak ada error JS.

### Case Study: video di kartu (25 Nov 2026)

User: kartu BREX Banking Branding dan REX Panels Branding memakai video (`brex-banking-branding.mp4`, `rex-panels-branding.mp4`) menggantikan gambar. Dipasang lewat Sanity, dengan pola yang sama seperti Services:

- **Studio** (`studio/schemaTypes/project.js`): field baru "Video cover (MP4, opsional)". Hanya tampil untuk Jenis = Case Study.
  - Cover tetap wajib, karena dipakai sebagai poster video, di homepage, dan di Selected Work.
- **Build** (`scripts/cms.mjs`): video Case Study diunduh ke `src/assets/images/cms/work/<slug>.mp4`, lalu `video: "cms/work/<slug>"`.
  - `prune()` sekarang hanya menghapus file video itu sendiri. Sebelumnya `.webp` cover yang namanya sama ikut terhapus.
- **Kartu** (`ProjectCard.astro`, prop `playVideo` dari `WorkGrid` dan `WorkResults`): `<video muted loop playsinline preload="none">` dengan cover sebagai poster. Selected Work tetap memakai gambar.
- **Putar** (`inview-videos.js`): IntersectionObserver.
  - Video berjalan saat kartu terlihat dan berhenti saat keluar layar.
  - Kartu yang baru tampil (hasil search, Load more) juga ikut, tanpa refresh.
  - Dengan reduced motion: video tidak diputar, poster tetap tampil.

Diuji di Chrome (1440 dan 390, video dipasang sementara di data lokal):

- Tidak ada video yang dimuat sebelum section Case Study terlihat.
- Di Case Study kedua video berjalan. Setelah scroll menjauh, keduanya berhenti.
- Search "brex": video berjalan di kartu hasil.
- Reduced motion: video tidak berjalan.
- Tidak ada error JS.

Catatan ukuran: BREX 1690×1265, 14,8 detik, 7,2 MB. REX 1920×1080, 20 detik, 5,2 MB. Kartunya hanya 325–555 px lebar, jadi video bisa dikecilkan jauh tanpa terlihat berbeda (lihat batas bandwidth Vercel).

#### Video dikecilkan sebelum upload (25 Nov 2026)

Video dikecilkan dengan ffmpeg (dipasang lewat Homebrew, atas persetujuan user):

```
ffmpeg -i in.mp4 -an -vf "scale=1110:-2:flags=lanczos" -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 26 -movflags +faststart out.mp4
```

- Lebar 1110 = 2× kartu terbesar (555), jadi tetap tajam di layar retina.
- Tanpa audio, karena kartu memutarnya tanpa suara.
- `faststart` supaya video bisa mulai diputar sebelum selesai diunduh.

Hasil:

- BREX: 7,2 MB → 2,1 MB.
- REX: 5,2 MB → 1,5 MB.
- Perbandingan frame dengan aslinya tidak terlihat berbeda.

File hasilnya ada di folder utama project: `brex-banking-branding-web.mp4` dan `rex-panels-branding-web.mp4`, tidak masuk git. Upload file `-web` ini ke Studio. Untuk video kartu berikutnya, pakai setelan yang sama.
