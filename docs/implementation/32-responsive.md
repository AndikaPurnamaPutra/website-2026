# 32 — Responsive (semua perangkat)

Branch: `responsive/plan` (dari `dev`). Status: langkah 1–2 selesai (dasar,
navbar + menu HP, footer; 6 Nov 2026), langkah 3 berjalan. Figma hanya punya desain desktop 1440;
tidak ada frame tablet atau mobile. Rencana ini menetapkan cara kerja dan
urutan; tiap tampilan baru tetap diusulkan dan disetujui dulu (AGENTS.md
§7, §13).

## Kondisi sekarang (dicek 6 Nov 2026, Chrome)
- Tidak ada media query tata letak; semua ukuran mengikuti `--px` / `--type-px`
  yang berhenti mengecil di 1280px. Di bawah 1280 halaman jadi lebih lebar
  dari layar.
- **390 (HP):** halaman 682–1245px lebar, jadi HP memperkecil seluruh halaman.
  Hero: judul tumpang-tindih dengan deskripsi dan koin; Contact: form keluar
  layar; navbar terpotong (hanya Work, About).
- **768 (tablet):** Home 828px, About 1244px (lebih lebar dari layar).
- **1024 (laptop kecil):** About melebar (1244px, scroll ke samping); lainnya
  muat tapi rapat.
- **1280 ke atas:** sesuai desain.
- Lighthouse mobile 50–73 terutama karena ini (plan 29).

## Usulan cara kerja
1. **Titik putus (breakpoint)**, desktop-first (kode sekarang desktop),
   disesuaikan dengan perangkat saat ini (lebar CSS):
   | Nama | Lebar | Acuan | Perangkat |
   |---|---|---|---|
   | Desktop | ≥ 1280 | Figma 1440 (sudah) | laptop 1280–1536, monitor 1920–2560, iPad Pro 13" lanskap |
   | Laptop | 1024–1279 | desktop dirapatkan | iPad Pro 13" potret, iPad lanskap 1080–1194 |
   | Tablet | 744–1023 | frame 834 (baru) | iPad mini 744, iPad / Air 810–820, iPad Pro 11" 834, HP lipat terbuka |
   | Mobile | < 744 | frame 390 (baru), aman sampai 320 | HP 360–440 |
   Ditambah dua aturan yang tidak bergantung pada lebar:
   - **Layar pendek** (tinggi < 500): HP lanskap 844–932 × ±390; section yang
     di-pin dan hero disesuaikan.
   - **Layar sentuh** (`hover: none`): interaksi hover diganti, berapa pun
     lebarnya (iPad besar ikut).
   Juga dicek: laptop 1366 × 768 (pendek).
2. **Skala:** satu "piksel desain" per rentang, jadi `fluid()` dan `fs()` tetap
   dipakai: tablet `--px = 100vw / 834`, mobile `--px = 100vw / 390`, dengan
   batas atas/bawah. Nilai mobile ditulis dalam piksel frame 390. JS
   (`design-px.js`) mengikuti. Teks tidak di bawah 12px.
3. **Satu mixin** `@include below(tablet)` / `below(mobile)` di
   `abstracts/`; tiap section menulis aturan tablet/mobile di filenya sendiri.
4. **Tanpa desain Figma:** untuk tiap section aku usulkan susunan mobile dan
   tablet (sketsa singkat + screenshot dari browser) sebelum dikerjakan; tidak
   menambah konten atau elemen baru di luar yang perlu (menu mobile).
5. **Perangkat sentuh:** interaksi hover (kursor "View", foto Tim, Play Video
   mengikuti kursor, magnet) mati di layar sentuh; yang penting punya padanan
   tap. Area sentuh minimal 44px.
6. **Performa mobile:** gambar `srcset` ukuran HP, video preview lebih kecil,
   koin 3D: resolusi lebih rendah atau gambar diam di HP (keputusan).

## Keputusan (disetujui pengguna, 6 Nov 2026: "setuju dengan usulanmu")
1. **Breakpoint** seperti di atas (tablet dari 744), plus layar pendek dan
   layar sentuh.
2. **Menu mobile** (referensi pengguna: jasminegunarto.com, kononenkogroup.com,
   telhaclarke.com.au, art-yakushev.com, bramvanvugt.com; perpaduan Bram +
   Telha + Art, disetujui):
   - HP (< 744): logo kiri, teks "Menu" kanan (bukan ikon), bar tetap
     transparan dan terbalik warna seperti desktop.
   - Buka: panel gelap (ink) turun dari atas seperti tirai (satu keluarga
     dengan preloader); "Menu" bergulir jadi "Close"; link besar (Work, About,
     Team, Services, Contact) naik satu per satu; di bawah, email, telepon dan
     sosial dari footer memudar masuk (tanpa konten baru).
   - Tutup: Close, Esc, atau ketuk link (menutup bersama transisi halaman);
     panel naik kembali.
   - Work = link biasa (tanpa kartu mega menu di HP).
   - Scroll dikunci saat terbuka; area sentuh ≥ 44px; keyboard dan pembaca
     layar (aria-expanded, fokus di dalam panel).
   - Tablet (744–1023) ke atas: navbar desktop tetap (5 link muat; iPad mini
     744 dicek khusus).
3. **Section yang di-pin di HP:** Statement dan Motto tetap di-pin (teks),
   Services dan Principles mengalir (kartu bertumpuk + gambar).
4. **Koin 3D di HP:** tetap 3D dengan resolusi lebih rendah; gambar diam bila
   perangkat lemah atau WebGL gagal (sudah ada fallback). Dicek ulang dengan
   Lighthouse mobile. *(Usulan; dikonfirmasi lagi saat langkah Hero.)*
5. **Preloader di HP:** urutan yang sama, waktu tunggu aset lebih pendek
   (aset HP lebih kecil). *(Usulan; dikonfirmasi lagi saat langkah 7.)*
6. **Perangkat dicek:** iPhone (Safari), Android (Chrome), iPad, laptop
   1366×768, monitor 1920/2560; di browser (emulasi) dan di perangkat asli
   pengguna.

## Urutan kerja (tiap langkah: usulan → setuju → kerjakan → cek)
1. Dasar: breakpoint, skala per rentang, mixin; `docs/design-system.md`
   diperbarui.
2. Navbar + menu mobile (mulai dari sini; referensi dari pengguna menyusul);
   footer.
3. Home per section: Hero → Statement → Services → Our Work → Trusted →
   Milestone → Motto.
4. About: Intro → Principles → Galeri → Tim.
5. Contact: teks, form, galeri.
6. Privacy / Terms.
7. Transisi halaman dan preloader di HP; interaksi sentuh.
8. Cek akhir: 320, 360, 375, 390, 412, 430, 744, 820, 834, 1024, 1180, 1280,
   1366×768, 1440, 1512, 1920, 2560; HP lanskap (844×390); Safari iOS;
   Lighthouse mobile.

## Langkah 3a — Hero (disetujui dan dikerjakan 9 Nov 2026)

Kondisi (screenshot Chrome, reduced motion agar preloader lewat): di 390
judul 80px jadi 7 baris dan menimpa deskripsi dan koin; di 834 judul 5 baris
dan koin menutup tanggal; di 1024 pas, koin menyentuh teks tanggal.

Susunan desktop: kiri judul + tombol sosial, kanan deskripsi + tanggal/jam,
koin di antaranya (bagian bawahnya di belakang showreel), showreel 1360:781
di bawah. Catatan: video showreel aslinya potret 1280×1920; di desktop hanya
bagian tengahnya yang tampak (object-fit: cover).

**Tablet (744–1023, frame 834):**
```
Elite digital products          (64px, 3 baris seperti Figma)
designed at venture
speed

[Be][Dr]        (koin)        Strategy, visual systems, ...
                               Monday, November 9
                               IDN / GMT +7 [09:04AM]
[============ showreel 1360:781 ============]
```
- Judul selebar konten di atas; baris kedua: sosial kiri bawah, deskripsi +
  tanggal/jam kanan (lebar 321 seperti desktop), koin di tengah di antara
  keduanya (≈300×281 px frame), bagian bawahnya di belakang showreel seperti
  desktop. Jarak judul → baris kedua 48.
