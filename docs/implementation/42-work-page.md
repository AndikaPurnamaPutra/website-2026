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
- [ ] 2. Halaman + hero
- [ ] 3. Selected Work
- [ ] 4. Tab menempel
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
