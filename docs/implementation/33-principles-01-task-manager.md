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

## Revisi: mulus dan berulang (pengguna, 10 Nov 2026)
"Untuk no 1 juga dibuat seamless, dan juga berulang"; lalu "dari cursor ke
drag berpindah card terlalu patah"; "masih kaku, patah-patah; dari cursor
ke grab terlihat kasar".
- **Berulang**: cerita maju sampai P-5, ditahan 1,2 s, lalu kembali dengan
  tenang: centang memudar (0,7 s), layar HP melebar ke papan penuh (1,8 s,
  sedikit lebih pelan dari menyempitnya; pengguna: "dari kecil ke lebar
  terasa aneh, sangat cepat"), kartu-kartu memudar dan muncul kembali
  seperti P-1, lalu mulai lagi (±9,5 s per putaran; sambungan tak
  terlihat). Bagian maju diputar 1,25× lebih cepat (pengguna: "terlalu
  lambat"). Cerita dimainkan lewat waktunya, jadi mundurnya
  persis kebalikan majunya. Desktop: berhenti saat prinsip lain tampil; HP:
  berputar selama terlihat; reduced motion: P-5 diam.
- **Satu gerakan tanpa jeda**: cursor datang melengkung, kartu menyala saat
  didekati, ditekan saat cursor berhenti; kartu terangkat, miring −13° (P-3)
  dan terbawa ke Completed dalam satu jalur halus (melewati titik P-3), sedikit
  membesar di tengah jalan dan turun saat mendarat; tempatnya menutup dan
  Completed memberi ruang selama kartu terbang; papan meredup dan terang lagi
  bersamaan.
- **Cursor ke tangan**: tangan muncul tepat di ujung cursor (sebelumnya ±45 px
  di sebelahnya lalu bergeser), cursor mengecil dan memudar sementara tangan
  membesar masuk; tangan menempel di titik tekan pada kartu dan ikut berputar.
- Semua ease lembut (sine / power2 in-out); centang tumbuh pelan
  (`back.out(1.3)`, sebelumnya memantul).
- Perbaikan: garis tepi jendela hilang setelah putaran pertama (`--ring`
  jendela hanya nilai cadangan, terbaca 0) → `--ring: 1` di `.tm-frame`.
- Dicek: P-5 2,09 terhadap Figma (seperti sebelumnya); perubahan kecepatan
  antar frame kecil (cursor ≤29, kartu dan tangan ≤13 px/s per frame); frame
  rate 60 fps juga dengan CPU 4× lebih lambat; About 320–1920 tanpa error
  dan scroll samping.

## Revisi: lebih manusiawi (pengguna, 11 Nov 2026)
"Sudah sangat bagus, tapi masih terlalu kaku dan terlihat seperti buatan AI."
- **Cursor**: datang cepat lalu melambat (sumbu x `power3.out`, y `power2.inOut`), sedikit lewat dari kartu (3,5 / 2,2 px) lalu membetulkan, diam ±0,15 s, baru menekan. Kartu ikut tertekan (97,5%).
- **Kartu punya berat**: saat diangkat sedikit melewati ukurannya (103,5%) lalu tenang; selama dibawa miring mengikuti arah dan kecepatannya (maks. 6°) dan tertinggal sedikit dari tangan (0,03 s); saat mendarat menekan sedikit (98,5%) dan memantul halus.
- **Irama tidak seragam**: tiap jenis gerak punya ease sendiri; papan meredup sedikit sebelum kartu berangkat; kolom lain hilang bergiliran; progres 88 → 100% cepat lalu melambat; centang muncul dengan putaran kecil pada jarak tak sama (0 / 0,17 / 0,38 / 0,52 s).
- **Cursor tetap ada**: setelah tangan melepas, panah muncul lagi di titik itu dan bergeser pelan ke samping HP, bergerak sedikit selama jeda P-5, lalu memudar bersama kartu saat putaran kembali. Reduced motion: P-5 tanpa cursor, seperti Figma.
- Putaran ±10,6 s (sebelumnya ±9,9). Dicek tiap 50 ms satu putaran penuh: tanpa lompatan; perubahan terbesar antar frame tetap di pudarnya kartu saat kembali, seperti sebelumnya.

### Penyesuaian (pengguna: "dari P5 ke P1 aneh; cursor juga aneh")
- **Tanpa diputar mundur**: setelah jeda P-5, isi kartu memudar, HP melebar kembali ke papan dengan kolom kosong, lalu kartu muncul di tempat awal per kolom (naik 6 px, bergiliran 0,09 s). Sebelumnya seluruh cerita diputar mundur (centang menyusut, cursor mundur) sehingga terlihat seperti rewind. Lompatan waktu kini instan (sebelumnya 0,01 s, satu frame bisa tertangkap di tengahnya); HP mulai menyempit di 4,0 s setelah kartu yang dibawa hilang.
- **Cursor**: tiap perjalanan satu lengkungan halus (`smoothPath`) dengan irama tangan (cepat di awal, melambat panjang; ease `power2.inOut` atas `t^0,72`), ditempatkan menurut waktu cerita; tanpa koreksi lewat-kembali dan tanpa goyangan bolak-balik. Setelah melepas: panah muncul di titik tangan dan menyingkir satu lengkungan ke samping HP; saat jeda bergeser sangat kecil, lalu keluar ke bawah papan, tempat ia masuk di putaran berikutnya (`--ax`/`--ay`/`--ao` di `.tm-cursor`).
- Dicek tiap 50 ms satu putaran (±9,2 s): tanpa lompatan dan error; perubahan terbesar antar frame (4,8) saat HP menyempit.
- **Kartu tidak muncul dua kali** (pengguna: "saat di-grab sudah muncul di Completed"): Completed kini membuka tempat kosong saat kartu mendekat (2,75 s, sebelumnya 2,42 s), dan kartu di dalamnya baru tampak saat kartu yang dibawa mendarat (3,78 s). Dicek ulang tiap 50 ms: tanpa lompatan.

## Revisi: gaya motion design (pengguna, 11 Nov 2026)
"Masih cukup kaku dan tidak seamless selayaknya motion, masih terlalu AI"; tanpa referensi.
- **Kamera**: semua kecuali titik dan cahaya dibungkus `.tm-camera` (titik pandang `--kfx/--kfy`, kedekatan `--kz`). Mendekat ke kartu saat cursor datang (350, 262; 1,05), mengikuti kartu ke Completed (384, 226; 1,06), mundur saat HP terbentuk (1,0); saat jeda P-5 sedikit mendekat (1,012) lalu kembali. Titik latar ikut 30% (paralaks). Kamera digerakkan oleh loop, jadi selalu kembali ke 1,0 sebelum putaran baru; reduced motion: tanpa kamera.
- **Kurva**: `CustomEase` `oww-move` (berangkat tegas, mengendap panjang) untuk perpindahan, `oww-settle` untuk yang masuk, `oww-cam` untuk kamera.
- **Saling menyambung**: kartu asli menggantikan kartu yang dibawa tepat saat mendarat (3,55 s) lalu memantul; HP mulai terbentuk di 3,7 s saat kartu masih mengendap; kolom Backlog dan In Progress bergeser keluar ke kiri bergiliran; centang mulai saat HP hampir jadi.
- **Centang digambar melingkar** (`mask-image: conic-gradient` dengan `--sweep`), bergiliran tidak rata.
- **Motion blur** kecil pada kartu yang dibawa saat paling cepat (`--mb`, maks. 0,9 px).
- Putaran ±8,8 s. Dicek tiap 50 ms: tanpa lompatan dan error; perubahan terbesar antar frame (±7) saat kamera mendekat, merata dari frame ke frame (gerak, bukan loncatan).
- **Melebar tanpa patah** (pengguna: "masih ada patah di akhir dari kecil ke besar"): balik ke 4,9 s (HP sudah terbentuk; sebelumnya 4,55 s saat HP masih menyempit, sehingga lebarnya meloncat), lalu melebar 1,5 s hanya dengan kurva cerita sendiri (sebelumnya ditambah `power2.inOut` di luar: awal sangat lambat, akhir mendadak). Dicek tiap 25 ms: perubahan per frame naik dan turun merata, tanpa lonjakan.
- **Akhir putaran** (pengguna: "cursor tiba-tiba muncul lalu menghilang; Completed seperti bertabrakan"):
  - Cursor keluar ke bawah board lalu baru memudar, dan putaran baru masuk dari luar tepi bawah (552, 478; board memotong isinya), jadi meluncur masuk, tidak muncul di atas board. Geser tambahannya lewat `top`/`left` (`--ax`/`--ay`): `translate` diambil alih GSAP sehingga cursor sebelumnya hanya memudar di tempat.
  - Backlog dan In Progress disembunyikan selama HP melebar (`--co`) dan muncul bersama kartunya, jadi tidak lagi menimpa Completed yang sedang bergeser.
  - Bug: geser cursor, pudarnya, dan `--co` sebagai tween tidak kembali saat loop mengulang, sehingga cursor dan dua kolom itu hilang di putaran berikutnya. Kini dihitung dari waktu loop tiap frame (`loopBits`). Dicek: putaran 1 dan 2 identik (selisih ≤ 0,36 per kanal).
- **Kamera tidak mengikuti cursor** (pengguna, saat 02: "karena menjadi terpotong"): tetap di tengah dan hanya mendekat sedikit (maks. 1,02×).
- **Klik lebih elegan** (pengguna: "animasi tombolnya tidak elegan", efek klik di 01 dan 02; 03 dikembalikan ke versi commit 966c598 atas permintaan pengguna): tekanan lebih kecil (cursor 0,9×, elemen 0,97–0,985×, 0,14 s) dan kembali dengan `oww-settle` tanpa pantulan (`back.out` dihapus); denyut OWW di 02 lebih lembut (1,02–1,03×).