- Showreel tetap 1360:781, lebar penuh.

**HP (< 744, frame 390, gutter 20):**
```
Elite digital          (48px; 5 baris: Elite digital / products /
products                designed at / venture / speed, karena
designed at             blok baris Figma dipertahankan untuk
venture                 animasi naiknya)
speed

Strategy, visual systems, branding, and high-end
web design. ... (14px, mengalir)

Monday, November 9
IDN / GMT +7 [09:04AM]

[Be][Dr]                              (koin
                                       ≈200×188, kanan)
[==== showreel 4:5 (350×437) ====]
```
- Satu kolom, urutan: judul, deskripsi, tanggal/jam, sosial (sama dengan
  urutan animasi naiknya, jadi tidak ada bagian yang muncul "di tengah").
- Koin lebih kecil di kanan, di celah antara sosial dan showreel, separuh
  bawahnya di belakang showreel (seperti footer HP). Koin 3D mengikuti kotak
  gambar ini (sudah begitu di `coin-scene.js`), jadi ikut mengecil; piksel
  rasio sudah dibatasi 1.5 (keputusan 4 dipakai: tetap 3D).
- **Showreel 4:5** (bukan 16:9): video aslinya potret, jadi di HP justru lebih
  utuh; dan saat scroll ia hanya perlu membesar ±1.9× untuk memenuhi layar
  (16:9 di HP perlu 4.2× dan jadi pecah). Tombol "Play Showreel" tetap di
  tengah (di layar sentuh tidak mengikuti jari; sudah begitu). Ketuk di mana
  saja membuka pop-up (sudah bekerja lewat click).
- Judul 48px: di 320px masih 5 baris ("designed at" muat sampai ±57px).

**Laptop (1024–1279):** koin digeser sedikit ke kiri (±40 px frame) agar tidak
menyentuh teks tanggal. Desktop ≥ 1280 tidak berubah.

**Cara:** aturan di `src/scss/sections/_hero.scss` dalam `@include tablet` /
`mobile` / `laptop`. Di bawah laptop `.hero__intro` jadi `display: contents`
dan `.hero__content` jadi grid, supaya judul bisa selebar konten dan sosial
pindah tempat tanpa mengubah Pug (urutan DOM dan animasi tetap). Rasio
showreel 4:5 lewat CSS saja; `hero-showreel.js` mengukur kotak, tidak perlu
diubah. Tidak ada konten atau elemen baru.

**Cek:** 320, 360, 390, 430, 744, 834, 1024, 1180; HP lanskap 844×390; tidak
ada scroll samping; animasi masuk setelah preloader dan setelah transisi
halaman; showreel membesar sampai penuh saat scroll dan pop-up terbuka dengan
ketuk; koin 3D di tempat dan ukurannya; desktop 1440 dibandingkan screenshot
sebelum.

Penyimpangan kecil dari usulan: di HP deskripsi mengalir sebagai satu
paragraf (baris-baris Figma-nya inline, dengan spasi), karena sebagai blok
terpisah ia membungkus tidak rapi di 320–360; `hero-intro.js` menaikkannya
sebagai satu bagian bila barisnya inline.

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless, viewport dipaksa; catatan:
      Chrome headless punya lebar jendela minimal 500, jadi HP harus lewat
      emulasi perangkat): 320, 360, 390, 744, 834, 1024, 844×390; 1440
      identik piksel dengan sebelum; hero tidak melebihi layar; animasi
      masuk selesai dengan urutan baru; showreel 4:5 membesar 1.93× sampai
      memenuhi layar di tengah scroll. Belum dicek: koin 3D (headless tanpa
      WebGL, gambar pengganti yang tampil) dan Safari iOS, dicek di perangkat
      pengguna.

## Langkah 3b — Statement (disetujui dan dikerjakan 9 Nov 2026)

Kondisi: kalimatnya 4 baris tetap (Figma) dengan `white-space: nowrap`,
42px, ikon biru dan folder di dalam baris. Di 834 lebar teks 1208px dan di
390 keluar layar kiri-kanan (terpotong "e specialize … cutting-edg"). Di
1024 masih muat (skala tipe 0,889). Section di-pin 1,8 layar saat tinta
mengalir (keputusan 3: tetap di-pin di HP).

**Tablet (744–1023):** kalimat mengalir biasa (tanpa baris tetap dan offset
per baris), 32px, line-height 1.5, rata tengah, lebar penuh dikurangi gutter
32. Ikon dan folder tetap ukuran desktop (66×52, 120×78) di dalam alur teks
dengan jarak 12px kiri-kanan, sejajar tengah baris. Eyebrow dan tombol tetap.
Jarak atas/bawah 100 / 160.

**HP (< 744):** sama, 24px, line-height 1.5 (±8 baris di 390); ikon dan
folder 0,7× (46×36, 84×55). Jarak atas/bawah 80 / 120. Hold tetap 1,8 layar;
isi (eyebrow + ±8 baris + tombol ≈ 520px) muat di layar 390×664 ke atas; HP
lanskap (844 lebar) memakai aturan tablet dan muat dalam 2–3 baris.

**Animasi:** tinta per huruf, ikon, folder dan tombol tetap bekerja:
`statement-ink.js` memecah teks per `.statement__line` dan tidak mengukur
tata letak baris, jadi baris yang membungkus tidak mengubahnya. Ikon dan
folder dipanggil oleh huruf sebelumnya seperti sekarang.

**Cara:** `_statement.scss` dalam `@include below-laptop` / `mobile`:
`.statement__line` jadi inline (height auto, white-space normal, transform
none, margin baris 3 dihapus), ikon `vertical-align: middle`, folder
`display: inline-block; vertical-align: middle`; `.statement__inner`
padding-inline gutter. Tanpa perubahan Pug/JS/konten.

**Cek:** 320, 390, 744, 834 (teks tidak keluar layar, ikon dan folder di
alur), pin dan tinta di 390 (scroll), 1024 dan 1440 tidak berubah.

Catatan pengerjaan: reset CSS membuat `svg` block, jadi ikon diberi
`display: inline-block`. Folder dikecilkan dengan `transform: scale(0.7)` di
kotak 84×55 (bagian-bagiannya absolut dalam fs()). Di 320 eyebrow membungkus
dengan ")" di baris sendiri (dibiarkan; teks Figma).

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless): 320, 390, 744, 834 teks di
      dalam layar, ikon dan folder di alur; 1440 identik piksel; di 390
      (sentuh, dengan animasi) section ter-pin (top tetap 146 dari scroll
      1350) dan tinta mengalir sampai penuh.

## Langkah 3c — Services (disetujui dan dikerjakan 9 Nov 2026)

Kondisi: section setinggi layar yang di-pin; kartu-kartu bertumpuk di kiri
(absolut, 345px), gambar/video di kanan (absolut, dari x = 385), tiap langkah
scroll mengganti kartu dan gambar, langkah terakhir memperbesar gambar. Di
834 gambar terdesak ke kolom sempit; di 390 gambar keluar layar (hanya kartu
pertama dan catatan yang terlihat). Keputusan 3: di HP Services mengalir
(kartu + gambar), tidak di-pin.

**Tablet dan HP (< 1024): mengalir, tanpa pin dan tanpa langkah.**
```
(What we do)
[Kartu Branding: judul, garis, tag, teks]
[gambar/video Branding 4:3]
[Kartu Brand Strategy]            ← HP: satu kolom, kartu lalu gambarnya,
[video Brand Strategy]               16 di antaranya, 48 antar layanan
… (5 layanan)
Catatan "Visual trends evolve…"

Tablet: dua kolom per layanan, kartu kiri (320) | gambar kanan (sisa, 4:3),
        baris-baris berjarak 32; label dan catatan selebar dua kolom.
```
- Kartu: statis, lebar kolom, isi dan ukuran teks tetap (judul 28, tag 14,
  teks 14); tanpa backdrop blur (latar sudah polos; hemat di HP). Tanpa
  tumpukan kartu di belakang (deck) karena tidak ada langkah.
