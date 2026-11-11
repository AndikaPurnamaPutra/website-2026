# 34 — Principles 02: alat-alat menyatu ke OWW

Status: disetujui (10 Nov 2026) dan dikerjakan.

## Tujuan
Ilustrasi Principles 02 ("Frictionless Infrastructure") di About diganti dari
gambar sementara (`principle-2.webp`) ke animasi dari Figma: Figma, Webflow
dan ClickUp terhubung ke OWW, lalu menjadi satu sistem.

## Figma (WEBSITE-2026, 670 × 420, tanpa data animasi)
1. **P-1** `1950:6117` — tiga ubin alat 80 × 80 (kaca gelap, garis tepi putih
   1,5, sudut 20, bayangan 0 8 40): Webflow di tengah (x 295, y 235,6),
   Figma kiri bawah (miring −29,42°), ClickUp kanan bawah (miring 18,72°),
   setengah keluar bingkai; partikel dan garis cahaya (`Group 1000005339`);
   grid titik dan cahaya dari bawah seperti 01.
2. **P-2** `1950:6293` — ketiganya naik dan menyebar, masih miring; garis
   cahaya ikut naik.
3. **P-3** `1950:6470` — berbaris di y 79 (x 115, 295, 475), tegak; garis
   penghubung (`Vector 3267`) ke ubin OWW 116 × 116 (sudut 32) di tengah
   bawah (y 247); kilau berwarna di tiap garis (biru, biru, merah muda);
   cursor di dekat OWW.
4. **P-4** `1950:6647` — alat-alat hilang; kisi 5 × 3 ubin kosong 116,
   OWW menyala di tengah.
5. **P-5** `1950:6821` — kisi 90 × 90 berjarak 106, digeser; tiap ubin
   bercentang abu (`Frame 1000005346`); OWW 90 di tengah; tepi bingkai
   memudar (gradien 103,7 di keempat sisi).
6. **P-6** `1957:7691` — ubin OWW membesar (±172) di atas kisi.
7. **P-7** `1957:7774` — gelap polos: ubin OWW memenuhi bingkai.

## Alur (keputusan pengguna, 10 Nov 2026)
Sekali saat terlihat, ±6 s, **berhenti di P-7** (diganti: lihat Revisi di bawah):
1. Ubin alat naik dari bawah sambil miring, partikel dan garis cahaya
   bergerak naik (P-1 → P-2).
2. Ubin tegak dan berbaris di atas; garis penghubung tergambar ke OWW yang
   muncul; kilau berwarna mengalir dari tiap alat ke OWW; partikel memudar
   (P-3).
3. **Cursor menekan OWW** (ubin mengecil sedikit lalu kembali) sebagai
   pemicu (P-3 → P-4).
4. Alat dan garis memudar, kisi ubin muncul dari tengah ke luar (P-4), lalu
   mengecil ke kisi 90 dan centang muncul berurutan (P-5).
5. OWW membesar (P-6) sampai memenuhi bingkai (P-7). Berhenti.

## Dipakai ulang dari 01
Kotak 670:420 dengan 1em = 1 px Figma (`.p-board`, `font-size` di alur HP),
grid titik CSS, cahaya bawah (`glow-phone.svg`), cursor (`tm/cursor.svg`),
pola `createBoardStory` (play / reset / finish / revert, reduced motion →
frame akhir), pemicu sekali di alur HP.

## File
- `src/pug/pages/about.pug` — ilustrasi 02 menggantikan `principle-2.webp`.
- `src/scss/pages/_about.scss` — gaya ilustrasi 02 (`.int-*`).
- `src/js/principles-scroll.js` — cerita 02; desktop memutarnya saat
  prinsip 02 tampil, HP saat terlihat.
- Aset dari Figma (`assets/images/about/principles/int/`): logo Figma,
  Webflow, ClickUp, OWW, partikel/garis cahaya, garis penghubung, centang
  ubin. `principle-2.webp` dihapus bila tak terpakai lagi.

