# 35 — Principles 03: dari wireframe ke desain yang disetujui

Status: disetujui (10 Nov 2026) dan dikerjakan.

## Tujuan
Ilustrasi Principles 03 di About diganti dari gambar sementara
(`principle-3.jpg`) ke animasi dari Figma: jendela browser berisi wireframe,
diberi grid, menjadi desain, dicoba dua arah lain, lalu yang pertama
disetujui lead.

## Figma (WEBSITE-2026, 670 × 420)
1. **P-1** `2161:80` — wireframe: balok abu 10%, kotak gambar 200 × 190 dengan
   ikon; jendela 542 × 284 (tepi lavender), cahaya "Polygon 1".
2. **P-2** `2161:254` — grid 12 kolom (#FF8A8A 12%, jarak 10) dengan catatan
   "grid-desktop-1440px, margin-all 80px, Gutter 20px"; pointer "UI Designer".
3. **P-3** `2161:337` — desain "Designing Spaces / Shaping Experiences." (foto
   arsitektur, tangga); jendela 336; pointer "Brand Designer" dan "UI
   Designer".
4. **P-4** `2194:2389` — "Transforming Ideas Into Digital Impact." (foto meja
   lebar).
5. **P-5** `2202:2465` — "Rise to the victory, stay focused." (pelari, barbel,
   Previous / Next).
6. **P-6** `2167:519` — desain pertama meredup (10%), cahaya bawah, badge
   "Approved by Lead" dan pointer lead.

## Keputusan pengguna (10 Nov 2026)
- Berulang mulus seperti 01 dan 02.
- Desain tumbuh dari wireframe.
- Grid: **wireframe menempel ke grid** (balok dan kotak gambar bergeser dan
  melebar ke tepi kolom), lebih pelan dan lebih jelas (balok sedikit menyala
  saat menempel).
- Pergantian desain: **layout berubah bentuk** (bukan pudar silang, bukan
  tirai): pointer menyeret sudut foto ke bentuk barunya.
- Cursor tetap terlihat di P-4 dan P-5.
- Teks prinsip 03 di halaman tetap (salinan 01) sampai ada teks asli.

## Alur (±20 s per putaran)
1. Pointer UI Designer datang dan mengklik; kolom grid menyala dari tengah;
   balok wireframe menyala, menempel ke kolom (6, 4, 6, 5, 3 kolom; kotak
   gambar ke 6 kolom terakhir = posisi foto P-3), lalu memudar; catatan grid
   muncul (P-2).
2. Pointer Brand Designer datang dan mengklik; jendela memanjang, kotak gambar
   tumbuh menjadi foto, isi desain naik masuk (P-3).
3. Dua kali dirombak lalu kembali: satu pointer menyeret sudut kiri atas foto
   ke bentuk barunya; foto kedua dan teks ikut pindah (P-4, P-5, P-3).
4. Meredup, pointer lead datang dan mengklik: "Approved by Lead" (P-6).
5. Desain melipat kembali menjadi wireframe; mulai lagi.

## Pengerjaan
- `about.pug`: `data-story="design"`; jendela (`.ds-window`, `.ds-screen`),
  wireframe, grid, tiga desain (`.ds-page`, hanya teks dan tombol), dua bingkai
  foto yang berubah bentuk (`.ds-shot`, `.ds-shot2`), badge, pointer.
- `_about.scss`: `.ds-*`, satuan 1 em = 1 px Figma; tepi jendela cincin
  gradasi lavender (diambil dari render, kode Figma hanya warna polos) yang
  berputar (`--ra`) dari kanan atas (wireframe) ke kiri bawah (desain).
- `principles-scroll.js`: `createDesignStory`, terdaftar di `STORIES`.
- Aset (`assets/images/about/principles/des/`): 5 foto dipotong sesuai kotak
  Figma (2×, JPG → WebP saat build), logo, panah, centang, ikon gambar,
  cahaya, pointer Figma; pointer lead = `tm/cursor.svg`; cahaya bawah =
  `tm/glow-phone.svg`.
- Font **Instrument Serif Italic** (SIL OFL 1.1, `@fontsource/instrument-serif`
  5.3.0, latin) untuk "Shaping Experiences.".
- `principle-3.jpg` dihapus.

## Cek
- Frame dibandingkan dengan render Figma (selisih rata-rata per kanal): P-1
  1,25, P-2 3,4 (saat memudar), P-3 4,1, P-4 3,2, P-5 3,2, P-6 1,7.
- Sambungan putaran tak terlihat; putaran kedua identik (desktop dan HP).
- Desktop: diputar saat 03 tampil, berhenti saat tidak; kembali dari 02/04
  sama dengan kunjungan pertama; reduced motion: P-6 diam.
- About 320–1920 tanpa error dan tanpa scroll samping. Belum: iPhone
  pengguna.

- [x] Disetujui.
- [x] Dikerjakan dan dicek.