- Gambar dan video: statis, lebar kolom, rasio 4:3, sudut 4px; video tetap
  diputar hanya saat terlihat (`inview-videos.js`).
- Tema halaman tetap berganti gelap saat Services datang dan terang menjelang
  Our Work (`page-theme.js` sudah punya jalur tanpa pin).
- Header: atribut `data-header-hide` menyembunyikan header selama section di
  layar; dibiarkan (header memang sembunyi saat scroll turun).
- Link di atas gambar (`.services__link`, tujuan masih `#`) disembunyikan di
  tata letak mengalir; saat halaman layanan ada, tiap gambar bisa dibungkus
  link sendiri.
- Tidak ada animasi masuk di tata letak mengalir (tidak menambah animasi).

**Desktop dan laptop (≥ 1024):** tidak berubah.

**Cara:**
- `_services.scss`, `@include below-laptop`: `.services__inner` jadi grid
  (tinggi auto, padding 40 / gutter / 60), `.services__cards` dan
  `.services__media` `display: contents`, urutan kartu–gambar berselang
  dengan `order` (kartu ke-n: 2n−1, gambar ke-n: 2n), kartu dan gambar statis
  (transform, clip-path, opacity, visibility direset), fade dan link
  disembunyikan, label dan catatan statis. `@include tablet`: dua kolom.
- `services-scroll.js`: seluruh pin/langkah dibungkus
  `gsap.matchMedia().add("(min-width: 1024px)", …)`, jadi di bawah 1024 tidak
  jalan dan kelas `is-enhanced` tidak dipasang; saat iPad diputar (834 ↔
  1194) ia dipasang/dilepas sendiri. Tanpa perubahan Pug/konten.

**Cek:** 320, 390, 744, 834 (urutan kartu–gambar, rasio, tidak ada scroll
samping, video jalan saat terlihat), tema gelap→terang di 390, 1024 dan 1440
tidak berubah (pin dan langkah tetap), putar dari 834 ke 1194 (pin terpasang).

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless): 390, 744, 834 urutan
      kartu–gambar berselang (CICICICICI), gambar 4:3, tidak melebihi layar,
      `is-enhanced` tidak terpasang; 1440 identik piksel; 1024 dan 1440 dengan
      animasi tetap ter-pin dan melangkah; di 390 tema gelap saat Services
      datang dan terang di Our Work; 834 → 1194 → 834 pin terpasang dan
      dilepas sendiri (tinggi inner 2025 → 834 → 2025).

## Langkah 3d — Our Work (disetujui dan dikerjakan 9 Nov 2026)

Kondisi: header satu baris (eyebrow + judul 42px kiri, 5 kategori kanan,
nowrap) → di 390 kategori keluar layar (lebar 594; ini salah satu penyebab
halaman bisa digeser ke samping di HP), judul jadi 4 baris; di 834 kategori
membungkus "Graphic / Design". Dua karusel: kartu `fluid(325)` → di 390 kartu
325px nyaris selebar konten (350), kartu berikutnya hanya mengintip 5px;
scroll karusel sudah native (snap, geser jari), panah tetap bekerja; label
"View Project" hanya mouse. Tombol "More Work" dan garis di bawahnya.

**Tablet dan HP (< 1024):**
```
( Our Work )
Thoughtful Design,            (HP 32px, 2 baris; tablet 42px)
Real Impact
Branding  UI/UX  Illustration  2D/3D  Graphic Design   (membungkus, gap 12×20)
────────────────────────────────
Recently Added            ‹ ›
[kartu][kartu][ka…  → geser; HP kartu 280 (gambar 280×210), yang berikutnya
                       mengintip ±50px; tablet kartu tetap 325
Selected Work             ‹ ›
[kartu][kartu][ka…
────────────────────────────────
[More Work]
```
- Header ditumpuk: eyebrow, judul, lalu baris kategori yang membungkus
  (rata kiri). Judul HP 32px, tablet tetap 42px.
- Kartu HP 280 (frame px): kotak crop gambar per kartu (nilai Figma × `--px`)
  ikut diskalakan 280/325 lewat variabel `--card-scale`, supaya potongan
  gambarnya sama seperti desktop. Judul kartu 13px dan nowrap tetap (judul
  panjang tertutup kartu berikutnya, seperti desktop).
- Jarak section: HP 100 atas/bawah, tablet 120 (desktop 180).
- Animasi masuk (teks naik, kartu membuka) tidak berubah.

**Laptop dan desktop (≥ 1024):** tidak berubah.

**Cara:** `_our-work.scss` (`below-laptop`: header kolom, kategori
`flex-wrap`, judul 32px di `mobile`, padding) dan `_work-carousel.scss`
(`mobile`: `.work-card` 280, media 210, `--card-scale: 280/325`; aturan dasar
crop dikali `var(--card-scale, 1)`). Tanpa perubahan Pug/JS/konten.

**Cek:** 320, 390, 744, 834 (tidak ada scroll samping dari section ini,
kategori membungkus, kartu mengintip, geser dan panah jalan, judul kartu), 1440
identik.

- [x] Disetujui ("okey", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless): 320, 390, 744, 834 tidak ada
      yang melebihi layar (kategori membungkus 2 baris di HP, 1 baris di
      tablet), kartu 280×210 di 390 (239 di 320), 325 di 834; 1440 identik
      piksel. Bersamaan: jarak dalam kartu Services di HP 32 → 24 (pengguna).

## Langkah 3e — Trusted (disetujui dan dikerjakan 9 Nov 2026)

Kondisi: judul berlebar tetap 699px (keluar layar di 390); logo dalam grid 4
kolom dengan ukuran Figma × `--px` (`max-width: none`) → di 390 grid melebar
sampai 766px (penyebab terakhir halaman bisa digeser ke samping di HP); kartu
testimoni 400×260 lebih lebar dari layar HP (350). Marquee testimoni sudah
berjalan sendiri dan didorong scroll; hover logo hanya di perangkat hover.

**Tablet (744–1023):**
- Judul lebar penuh (maks 699), tetap 42px rata tengah.
- Logo 3 kolom (4 baris), tinggi sel 100, logo diskalakan 0,85 (`--logo-scale`,
  dikalikan ke lebar/tinggi logo dan posisi "See More").
- Kartu testimoni tetap 400 (frame px) — dua kartu terlihat.
- Jarak section 120 atas/bawah, antar bagian 60.

**HP (< 744):**
- Judul 32px, lebar penuh, rata tengah.
- Logo 2 kolom (6 baris), tinggi sel 72, logo diskalakan 0,6 (PayMongo 196 →
  118 di kolom 165).
- "and hundred more..." tetap di tengah.
- Kartu testimoni lebar 300, tinggi minimal 260 (membesar bila kutipannya
  panjang), padding 24; posisi awal baris tetap di tengah (5 kartu = 1628).
  Fade tepi tetap.
- Jarak section 100 atas/bawah, antar bagian 48, marquee 48 dari garis.

**Desktop dan laptop (≥ 1024):** tidak berubah. Animasi masuk (teks naik,
logo memudar masuk satu per satu, garis, testimoni) tidak berubah.

**Cara:** `_trusted-clients.scss`: aturan dasar logo dan "See More" dikali
`var(--logo-scale, 1)`; `below-laptop` / `tablet` / `mobile` untuk header,
grid, kartu, jarak. Tanpa Pug/JS/konten.

**Cek:** 320, 390, 744, 834 (tidak ada scroll samping di seluruh halaman
Home — ini penyebab terakhir), logo terbaca, kartu utuh dan marquee jalan;
1440 identik.

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless): 320 dan 390 lebar dokumen =
      lebar layar (**Home tidak lagi bisa digeser ke samping di HP**), logo 2
      kolom (68×20 BenQ di 390), kartu 300×260; 744 dan 834 logo 3 kolom,
      kartu 400; 1440 identik piksel.

## Langkah 3f — Services di tablet (pengguna, 9 Nov 2026)

