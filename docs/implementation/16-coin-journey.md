# 16 — Perjalanan koin 3D (hero → footer)

Status: **Selesai (28 Okt 2026), menunggu review**
Acuan pengguna: drone.riotters.com, di mana satu objek 3D di lapisan *fixed* menemani halaman dan muncul di section tertentu.

## Keputusan pengguna
- Koin hanya tampil di **hero dan footer**. Koin muncul dari atas di hero, ikut bergerak ke bawah saat mulai di-scroll, lalu muncul kembali di footer.
- Koin tetap **di belakang** showreel, konten hero, dan Motto (seperti desain).
- Pendaratan: dipilihkan (goyangan kecil yang mereda).

## Revisi 2: koin turun dengan flip, footer tersingkap (28 Okt 2026, disetujui)
Masukan pengguna: masih kurang elegan, dan tidak boleh ada lompatan. Gerak cukup dari atas ke bawah dengan koin yang flip secara halus. Footer juga harus muncul dari atas, supaya terasa satu kesatuan. Footer dimunculkan seperti sstr.tech. Detail dipilihkan, dengan arahan "yang elegan".

- **Satu koin yang selalu turun**, dengan **satu putaran flip penuh** yang pelan per bagian (`rotateX` −360°, kurva `inOut`), mengikuti scroll dengan kelembaman 0,35 detik. Tanpa fisika dan tanpa pantulan.
  - Saat dimuat (2,4 detik): turun dari atas layar (0,9 layar) sambil flip sekali, lalu berhenti utuh di pose B.
  - Hero 0 → 0,25 layar: meluncur turun ke posisi desain (di belakang showreel).
  - Hero 0,25 → 1 layar: terus turun 0,9 layar sambil flip sekali, keluar dari layar.
  - Footer (layar terakhir): turun dari atas (dari balik Motto) 0,9 layar sambil flip sekali, lalu berhenti di posisi desain.
- **Footer tersingkap** (`src/js/footer-reveal.js`, acuan sstr.tech, yang menggeser footer −231px → 0): footer mulai 25% tinggi layar lebih tinggi, tersembunyi di belakang Motto atau `.policy`, lalu bergerak lebih lambat dari halaman sampai 0 di akhir halaman (`top bottom` → `bottom bottom`, scrub). Koin footer ikut, karena posisinya diukur dari PNG footer. Reduced motion: tanpa efek.
- Terukur di 1440: footer −256 / −163 / −23 / 0 di 0,9 / 0,6 / 0,3 / 0 layar sebelum akhir. Screenshot: intro (koin menyamping di tengah flip, lalu menghadap), istirahat di pose B, scroll 256 (meluncur di belakang showreel), dan scroll 512 (sudah keluar). Di akhir halaman, koin berhenti di posisi desain footer di belakang Motto.

## Revisi: koreografi scroll yang elegan (28 Okt 2026, disetujui)
Masukan pengguna: tidak suka koin jatuh dan animasinya. Pengguna ingin animasi scroll yang elegan, dengan acuan thewatch.60fps.fr dan drone.riotters.com.

Hasil diskusi dan keputusan:
- Pelajaran dari referensi: objek tidak jatuh atau memantul. Setiap bagian halaman punya pose, scroll mengalir mulus di antaranya dengan kelembaman, dan temponya lambat dan konsisten.
- Koin sebagai "segel" OWW. Geraknya berupa putaran dan luncuran, dan kilau lampu menyapu logam saat koin berputar. Drag dihapus.
- **Hero = perkenalan, satu-satunya momen koin utuh.** Pose B (dipilih pengguna dari 3 screenshot): ukuran desain, (+24, −175) dari posisi desain di 1440, bebas dari showreel dan di samping kolom info.
- **Footer = penutup, sesuai desain** (bagian atas tetap di belakang Motto).

Koreografi (posisi scroll dalam layar; scroll dihaluskan dengan kelembaman ±0,3 detik, kurva `inOut`):
- Saat dimuat: dari posisi menyamping (`rotateX −90°`) berputar menghadap kita, 2 detik, di pose B.
- Hero 0 → 0,25: meluncur turun dari pose B ke posisi desain (di belakang tepi atas showreel).
- Hero 0,25 → 0,6: berputar ke posisi menyamping, memudar di 0,45 → 0,62 (garis tipis lalu hilang).
- Footer (layar terakhir): naik bersama footer dengan sedikit parallax (12% layar), dari menyamping berputar menghadap kita, lalu berhenti di posisi desain. Opacity 0 → 1 di 40% pertama.
- Putaran pelan pada permukaannya sendiri (0,3 rad/s) selama terlihat.

