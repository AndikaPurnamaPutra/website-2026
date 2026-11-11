# 40 — Principles (About): tumpukan di HP & tablet

Permintaan pengguna (11 Nov 2026): "aku ingin tumpuk seperti di service".
HP, tablet, dan semua layar sentuh (< 1024 atau `hover: none`); desktop
(pin dan langkah) tidak berubah. Tidak ada di Figma.

## Cara kerja
- Kode tumpukan dari Services (doc 39) dijadikan modul bersama:
  - `src/js/scroll-stack.js` — `buildStack({ section, block, scope, after,
    pairs })`: menggabung pasangan elemen jadi panel `<block>__panel` di
    wadah `<block>__stack`, penanda `<block>__mark` untuk timeline scroll,
    jarak bawah tiap panel diukur supaya tumpukan lepas bersamaan; fungsi
    kembaliannya mengembalikan semua elemen ke tempat asal.
  - `src/scss/components/_scroll-stack.scss` — mixin `scroll-stack($block,
    $top, $background, $shade)` dan keyframes `stack-step-back`, `stack-dim`.
  - Services memakai modul ini (tampilan sama, dicek ulang).
- Principles: tiap prinsip (nomor, judul, teks) dan ilustrasinya jadi satu
  panel (`flow()` di `principles-scroll.js`, dibangun sebelum cerita
  mengukur posisinya). Header tetap tampil di section ini (64px), jadi
  tumpukan menempel di **76px** (64 + 12), tiap panel 10px lebih rendah.
- Panel yang tertutup mundur (0,94, gelap 55%) **mulai saat panel berikutnya
  menyentuh tepi bawahnya** (`--cover-from`, diukur), bukan saat panel
  berikutnya masuk layar: sebelumnya panel sudah mengecil saat masih
  bergerak naik. Berlaku juga untuk Services.

## Bug yang ditemukan dan diperbaiki
- Semua nomor "01": `.principles__inner` (container) mengurung reset
  penghitung dari isinya; dengan tiap prinsip di panel sendiri, tiap
  panel mulai dari 01. Reset kini di `.principles__stack`.

## Dicek (Chrome headless, sentuh)
- 390×844: panel 400px, menempel 76/86/96…, urutan tidak pernah terbalik,
  galeri ≥ 224px di bawah panel, nomor 01–06.
- 375×667 dan 834×1194: urutan benar, tanpa tumpang tindih.
- 390 → 1440 → 390: panel dibongkar (desktop 6/6 kembali) dan dibangun lagi.
- Services 390: tetap benar setelah dipindah ke modul.
- Tanpa error. Belum: iPhone pengguna.

## Tumpukan lebih terlihat (11 Nov 2026, pengguna: "kurang terlihat")
Tepi panel di belakang hanya garis gelap 10px di latar gelap, lalu
digelapkan 55%. Kini (modul bersama, jadi juga Services): jarak antar tepi
16px; garis tepi atas terang 1px (putih 14%) di tiap panel, di atas lapisan
gelap; penggelapan 35%. Dicek 390: urutan benar, tanpa tumpang tindih,
tanpa error (Principles dan Services).

## Tumpukan bertingkat dan border keliling (11 Nov 2026, pengguna)
"Pada akhirnya kecilnya sama semua, kecuali di akhir" dan "border hanya di
atas aneh":
- Tiap panel yang datang menimpa membuat **semua** panel di bawahnya mundur
  satu tingkat lagi: satu animasi per panel di atasnya (timeline penanda
  panel itu), dijumlahkan (`animation-composition: add`, `transform:
  scale(0.95)` per tingkat). Hasil di 390: 0,77 / 0,82 / 0,86 / 0,90 / 0,95
  / 1 dari belakang ke depan, seperti tumpukan kartu. Nama, timeline, dan
  rentang ditulis oleh `scroll-stack.js` (rentang tiap tingkat: dari tepi
  atas panel itu menyentuh bawah panel sebelumnya sampai ia menempel);
  hanya jika browser mendukung scroll timeline dan tanpa reduced motion
  (tanpa timeline animasinya langsung ke akhir).
- Border 1px putih 12% di keempat sisi (di atas lapisan gelap), mengganti
  garis atas saja.
- Dicek 390 (Principles, Services) dan 834: urutan benar, tanpa tumpang
  tindih, tanpa error.