Pengguna: Services dua kolom di tablet tidak disukai; satu kolom (kartu lalu
gambar 16:9) "terlalu monoton"; di iPad Pro "sangat rusak" (bagian mana belum
dijawab). Dua versi dibuat untuk dibandingkan di iPad:

1. **Tumpukan sticky** (pilihan A), di branch `services-tablet/stack`
   (commit "Services on tablets and touch screens, variant: a sticky stack"):
   tiap layanan satu ubin (kartu di atas gambar 16:9) yang menempel dekat
   atas layar, ubin berikutnya naik menutupinya; murni CSS; di layar sentuh
   lebar kartu di samping gambar; pin hanya di layar hover ≥ 1024;
   `overflow-anchor: none` di section (Chrome melompat saat kartu menempel).
2. **Seperti desktop, ukuran tablet** (permintaan pengguna berikutnya), di
   `responsive/plan`: pin dan langkah aktif dari **744 ke atas**
   (`gsap.matchMedia("(min-width: 744px)")`), termasuk layar sentuh; di
   tablet kartu selebar konten di atas (tumpukan kartu di belakangnya seperti
   desktop), gambar mengisi dari 440 sampai 130 dari bawah, catatan di bawah
   gambar, fade selebar konten. HP (< 744) tetap mengalir (kartu lalu gambar
   4:3, jarak dalam kartu 24).
   Dicek (Chrome headless, sentuh, animasi): 834×1194 dan 744×1000 ter-pin,
   kartu berganti, tirai gambar, langkah terakhir memenuhi section; 390
   mengalir; 1440 identik piksel.
   Risiko: efek yang diikat ke scroll di Safari iPad (lihat showreel di
   iPhone); kartu punya pengejaran halus sendiri sehingga lebih tersamar.
   Dipastikan oleh pengguna di iPad.

- Pengguna tidak menyukai keduanya (9 Nov 2026), dan tiga arah lain (geser
  ke samping, ubin bergambar, akordeon) ditolak karena tidak berkaitan dengan
  section-nya dan terlalu berbeda dari desktop dan HP.

Versi berikutnya, alur dengan rupa dan gerak desktop (kartu bayangan deck
di bawah tiap kartu, kartu naik dan gambar membuka seperti tirai saat masuk
layar), dibuat dan terukur berjalan, tapi pengguna melihatnya statis di
localhost dan meminta kembali ke versi sebelumnya.

> 11 Nov 2026: HP & tablet kini memakai tumpukan panel, lihat
> [39-services-stack.md](39-services-stack.md).

**Keputusan akhir (pengguna, 9 Nov 2026): tablet mengikuti HP.** HP, tablet,
dan semua layar sentuh (mixin `below-laptop-or-touch`): satu kolom, kartu
lalu gambarnya, gambar 4:3 di HP dan 16:9 dari 744 ke atas, jarak
kartu→gambar 16, antar layanan 48 (HP) / 64 (tablet ke atas), jarak dalam
kartu 24, tanpa kartu bayangan dan tanpa animasi masuk. Pin dan langkah
hanya di layar hover ≥ 1024 (`gsap.matchMedia`). Dicek: 390 (350×263) dan
834 (770×433) mengalir, 1440 identik piksel dan tetap di-pin. Branch
`services-tablet/stack` dibiarkan sebagai arsip (bisa dihapus).

Laptop 1024 (mouse): versi desktop dirapatkan (kartu 245, gambar 722, teks
12,4px). Cacat ditemukan dan diperbaiki: catatan "Visual trends…" (fs 305 =
271px) melewati kolom kiri (245px) dan tertutup gambar → lebarnya
`min(fs(305), fluid(325))` (231px di 1024; 1440 tetap 305, identik piksel).

- Laporan pengguna (9 Nov 2026): saat inspeksi di browser, tata letak yang
  dipakai "berubah-ubah", terutama di 1024 di Services. Sebab: CSS dan pin
  Services (`gsap.matchMedia`) berpindah langsung saat lebar melewati 1024
  atau emulasi sentuh dinyalakan, sedangkan pembesaran showreel dan tanda
  tema halaman diputuskan sekali saat halaman dimuat → campur aduk tanpa
  reload. Perbaikan: pembesaran showreel (dan tombol yang mengikuti kursor)
  dalam `gsap.matchMedia("(min-width: 1024px) and (hover: hover)")`
  (`hero-showreel.js`); tanda "terang" tema halaman mencari pin Services
  pada tiap refresh (`page-theme.js`). Diukur (mouse): 1200 → showreel
  membesar 1,39× dan Services di-pin; diubah ke 900 → showreel diam, tanpa
  pin; kembali 1200 → seperti semula; tema terang di Our Work di ketiganya;
  hero 1440 identik piksel. Perpindahan di 1024 sendiri memang disengaja
  (mouse = laptop/pin, sentuh = alur).

- Laporan pengguna (9 Nov 2026, 1024): pembesaran showreel menutupi konten
  hero dan memotong Statement. Sebab: di layar yang lebih "kotak"
  (1024×768) kotak showreel 542 dari 768 tinggi, jadi saat memenuhi layar
  video melebar 114px ke atas (menutupi tanggal/sosial hero yang masih di
  layar) dan ke bawah (melewati jarak 113px ke eyebrow Statement); di
  1440×900 hanya 60px. Perbaikan (`hero-showreel.js`): tinggi pembesaran
  dibatasi `min(tinggi layar, tinggi kotak + 2 × 80 frame-px)` (ROOM =
  jarak showreel ke teks hero). Diukur: 1024×768 skala 1,21 (band 37–708,
  tidak menutupi tanggal maupun eyebrow); 1440×900 skala 1,155 tak berubah;
  1280×720 skala 1,06.

- [x] Dikerjakan dan dicek.
- [ ] Dicek pengguna di iPad.

## Langkah 3g — Milestone (disetujui dan dikerjakan 9 Nov 2026)

Kondisi: dua kolom (intro kiri; statistik kanan selebar 670) dengan
`space-between`. Di 390 keduanya berdesakan: eyebrow membungkus, judul 42px
jadi 4 baris, kolom statistik ±210px sehingga label membungkus ("Capital /
raised"). Di 834 muat, tapi kolom judul sempit (3 baris). Tidak ada scroll
samping. Animasi: odometer per digit, gelombang gradien di "$139M+", tinta
di kalimat utama; skrip mengukur lebar karakter saat init (tidak bergantung
breakpoint).

**Tablet (744–1023):** tetap dua kolom, kolom statistik 470 (bukan 670)
sehingga judul 42px muat dalam 2 baris ("From Concept / To Impact"); jarak
atas/bawah 120.

**HP (< 744):** ditumpuk: eyebrow, judul 32px (2 baris), lalu statistik
selebar konten (nilai kiri 40px, label kanan 16px, garis per baris seperti
desktop), lalu kalimat 18px. Jarak atas/bawah 100; antara intro dan
statistik 40; padding baris 20; antar baris 12; statistik → kalimat 32.

**Laptop dan desktop (≥ 1024):** tidak berubah. Animasi tidak berubah.

**Cara:** `_milestone.scss` dalam `@include tablet` / `mobile`. Tanpa
Pug/JS/konten.

**Cek:** 320, 390, 744, 834 (judul 2 baris, label tidak membungkus, tidak
melebihi layar), 1440 identik; odometer di 390 dengan animasi.

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless): 320, 390, 744, 834 judul 2
      baris, label satu baris (16px tinggi), statistik 287 / 350 / 419 /
      470 lebar, tidak melebihi layar; 1440 identik piksel; odometer di 390
      mendarat di $139M+, 120+, 8.

## Langkah 3h — Motto (disetujui dan dikerjakan 9 Nov 2026)