Hasil:
- Screenshot di 1440: intro di pose B (utuh). Scroll 128 / 256 / 384 / 512: turun ke posisi desain, lalu miring sampai menyamping (garis tipis), opacity 1 / 1 / 1 / 0,71, dan 0 di 640. Footer di 0,45 / 0,2 / 0 layar sebelum akhir: miring lalu menghadap, akhirnya di posisi desain di belakang Motto.
- Reduced motion: tanpa lapisan, kedua PNG terlihat. Privacy Policy: koin di footer. Tidak ada scroll horizontal.

## Konsep awal (diganti): "koin yang jatuh menembus halaman"
Satu koin yang sama:
1. Halaman dibuka: koin jatuh dari atas layar dan mendarat di posisi hero, dengan goyangan kecil yang mereda.
2. Scroll ke bawah dari hero: koin jatuh ke bawah lebih cepat dari halaman, miring mengikuti kecepatannya, lalu keluar lewat bawah layar.
3. Section tengah: tidak terlihat, dan render berhenti.
4. Mendekati akhir halaman: koin jatuh masuk dari atas (dari balik Motto) dan mendarat di posisi koin footer.
5. Scroll ke atas: semuanya berbalik.

## Cara kerja
- **Satu lapisan fixed** selebar layar (`.coin-stage`), diletakkan paling awal di `<body>` dengan `z-index: 0`. Elemen yang punya posisi (konten hero, showreel, `.tone-shift`, `.policy`, dan isi footer) tergambar di atasnya, jadi koin tetap di belakangnya. Latar footer menjadi transparan (latar halaman sudah putih), supaya koin footer tidak tertutup.
- Koin selalu di titik asal 3D (lampu dan HDRI sama seperti sebelumnya). Posisinya di layar diatur dengan `camera.setViewOffset`, dan ukurannya dengan `camera.zoom`, dihitung dari kotak PNG (hero dan footer) setiap frame, sehingga cocok di setiap ukuran layar.
- Posisi dan ukuran mengikuti target lewat **pegas** (sedikit underdamped), sehingga menghasilkan jatuh berbobot dan pendaratan dengan goyangan kecil. Kemiringan dan tambahan putaran mengikuti kecepatan jatuh. Putaran idle tetap.
- Drag (mouse) memutar koin saat penunjuk di atas koin dan tidak di atas link atau tombol, lalu kembali dengan pegas.
- PNG disembunyikan sejak gambar pertama, dan kembali kalau WebGL atau model gagal, atau saat reduced motion.
- Satu renderer dan satu kali unduh model. Render berhenti saat koin di luar layar dan diam.

## File
`src/js/coin-3d.js` (pemuat, menggantikan `hero-coin-3d.js`), `src/js/coin-scene.js` (menggantikan `hero-coin-scene.js`), `src/js/main.js`, `src/scss/sections/_hero.scss`, `src/scss/components/_footer.scss`, `src/scss/components/_coin-stage.scss` (baru), dan `src/scss/main.scss`.

## Verifikasi
- [x] Pendaratan saat halaman dibuka (hero), posisi dan ukuran sama dengan PNG di 1440 / 1920.
- [x] Scroll dari hero: koin jatuh keluar, dan tetap di belakang showreel.
- [x] Footer: koin masuk dari balik Motto dan mendarat di posisi PNG footer. Scroll balik juga benar.
- [x] Halaman legal (hanya footer), reduced motion (PNG), GLB gagal (PNG). Tidak ada scroll horizontal. Build tanpa error.

## Hasil
- Ukuran mengikuti rasio layar: three.js menghitung field of view dari focal length dan rasio layar, jadi `zoom = 2,28 × lebar kotak PNG / max(lebar, tinggi layar)`.
- Hero (diam): tinggi 399 / 533px dan pusat (878, 580) / (1171, 774) di 1440 / 1920, dibandingkan PNG 401 / 535 dan (881, 579) / (1174, 772).
- Scroll 200 / 400px: koin jatuh ke bawah di belakang showreel (screenshot). Section tengah: lapisan disembunyikan dan render berhenti.
- Akhir halaman: koin mendarat di posisi PNG footer, bagian atasnya di belakang Motto (screenshot sama dengan PNG). Kembali ke atas: koin kembali ke hero (pusat 878, 580).
- Privacy Policy (hanya footer): koin mendarat di footer, di belakang isi halaman. Reduced motion: tanpa lapisan, kedua PNG terlihat. GLB gagal: kedua PNG kembali (`is-fallback`). Tidak ada scroll horizontal.
- `hero-coin-3d.js` dan `hero-coin-scene.js` (`15-hero-coin-3d.md`) diganti `coin-3d.js` dan `coin-scene.js`. Gaya koin hero dipindah ke `components/_coin-stage.scss`.

