# 02 — Menu Bar + Hero

Status: **Selesai (23 Okt 2026), menunggu review** · Figma: Homepage `1523:3214` → Hero `1523:3215` (1440 × 1439).
Bergantung pada: [01-design-system.md](01-design-system.md) (selesai).

Label: **[T]** dari layer Figma · **[D]** diturunkan dari posisi/ukuran · **[?]** belum pasti.

---

## 1. Tujuan dan ruang lingkup

**Tujuan:** membangun menu bar dan hero homepage yang sama dengan Figma di lebar 1440px.

**Termasuk:**
- Menu bar: logo dan 5 link navigasi.
- Hero: headline (teks asli), dua ikon sosial, deskripsi perusahaan, tanggal/jam, gambar koin, showreel dengan tombol "Play Showreel".

**Tidak termasuk:**
- Dropdown "Work": tidak ada desainnya.
- Pemutar video showreel: belum ada file atau desainnya.
- Animasi apa pun: tidak ada desain animasi untuk hero.
- Tampilan mobile: menunggu desain.
- Section lain.

---

## 2. Requirement dari desain

### 2.1 Struktur vertikal (total 1439px) [T]
| Bagian | Tinggi | Jarak |
|---|---|---|
| Padding atas | 40 | |
| Menu bar | 24 | |
| Gap | 80 | |
| Hero content (headline dan info) | 394 | |
| Gap | 80 | |
| Showreel | 781 | |
| Padding bawah | 40 | |

Padding kiri-kanan 40px, lebar isi 1360px. [T]

### 2.2 Menu bar [T]
- Logo SVG 50.25 × 24 di kiri.
- Navigasi di kanan, gap 40px: **Work** (dengan ikon chevron 16px), About, Team, Services, Career.
- Teks: Inter Medium 14px, line-height normal, -0.02em, `#111` → `.text-14.text-medium` dengan line-height normal.
- Menu bar yang sama muncul di semua halaman lain (Contact, Team, About, dan seterusnya), jadi dibuat sebagai **partial di layout**.

### 2.3 Hero content [T]
Flex, `justify-content: space-between`, `align-items: center`.

**Kiri (lebar 789.75px, gap 80px):**
- Headline `h1` → `.text-display-80`. Baris 1: "Elite digital products", baris 2–3: "designed at venture speed" (terbungkus otomatis pada lebar 790px). Total 3 baris × 88px = 264px.
- Gradient brand hanya pada "Elite digital". Di Figma, gradient-nya berupa bidang 385 × 93px di pojok kiri atas, dengan sudut ≈201deg.
- Ikon sosial: 2 kotak 50 × 50, gap 11px, latar `--color-surface-soft`, radius 4px.
  - Behance: PNG 32 × 21.12.
  - Dribbble: SVG 24 × 24.

**Kanan (lebar 321px, gap 45px):**
- Deskripsi: Inter Medium 14px, line-height 1.6. Ada baris baru paksa setelah "branding,".
- Tanggal "Wednesday, October 14": Inter Medium 14px, line-height 1.7.
- Baris zona waktu (gap 5px): "IDN  /  GMT +7" dan pill jam.
  - Pill: border 1px `--color-border-strong`, radius 4px, padding 6px 10px, tinggi 24px.
  - Teks jam: **General Sans Medium** 14px.

### 2.4 Koin [T]
- PNG 448 × 420, `object-position: bottom`, shadow `0 4px 4px rgba(0,0,0,.25)`.
- Posisi absolut: 638px dari kiri dan 325px dari atas kontainer isi. Jadi tengahnya 182px di kanan titik tengah.
- Berada **di belakang** showreel: bagian bawah koin tertutup showreel.
- Shadow dibuat dengan `filter: drop-shadow`, bukan `box-shadow`, agar mengikuti bentuk koin dan bukan kotak gambar. [D]

### 2.5 Showreel [T]
- Kotak 1360 × 781, radius 4px, `overflow: hidden`, gambar `object-fit: cover`.
- Tombol di tengah: latar `--color-glass-button`, radius pill, padding 10px 16px, gap 4px.
  - Label "Play Showreel": Inter Medium 14px, line-height 1.7, putih.
  - Ikon play 16px.