Kondisi: section setinggi layar yang di-pin dengan 5 langkah (motto 1 →
sorot → balik → sorot → balik + CTA); teks aksen digambar per huruf lewat
salinan absolut yang hanya diberi posisi horizontal (`--x`), sehingga baris
motto dipaksa satu baris (`nowrap`, 42px). Blok isi 1050 × 664 dengan jarak
254. Di 390 baris motto 900px lebar → terpotong kiri-kanan (hanya "…tting
Design, Grounded…" yang terlihat); di 834 juga terpotong (1122). Keputusan 3:
Motto tetap di-pin di HP (teks). Langkah per gestur roda hanya mouse; di
layar sentuh langkahnya mengikuti scroll seperti Statement.

**Tablet dan HP (< 1024):** tetap di-pin dengan langkah yang sama.
- Baris motto **membungkus**, rata tengah: tablet 36px, HP 28px (motto
  terpanjang "Design to advocates and investors into believers." jadi 2
  baris di 770 dan 2–3 baris di 350). Ketiga motto berbagi satu sel grid dan
  masing-masing dipusatkan vertikal (tinggi beda saat membungkus).
- Blok isi selebar konten (bukan 1050), tinggi mengikuti isi, jarak label →
  motto → tombol 96 (tablet) / 64 (HP); isi tetap di tengah layar.
- Glow (elips 1440 lebar) dibiarkan, terpotong oleh `overflow: hidden`.

**JS (`motto-scroll.js`):** `measure()` juga menyimpan posisi vertikal tiap
huruf (`--y`, em) dan dipanggil lagi pada `refreshInit`/`restoreStep`
(perubahan lebar, rotasi iPad), supaya salinan per huruf mengikuti baris
yang membungkus; CSS `.motto__glyph { top: var(--y, 0) }`. Desktop tidak
berubah (`--y` = 0 di satu baris).

**Desktop dan laptop (≥ 1024):** tidak berubah.

**Cek:** 320, 390, 744, 834 teks di dalam layar; di 390 dengan animasi:
pin, sorot gradien per huruf di baris yang membungkus (screenshot di
tengah langkah 1 dan 3), balik ke motto 2 dan 3, tombol muncul; rotasi 834 ↔
1194 posisi huruf diukur ulang; 1440 identik piksel.

Catatan pengerjaan: `--y` diukur relatif terhadap huruf pertama baris
(bukan tepi atas blok; kotak huruf menggantung setengah leading di bawahnya,
dan diukur dari blok salinan turun beberapa piksel di desktop).

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome headless): 320 / 390 / 744 / 834 baris
      membungkus (2–3 / 2–2–1 / 1–2–1 / 1 baris), teks di dalam layar, 28 /
      36px; kotak teks salinan per huruf tepat di atas hurufnya (selisih 0)
      di 390, 834, 1440; 1440 identik piksel; di 390 dengan animasi: pin,
      sorot 18/18 huruf motto 1 di baris yang membungkus, balik ke motto 2
      (10/10 huruf "believers.") dan motto 3, label berganti, tombol muncul;
      rotasi 834 → 1194 → 390 pengukuran ulang tepat.

## Langkah 3h-2 — Sorotan Motto di iPhone (laporan pengguna 9 Nov 2026)

iPhone 13 Safari: sorotan motto "tidak muncul". Diuji langsung di iPhone
pengguna (iOS 27.0.1, tersambung kabel, dikendalikan lewat `safaridriver`
dengan `platformName: iOS`): di preview Vercel (commit Motto `1cb698c`,
gradien asli `background-clip: text`) **kedua sorotan tergambar dengan
benar** ("Trendsetting Design" dan "believers." di baris kedua). Juga benar
di Safari Mac. Perbaikan warna solid per huruf yang sempat dibuat tidak
diperlukan dan dibatalkan sebelum di-commit. Kemungkinan yang dilihat
pengguna sebelumnya: versi sebelum `1cb698c`, di mana baris motto 900px
terpotong di layar HP sehingga kata yang disorot berada di luar layar.

## Pemeriksaan seluruh Home di semua perangkat (9 Nov 2026)

Alat: Chrome headless dengan animasi (15 ukuran: 320×640, 360×780, 390×844,
430×932, 844×390, 744×1133, 834×1194, 1024×1366, 1194×834, 1366×1024 —
sentuh; 1024×768, 1280×720, 1366×768, 1440×900, 1920×1080 — mouse), lewat
server statis (`python3 -m http.server` di `dist/`; browser-sync menyamakan
scroll antar browser dan mengacaukan hasil), dan **iPhone 13 pengguna**
lewat kabel (`safaridriver`, iOS 27.0.1).

Hasil Chrome: tidak ada error JS, tidak ada scroll samping atau elemen keluar
layar (elips Motto dan gambar Services yang membesar terpotong bingkainya),
preloader ±5,3 s, koin 3D termuat di semua ukuran.

Temuan di iPhone (layar terpakai 699px, bukan 844):
1. **Koin hero** mulai di 695 (di bawah lipatan) dan tenggelam di balik
   showreel begitu digeser → tidak pernah terlihat. Perbaikan
   (`_hero.scss`, HP): koin 150×141, dasar sejajar dasar tombol sosial
   (`bottom: 437.5 + 20 + 64`), showreel 64 di bawah sosial. Diuji di
   iPhone: koin utuh di layar pertama, tenggelam ke showreel saat digeser.
2. **Footer lebih tinggi dari layar** (816 > 699): dengan efek tirai,
   bagian atasnya (logo, "Get in Touch", koin) masih tertutup Motto saat di
   layar dan sudah lewat saat terbuka → tidak pernah terlihat. Perbaikan:
   efek tirai mati bila footer lebih tinggi dari layar (`footer-reveal.js`,
   diperiksa tiap refresh); koin footer di HP di dalam footer, kanan atas
   sejajar logo, 100×94, `top: 32` (pilihan B pengguna; `_footer.scss`); di
   footer setinggi itu koin 3D mendarat saat tempatnya 40% dari atas layar
   lalu ikut bergulir (`coin-scene.js`, `LAND`). Diuji di iPhone: logo,
   form, dan koin terlihat. Desktop: tirai tetap (−281 → 0 di 1440×900).
3. HP lanskap (844×390): koin hero di bawah lipatan — masuk langkah 7
   (layar pendek), belum dikerjakan.

- [x] Diperbaiki dan dicek ulang (7 ukuran Chrome + iPhone).

## Langkah 7b-2 — Layar pendek / HP lanskap (disetujui dan dikerjakan 9 Nov 2026)

Berlaku untuk tinggi layar < 500 (mixin `short`), yaitu HP lanskap
(667×375 iPhone SE, 844×390 iPhone 13, 932×430 Pro Max). Diperiksa di
Chrome dengan animasi, Home layar demi layar:
- **Hero** (tata letak tablet di 844): judul 64px memenuhi layar pertama;
  koin dan showreel di bawah lipatan, koin tidak pernah terlihat.
- **Statement** (di-pin di tengah layar): isi 675px tinggi di layar 390;
  eyebrow tertutup header, tombol "Schedule a call" terpotong di bawah
  (349–433).
- **Menu HP** (667×375): isi panel 562px, "Contact" dan sosial di bawah
  lipatan (panel bisa digulir, tapi tidak terlihat ada isinya).
- Motto muat (22–368), Services/Our Work/Trusted/Milestone/footer mengalir,
  preloader muat (logo 145–185, tahun 307–328). Branch arsip
  `services-tablet/stack` dihapus (f6a2972).

Usulan (hanya `short`; layar lain tidak berubah):
1. **Hero**: judul 40px; koin 160×150 di kanan sejajar baris sosial (seperti
   HP); jarak atas lebih rapat. Target: judul, info, sosial, dan koin di
   layar pertama.
2. **Statement**: teks 24px (line-height 1.5), jarak eyebrow→teks 16,
   teks→tombol 24, sehingga eyebrow + teks + tombol (±320px) muat di bawah
   header saat ditahan.
3. **Menu HP**: tautan 32px dalam satu kolom kiri, kontak dan sosial di
   kolom kanan (dua kolom), jarak atas lebih rapat; semua terlihat tanpa
   menggulir panel.
4. Motto, section lain, preloader: tidak diubah.