### Flip diperlambat (28 Okt 2026, masukan pengguna: terlalu cepat)
- Satu putaran penuh diganti **setengah putaran (180°)** per bagian, dengan jarak scroll yang sama, sehingga putarannya setengah lebih pelan. Intro 2,4 → 3 detik. Sisi belakang koin juga berlogo, jadi setengah putaran tetap rapi (screenshot intro: miring → menghadap → pose B).
- "Rasa melompat" saat scroll: frame rate stabil 60 fps di pengujian (median 16,7 ms, 0 frame > 20 ms di DPR 2), jadi bukan masalah performa. Penyebabnya, halaman bergerak bertahap per putaran roda mouse, sedangkan koin meluncur dengan kelembamannya sendiri, sehingga posisi koin terhadap konten bergeser maju-mundur. Pengguna memilih **A**: koin menempel pada scroll (kelembaman dihapus; pose dihitung dari `scrollY` langsung), sehingga koin selalu bergerak bersama konten di sekitarnya. Intro tetap berbasis waktu.

### Menu bar transparan di posisi paling atas (28 Okt 2026, permintaan pengguna)
- Supaya koin yang turun dari atas tidak terpotong oleh menu bar putih, latar menu bar transparan selama halaman di posisi paling atas (`.site-header:not(.is-scrolled)`), lalu putih lagi begitu di-scroll (transisi 0,4 detik yang sudah ada). Berlaku di semua halaman.
- Terukur: di atas `rgba(0,0,0,0)`, setelah scroll `rgb(255,255,255)`, kembali ke atas transparan. Screenshot intro: koin terlihat utuh melewati area menu, dan teks menu tetap di atasnya.

### Tanpa lompatan: koin mengikuti scroll, smooth scroll, navbar transparan (28 Okt 2026, keputusan pengguna)
- **Koin menempel pada scroll** (opsi A): kelembaman koin sendiri dihapus, dan pose dihitung dari `window.scrollY`. Dengan begitu koin tidak lagi bergeser maju-mundur terhadap konten.
- **Smooth scroll untuk seluruh website** (opsi B, Lenis 1.1.20, `src/js/smooth-scroll.js`): halaman meluncur dengan `lerp 0.1`. ScrollTrigger diperbarui dari Lenis, dan Lenis dijalankan oleh ticker GSAP (satu frame bersama). Semua yang bergantung pada scroll (pin, koin, footer tersingkap) ikut meluncur. Dimatikan untuk reduced motion. Di layar sentuh scroll tetap native (bawaan Lenis). Pop-up showreel menghentikan Lenis saat terbuka (`stopSmoothScroll` / `startSmoothScroll`). CSS dasar Lenis ada di `_reset.scss`.
- **Navbar transparan di paling atas** (`.site-header:not(.is-scrolled)`), supaya koin yang turun dari atas tidak terpotong oleh bar putih. Navbar kembali putih begitu halaman di-scroll.
- Terukur: satu putaran roda (100px) meluncur dalam ±33 frame (11 → 8 → … → 1px per frame, sebelumnya 100px dalam satu frame). What we do dengan roda: kartu berpindah bertahap dan berhenti di zona diam (98 / 88). Motto langkah 3 dan muat ulang tetap di langkah 3 (top 0). Pop-up: scroll terkunci (`lenis-stopped`), lalu normal lagi setelah ditutup. Reduced motion: tanpa Lenis. Halaman legal: smooth scroll aktif.

### Flip hanya oleh scroll, pelan, tanpa patah-patah (28 Okt 2026, masukan pengguna)
- **Intro tanpa flip:** koin memudar masuk sambil turun sedikit (6% layar), 1,8 detik `ease-out`, ke pose B.
- **Flip hanya karena scroll, pelan** (kurva sinus):
  - Hero: setengah putaran sepanjang 0,2 → 1,2 layar scroll (sebelumnya 0,25 → 1), sambil turun 0,6 layar di belakang showreel, lalu memudar di 1 → 1,2.
  - Footer: hanya **seperempat putaran** (dari miring ke menghadap) sepanjang layar terakhir, turun 0,6 layar dari balik Motto, dan memudar masuk di 35% pertama.
  - Putaran pelan pada permukaannya 0,3 → 0,15 rad/s.
