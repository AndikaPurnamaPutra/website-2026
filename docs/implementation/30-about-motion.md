# 30 — Halaman About: animasi dan interaksi

Branch: `about/v1` (dari `contact/v1`). Figma tidak punya animasi untuk About
(kecuali storyboard papan Principles 01), jadi semuanya memakai bahasa gerak
yang sudah ada di Home dan Contact. Dikerjakan satu bagian per langkah; setiap
langkah dicek di browser dan disetujui sebelum lanjut.

## Langkah

### 1. Animasi masuk Intro
Sama seperti Contact (`src/js/contact-intro.js`), saat halaman dibuka:
- Judul "We Are the Team…" naik baris per baris dari balik jendelanya.
- Foto tim terbuka dari bawah (seperti gambar Our Work dan foto kantor di
  Contact), gambarnya sedikit turun ke tempatnya.
- Lead, catatan, tombol "Schedule a call" dan "Free 15min call" naik satu per
  satu. Bagian ini ada di bawah foto, jadi bisa di luar layar pertama: dimainkan
  saat masuk layar.
- Disembunyikan oleh CSS sampai skrip siap (seperti `is-contact-ready`), agar
  tidak berkedip. Dengan reduced motion tidak ada gerak.

File: `src/js/about-intro.js` (baru), `src/js/main.js`, `src/scss/pages/_about.scss`.

### 2. Daftar Tim
- Lead naik baris per baris saat masuk layar.
- Baris tim muncul berurutan saat di-scroll: garis bawah tergambar dari kiri,
  nama dan peran naik.
- Hover: baris yang di-hover tetap penuh, baris lain meredup (sama seperti
  link navbar, mega menu dan footer).

File: `src/js/about-team.js` (baru) atau digabung ke `about-intro.js`,
`src/js/main.js`, `src/scss/pages/_about.scss`.

### 3. Principles: diselaraskan dengan Services
Masukan pengguna: terasa berat. Scroll tertahan (satu usapan = satu prinsip),
patah-patah, terlalu panjang, dan pergantian teksnya kurang hidup. Acuan:
section Services di homepage (`src/js/services-scroll.js`).

Rencana (`src/js/principles-scroll.js`, `src/scss/pages/_about.scss`):
- **Scroll bebas.** Kunci roda/usapan dihapus (penangkap wheel, glide, entry
  carry). Prinsip berganti sesuai posisi scroll, seperti kartu Services; setiap
  prinsip punya zona diam singkat. Keyboard dan layar sentuh tetap normal.
- **Lebih pendek.** Panjang pin dihitung ulang: sekitar 0,5 layar per prinsip
  (sekarang 0,7 dengan kunci; Services 1,1 per langkah, tapi kartunya lebih
  banyak teks). Total sekitar 3 layar untuk 6 prinsip; diukur dan disesuaikan.
- **Pergantian teks seperti Services.** Judul dan deskripsi baru naik baris per
  baris dari balik jendelanya (1 dtk, power3.out); yang lama naik keluar.
  Angka aktif tetap menyala; garis angka bergeser.
- **Ilustrasi seperti tirai Services.** Ilustrasi baru terbuka dari bawah
  (clip-path) sementara gambarnya naik sedikit; yang lama tetap di bawahnya.
- **Keluar seperti Services.** Di akhir pin, section sudah ikut naik bersama
  halaman, tidak tertahan lalu lepas.
- **Lag.** Papan 01 menggerakkan posisi/ukuran (custom properties ke
  `left`/`width`) dan `filter` drop-shadow tiap frame. Diukur dulu (waktu
  frame saat scroll); jika berat, gerak diubah ke `transform` dan bayangan ke
  `opacity`, tanpa mengubah urutan storyboard.
- Klik angka tetap meluncur ke prinsipnya. Reduced motion: langsung berganti.

### 4. Galeri foto
Sudah ada: foto melayang dengan kedalaman berbeda, blur dan hitam-putih ke
warna. Perlu masukan pengguna; kemungkinan interaksi hover pada label
"Play Video" agar selaras dengan tombol lain.

## Cek
- [x] 1. Intro: build, urutan frame di browser (judul naik, foto terbuka dari
      bawah, teks di bawah foto naik saat di-scroll), muat ulang di tengah
      halaman tetap di posisinya, tanpa error.
- [ ] 2. Tim: build, scroll dan hover dicek di browser, tanpa error.
- [x] 3. Principles: scroll bebas tanpa kunci; pergantian teks dan tirai
      ilustrasi dicek per frame (tirai mulai di frame yang sama dengan
      pergantian); pin 0,8 layar per prinsip, 5,2 layar termasuk keluar; teks 1,15 dtk, tirai 1,1 dtk (lebih cepat terasa terlalu cepat, 0,85 / 1,3 / 1,25 sedikit berat; pengguna);
      waktu frame saat scroll 16,7 ms (60 fps, papan 01 tidak perlu diubah);
      keluar naik 180 px bersama halaman; scroll balik, klik angka, muat ulang
      di tengah; tanpa error.
- [ ] 4. Galeri: sesuai masukan.
- [ ] Lighthouse About tidak turun (sekarang desktop 89 / 96 / 96 / 100).

## Belum jelas
- Principles dan Galeri: apa yang ingin diubah?