**File:** `_hero.scss`, `_statement.scss`, `_header.scss` (menu HP), mixin
`short` yang sudah ada. **Cek:** 667×375, 844×390, 932×430 (screenshot
hero, Statement saat ditahan, menu terbuka), 390×844 dan 1440 tidak berubah,
dan iPhone pengguna diputar lanskap.

Pengerjaan (`short`):
- Hero: judul 32px, tepat di bawah bar 64px (`margin-top: 4.5rem −
  fluid(104)`), info 420 lebar dengan deskripsi mengalir 2 baris, jarak 12;
  HP lanskap kecil (< 744) memakai baris tablet (sosial kiri, koin tengah,
  info kanan) dan showreel 1360:781; koin di baris sosial (160×150 tablet,
  120×113 HP).
- Statement: teks 24px / 1.4, jarak 16 dan 12, ikon dan folder ukuran HP.
- Menu HP: dua kolom (tautan 32px kiri, kontak dan sosial kanan).
- **iPhone Safari memperbesar teks sendiri saat lanskap**
  (`text-size-adjust: auto`): blok info 204px alih-alih 139. Ditambahkan
  `text-size-adjust: 100%` di `_reset.scss` (seluruh situs; zoom manual
  tetap).

Dicek: iPhone 13 pengguna lanskap (750×326): hero 72–325 (muat),
Statement saat ditahan 92–318; Chrome 667×375, 844×390, 932×430: hero
72–325, Statement 69–370 / 93–358 / 113–379, menu 667×375 tanpa gulir
(terakhir 351); 390×844 dan 834×1194 identik piksel dengan sebelum, 1440
sama (selisih 8 piksel di titik dua jam yang berkedip).

- [x] Disetujui ("ya", 9 Nov 2026).
- [x] Dikerjakan dan dicek.

## Koin 3D tajam di layar sentuh (laporan pengguna 9 Nov 2026)

iPhone 13: koin 3D "pecah / pixelated". Sebab: langkah 7b menggambarnya 1×
tanpa antialiasing di layar sentuh (untuk meringankan showreel yang saat itu
membesar dan patah-patah); iPhone 13 berlayar 3×. Showreel tidak lagi
membesar di layar sentuh, jadi kanvas dikembalikan ke 2× dengan antialiasing
(`coin-scene.js`; desktop tetap 1,5×). Diuji di iPhone pengguna: tepi dan
logo halus (screenshot sebelum/sesudah), 60 fps diam dan saat digulir (frame
terlama 19–20 ms), kanvas 780px.

## Sorotan Motto dan gerak koin di iPhone (laporan pengguna 9 Nov 2026)

1. **Sorotan Motto tidak bekerja di iPhone** (kambuh): bilah alamat Safari
   memicu `resize` saat digulir; Motto menandai "resizing" dan menunggu
   refresh ScrollTrigger untuk melepasnya, sedangkan `ignoreMobileResize`
   (langkah 7b) membuat refresh itu tak pernah datang → sorotan dan cahaya
   berhenti. Dibuktikan di iPhone dengan satu `resize` tiruan (0/18 huruf).
   Perbaikan (`motto-scroll.js`): tanda dilepas sendiri 500 ms setelah
   resize bila tak ada refresh. Diuji di iPhone dengan resize berulang saat
   menggulir: 18/18 dan 10/10 huruf menyala, motto 1→2→3.
2. **Koin patah-patah saat bergerak di iPhone**: kanvas tetap di layar,
   posisi dihitung dari scroll; Safari iOS melaporkan scroll ke skrip
   sedikit terlambat → koin tertinggal lalu menyusul. Pilihan A (pengguna):
   di layar sentuh kanvas diletakkan **di halaman** di sekitar tempat koin
   (hero, lalu footer; `placeOnPage` di `coin-scene.js`), sehingga bergulir
   bersama halaman; koin menempel pada tempatnya (tanpa parallax turun dan
   tanpa jatuh di footer), putaran, efek masuk, dan balik karena scroll
   tetap; selama preloader kanvas hero menjangkau satu layar lebih ke bawah
   untuk dorongan showreel. Desktop tetap kanvas layar penuh. Diuji di
   iPhone: koin di tempatnya saat diam, setelah 250px, dan di footer; 60 fps
   (frame terlama 35 ms saat digulir).
   Pengguna: "hanya berputar-putar", ingin gerak seperti desktop. Gerak
   desktop dikembalikan di atas kanvas di halaman: posisi = tempatnya di
   halaman (bergulir sendiri) + selisih gerak desktop dari tempat itu
   (turun lebih lambat dan tenggelam ke showreel di hero; jatuh dari balik
   Motto di footer), selisih itu dihaluskan ±80 ms (`drift`) karena
   laporan scroll iOS terlambat dan tak rata; ruang kanvas diperluas untuk
   gerak itu (hero 0,6 layar ke bawah, footer `DROP` ke atas). Dicek di
   Chrome (sentuh, 390×699): tenggelam di hero setelah 100px, jatuh dari
   balik Motto di footer.

## Navbar di footer (pengguna 10 Nov 2026)

Navbar di atas footer terlihat "dobel" (logonya tepat di atas logo footer;
di HP juga menutupi form). Keputusan: navbar disembunyikan sejak tepi footer
(bawah konten di atasnya) melewati tengah layar sampai akhir halaman, muncul
lagi saat kembali naik; semua ukuran (`header.js`: alasan per kelas
digabung agar Motto dan footer tidak saling menimpa; progres > 0 karena di
ujung halaman pemicu dianggap lewat; `refreshPriority: -1` agar diukur
setelah pin Services dan Motto). Dicek 390×699 (sentuh), 1440×900,
1024×768: tampil di Trusted dan sebelum footer, tersembunyi setelah tepi
footer lewat tengah dan di akhir, tampil lagi saat naik.

Juga: efek tirai footer di HP (footer lebih tinggi dari layar) sengaja
dimatikan (lihat pemeriksaan semua perangkat); usulan mengembalikannya
ditolak pengguna ("tidak perlu").

## Langkah 4 — About (disetujui dan dikerjakan 10 Nov 2026)

Kondisi (screenshot 390 dan 834): halaman bisa digeser ke samping di HP dan
tablet (lebar dokumen 1380 / 1392) karena galeri memakai posisi Figma
mutlak dalam kanvas 1360 × 2128 (di HP `--px` = 1, jadi foto 1130px). Intro
sudah muat (judul 3 baris; foto 1360:560 jadi pita 350 × 144 di HP).
Principles di-pin: di 390 ilustrasi terdorong keluar layar kanan, di 834
kolom teks 210px dan ilustrasi 590 berdesakan. Tim: kolom peran di 462 →
keluar layar di HP (547); tablet muat.

### 4a Intro
- HP: judul 32px; foto 4:3 (gambar `height: 130%; object-fit: cover` agar
  tetap lebih tinggi dari bingkainya untuk paralaks `about-intro.js`); teks
  dan tombol seperti sekarang; jarak bawah 120.
- Tablet: foto 16:9, jarak bawah 160. Selebihnya tetap.

### 4b Principles — mengalir (keputusan 3), seperti Services
Berlaku di HP, tablet, dan semua layar sentuh (`below-laptop-or-touch`); pin
dan langkah hanya di layar hover ≥ 1024 (`gsap.matchMedia`, seperti
`services-scroll.js`).
```
Hundreds of products later, …        (24px HP / 28px tablet)
01 (Execution Over Overhead)
   We replace long discovery…
[ ilustrasi 01 — papan, 670:420, selebar konten ]
02 (Frictionless Infrastructure)
   …
[ ilustrasi 02 ]
… sampai 06
```
- `.principles__inner` jadi grid satu kolom; `__text`, `__detail`,
  `__items`, `__figures` `display: contents`; urutan intro → item n →
  ilustrasi n lewat `order`; daftar nomor (tombol) disembunyikan, nomor tiap
  prinsip ditulis lewat `counter` di depan judul.
- Tiap ilustrasi: `position: static`, lebar penuh, `aspect-ratio: 670/420`,
  sudut 4px. Papan (ilustrasi 01, HTML dalam em): `font-size: calc(100cqw /
  670)` dengan `container-type: inline-size` pada inner, jadi skalanya
  mengikuti lebar; `position: relative` untuk anak-anaknya.
