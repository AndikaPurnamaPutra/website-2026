# 20 — Preloader

Status: **Revisi 5 (2 Nov 2026): kotak hitam menjadi showreel.** Bagian "Revisi 5" di akhir dokumen menggantikan alur sebelumnya. Alur di bawah ini (langkah 1–9) sudah diganti oleh bagian "Revisi 3" di akhir dokumen.
Figma: 1860:249 → 1860:244 → 1860:202 → 1860:254 (Hero), 1440 × 820. Figma hanya berisi keadaan diam, tanpa animasi. Gerakan mengikuti penjelasan pengguna dan referensi mersi-architecture.com, fluid.glass, dan leoparpeix.com.

## Keputusan pengguna (2 Nov 2026)
1. Logo terbentuk mengikuti progress loading: mulai kecil berupa outline, lalu terisi warna solid.
2. Warna solid berubah menjadi gradasi persis Figma. Setelah itu teks "One Week" dan "Wonders Studio" muncul di kiri-kanan logo. Ukuran teks boleh berbeda dari Figma (14px), asal seimbang dengan logo.
3. Teks menjauh ke pinggir layar (frame 1860:202).
4. Teks hilang, lalu logo membesar sambil memudar transparan dan memperlihatkan halaman (seperti leoparpeix.com).
5. Logo kecil membesar ke ukuran Figma di antara langkah 1 dan 2.
6. Teks (di preloader dan **semua teks di hero**) muncul **dari bawah**, seperti fluid.glass.
7. Preloader tampil **setiap kali halaman dibuka**.
8. Koin 3D: untuk sementara ikut muncul bersama hero (tanpa animasi khusus).

## Isi dari Figma
- **Latar:** putih.
- **1860:249:** logo 69 × 33 di tengah layar.
- **1860:244:** logo 206 × 98 di tengah (x 617, y 361). Teks Inter Medium 14 / 1.6 / −0.28, #111: "One Week" berakhir 40px di kiri logo, "Wonders Studio" mulai 40px di kanan logo, sejajar tengah logo.
- **1860:202:** logo tetap. "One Week" di x 40 dan "Wonders Studio" berakhir di x 1400, mengikuti tepi konten (`.container`).
- **Logo:** 4 bentuk (titik + 3 garis miring), gradasi radial #111111 → #474747. SVG diambil dari Figma, sama dengan `assets/images/logo.svg` tapi bergradasi.

## Alur animasi (usulan waktu, bisa disetel nanti)
| # | Langkah | Kira-kira |
|---|---|---|
| 1 | Logo kecil (skala 69/206) tergambar sebagai outline mengikuti progress loading (gambar, font, dan file halaman). Paling cepat ±1,2 dtk, supaya tidak berkedip di koneksi cepat. | selama loading |
| 2 | Outline terisi warna solid #111 | 0,4 dtk |
| 3 | Logo membesar ke 206px | 0,8 dtk |
| 4 | Solid berubah menjadi gradasi Figma (crossfade lapisan gradasi) | 0,6 dtk |
| 5 | "One Week" dan "Wonders Studio" muncul dari bawah, huruf per huruf (bertahap) | 0,6 dtk |
| 6 | Kedua teks bergeser ke pinggir layar | 1 dtk |
| 7 | Teks turun dan hilang (kebalikan langkah 5) | 0,4 dtk |
| 8 | Logo membesar besar-besaran sambil memudar; latar putih preloader ikut memudar sehingga halaman terlihat | 1 dtk |
| 9 | Teks hero muncul dari bawah, baris per baris, bertahap | 0,8–1 dtk |

Total setelah loading ±5 dtk.

**Teks muncul dari bawah:** setiap baris (atau huruf, untuk teks preloader) dibungkus wadah `overflow: hidden`, lalu isinya naik dari 100% ke 0. Cara kerja persis di fluid.glass akan saya rekam lebih detail saat mengerjakan, dan menyesuaikan easing serta jedanya.

