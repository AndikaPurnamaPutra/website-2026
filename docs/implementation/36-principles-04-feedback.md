# 36 — Principles 04: komentar client, dijawab dan diselesaikan

Status: disetujui (10 Nov 2026) dan dikerjakan.

## Tujuan
Ilustrasi Principles 04 di About diganti dari gambar sementara
(`principle-4.jpg`) ke animasi dari Figma: tim di sekitar client, komentar
client dijawab PMO, designer mengerjakannya di Figma, komentar diselesaikan.

## Figma (WEBSITE-2026, 670 × 420)
1. **P-1** `2095:5591` — Client (cakram 100, memoji) terhubung garis lengkung
   putus-putus ke Execution Leads, Dedicated PMO dan dua Designer.
2. **P-2** `2117:5738` — panel "Comment" 234 × 267: komentar Client (10:24 AM),
   balasan PMO (10:27 AM), kerangka komentar ketiga; pointer Client, PMO,
   Designer.
3. **P-3** `2129:5935` — jendela Figma 542 × 446 (lewat bawah bingkai): panel
   kiri, kanvas dengan garis ukur merah "64", panel kanan; pointer Designer.
4. **P-4** `2129:6457` — jendela meredup (20%), kartu komentar Client dengan
   centang.

## Keputusan pengguna (10 Nov 2026)
Alur yang diusulkan disetujui ("ya"): berulang mulus, tiap langkah dipicu
orang, tanpa pudar biasa, cursor tetap terlihat, ±14 s. Teks prinsip 04 di
halaman tetap (salinan 01) sampai ada teks asli.

## Alur (±15 s per putaran)
1. Tim terbentuk (pengguna: "P-1 awal langsung terbentuk, bagaimana jika
   dibuat animasi"): putaran dimulai dari Client sendirian; garis lengkung
   tergambar dari Client, tiap anggota muncul saat garisnya sampai, lalu
   namanya (P-1).
2. Garis lengkung tergulung kembali ke Client; PMO dan Designer menyusut
   menjadi pointer-nya, yang lain menghilang; avatar Client terbang dan
   mengecil, panel terbuka dari tempat ia mendarat; judul dan pencarian
   masuk, komentar Client naik masuk, wajah PMO muncul dengan balasannya,
   komentar ketiga berkedip "sedang mengetik" (P-2).
3. Panel melebar menjadi Figma; Designer menyeret teks ke bawah, jarak 32 →
   64 (garis ukur dan angkanya ikut) (P-3).
4. Meredup, kartu komentar naik masuk, Designer mengklik centang (P-4).
5. Kartu kembali ke atas menjadi Client sendirian; putaran berikutnya
   membentuk tim lagi dari sana.

## Pengerjaan
- `about.pug`: `data-story="feedback"`; garis lengkung SVG (dibentuk ulang
  dari potongan putus-putus Figma menjadi satu jalur per lengkung, digambar
  lewat masker), anggota, label, satu jendela (`.cm-box`) yang menjadi panel
  lalu Figma, kartu, pointer (`.ds-pointer` dari 03).
- `_about.scss`: `.cm-*`; tepi lavender jendela dan kartu seperti 03.
- `principles-scroll.js`: `createFeedbackStory`, terdaftar di `STORIES`.
- Aset (`assets/images/about/principles/cm/`): 3 avatar (200 px), ikon
  pengguna, kaca pembesar, Command, logo Figma, Play, garis ukur, kerangka,
  centang; cahaya `des/light.svg`, pointer `des/pointer.svg`, cahaya bawah
  `tm/glow-phone.svg`. `principle-4.jpg` dihapus.

## Bug yang ditemukan dan diperbaiki saat mengecek
- Garis lengkung tak tergambar (masuk ke dalam `defs` karena indentasi).
- Komentar tergeser 20 / 53 px (terindentasi ke dalam kotak pencarian).
- Label "64" tak terlihat (posisinya ikut terskala ukuran fontnya).
- Avatar Client terbang di bawah panel; avatar PMO menunggu sendirian.
- Label anggota tertutup cakram (urutan tumpukan); pointer di bawah cakram.
- Panel tampil penuh sesaat sebelum terbuka (pudar dan ukuran terpisah).
- Dua wajah Client sekaligus saat panel terbuka dan saat kembali ke awal.
- Label pointer PMO menutupi wajah PMO di komentar.
- Frame pertama menampilkan P-1 lengkap (gaya bawaan) sesaat sebelum cerita
  mulai dari Client sendirian; hal yang sama untuk 02 (mulai gelap) dan 03.
  Kini tiap cerita langsung dipasang di langkah pertamanya saat dibuat.

## Cek
- Frame dibandingkan dengan render Figma (selisih rata-rata per kanal): P-1
  1,5, P-2 2,4, P-3 2,4, P-4 1,2.
- Seluruh putaran ditangkap tiap 0,1 s: tak ada loncatan; sambungan putaran
  tak terlihat; tak ada dua wajah Client sekaligus (dicek tiap 0,05 s).
- Desktop: diputar saat 04 tampil, berhenti saat tidak; kembali dari 03/05
  sama dengan kunjungan pertama; reduced motion: P-4 diam. HP: berulang.
- Gulir cepat maju-mundur, ganti lebar desktop → tablet → desktop: tanpa
  error, hanya ilustrasi aktif yang tampil.
- About 320–1920 tanpa error dan tanpa scroll samping. Belum: iPhone
  pengguna.

- [x] Disetujui.
- [x] Dikerjakan dan dicek.
