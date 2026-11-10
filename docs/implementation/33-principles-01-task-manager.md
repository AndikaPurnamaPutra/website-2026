# 33 — Principles 01: papan "Task Manager"

Status: disetujui (10 Nov 2026: pertanyaan 1 → a, pertanyaan 2 → teks asli) dan dikerjakan.

## Tujuan
Ilustrasi Principles 01 ("Execution Over Overhead") di About diganti dari papan
abstrak (kartu kosong, garis putus-putus, cursor memindah kartu) ke papan
**Task Manager** dari Figma, dengan storyboard barunya.

## Figma (file WEBSITE-2026, 670 × 420 tiap frame, tanpa data animasi)
1. **P-1** `1950:5090` — diam: jendela "Task Manager" (ikon kalender, tombol
   "+ New Task" dan "⋮"), tiga kolom: **Backlog 20** (kartu Design "Create
   responsive mobile navigation", Due Nov 12, 2 avatar; 2 kartu kosong),
   **In Progress 3/8** (Development "Build product listing page and
   filtering", 50%; Design "Finalize homepage design and interactions", 88%),
   **Completed 4/20** (2 kartu kosong). Latar: grid titik + cahaya.
2. `1950:5267` — cursor datang ke kartu "Finalize homepage…": kartu terang
   (latar hitam, garis), lingkaran centang kosong muncul di pojok kanan atas.
3. `2169:1649` — kartu diangkat (tangan "grab"), miring ±−8°, membesar sedikit,
   seluruh papan meredup di belakangnya.
4. `2169:1931` — papan menyempit menjadi layar HP: hanya kolom **Completed
   4/20**; "Finalize homepage…" di atas dengan progres **100%** dan garis
   terang; "Build product listing…" di bawahnya (tanpa progres); dua kartu
   kosong; tiap kartu punya lingkaran kosong.
5. `2169:2256` — centang putih muncul di dua kartu pertama, centang abu di
   kartu kosong.

## Usulan animasi (sekali saat terlihat, ±5 s, seperti Motion-01 sekarang)
1. Diam ±0,6 s → 2. cursor masuk ke kartu "Finalize…", kartu menyala dan
lingkaran muncul → 3. kartu diangkat (miring, membesar, papan meredup) →
**[belum ada di Figma]** kartu dibawa ke kolom Completed dan diletakkan,
progres 88% → 100% → 4. papan menyempit ke layar HP (kolom lain memudar,
"New Task" hilang, "Build product…" pindah ke Completed) → 5. centang muncul
satu per satu. Berhenti di frame 5 (seperti sekarang).

## Yang dipakai ulang
`createBoardStory()` di `principles-scroll.js` (dipanggil di desktop dan di
alur HP), cara "1em = 1 px Figma" pada `.p-board`, kotak 670:420, aturan
reduced motion (langsung frame akhir).

## File
- `src/pug/pages/about.pug` — markup papan baru (kartu, kolom, teks).
- `src/scss/pages/_about.scss` — gaya `.p-board` diganti.
- `src/js/principles-scroll.js` — `createBoardStory()` ditulis ulang.
- Aset dari Figma: 6 ikon kecil (CalendarDots, Plus, DotsThreeVertical,
  BoxArrowDown, HourglassHigh, CheckCircle), 2 avatar, cursor panah dan
  tangan, centang; grid titik dan cahaya latar (SVG/CSS).
- Aset papan lama di `assets/images/about/principles/` yang tak terpakai
  dihapus.

## Pertanyaan
1. **Antara frame 3 dan 4**: kartu dibawa ke kolom Completed lalu papan
   menyempit (usulan di atas), atau papan langsung menyempit sambil kartu
   yang diangkat "jatuh" ke posisinya di frame 4?
2. **Teks di kartu** (judul tugas, "Due Nov 11", persen) ditulis sebagai teks
   asli atau gambar? Usulan: teks asli (tajam di semua ukuran), dengan
   `aria-hidden` seperti sekarang karena ilustrasi dekoratif.

## Cek
- Frame 1 dan 5 dibandingkan dengan screenshot Figma (desktop 1440).
- Animasi dilihat penuh di desktop dan di HP (alur), dan di iPhone pengguna.
- Reduced motion: frame 5 langsung.
- About 1440 di luar ilustrasi identik piksel; tidak ada scroll samping.

## Pengerjaan
- Markup lewat mixin `tmCard`, `tmSkeleton`, `tmMark`, `tmColumn` di
  `about.pug`; kolom diposisikan dengan `--x`/`--w`, jendela dengan
  `--wl`/`--ww`, header dengan `--hw` (di elemennya sendiri: `setup()`
  menghapus gaya inline pada `.principles__figure`).
- Grid titik digambar dengan CSS (radial-gradient 16,7158 em, titik 1,09 em,
  #98A2B3, 20%, masker radial seperti Figma) alih-alih SVG Figma 1,2 MB.
- Teks dipangkas ke kapital dan garis dasar (`text-box: trim-both cap
  alphabetic`), seperti Figma.
- 11 aset papan lama dihapus; 17 aset baru di
  `assets/images/about/principles/tm/`.

- [x] Disetujui.
- [x] Dikerjakan dan dicek (Chrome, jam tiruan untuk menghentikan animasi):
      P-1, P-2, P-3 (kartu diangkat −13°, papan meredup, tempat putus-putus),
      pemindahan ke Completed (88% → 100%), P-4, P-5 cocok susunan, ukuran
      dan warna dengan Figma di 1440; alur HP 390 (sentuh) memutar cerita
      sampai P-5; reduced motion langsung P-5 (4 centang, jendela 308);
      About 390, 834, 1440 tanpa error dan tanpa scroll samping.
      Belum: iPhone pengguna.

## Penyempurnaan (pengguna: "lebih perfect", 10 Nov 2026)
Dibandingkan piksel demi piksel dengan render Figma (1×, 670 × 420):
- **Garis tepi jendela dan kartu terpilih** di Figma bergradasi melingkar
  (lavender di dua sisi berseberangan) yang tak ikut ekspor kode; diambil
  dari render dan digambar sebagai cincin `conic-gradient` (mixin
  `tm-ring`; jendela dibungkus `.tm-frame` karena isinya terpotong).
  Muncul di kartu yang dipilih (P-2), yang diangkat (P-3) dan di HP (P-5);
  hilang saat papan meredup.
- **Bilah progres**: lebar sesuai Figma (70/117,67 = 59,5% di 50%, 91% di
  88%); sebelumnya variabel `--w` kolom ikut terbaca sehingga bilah penuh.
- **Jarak huruf** normal (mewarisi −0,02em dari section), judul kartu kini
  membungkus di kata yang sama dengan Figma.
- **Elemen tersembunyi** (tempat putus-putus, dua slot di Completed)
  `display: none` sampai dipakai: dengan tinggi 0 mereka tetap menambah
  jarak 4px dan menggeser kartu 4–8px.
- Tombol "New Task" melipat lebarnya di HP sehingga "⋮" tetap di tepi kanan
  (sebelumnya meluap 16px); titik kecil di kartu kerangka ditambahkan.

Selisih rata-rata per kanal terhadap Figma: P-2 3,1, P-3 1,4, P-5 1,7
(sebelumnya P-1 5,4 dan P-5 2,6; sisanya penghalusan huruf dan pola titik).