**Yang ikut animasi di hero:** judul "Elite digital products…", deskripsi kanan, tanggal, zona waktu dan jam, serta tombol Behance/Dribbble. Gelombang gradasi "Elite digital" (hero-highlight) baru berjalan setelah judul selesai muncul. Showreel dan koin 3D muncul bersama hero tanpa animasi tambahan.

**Halaman tanpa hero** (About, Contact, Privacy, Terms): preloader yang sama, lalu halaman langsung terlihat setelah langkah 8.

## File
| File | Perubahan |
|---|---|
| `src/pug/partials/preloader.pug` (baru) | Lapisan preloader: logo SVG inline (outline, solid, gradasi) dan dua teks |
| `src/pug/layouts/default.pug` | Include preloader di awal `body` |
| `src/scss/components/_preloader.scss` (baru), `src/scss/main.scss` | Style preloader |
| `src/js/preloader.js` (baru), `src/js/main.js` | Progress loading, timeline GSAP langkah 1–8, kunci scroll selama preloader |
| `src/js/hero-intro.js` (baru), `src/pug/partials/hero.pug` | Teks hero muncul dari bawah (langkah 9), dijalankan setelah preloader. Baris judul dan deskripsi dibungkus di Pug (`.hero__line`) |
| `src/js/hero-highlight.js` | Gelombang gradasi menunggu hero intro selesai, tidak lagi berjalan sendiri saat load |
| `src/scss/sections/_hero.scss` | Baris hero dan mask sementara |

Tanpa library baru: cukup GSAP yang sudah ada. Outline digambar dengan `stroke-dasharray` SVG.

## Hal teknis penting
- **Kunci scroll** selama preloader (Lenis dihentikan, scroll asli juga dikunci), lalu dibuka lagi setelah langkah 8.
- **Tanpa kedipan:** preloader dan keadaan awal teks hero sudah tampil sejak paint pertama (kelas `.js` di `<head>`), sebelum `main.js` dimuat.
- **Tanpa JS:** preloader tidak tampil, halaman normal.
- **Reduced motion:** preloader dilewati (atau hanya memudar singkat), teks hero langsung tampil.
- **Scroll memory:** bila halaman dibuka ulang di tengah, posisi scroll dipulihkan di balik preloader. Teks hero hanya beranimasi bila hero terlihat.
- **Navbar** tertutup preloader (z-index di atas header), lalu terlihat saat langkah 8.

## Langkah
- [x] 1. Logo SVG dari Figma, markup, dan style preloader.
- [x] 2. Progress loading dan langkah 1–4 (outline → solid → membesar → gradasi).
- [x] 3. Teks preloader: muncul dari bawah, menjauh ke pinggir, hilang (langkah 5–7).
- [x] 4. Keluar: logo membesar dan memudar, halaman terlihat (langkah 8). Kunci scroll.
- [x] 5. Teks hero muncul dari bawah (langkah 9), lalu gelombang gradasi.
- [x] 6. Reduced motion, tanpa JS, halaman lain, dan muat ulang di tengah halaman.
- [x] 7. Build, cek di browser (rekam per frame), bandingkan dengan keempat frame Figma.

## Kriteria selesai
- Keadaan diam sama dengan Figma 1860:249, 1860:244, 1860:202, lalu hero 1860:254 (gradasi logo identik, posisi teks di frame 1860:202 mengikuti tepi konten).
- Outline benar-benar mengikuti progress loading, dan preloader tidak berkedip di koneksi cepat.
- Teks preloader dan teks hero muncul dari bawah.
- Tidak ada scroll selama preloader, dan tidak ada lompatan tata letak setelahnya.
- Build tanpa error, dan halaman lain tetap berfungsi.

## Belum pasti
- Ukuran teks preloader: usulan 18px (fluid) di samping logo 206px, disetel saat cek di browser.
- Seberapa besar logo membesar di langkah 8 (usulan ±8× sampai memenuhi layar) dan apakah latar ikut memudar bersamaan atau sedikit sesudahnya.
- Detail efek fluid.glass (per huruf atau per baris, easing) akan dicocokkan dari rekaman.