- Render Figma menunjukkan pinggiran terang/efek glass pada tombol yang **tidak ada di data MCP**. [?]

### 2.6 Aset (diunduh dari Figma saat implementasi)
| Aset | Format | Tujuan |
|---|---|---|
| Logo | SVG | `src/assets/images/logo.svg` |
| Koin | PNG | `src/assets/images/hero/coin.png` |
| Gambar showreel | PNG | `src/assets/images/hero/showreel.png` |
| Behance | PNG | `src/assets/icons/behance.png` |
| Dribbble | SVG | `src/assets/icons/dribbble.svg` |
| Chevron "Work" | SVG | `src/assets/icons/chevron-down.svg` |
| Ikon play | SVG | `src/assets/icons/play.svg` |

Link aset dari Figma kedaluwarsa dalam 7 hari. Jika lewat, saya ambil ulang dari Figma.

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/header.pug` | Baru | Menu bar |
| `src/pug/partials/hero.pug` | Baru | Hero |
| `src/pug/layouts/default.pug` | Ubah | Memanggil `header.pug` di atas `main`. (Perbaikan baris kosong di `<title>` dibatalkan: browser sudah memangkasnya, jadi tidak perlu mengubah halaman lain.) |
| `src/pug/pages/index.pug` | Ubah | "Hello, OWW" diganti dengan hero |
| `src/scss/base/_layout.scss` | Baru | Kelas `.container` (lebar 1360px, padding 40px) |
| `src/scss/components/_header.scss` | Baru | Style menu bar |
| `src/scss/sections/_hero.scss` | Baru | Style hero |
| `src/scss/main.scss` | Ubah | Menambah 3 `@use` |
| `src/js/hero-clock.js` | Baru, **jika jam dibuat live** | Tanggal dan jam waktu Jakarta |
| `src/js/main.js` | Ubah, **jika jam dibuat live** | Memanggil `hero-clock.js` |
| `src/assets/images/…`, `src/assets/icons/…` | Baru | Aset di tabel 2.6 |

**Kenapa header di layout:** semua halaman memakai menu bar yang sama. Saat Barba.js dipakai nanti, menu bar juga sebaiknya berada di luar area yang berganti, supaya tidak ikut dimuat ulang.

---

## 4. Urutan implementasi
1. Unduh aset dari Figma dan periksa (file tidak kosong, ukuran sesuai).
2. Buat `_layout.scss` (`.container`).
3. Buat `header.pug` dan `_header.scss`, lalu pasang di layout.
4. Buat `hero.pug` dan `_hero.scss`: headline, ikon sosial, info, koin, showreel.
5. (Jika disetujui) buat `hero-clock.js`.
6. Build, ambil screenshot di 1440px, bandingkan dengan screenshot Figma, lalu perbaiki selisihnya.
7. Perbarui checklist.

---

## 5. Pertimbangan teknis
- **Headline teks asli:** baris baru setelah "products" dibuat dengan `<br>`. Baris kedua dan ketiga terbungkus otomatis pada lebar 790px, sama seperti di Figma.
- **Pill jam:** Figma memotong ruang kosong di atas dan bawah teks (`text-box-trim`), dan fitur ini belum didukung semua browser. Saya memakai tinggi tetap 24px dan teks di tengah, jadi hasilnya sama di semua browser.
- **Urutan tumpukan:** koin ditulis sebelum showreel di HTML, dan showreel diberi `position: relative`, sehingga showreel menutupi koin, sama seperti di Figma.
- **Lebar layar selain 1440px:** lihat pertanyaan 8.

---

## 6. Keputusan (dijawab pengguna, 23 Okt 2026)
1. **Link navigasi:** `#` dulu.
2. **Dropdown "Work":** dibuat **dummy**. Isinya 5 kategori yang ada di desain (filter Our Work: Branding, UI/UX, Illustration, 2D/3D, Graphic Design), semua link `#`. Muncul saat hover atau fokus keyboard, dengan CSS saja (tanpa JS). Style dari token yang ada: latar putih, border `--color-border`, radius 4px, teks `.text-14.text-medium`. *Ini interpretasi sementara, bukan dari Figma.*
3. **Menu bar saat scroll:** ~~ikut tergulir~~. **Diganti 26 Okt 2026:** menu bar menempel dengan efek kaca, sembunyi saat scroll ke bawah, muncul saat scroll ke atas, dan berwarna putih di atas section gelap. Lihat `09-sticky-header.md`.
4. **Tanggal dan jam:** live, waktu Jakarta (`Asia/Jakarta`), diperbarui setiap menit, dengan format yang sama seperti Figma.
5. **Behance/Dribbble:** sementara mengarah ke `https://www.behance.net` dan `https://dribbble.com`, dibuka di tab baru.
6. **Tombol showreel:** tampil saja, belum melakukan apa-apa.
7. **Efek tombol showreel:** glass ala Apple. Latar `--color-glass-button` (dari Figma), ditambah `backdrop-filter: blur + saturate` dan pinggiran tipis terang. *Nilai blur dan pinggiran adalah interpretasi, karena tidak terbaca lewat MCP.*
8. **Lebar layar:** di atas 1440px isi tetap 1360px di tengah. Di 1024–1439px lebar isi menyesuaikan, margin 40px.
9. **Gambar showreel:** boleh dikonversi ke JPG/WebP.