- Animasi: cerita papan (Motion-01, ±4,5 s) diputar sekali saat papan masuk
  layar; tidak ada animasi lain (tidak menambah).
- Jarak: intro → prinsip 1: 48; teks → ilustrasi 20; antar prinsip 48 (HP) /
  64 (tablet); section padding 80 / 100.

### 4c Galeri
- Tablet (744–1023): komposisi Figma dipertahankan tapi diskalakan ke lebar
  konten: `--gpx: calc(100cqw / 1360)` (container pada `.container`),
  dipakai untuk x/y/w/h dan tinggi kanvas; di 770 lebar foto besar 640, foto
  kecil 195. Naik-turun saat scroll (`about-gallery.js`, dalam frame px)
  tetap.
- HP (< 744): satu kolom, urutan Figma, tiap foto selebar konten dengan
  rasio Figma-nya (1130:636, 460:589, 805:411, 345:325, 920:478), jarak 16.
  Tirai dan naik-turun tetap (ukuran naik 96/150 frame-px masih wajar di
  kolom; dicek). "Play Video" tetap di tengah foto pertama.
- Jarak atas 120 (HP) / 160 (tablet).

### 4d Tim
- HP: nama dan peran ditumpuk dalam satu baris (peran 12px, abu, di bawah
  nama), garis per baris tetap; lead 16px.
- Tablet: seperti desktop (sudah muat).
- Pratinjau foto mengikuti kursor hanya mouse (sudah).

**Desktop dan laptop (≥ 1024):** tidak berubah. **File:** `_about.scss`,
`principles-scroll.js` (pembungkus matchMedia + cabang alur untuk cerita
papan). Tanpa Pug/konten.

**Cek:** 320, 390, 744, 834 tiap section (tidak ada scroll samping di seluruh
About), papan proporsional, cerita papan jalan di HP, galeri bergerak, tim
terbaca; 1440 identik piksel; rotasi 834 ↔ 1194 (pin/alur berganti).

Pengerjaan: seperti usulan. Principles memakai `gsap.matchMedia` (pin di
layar hover ≥ 1024, alur di bawahnya dan di layar sentuh) dan tiap prinsip
diberi baris sendiri (`grid-area: auto`; desktop menaruh semua di satu sel);
nomor lewat `counter`. Galeri: naik-turun diskalakan dengan lebar galeri
(lebarnya / 1360, sama dengan `designPx()` dari laptop ke atas); di HP semua
foto naik sama jauh (foto kecil yang naik lebih jauh menutupi foto besar di
kolom).

Foto tim yang mengikuti kursor tetap hanya untuk mouse; di layar sentuh daftar
hanya nama dan peran (keputusan pengguna 10 Nov 2026, "oke seperti
sekarang"; pilihan ketuk-untuk-foto ditunda sampai ada foto asli tiap
anggota — sekarang placeholder).

- [x] Disetujui ("ya", 10 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome): 320, 390, 744, 834, 1194 (sentuh), 1024,
      1440 tanpa scroll samping dan tanpa error; urutan Principles di HP
      intro → (judul, ilustrasi) × 6; papan memutar ceritanya sampai 100% di
      HP; 1440: keempat bagian identik piksel dengan commit sebelumnya,
      Principles tetap di-pin dan melangkah.

## Langkah 5 — Contact (disetujui dan dikerjakan 10 Nov 2026)

Kondisi: halaman ini punya skala sendiri (`--px`/`--type-px` tetap
berhenti di 1280/1440 dan tidak mengikuti token tablet/HP), dua kolom:
kolom kiri lengket (judul, tombol, foto kantor, alamat) 478 dan form 786
dengan `space-between`. Di 390 **form berada di luar layar kanan** (hanya
tepinya terlihat; elemen form sampai 678px), halaman tidak bisa digeser ke
samping karena `overflow-x: clip`, jadi form tidak bisa dicapai sama sekali;
kolom kiri menyisakan ruang kosong 309 di tengah. Di 834 dua kolom
berdesakan (kiri 350, form 425). Galeri marquee di bawah tetap berjalan.

**Tablet dan HP (< 1024):**
- Skala halaman ikut token tablet/HP (`--px`, `--type-px` tidak lagi
  ditimpa di bawah 1024), sisi mengikuti `--page-gutter`.
- Satu kolom, tidak lengket: judul, paragraf, tombol "Schedule a call",
  lalu **form** (kartu selebar konten), lalu foto kantor + alamat + catatan
  email (urutan: hal yang paling dicari dulu). Jarak antar blok 48 (HP) /
  64 (tablet); jarak 309 di kolom kiri dihapus.
- Form: chip membungkus seperti sekarang, dropzone selebar form, Turnstile
  dan tombol Submit tetap; di HP padding kartu 20, judul 28px.
- Judul halaman 32px di HP (tablet 42 tetap).
- Galeri: tetap marquee; ukuran gambar mengikuti skala HP/tablet (bukan
  0,889× desktop), jarak atas 80.

**Laptop dan desktop (≥ 1024):** tidak berubah.

**Cara:** `_contact.scss` dalam `@include below-laptop` / `mobile`
(urutan lewat `order` pada `.contact__aside` yang dibuat `display:
contents`); tanpa Pug/JS/konten.

**Cek:** 320, 390, 744, 834 (form terlihat dan bisa diisi, tidak ada scroll
samping, dropdown Turnaround dan tooltip Project Type di dalam layar), 1440
identik; iPhone pengguna bila tersambung.

Pengerjaan: skala tablet/HP situs disediakan sebagai `--site-px-small` di
`_tokens.scss` dan diambil kembali oleh `.contact` di bawah 1024 (halaman
ini menimpa `--px` dengan skalanya sendiri). Tooltip "Project Type" di
tengah tombol info dengan geser −35% dan lebar maksimal selebar layar.

- [x] Disetujui ("ya", 10 Nov 2026).
- [x] Dikerjakan dan dicek (Chrome): 320, 390, 744, 834 satu kolom (intro →
      form → kantor), tidak ada elemen keluar layar, tooltip di dalam layar
      (49–309 di 320); di 390 (sentuh) memilih Project Scope dan Project
      Type memunculkan Turnaround, dropdown terbuka di dalam layar (40–350);
      Contact, Home, About 1440 dan Home 390/834 identik piksel dengan commit
      sebelumnya. iPhone pengguna tidak terjangkau saat itu.

## Langkah 6 — Privacy Policy dan Terms (10 Nov 2026)

Kondisi: tablet dan laptop sudah rapi; di HP baris info (Data Controller,
Address) dipaksa satu baris sehingga halaman melebar ke 620–624px, dan isi
tiap bagian menjorok di bawah nomornya. Perbaikan kecil (`_policy.scss`, HP
saja): baris info membungkus, judul 32px, nomor di atas judul bagian (isi
selebar layar), judul bagian 24px, isi 15px, jarak lebih rapat.

- [x] Dikerjakan dan dicek: 320 dan 390 tanpa scroll samping di kedua
      halaman; 834 dan 1440 identik piksel dengan commit sebelumnya.

## Langkah 7a — Preloader di HP (disetujui dan dikerjakan 9 Nov 2026)

Keluhan pengguna: preloader terasa lama sekali di HP. Sebab: preloader
menunggu semua aset halaman (keputusan lama "tunggu sampai semuanya masuk"):
di beranda ±16 MB (4 video 10,2 MB termasuk video Services 5 MB dan video
pop-up; 26 gambar 2,1 MB, yang lazy dipaksa eager; koin 3D 3,5 MB), 13 detik
atau lebih di 4G, sampai batas 20 detik.

Keputusan (pengguna, "oke sekarang"):
- Preloader hanya menunggu layar pertama: gambar header dan hero, frame
  pertama video showreel kecil (di layar sentuh) atau sampai bisa diputar
  (desktop), font, `load`, koin 3D. Sisanya memuat seperti biasa setelah
  halaman terbuka. Berlaku di semua perangkat (`src/js/preloader.js`).