## Catatan pengerjaan (2 Nov 2026)
- **Efek fluid.glass (dari kodenya):** baris naik dari `yPercent 200` di dalam mask, 1,5 dtk `power3.out`, jeda 0,1 dtk. Teks intronya naik per huruf dari 150%, 1 dtk, jeda 0,05. Dipakai persis begitu: huruf di preloader, baris di hero.
- **Plugin:** DrawSVG (outline) dan SplitText (huruf preloader) sudah termasuk di GSAP 3.15 yang terpasang. Tidak ada dependensi baru.
- **Baris hero ditulis di Pug, bukan SplitText:** "Elite digital" dipakai gradient-wave yang butuh teksnya utuh, dan SplitText mengukur baris deskripsi sedikit berbeda dari browser ("and" terpotong). Judul dan deskripsi tetap 3 baris seperti Figma.
- **Keluar:** logo membesar 8× (`power2.inOut`, 1,3 dtk), memudar mulai 0,35 dtk, latar putih memudar mulai 0,45 dtk. Teks hero mulai 0,5 dtk setelahnya.
- **Diperiksa di browser (1440 × 900):** urutan langkah 1–9; keadaan teks di samping logo dan di tepi cocok dengan 1860:244 / 1860:202; deskripsi tetap 3 baris selama dan setelah animasi; scroll tertahan selama preloader (y tetap 0) dan bisa lagi setelahnya; About tanpa error; reduced motion tanpa preloader dan teks hero langsung tampil.
- **Uji headless:** koin 3D dirender tanpa GPU sehingga sangat lambat di bagian keluar, jadi pengukuran waktu dilakukan dengan koin diblokir. Di browser biasa dengan GPU hal ini tidak terjadi.

## Revisi 1 (2 Nov 2026, pengguna: "tidak simless, kaku, terlalu lama")
- **Satu gerakan mengalir:** setiap tahap mulai sebelum tahap sebelumnya selesai, tanpa jeda diam. Solid muncul sambil logo membesar, dan gradasi masuk di tengah gerakan membesar itu. Outline paling cepat 1 dtk (sebelumnya 1,2).
- **Teks preloader lebih cepat:** naik 0,6 dtk dengan jeda 0,025 per huruf (sebelumnya 1 dtk / 0,05), ke pinggir 0,8 dtk, turun 0,4 dtk.
- **Gradasi dipertegas:** #111111 → #6a6a6a (Figma #474747), bentuk dan arah gradasi tetap.
- **Keluar seperti leoparpeix.com:** lapisan putih sekarang SVG ber-mask. Bentuk logo berubah menjadi lubang di lapisan itu (logo memudar 0,3 dtk di atas lubang yang sama persis), lalu lubangnya membesar 90× dari titik di dalam garis tengah logo (1,2 dtk, `power3.in`) sampai menutupi layar. Tidak ada lagi lapisan yang memudar.
- **Durasi:** setelah loading selesai sekitar 2,5 dtk sampai hero terbuka penuh (sebelumnya ±5 dtk).
- Diperiksa di browser (1440 × 900, koin 3D diblokir untuk pengukuran waktu): urutan mulus, hero terlihat lewat lubang logo yang membesar, lalu teks hero naik.

## Revisi 2 (2 Nov 2026, pengguna: hero harus terlihat *di dalam* logo, teks hero berurutan, keluar terlalu cepat)
- **Keluar:** logo dan lubangnya membesar bersama dari titik yang sama (titik di garis tengah logo). Pertama pelan sampai 4× (1,8 dtk, `power2.inOut`) sementara logo berangsur transparan (1,4 dtk), jadi hero muncul di dalam bentuk logo dan bagian luar tetap putih. Lalu cepat sampai 90× (1,2 dtk, `power3.in`) dan menutupi layar. Dari logo mulai berubah sampai hero terbuka penuh sekitar 2,6 dtk (sebelumnya ±1,2).
- **Teks hero berurutan:** 3 baris judul berjarak 0,2 dtk, lalu baris deskripsi, tanggal, zona waktu, dan tombol sosial berjarak 0,15 dtk. Setiap bagian naik 1,3 dtk `power3.out` dari 200%. Mulai 0,4 dtk setelah logo berubah, jadi teks terlihat naik di dalam lubang logo.

