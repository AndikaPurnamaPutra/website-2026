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