## Yang diperiksa saat mengerjakan
- Warna garis tepi ubin: kode Figma menyebut putih 1,5 px, render tampak abu
  halus (kemungkinan gradien seperti 01) — diambil dari render.
- P-7: warna gelap pastinya (render ±#101010) = isi ubin OWW yang membesar.

## Cek
- Ketujuh frame dibandingkan dengan render Figma (alat yang sama seperti 01).
- Desktop: diputar saat prinsip 02 aktif, diulang dari awal tiap kembali ke
  02; HP: sekali saat terlihat; reduced motion: P-7 langsung.
- About tanpa error dan tanpa scroll samping; iPhone pengguna bila
  tersambung.

## Pengerjaan
- Markup di `about.pug` (`data-story="integrations"`); 01 kini juga ditandai
  `data-story="tasks"`, dan `principles-scroll.js` memutar setiap cerita
  lewat satu daftar (`STORIES`): desktop saat prinsipnya tampil (diulang
  dari awal), HP sekali saat terlihat, reduced motion langsung frame akhir;
  dimuat ulang di 02 → P-7.
- **Garis tepi ubin**: gradien linear Figma (putih → 10% di 54% → 30%,
  kiri atas ke kanan bawah) yang tak ikut ekspor kode; kekuatan diambil dari
  render: 0,7 untuk ubin kaca dan OWW, 0,2 untuk kisi (mixin `int-ring`).
- Ubin alat kaca `rgba(0,0,0,.25)`; OWW kaca di P-3 lalu #0F0F0F dari P-4
  (= warna P-7). Ukuran, sudut, garis tepi, logo dan bayangan OWW lewat
  variabel (`--s`, `--r`, `--b`, `--l`, `--sa`) agar tetap tajam.
- Kisi 7 × 5 satu set: 116/132 di P-4 (cincin luar tersembunyi), 90/106 di
  P-5; muncul dan bercentang dari tengah ke luar.
- Garis kilau berwarna dan garis tengah digambar CSS; cahaya bawah memakai
  `tm/glow-phone.svg` (berkas Figma-nya sama). Aset baru: 7 di
  `principles/int/` (centang diambil dari ubin Figma). `principle-2.jpg`
  dihapus.

- [x] Disetujui.
- [x] Dikerjakan dan dicek (Chrome, jam tiruan): selisih rata-rata per kanal
      terhadap render Figma P-1 0,88, P-2 0,93, P-3 1,03, P-4 0,42, P-5 0,62,
      P-6 0,85; P-7 #0F0F0F polos seperti Figma. Desktop 1440: diputar saat
      02 tampil, diulang saat kembali dari 03, dimuat ulang → P-7; reduced
      motion → P-7. Alur 390 dan 834 (sentuh) memutar cerita. About 320–1920
      tanpa error dan tanpa scroll samping. 01 tidak berubah.
      Belum: iPhone pengguna.

## Revisi: mulus dan berulang (pengguna, 10 Nov 2026)
"Masih terlalu kaku, aku ingin seamless, motion berputar berulang."
- **Berulang** (±7,4 s per putaran): putaran berakhir di gelap P-7 dan
  putaran berikutnya dimulai dari gelap yang sama (`.int-cover`), yang
  terangkat sambil alat-alat naik dari bawah bingkai. Sambungan tidak
  terlihat (selisih frame akhir dan awal 0,01).
- **Tanpa henti di tiap frame**: ketiga alat bergerak dalam satu gerakan
  (bawah bingkai → P-1 → P-2 → P-3) dengan kecepatan masing-masing;
  langkah berikutnya selalu dimulai sebelum yang sebelumnya selesai; alat
  mengayun pelan sambil menunggu cursor; cursor datang melengkung; alat
  meluncur masuk ke OWW setelah ditekan; OWW membesar melewati P-6 sampai
  P-7 dalam satu gerakan.
- Desktop: diputar saat 02 tampil (dari awal), berhenti setelah prinsip
  lain menutupinya; dimuat ulang di 02 → langsung berputar. HP: berputar
  selama terlihat, berhenti di luar layar. Reduced motion: P-5 diam
  (sistem lengkap; P-7 hanya gelap polos).
- Dicek: P-4 0,45 dan P-5 0,62 terhadap Figma (P-3 2,0 karena alat sedang
  mengayun); putaran kedua identik dengan yang pertama (desktop dan HP);
  About 320–1920 tanpa error dan tanpa scroll samping.

## Revisi 2 (pengguna, 10 Nov 2026)
"Garis berwarna mengalir hingga ke bawah; animasi tidak stabil, ada yang
tiba-tiba cepat atau lambat; ada yang bocor; dari P-7 ke P-1 terlalu cepat."
- **Cahaya berwarna mengalir sepanjang garis** dari tiap alat sampai masuk ke
  OWW (dua kali), dengan kecepatan tetap. Digambar sebagai SVG
  (`.int-streams`): enam garis putus bertumpuk yang berakhir di satu kepala,
  sehingga ekornya memudar seperti gradien Figma.
- **Kecepatan rata**: alat naik di satu jalur halus (kurva Catmull-Rom
  melewati P-1 dan P-2, ditempuh merata menurut panjangnya; sebelumnya
  belokan tajam di P-1/P-2); semua gerakan memakai ease lembut (sine /
  power2 in-out; `back`, `expo`, `power3.in` dibuang). Diukur per frame:
  tak ada lonjakan kecepatan pada elemen yang terlihat.
- **Bocor** yang ditemukan dan diperbaiki: alat tampak tembus OWW yang masih
  kaca saat masuk → OWW menjadi padat saat ditekan, baru alat meluncur masuk
  di belakangnya; kisi muncul sebelum OWW sampai di tengah (lubang tengah
  terlihat) → kisi menunggu OWW tiba; layar gelap sempat hilang 0,4 s di
  awal putaran (cahaya bawah berkedip) → ditahan; logo OWW raksasa saat
  membesar → memudar lebih awal.
- **P-7 → P-1 lebih pelan**: gelap ditahan ±0,5 s, memudar 1,6 s sambil alat
  naik 3,1 s. Satu putaran ±12 s.
- Dicek: P-4 0,85 dan P-5 0,61 terhadap Figma; sambungan putaran 0,01;
  putaran kedua identik (desktop dan HP); desktop berhenti saat tak tampil,
  reduced motion P-5 diam; About 320–1920 tanpa error dan scroll samping.

## Revisi 3: transisi dipoles (pengguna, 10 Nov 2026)
"Awal pergerakannya cukup aneh, dan di setiap transisi masih cukup aneh."
Tiap langkah kini tumbuh dari langkah sebelumnya (±12,8 s per putaran):
- **Awal**: gelap terangkat sambil cahaya bawah ikut naik dan grid titik
  sedikit mengendap (skala 1,05 → 1); partikel muncul bersama alat, bukan
  sendirian di layar gelap.
- **OWW naik menyambut garis** yang turun dari alat (sebelumnya muncul samar
  di tempat).
- **Alat meluncur menyusuri garisnya** masuk ke OWW sambil mengecil, dan
  garisnya tergulung tepat di belakangnya. Garis penghubung kini tiga garis
  SVG (`.int-wire`, satu per alat; `connector.svg` dihapus).
- **Kisi menyebar dari balik OWW** (`--k` 0 → 1), bukan muncul di tempat.
- **P-5 → P-7**: kisi ikut maju dan memudar saat OWW membesar.
- Bug: Figma dan ClickUp tetap miring di P-3 (GSAP mengambil alih transform
  dan membekukan putaran awal) → putaran ubin lewat GSAP.
- Dicek: P-3 1,46 dan P-5 0,62 terhadap Figma; perubahan kecepatan antar
  frame maks. ±7% pada elemen terlihat; desktop berhenti saat tak tampil,
  reduced motion P-5; HP berulang; About 320–1920 tanpa error dan scroll
  samping.

## Revisi 4 (pengguna, 10 Nov 2026)
"Garis di P-3 hilang; garis di P-2 seperti meluncur. Lainnya sudah oke."
- **Cahaya berwarna di P-3 selalu ada**: sebelumnya tiap garis hanya
  membawa satu kilau (kilau berikutnya memotong yang sebelumnya), sehingga
  warnanya sering hilang. Kini pola kilau berulang tiap 150 px mengalir terus
  dari saat garis tergambar sampai alat meluncur masuk; bagian tegak tiap
  garis selalu berwarna.
- **Garis dan titik di P-2 meluncur ke atas** (pengguna: "garis dan dot"):
  ke-8 titik dan 3 garis dari "Group 1000005339" kini elemen sendiri
  (`.int-spark`; `particles.svg` dihapus), masing-masing meluncur naik
  dengan ketukan dan kecepatan sendiri, sedikit lebih cepat dari alat,
  sambil muncul dan memudar; posisi diamnya tetap seperti Figma.

## Revisi 5 (pengguna, 10 Nov 2026)
- "Ketika pindah ke step sebelum atau sesudahnya, garis di P-3 hilang":
  tween yang memunculkan garis hanya menulis "terlihat" di nilai awalnya;
  saat cerita dimulai ulang dari tengah (kembali ke 02), nilai itu tak
  dipasang lagi dan garis tetap tersembunyi. Kini ditulis di kedua ujung,
  begitu pula untuk ubin, cursor, kisi dan OWW. Dicek: tampilan P-3 setelah
  kembali dari 03 dan dari 01 sama dengan kunjungan pertama.
- "Garisnya ketika muncul masih kasar": garis dibuka oleh potongan mendatar
  yang turun (garis mendatar bawah muncul sekaligus). Kini tiap garis
  tergambar menyusuri jalurnya dari alat, lewat sudut, sampai OWW (satu
  garis putus SVG yang memanjang, ±240 px/s), dan cahaya berwarna hanya
  tampil di bagian yang sudah tergambar (masker SVG yang mengikuti garis).

## Revisi: gaya motion design (pengguna, 11 Nov 2026)
Sama seperti 01 ("masih terlalu kaku, terlalu AI"):
- **Kamera** (`.tm-camera` membungkus semua kecuali titik, cahaya dan gelap; `cameraPath()` dihitung dari waktu cerita, jadi tiap putaran sama): hanya bergeser sedikit dari tengah (maks. 1,02×), tidak mengikuti cursor (pengguna: "kamera tidak perlu mengikuti cursor karena menjadi terpotong"); mendekat 1,06× hanya saat OWW memenuhi layar, kembali ke 1× di bawah gelap. Titik latar ikut 30%.
- **Kurva** `oww-move` / `oww-settle` seperti 01.
- **Alat**: naik sedikit melewati tempatnya lalu mengendap; saat menunggu tiap alat melayang dengan irama sendiri (tidak lagi seragam). Masuk ke OWW bergiliran (6,25 / 6,34 / 6,43 s), makin cepat (`power3.in`), dan OWW berdenyut kecil tiap kali satu masuk, tiap denyut berbeda.
- **Cursor**: masuk dari luar tepi bawah board dalam satu lengkungan dengan irama tangan, diam sebentar, menekan (OWW tertekan lalu memantul), keluar ke bawah board.
- **Saling menyambung**: OWW ke tengah saat alat terakhir masuk, grid menyebar sebelum OWW selesai, centang digambar melingkar (`--sweep`) mulai 9,3 s.
- Dicek tiap 0,1 s: tanpa lompatan dan error (perubahan terbesar 4 saat alat naik); putaran 1 dan 2 identik (selisih ≤ 0,3); tidak ada yang terpotong.
- **Klik lebih elegan** (pengguna: "animasi tombolnya tidak elegan", efek klik di 01 dan 02; 03 dikembalikan ke versi commit 966c598 atas permintaan pengguna): tekanan lebih kecil (cursor 0,9×, elemen 0,97–0,985×, 0,14 s) dan kembali dengan `oww-settle` tanpa pantulan (`back.out` dihapus); denyut OWW di 02 lebih lembut (1,02–1,03×).