---

## 7. Verifikasi dan acceptance criteria

**Verifikasi:**
- `npm run build` tanpa error.
- Screenshot halaman di 1440px dibandingkan berdampingan dengan screenshot Figma hero.
- Posisi dan ukuran elemen utama dicek di browser (logo, nav, headline, info, koin, showreel).
- Semua aset termuat (status 200) dan tidak ada link Figma sementara di kode.

**Acceptance criteria:**
- [x] Tinggi hero 1439px di layar 1440px (header 64 + hero 1375).
- [x] Posisi elemen utama selisihnya ≤ 2px dari Figma (selisih terbesar: navigasi 1,7px lebih sempit).
- [x] Headline 3 baris, pemenggalan baris sama dengan Figma, gradient hanya pada "Elite digital".
- [x] Koin di posisi yang benar (678, 365) dan sebagian tertutup showreel.
- [x] Semua aset dari Figma dipakai di tempat yang sama, tanpa pengganti. Showreel dikonversi ke JPG (disetujui).
- [x] Menu bar tampil di semua halaman lewat layout.
- [x] Tidak ada elemen, animasi, atau interaksi yang tidak ada di desain, kecuali dropdown dummy dan efek glass yang diminta.
- [x] Halaman `styleguide.html` tetap berfungsi.

**Hasil pengukuran di browser (1440px), dibandingkan dengan Figma:**
| Elemen | Hasil (x, y, w, h) | Figma |
|---|---|---|
| Logo | 40, 40, 50.25, 24 | 40, 40, 50.25, 24 |
| Navigasi | 1015.7, 40, 384.3, 17 | 1014, 40, 386, 17 |
| Headline | 40, 144, 789.75, 264 | 40, 144, 789.75, 264 |
| Info | 1079, 257, 321, 168 | 1079, 257.5, 321, 167 |
| Pill jam | 1177.8, 401, 77.8, 24 | 1178, 400.5, 79, 24 |
| Koin | 678, 365, 448, 420 | 678, 365, 448, 420 |
| Showreel | 40, 618, 1360, 781 | 40, 618, 1360, 781 |
| Tombol showreel | 648.6, 986.6, 142.8, 43.8 | 649, 987, 143, 44 |

**Pengujian lain:** jam live cocok dengan waktu Jakarta, dropdown muncul saat Work difokus atau di-hover, semua aset status 200, tidak ada link Figma di `src/`, tidak ada scroll horizontal di 1280px dan 1920px.

---