- Batas tunggu di layar sentuh 8 detik (desktop tetap 20).
- Koin 3D di HP memakai cahaya studio setengah ukuran
  (`white-studio-512.hdr`, 351 KB; dibuat dari yang 1k dengan rata-rata 2×2
  piksel) — desktop tetap 1k. Model GLB versi HP (tekstur 512) belum: perintah
  `gltf-transform` lewat `npx` diblokir di sesi ini; bisa dijalankan pengguna
  (lihat docs/implementation/15-hero-coin-3d.md) kalau masih perlu.
- Gambar Services dan tekstur Motto jadi `loading="lazy"` (AGENTS.md §15);
  gambar Our Work tetap eager (karusel mendatar).

- Tekstur Motto kedua (`.tone-shift__texture`, 557 KB) juga lazy.

Diukur (Chrome headless, HP 390, 4G tiruan 10 Mbps / 40 ms, CPU 4× lebih
lambat, server lokal yang sama):
| | Sebelum | Sesudah |
|---|---|---|
| Semua yang ditunggu masuk (`coin:ready`) | 9,7 s | 5,5 s |
| Tirai mulai naik (`preloader:reveal`) | 12,2 s | 8,0 s |
| Halaman bisa di-scroll | ±14,1 s | 10,0 s |
| Diunduh sampai terbuka | ±7–8 MB | 6,45 MB |

Catatan: gambar lazy di header (kartu menu Work, ±1 MB, tersembunyi sampai
menu dibuka) dulu dipaksa eager dan ikut ditunggu; sekarang dikecualikan
(dibiarkan lazy; kalau ikut dihitung tanpa dipaksa, preloader menunggunya
sampai batas waktu).

Temuan: setelah aset masuk, koreografi preloader sendiri (garis logo
diselesaikan, isi, tahun naik, napas, tirai 1,5 s, showreel didorong 1,6 s)
memakan ±4,5 s lagi (aset masuk 5,5 s → scroll 10,0 s), dan itu yang kini
mendominasi di HP. Yang masih
diunduh sebelum terbuka: model koin 1,3 MB + kode three.js 0,8 MB, video
showreel kecil 1,7 MB (potret 1280×1920 diunduh utuh), gambar Our Work ±1 MB.
Langkah lanjutan yang mungkin (perlu keputusan / alat):
- Koreografi lebih singkat di HP (keputusan desain pengguna).
- Video showreel kecil versi HP (±480 px lebar, ±400 KB; perlu ffmpeg, tidak
  ada di mesin ini) lewat `<source media>`.
- Model GLB tekstur 512 untuk HP (gltf-transform; diblokir di sesi ini).
- Gambar Our Work lazy (dicek bersama langkah responsive Our Work).
- Kode koin dimulai bersamaan dengan aset lain, bukan setelah `load`.

- [x] Dikerjakan dan diukur; koin 3D di HP memuat HDR 512 tanpa fallback
      (WebGL headless).

## Langkah 7b — Showreel dan koin di HP (laporan pengguna 9 Nov 2026, disetujui, dikerjakan)

Laporan: di HP showreel patah-patah saat scroll, dan koin tidak terlihat.
Tidak bisa direproduksi di sini (butuh perangkat); perbaikan dari penyebab
yang paling mungkin, khusus layar sentuh (`hover: none`), desktop tak berubah:
- Koin: bila konteks WebGL hilang (HP kehabisan memori grafis: kanvas kosong
  tanpa error) gambar koin pengganti kembali (`webglcontextlost`, semua
  perangkat). Di layar sentuh tanpa antialias dan kanvas 1× (`coin-scene.js`).
- Showreel: clip tanpa sudut bulat saat membesar (sudut CSS video tetap),
  tinggi layar dari `100lvh` agar tidak menyisakan celah saat bar browser
  pergi (`hero-showreel.js`); blur tombol kaca mati (`_glass-button.scss`);
  `ScrollTrigger.config({ ignoreMobileResize: true })` agar bar Safari yang
  naik-turun tidak membuat pembesaran meloncat (`main.js`).
- Belum: model GLB tekstur 512 untuk HP (memori GPU ±4× lebih kecil). Perintah
  untuk pengguna (dari folder proyek; keluaran ke `src/assets/models/`):
  `npx -y @gltf-transform/cli@4 optimize src/assets/models/oww-pin.glb src/assets/models/oww-pin-512.glb --compress meshopt --texture-compress webp --texture-size 512 --flatten false --join false --simplify false --instance false --palette false`
  lalu `coin-scene.js` memilihnya di layar sentuh.
- Dicek (Chrome headless, sentuh ditiru, 390): blur mati, kanvas 390 px lebar,
  koin tampil, showreel membesar 1,93× dan koin sembunyi saat tertutup;
  desktop 1440 identik piksel dengan acuan. Yang menentukan: cek di HP
  pengguna.

- Masih patah di HP pengguna (iPhone 13, Safari). Keputusan pengguna
  (pilihan 1): **di layar sentuh showreel tidak membesar saat scroll**; tetap
  di kotaknya, ketuk membuka pop-up. Safari menggulir sendiri dan melaporkan
  posisi ke skrip hanya sesekali, jadi pembesaran yang diikat ke scroll
  selalu tertinggal. Koin lalu memudar mengikuti scroll saja (tidak lagi
  sembunyi saat video memenuhi layar). Sudut clip dan tinggi `100lvh` untuk
  sentuh dicabut lagi (tidak terpakai). Dicek: sentuh 390 tanpa transform
  dan clip, koin sembunyi di scroll ±1000; desktop 1440 masih membesar.
- Riwayat: perubahan "showreel tidak membesar" sempat dibatalkan
  (`effce46`) lalu dipasang lagi (cherry-pick) atas permintaan pengguna, 9 Nov
  2026: di HP showreel diam dan tetap potret 4:5 (pembesaran terasa aneh).
  Tablet (744–1023) tetap 16:9 dan juga diam (layar sentuh).
- Aturannya lalu diperluas (pengguna, 9 Nov 2026, saat mengecek di localhost
  dengan jendela disempitkan): tidak membesar bila layar sentuh **atau** lebar
  di bawah 1024 (tata letak tablet/HP), supaya jendela desktop yang
  disempitkan menunjukkan apa yang HP tunjukkan. Desktop ≥ 1024 membesar.
- Laporan pengguna (9 Nov 2026, tablet): koin hero turun sampai ke section
  di bawahnya. Sebab: tanpa pembesaran showreel, koin (turun 0,4 px per px
  scroll) hanya memudar di 0,95–1,2 layar, dan sebelum itu muncul lagi di
  bawah tepi bawah showreel. Perbaikan (`coin-scene.js`): di tata letak tanpa
  pembesaran koin hilang saat tenggelam di balik tepi atas showreel
  (titik = jarak tepi showreel ke tepi atas koin ÷ 1,4), memudar di 60–100%
  jalan ke sana, dan tidak kembali. Diukur: 834 → 1 / 0,76 (80 px) / 0 (120
  px); 390 → 1 / 0,25 (60 px) / 0 (90 px); desktop 1440 tetap 1 (jalur lama).
- [ ] Dicek di HP pengguna (showreel halus, koin tampil atau gambar
      penggantinya).

## Kriteria selesai
- Tidak ada scroll ke samping di lebar mana pun dari 320px.
- Teks terbaca tanpa zoom (≥ 12px), area sentuh ≥ 44px.
- Desktop ≥ 1280 tidak berubah (dibandingkan screenshot sebelum).
- Lighthouse mobile 90+ di Accessibility, Best Practices, SEO; Performance
  dilaporkan dan diusahakan naik.

## Cek
- [x] Breakpoint disesuaikan dengan perangkat saat ini.
- [x] Keputusan 2–6 (usulan disetujui; 4 dan 5 dikonfirmasi lagi di
      langkahnya).
- [x] Referensi navbar dari pengguna; usulan navbar disetujui.
- [x] Langkah 1–2 (dasar; navbar + menu HP; footer).
- [ ] Langkah 3–8.