## Revisi 3 (2 Nov 2026): konsep baru, disetujui pengguna
Referensi: fluid.glass (ukuran dan susunan), simonholm.studio (keluar ke hero). Kedua situs sudah direkam di browser.
- **Sejak awal tampil di tengah, ukuran normal:** "One Week", logo, lalu "Wonders Studio" dalam satu baris. Logo 69px seperti Figma 1860:249, teks Inter Medium 14px seperti Figma, jarak 16px. Logo tidak lagi membesar, dan teks tidak pindah ke pojok.
- **Latar preloader #111** dengan logo dan teks putih. Alasannya: di atas latar putih, hero yang naik tidak akan terlihat (keputusan pengguna). Gradasi Figma tidak terlihat di atas #111, jadi logo diisi putih solid.
- **Logo:** outline putih tergambar mengikuti progress loading (paling cepat 1 dtk), lalu terisi solid.
- **Keluar (simonholm.studio):** teks turun ke bawah dan hilang, logo memipih secara vertikal sampai lenyap. Lalu lapisan preloader terbuka dari bawah ke atas seperti tirai, dan isi hero sedikit ikut naik.
- **Teks hero:** naik berurutan seperti Revisi 2, mulai saat tirai hampir terbuka.
- Efek lubang berbentuk logo (leoparpeix) dan gradasi preloader dihapus.