## 8. Checklist progres
- [x] Analisis Figma hero
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: Aset
- [x] Langkah 2: `.container`
- [x] Langkah 3: Header
- [x] Langkah 4: Hero
- [x] Langkah 5: Jam live
- [x] Langkah 6: Verifikasi dan perbaikan

### Revisi (27 Okt 2026): showreel menjadi video
Gambar showreel diganti `hero/showreel.mp4` (H.264, 3000 × 2000, 12 detik, 7,5 MB). File punya audio, tetapi diputar `muted` sebagai latar. Poster `showreel-poster.jpg` = frame pertama (2400 × 1600, 180 KB). Diputar hanya saat terlihat oleh `src/js/inview-videos.js`, tidak diputar dengan reduce motion. Tombol "Play Showreel" tetap dummy. Ukuran dan posisi kotak tidak berubah (40, 618, 1360 × 781).

### Animasi highlight "Elite digital" (27 Okt 2026), selesai, menunggu review
Acuan pengguna: highlight "ambitious ideas." di manual.studio. Di sana huruf menyala satu per satu (setiap 37ms), setiap huruf menyala 0,35 detik lalu memudar kembali dalam 1 detik. Animasi berjalan sekali saat teks terlihat, lalu diputar ulang saat kursor masuk ke judul jika animasi sebelumnya sudah selesai.

Keputusan pengguna:
- **Keadaan diam:** "Elite digital" berwarna hitam, sama seperti teks lain di judul. Ini mengubah Figma, yang menampilkan gradien terus-menerus.
- **Warna nyala** adalah gradien brand (opsi A). Gradien membentang di sepanjang frasa, dan setiap huruf menampilkan bagian gradien di posisinya.
- Animasi berjalan ±0,8 detik setelah halaman dimuat, lalu diputar ulang setiap kursor masuk ke h1 jika animasi sebelumnya sudah selesai.
- Reduced motion dan tanpa JS: tanpa animasi, teks hitam.

Cara kerja:
- Teknik salinan huruf seperti di Motto. Teks asli tidak dipecah (jarak huruf tetap persis), dan JS mengukur posisi setiap huruf dalam em.
- Setiap huruf mendapat salinan hitam dan salinan gradien. Gradien memakai satu kotak selebar frasa (`--pw`). Teks asli hanya menjaga layout.
- Gelombang: salinan gradien 0 → 1 dan salinan hitam 1 → 0 dalam 0,1 detik, ditahan, lalu kembali dalam 1 detik (`power1.out`), dengan selisih 37ms antarhuruf.

File: `src/pug/partials/hero.pug` (hapus `.text-gradient`), `src/scss/sections/_hero.scss`, `src/js/hero-highlight.js` (baru), dan `src/js/main.js`.

Hasil:
- Salinan huruf tepat di atas huruf asli (selisih 0px horizontal dan vertikal) di 1280, 1440, 1920, dan 2560px. Selisih vertikal dihitung di JS (`--y`), karena line-height judul (88px) lebih kecil dari kotak teks font (100px). Ukuran judul tetap 789,75 × 264 di 1440px (Figma).
- Saat diam teks hitam. Gelombang berjalan ±0,8 detik setelah dimuat dan diputar ulang saat kursor masuk ke judul (screenshot: saat menyala gradien Figma 201° terlihat di sepanjang frasa, lalu memudar kembali ke hitam).
- Reduced motion dan tanpa JS: teks hitam, tanpa salinan huruf.
- Perbaikan: ekor huruf "g" sempat terpotong putih saat menyala, karena gradien hanya digambar di kotak setinggi line-height (88px), sedangkan teksnya 100px. Salinan huruf sekarang memakai `line-height: normal` (kotak 108px), dan posisinya tetap tepat (selisih 0px).
- Revisi (permintaan pengguna): gelombang dibuat lebih santai, tapi versi ±3 detik terasa terlalu lambat. Yang dipakai adalah nilai tengahnya: jarak antarhuruf 0,045 detik, menyala 0,15 detik (`sine.out`), ditahan 0,35 detik, dan memudar 1,2 detik (`sine.inOut`), total ±2,2 detik.