- **Penyebab patah-patah:** koin digambar di loop `requestAnimationFrame` sendiri, sedangkan Lenis dan ScrollTrigger berjalan di ticker GSAP. Di sebagian frame koin membaca posisi scroll sebelum Lenis memperbaruinya, jadi tertinggal satu frame lalu menyusul. Sekarang koin digambar di `gsap.ticker` setelah Lenis, jadi selalu dalam frame yang sama dengan halaman.
- Terukur (DPR 2, roda mouse): frame maksimal 16,8 ms, 0 frame > 20 ms, dan tidak ada langkah scroll mundur (langkah 3 → 11 px per frame, halus). Screenshot: intro langsung menghadap (tanpa flip), scroll 300 / 500 miring lalu menyamping di belakang showreel, dan footer berputar seperempat lalu berhenti di posisi desain.

### Rasa scroll disamakan dengan referensi, render koin lebih ringan (28 Okt 2026, masukan pengguna)
- Pengukuran referensi (satu putaran roda): drone.riotters.com dan leoparpeix.com memakai **Lenis** (langkah awal ±0,088 dari jarak, meluncur ±32–37 frame, riotters ±80% jarak roda). sstr.tech tanpa smooth scroll. thewatch.60fps.fr memakai scroll virtual sendiri. Lenis kita sudah aktif (`html.lenis`), dan setelannya disamakan: `lerp 0.085`, `wheelMultiplier 0.9` (sebelumnya 0,1 / 1). Terukur: langkah awal 4 dari 45px (0,089), 0 frame > 20 ms. `window.lenis` tersedia untuk pengecekan di console.
- Catatan: perubahan ini hanya terlihat di server lokal (`npx gulp`) setelah hard refresh, sampai di-commit dan di-push (preview Vercel masih versi lama).
- Render koin: pixel ratio 2 → **1,5**, dan `powerPreference: "high-performance"`. Canvas koin selayar penuh digambar setiap frame saat koin terlihat. Di Retina, 2× berarti ±5 juta piksel per frame dengan pencahayaan studio, yang bisa membuat frame terlewat.

### Satu kali scroll tanpa patah-patah (28 Okt 2026, masukan pengguna)
Pencatatan posisi koin per frame selama satu kali scroll menemukan dua penyebab:
1. **Koin berbalik arah:** koin ditempelkan pada posisi PNG di halaman (yang naik saat di-scroll) sambil diberi gerak turun. Hasilnya koin naik dulu, lalu turun (−3,9 → … → +0,2px per frame).
2. **Posisi scroll dibulatkan browser** ke piksel utuh, jadi ekor luncuran bergerak 1, 0, 1, 0px.

Perbaikan:
- Pose dihitung **di koordinat layar**, dari posisi scroll Lenis (`lenis.animatedScroll`, pecahan piksel).
  - Hero: posisi pose B saat halaman di atas, ditambah 0,4px turun per 1px scroll (showreel naik menutupinya), bergeser ke kolom desain di 0 → 0,5 layar, setengah putaran sepanjang 0 → 1,1 layar, memudar di 0,95 → 1,2.
  - Footer: posisi desain di akhir halaman (posisi dokumen PNG − pergeseran footer saat ini − scroll maksimal), turun 0,6 layar ke sana dengan seperempat putaran.
- Terukur per frame (DPR 2, roda): hero dan footer 0 frame berbalik arah dan 0 frame diam di tengah luncuran, kecepatan mengecil halus (hero 1,75 → 0,13px; footer 5,5 → 0,34px). Posisi istirahat tetap: pose B di atas, dan posisi desain di footer (screenshot).

### Intro: dari atas, kecil ke besar, dengan flip yang melambat (28 Okt 2026, permintaan pengguna)
- Saat dimuat (2,4 detik, `ease-out`): koin turun dari 0,35 layar di atas pose B, membesar dari 35% ke ukuran penuh, dan setengah putaran flip melambat sampai berhenti menghadap depan. Opacity naik di 25% pertama.
- Intro baru dimulai setelah **model dan HDRI sama-sama termuat dan shader sudah dikompilasi** (`renderer.compile` + satu frame tersembunyi; jam intro mulai di frame berikutnya). Sebelumnya gambar pertama yang berat bisa memakan sebagian intro, dan HDRI yang datang belakangan bisa memicu kompilasi ulang di tengah intro.
- Terukur: jam intro mulai dari 0 dan naik rata (0,005 → 0,08 dalam 12 frame, ±16 ms per frame). Screenshot setelah reload: kecil dan miring di atas, lalu menyamping, lalu menghadap dan membesar ke pose B.