- [x] Markup dan style baru (satu baris di tengah, latar #111).
- [x] Timeline: outline → solid → keluar → tirai; hero ikut naik.
- [x] Build dan cek di browser (rekaman per frame).
- **Waktu:** setelah loading, outline → solid 0,5 dtk, diam 0,3 dtk, teks turun dan logo memipih 0,6 dtk, tirai terbuka 1 dtk (`power3.inOut`). Isi hero naik 15% tinggi layar bersama tirai, dan teks hero mulai 0,6 dtk setelah tirai mulai terbuka.
- Diperiksa di browser (1440 × 900, koin 3D diblokir): susunan dan ukuran di tengah, outline → solid, tirai membuka hero dari bawah, teks hero berurutan. Halaman About tanpa error.

## Revisi 4 (2 Nov 2026), disetujui pengguna
- **Preloader (seperti fluid.glass):**
  1. Awalnya hanya logo di tengah: outline tergambar mengikuti loading, lalu terisi putih.
  2. "One Week" naik huruf per huruf di kiri dan mendorong logo, sehingga keduanya tetap di tengah.
  3. "Wonders Studio" naik di kanan dan mendorong lagi.
  4. Keluar seperti Revisi 3.
- **Hero satu layar (Figma 1860:126):** layar pertama hanya berisi judul, tombol sosial, deskripsi, tanggal dan jam, serta koin yang terpotong di tepi bawah layar. Posisi koin dari tepi bawah sama seperti di Figma (261px koin terlihat). Showreel mulai tepat di bawah layar pertama.
- **Showreel:** mulai membesar saat masuk layar (sebelumnya sejak scroll pertama), dan penuh layar saat berada di tengah.
- Menu tetap "Contact" (Figma 1860:126 berisi "Career").
- File: `preloader.js`, `_preloader.scss`, `hero.pug` (pembungkus `.hero__screen`), `_hero.scss`, `hero-showreel.js`.

- [x] Preloader: teks mendorong logo.
- [x] Hero satu layar dan koin di tepi bawah.
- [x] Showreel mulai membesar saat masuk layar.
- [x] Build dan cek di browser.
- Diperiksa di browser (1440 × 900, koin 3D diblokir): logo sendirian, lalu "One Week" dan "Wonders Studio" mendorongnya bergantian tanpa huruf terpotong. Hero pas satu layar: showreel mulai tepat di y 900 dan koin terpotong tepi bawah. Showreel mulai membesar saat masuk layar.
- **Dibatalkan (pengguna, 2 Nov 2026):** hero satu layar dan showreel terpisah. Hero, koin, dan showreel kembali seperti sebelum Revisi 4. Yang tetap dipakai hanya preloader dengan teks yang mendorong logo.
- **Dipasang lagi (pengguna, 2 Nov 2026):** hero satu layar seperti 1860:126. Showreel belum terlihat, lalu saat di-scroll naik dari bawah dan membesar sampai penuh layar (Figma 1874:302, 1440 × 827, tombol di tengah). Video showreel yang ada tetap dipakai; gambar di Figma dianggap contoh.
- **Showreel menutupi hero (pengguna, 2 Nov 2026):** layar pertama hero diam di tempat (`position: sticky`) dan showreel naik menimpanya sambil membesar sampai penuh layar. Koin 3D ikut diam bersama hero (tidak lagi turun dan berputar saat scroll) dan tertutup showreel.
- **Hero tidak kosong, showreel tertahan (pengguna, 2 Nov 2026):** bagian atas showreel (140px) mengintip di bawah layar pertama, dan koin terpotong di tepi atas showreel. Showreel naik dalam ukuran normal sampai di tengah layar, lalu tertahan (pin) selama satu layar scroll sementara scroll membesarkannya sampai penuh layar. Setelah itu scroll lanjut ke section berikutnya. Ini mengganti keputusan lama "tanpa tertahan".
- **Dikembalikan (pengguna, 2 Nov 2026):** hero dan showreel kembali seperti versi yang sudah di-commit: showreel terlihat di layar pertama, membesar sejak scroll pertama, tanpa tertahan; hero tidak diam dan koin 3D kembali turun dan berputar. Yang tetap: hitung ulang posisi scroll setelah hero selesai naik (`hero-intro.js`).
- **Showreel tertahan saat penuh layar:** dicoba lalu dibatalkan (pengguna, 2 Nov 2026). Showreel tetap tanpa tertahan.

## Revisi 5 (2 Nov 2026), disetujui pengguna
Figma: 1860:244 → 1876:346 → 1876:533 → 1876:589. Hitam #000, logo 166 × 79 di tengah kotak.
1. Layar hitam, hanya logo: outline mengikuti loading → solid → gradasi. Gradasi memakai bentuk dan arah Figma, tapi putih → #9a9a9a supaya terlihat di atas hitam (keputusan pengguna). Tanpa teks.
2. Kotak hitam turun dan menyempit dalam satu gerakan (1,6 dtk, `power3.inOut`) sampai tepat di posisi, ukuran, dan sudut showreel. Logo tetap di tengah kotak. Navbar dan hero terlihat saat tertutup kotak berkurang.
3. Teks hero naik berurutan saat terbuka (mulai 0,5 dtk setelah kotak bergerak). Koin 3D baru mulai masuk saat kotak mulai turun.
4. Di showreel: logo memudar, lalu kotak memudar dan memperlihatkan video.
- Halaman tanpa showreel yang terlihat (halaman lain, atau dimuat ulang di tengah halaman): kotak naik keluar layar dari bawah.

- [x] Markup, style, dan timeline.
- [x] Build dan cek di browser (rekaman per frame).
- **Penyesuaian (pengguna, 2 Nov 2026):** gradasi logo dihapus (outline → putih solid). Sudut kotak langsung membulat seperti showreel begitu mulai turun. Judul hero juga bergerak naik 120px sebagai satu blok (selain baris-barisnya naik di mask), dan kolom kanan serta tombol sosial naik 40px.
- **Kotak menjadi showreel (pengguna, 2 Nov 2026):** saat mulai turun, video showreel yang asli dipindahkan ke dalam kotak, di bawah lapisan hitam dan logo. Hitam dan logo memudar selama kotak turun, jadi video sudah terlihat di kotak yang bergerak. Saat mendarat, video dikembalikan ke showreel di ukuran dan posisi yang sama, dan tombol "Play Showreel" muncul. Preloader hanya di homepage. Sudut kotak 4px sejak mulai bergerak.