### Tombol sosial mengikuti skala huruf (27 Okt 2026, permintaan pengguna)
Di layar 2K ke atas tombol Behance/Dribbble terasa terlalu besar, karena mengikuti skala layout (89px di 2560). Ukuran tombol, jarak, dan ikon sekarang memakai `fs()` (skala huruf, maksimal 1,2×). Terukur: tombol 44,4 / 50 / 54,3 / 60px di 1280 / 1440 / 1920 / 2560. Di 1440 sama dengan Figma (tombol 50, jarak 11, ikon 32 × 21,1).

### Showreel: tombol mengikuti kursor dan pop-up video (27 Okt 2026), selesai, menunggu review
Acuan pengguna: manual.studio. Di sana kursor di atas video diganti tombol play. Saat diklik, video membesar dari posisinya ke tengah layar (±90%, 0,35 detik) dengan latar gelap, lalu tombol × muncul. Pop-up ditutup dengan ×, klik latar, atau Esc, dan video mengecil kembali ke posisi asalnya (0,3 detik). Selama terbuka, scroll halaman dikunci.

Keputusan pengguna:
- Kursor bawaan disembunyikan di atas showreel (opsi A).
- Tombol × sederhana dengan gaya kaca yang sama dengan tombol showreel.
- Latar gelap memakai design system (#111).
- Video sementara memakai `showreel.mp4` yang sama.

Cara kerja:
- **Mengikuti kursor** (hanya perangkat dengan hover dan pointer presisi): tombol menyusul kursor dengan `gsap.quickTo`, durasi 0,6 detik `power3.out`, dan dibatasi di dalam video. Saat kursor keluar, tombol meluncur kembali ke tengah (posisi Figma) dengan gerakan yang sama.
- **Pop-up** (`.showreel-lightbox`, dipindah JS ke `<body>` dengan z-index di atas header):
  - Panggung video membesar dari kotak showreel ke tengah layar (90% layar, rasio video 3:2). Yang dianimasikan adalah posisi dan ukuran kotak, bukan scale, supaya video tidak meregang.
  - Latar #111 memudar masuk, lalu tombol × muncul.
  - Video diputar dari awal dengan suara dan kontrol browser (jika browser menolak suara, diputar tanpa suara). Video hero dijeda selama pop-up terbuka.
  - Menutup dengan ×, klik latar, atau Esc. Video berhenti, lalu panggung kembali ke kotak showreel.
  - Scroll dikunci dengan menahan wheel, sentuh, dan tombol scroll, tanpa mengubah layout, supaya pin tidak bergeser.
  - Fokus pindah ke ×, Tab berputar di dalam pop-up, dan fokus kembali ke tombol showreel setelah ditutup.
- **Reduced motion:** tombol tidak mengikuti kursor, dan pop-up muncul tanpa animasi.

File: `src/pug/partials/hero.pug`, `src/scss/sections/_hero.scss`, `src/scss/components/_showreel-lightbox.scss` (baru), `src/scss/main.scss`, `src/js/hero-showreel.js` (baru), dan `src/js/main.js`.

Hasil (1440 × 1024, halaman di-scroll 500px):
- **Mengikuti kursor:** tombol tepat di posisi kursor setelah ±1 detik. 120ms setelah kursor pindah, tombol baru setengah jalan (jeda halus). Kursor disembunyikan di atas video (`cursor: none`). Setelah keluar, tombol kembali ke tengah (720, 509).
- **Pop-up:** kotak video 1296 × 864 (90% tinggi layar, 3:2). Latar 0,89 pada 150ms, lalu 1. Tombol × muncul, dan fokus ada di ×. Scroll terkunci (posisi tetap 500 setelah roda). Video hero dijeda.
- **Menutup:** Esc dan klik latar mengembalikan kotak tepat ke showreel (40, 118, 1360 × 781). Fokus kembali ke tombol showreel, dan video hero berjalan lagi.
- **Reduced motion:** pop-up langsung di tengah tanpa animasi, dan tombol tidak mengikuti kursor (kursor tetap pointer).

### Revisi kecil (27 Okt 2026, permintaan pengguna)
- **Latar pop-up showreel:** #111 dengan transparansi 80% (`rgba(17, 17, 17, 0.8)`), tidak solid, jadi halaman samar terlihat di belakangnya.
- **Jarak label zona waktu ke jam:** 5px → 8px (`fs(8)`). Terukur 8px di 1440.
- **Titik dua jam berkedip** seperti jam digital: terlihat di paruh pertama setiap detik dan hilang di paruh kedua (`step-end`, 1 detik). Animasinya disinkronkan ke detik sungguhan lewat `animation-delay` negatif saat jam diperbarui. Dengan reduced motion tidak berkedip. Lebar kotak jam tidak berubah (selisih 0,02px dibanding teks utuh).

### Showreel membesar saat di-scroll (27 Okt 2026), selesai, menunggu review
Permintaan pengguna: begitu video showreel berada di tengah layar, video membesar sampai layar penuh, lalu halaman lanjut ke section berikutnya. Keputusan: **layar penuh** (opsi A, tepi atas dan bawah video sedikit terpotong) dan **langsung dilepas** setelah penuh (opsi A).

Cara kerja:
- `.hero__showreel` di-pin (ScrollTrigger) dari `center center` sepanjang satu layar scroll (`+=100%`), dengan scrub 1.
- Video (`.hero__showreel-image`) diposisikan absolut di dalam showreel. Sudut membulat dipindah dari showreel ke video, dan showreel tidak lagi memotong isinya (`overflow`). Tampilan tanpa JS tetap sama.
- Selama pin, posisi dan ukuran video (left, top, width, height) membesar sampai menutup seluruh layar (dihitung dari ukuran layar dan kotak showreel, dihitung ulang saat refresh), dan radius → 0 (`power1.inOut`). Video diberi `max-width: none`, karena reset membatasi media di 100%.
- Karena showreel berada tepat di tengah layar selama pin, titik tengah video tetap sama. Tombol showreel dan pop-up memakai kotak video (bukan kotak showreel) untuk batas gerak kursor dan titik awal animasi pop-up.
- Scroll ke atas mengecilkan video kembali. Reduced motion: tanpa efek.

File: `src/scss/sections/_hero.scss` dan `src/js/hero-showreel.js`.

Hasil:
- 1440 × 1024: video 1360 × 781 saat mulai, 1400 × 903 di tengah hold, dan 1440 × 1024 (radius 0) di akhir. Setelah itu dilepas, dan Statement menyusul. 1920 × 1080: 1813 × 1041 → 1920 × 1080. Tombol showreel tetap di tengah video selama hold.
- Services (langkah 0 dan 1) dan Motto (langkah 0, top 0) tetap benar setelah halaman bertambah satu layar.
- Pop-up dibuka dari video yang sedang membesar dan kembali tepat ke kotaknya (13, 38, 1414 × 946).
- Reduced motion: tanpa pin, dan video tetap 1360 × 781.

Revisi (permintaan pengguna):
- **Celah kecil di kanan** (terlihat oleh pengguna, kemungkinan karena scrollbar klasik dan posisi pecahan piksel): ukuran akhir sekarang dihitung dari posisi showreel yang sebenarnya, dengan lebar seluruh jendela (termasuk area scrollbar) ditambah 1px di setiap sisi. Terukur di 1440 / 2174 / 2560 / 3000px: video melewati keempat tepi layar (misalnya −1 … 1441 × −2 … 1024 di 1440).
- **Tahan setengah layar** setelah penuh (saran disetujui): pin `+=150%`, dengan 1 layar untuk membesar dan 0,5 layar ditahan penuh, lalu dilepas. Terukur: video penuh dari posisi 1 sampai 1,5 layar, lalu bergerak ke atas bersama Statement.
- Kode gelombang "Elite digital" dipindah ke modul bersama `src/js/gradient-wave.js` + `components/_gradient-wave.scss` (dipakai juga oleh Milestone). Tampilan dan waktunya tidak berubah.