### Flip footer melanjutkan flip hero (28 Okt 2026, masukan pengguna)
- Sebelumnya hero berakhir setengah putaran (−180°), sedangkan footer memakai seperempat putaran tersendiri (−90° → 0°), jadi terasa dua gerakan berbeda.
- Sekarang footer **melanjutkan** putaran itu ke arah yang sama dengan kecepatan yang sama (`FLIP × (1 + settle)`: −180° → −360°, menghadap lagi). Hasilnya satu flip penuh yang dimulai di hero dan selesai di footer.
- Screenshot: koin datang dari balik Motto dalam posisi miring (bagian akhir putaran), lalu berhenti menghadap di posisi desain. Sebagian besar putaran di footer terjadi di belakang Motto, karena koin turun 0,6 layar dari balik Motto.
- **Opsi A** (keputusan pengguna, karena flip tidak terlihat di belakang Motto): koin tetap turun dari atas di balik Motto, dan **turunnya selesai tepat saat koin mulai terlihat**. Jarak scroll yang terlihat dihitung dari tepi bawah `main` (section di atas footer) dan bagian bawah koin di akhir halaman (±200px di 1440). **Seluruh setengah putaran kedua terjadi di jarak itu** (`sine`). Screenshot 240 / 180 / 120 / 60 / 0px sebelum akhir: tersembunyi → sisi belakang miring → menyamping → depan miring → menghadap. Karena jaraknya lebih pendek dari bagian hero, flip di footer sedikit lebih cepat.
- **Flip footer diperlambat** (masukan pengguna: terlalu cepat dan terlihat buruk): setengah putaran kedua dibagi dua. Seperempat pertama (terbalik → menyamping) terjadi saat koin turun tanpa terlihat, dan **hanya seperempat terakhir (menyamping → menghadap) yang terjadi di bagian yang terlihat**, dengan kurva `ease-out` yang melambat sampai berhenti. Putaran yang terlihat jadi setengah dari sebelumnya pada jarak yang sama. Screenshot 190 / 150 / 100 / 50 / 0px sebelum akhir: tersembunyi → mulai muncul miring → membuka → hampir menghadap → menghadap.
- **Seperempat terakhir dengan waktunya sendiri** (masukan pengguna: saat ke footer flip tidak terlihat, justru terlihat saat naik). Pengukuran per frame dengan roda mouse: saat turun koin terlihat 231 frame, tapi putarannya hanya 22 frame (±0,35 detik), karena jarak yang terlihat (±200px) dilewati di tengah luncuran yang masih cepat. Saat naik, scroll mulai dari diam, jadi flip-nya terlihat. Sekarang seperempat terakhir (menyamping → menghadap) **berjalan dengan waktunya sendiri** begitu koin terlihat (`remaining < 85%` jarak terlihat): 1,6 detik `power2.out`, dan berbalik 0,8 detik saat scroll naik melewati tepi itu. Seperempat pertama tetap mengikuti scroll saat tidak terlihat. Terukur saat turun: putaran terlihat selama 80 frame (±1,3 detik) dan berhenti tepat menghadap (−2π).

### Hero: berhenti di posisi dan ukuran Figma (28 Okt 2026, permintaan pengguna)
- Pose B (koin utuh di atas showreel) tidak dipakai lagi. Koin turun dari atas (membesar dari 35% dengan flip yang melambat) lalu **berhenti di posisi koin Figma** (kotak `img.hero__coin`, bagian bawahnya di belakang showreel), dengan ukuran yang sama. Scroll tetap: turun 0,4px per 1px scroll di belakang showreel, setengah putaran.
- Terukur saat diam dibandingkan PNG Figma: 1440 → tinggi 399 vs 401px, pusat (878, 580) vs (881, 579); 1920 → 533 vs 535px, (1171, 774) vs (1174, 772). Lebar 3D sedikit lebih besar karena sudut model dan putaran pelannya.
- **Sudut seperti foto Figma** (permintaan pengguna): koin dimiringkan ke belakang 55° (sebelumnya 45° dari skrip pengguna), jadi bentuknya lebih sempit dan tepi kirinya terlihat seperti di Figma. Dicoba 4 sudut lain; dengan 55°, lebar (x 740–1010 di 1440) dan tepi atas (±y 380) sama dengan foto Figma. Logo di tengah bisa sedikit berbeda arah karena putaran pelan koin.
