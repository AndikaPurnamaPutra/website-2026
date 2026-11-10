# 38 — Principles 06: design system diterapkan dan siap dikembangkan

Status: disetujui (10 Nov 2026) dan dikerjakan.

## Tujuan
Ilustrasi Principles 06 di About diganti dari gambar sementara
(`principle-6.jpg`) ke animasi dari Figma: pengaturan design system
diterapkan ke aplikasi, bagian-bagiannya tersambung ke token, kodenya
disiapkan untuk developer, lalu dinyatakan siap dikembangkan.

## Figma (WEBSITE-2026, 670 × 420)
1. **P-1** `1942:119` — panel "Design System" 383 × 309: Colors, Theme (Dark),
   Font Style (Inter Display), Device (HP), tipografi "Aa", Spacing 4–24 px;
   kursor di "Apply".
2. **P-2** `1948:857` — aplikasi "OWW Studio" (sidebar 160 × 327); label token
   "main-component" dan "bg-default #050505" tersambung garis putus-putus.
3. **P-3** `1988:1267` — aplikasi bergeser dan meredup; panel "Developer View"
   dengan kode `Button.tsx` (gambar di Figma).
4. **P-4** `1988:1621` — badge "Ready to develop" (seperti "Approved by Lead"
   di 03) dengan kursor.

## Keputusan pengguna (10 Nov 2026)
- Alur yang diusulkan disetujui ("ya lanjutkan"): berulang mulus, dipicu
  kursor, panel berubah bentuk menjadi aplikasi, kode diketik baris demi
  baris, ±13 s.
- "Motion yang memiliki story dan terasa hidup; yang saat ini sudah cukup
  bagus."
- Teks prinsip 06 (dan 03–05) di halaman tetap (salinan 01) sampai ada teks
  asli.

## Alur (±13 s per putaran)
1. Kursor memilih HP di Device (penandanya bergeser dari desktop), lalu
   mengklik Apply (P-1).
2. Panel berubah bentuk menjadi sidebar aplikasi yang tersusun dari atas ke
   bawah; garis putus-putus tergambar, label token muncul (P-2).
3. Aplikasi bergeser ke kiri dan meredup; Developer View naik masuk, kodenya
   diketik baris demi baris (P-3).
4. Semua menyusut menjadi "Ready to develop"; kursor mengkliknya, centang
   menyala (P-4).
5. Badge melebar kembali menjadi panel design system; mulai lagi.

## Pengerjaan
- `about.pug`: `data-story="handoff"`; satu jendela (`.sy-box`) yang menjadi
  panel lalu aplikasi, garis SVG bermasker, label token, Developer View
  (`.sy-dev`, kode sebagai teks asli berwarna sesuai gambar Figma),
  badge (`.ds-badge` dari 03), kursor.
- `_about.scss`: `.sy-*`; tepi lavender (`cm-edge`).
- `principles-scroll.js`: `createHandoffStory`, terdaftar di `STORIES`.
- Aset (`assets/images/about/principles/sy/`): ikon palet, panah, warna,
  matahari, bulan, perangkat, cahaya kartu tipografi, logo OWW, ikon menu,
  kode, tumpukan, X; dipakai ulang: kaca pembesar dan Command (`cm/`),
  centang (`des/`), kursor dan cahaya bawah (`tm/`). `principle-6.jpg`
  dihapus.

## Bug yang ditemukan dan diperbaiki saat mengecek
- Menu "Daily tasks" dan sub-menunya tidak redup (animasi masuk menimpa 40%).
- Kode tergeser ±40 px ke kanan (posisinya ikut terskala ukuran fontnya).
- Jendela sempat kosong saat berubah menjadi aplikasi dan saat kembali.
- "Inter Display" di kartu tipografi terpotong dan terlalu rendah (contoh di
  sebelahnya kini dipangkas seperti Figma; latar gradien teks diturunkan
  sampai ekor "y").

## Cek
- Frame dibandingkan dengan render Figma (selisih rata-rata per kanal): P-1
  2,7, P-2 1,4, P-3 1,6, P-4 0,7.
- Seluruh putaran ditangkap tiap 0,1 s: tak ada loncatan; sambungan putaran
  tak terlihat.
- Desktop: diputar saat 06 tampil, berhenti saat tidak; kembali dari 05/01
  sama dengan kunjungan pertama; reduced motion: P-4 diam. HP: berulang.
- Gulir cepat, ganti lebar desktop → tablet → desktop: tanpa error.
- About 320–1920 tanpa error dan tanpa scroll samping. Belum: iPhone
  pengguna.

- [x] Disetujui.
- [x] Dikerjakan dan dicek.
