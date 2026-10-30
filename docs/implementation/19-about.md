# 19 — Halaman About

Status: **Selesai (30 Okt 2026), menunggu review**
Figma: "About" 1734:317 (1440 × 7122), di section "About" 1734:541 (halaman "Phase - 4 (Final)"). Hanya desktop.

## Isi halaman (dari Figma, urut dari atas)
1. **Menu bar**: memakai `header.pug` yang sudah ada (menu "About" aktif).
2. **Intro**
   - Judul "We Are the Team We Wished / We Could Hire." General Sans 42, −3%, #111, di 40,144.
   - Foto tim 1360 × 560 di y 313.
   - Dua paragraf Inter Medium (18 dan 14, 160%, −2%, #555), lebar 1015.
   - Tombol "Schedule a call" (#111, radius 4, Inter Medium 18 putih) dan "Free 15min call" (14, 50%). Pola tombolnya sama dengan Contact.
3. **Principles** (1440 × 820, latar #111)
   - Kiri (600): kalimat pembuka General Sans 28 / 140%, putih.
   - Angka 01–06 Inter Medium 18: yang aktif 100%, lainnya 20%.
   - Judul "(…)" 18 dan deskripsi 14.
   - Kanan: ilustrasi 670 × 420 (latar hitam dengan gradasi).
4. **Galeri foto**: 5 foto dengan tata letak acak (1130 × 636, 460 × 589, 805 × 411, 345 × 325, 920 × 478). Foto pertama punya label "Play Video".
5. **Tim**
   - Kalimat pembuka (Inter Medium 18, #555, lebar 900).
   - Daftar 32 nama + jabatan (baris 22px, garis pemisah, kolom jabatan di x 462).
6. **Footer**: memakai `footer.pug` yang sudah ada.

## Principles: yang ada di Figma
- **6 frame** "Principles - 1…6": hanya angka aktif dan ilustrasinya yang berbeda.
- **Teks:**
  - 01 dan 02 punya teks sendiri:
    - 01 "Execution Over Overhead"
    - 02 "Frictionless Infrastructure"
  - 03–06 masih salinan teks 01.
- **Ilustrasi:**
  - Hanya **P-1** yang sudah didesain (vektor: papan kanban).
  - Ada storyboard geraknya, "Motion-01", dengan 7 langkah: kartu diangkat dan dipindah, progress 40% → 100%, lalu papan mengecil ke tampilan mobile dengan centang hijau.
  - Ada juga versi kedua yang diawali logo Figma, Webflow, dan ClickUp.
- **Principles 2–6** memakai screenshot "CleanShot" (terlihat seperti referensi). Frame P-2…P-6 masih kosong.

## Usulan perilaku scroll Principles
- Section **di-pin** selama 6 × 70% tinggi layar.
- Setiap bagian scroll mengaktifkan satu prinsip:
  - Angka aktif berganti.
  - Judul dan deskripsi berganti dengan memudar dan naik sedikit.
  - Ilustrasi berganti dengan memudar.
- Pergantian berjalan dengan jam sendiri (±0,5 detik) agar tidak tersendat oleh scroll. Mundur ke atas akan membalik urutannya.
- Angka 01–06 bisa diklik untuk melompat ke prinsip itu (scroll ke posisinya).
- Tanpa JS: hanya 01 yang tampil. Reduced motion: pergantian langsung, tanpa animasi.

## File
| File | Perubahan |
|---|---|
| `src/pug/pages/about.pug` | Halaman baru |
| `src/scss/pages/_about.scss` (atau `sections/`, mengikuti Contact) | Style halaman |
| `src/js/principles-scroll.js`, `src/js/main.js` | Pin dan pergantian prinsip |
| `src/pug/partials/header.pug`, `footer.pug` | Link About ke `about.html` |
| `src/assets/images/about/` | Foto dan ilustrasi dari Figma |
| `src/scss/components/_glass-button.scss`, `_hero.scss`, `hero.pug` | Tombol kaca bersama (hero dan galeri) |

## Langkah (per bagian, dicek di browser setiap selesai)
- [x] 1. Aset: foto intro dan 5 foto galeri (`src/assets/images/about/`, potongan sesuai Figma, 2×). Ilustrasi Principles menyusul di langkah 3.
- [x] 2. Halaman dan Intro.
  - Diukur di 1440: judul 40,144; foto 40,313 (1360 × 560); paragraf y 928 dan 1006; tombol 40,1090 (165 × 42); caption 221,1099. Section berakhir di y 1332, tempat Principles mulai. Semua sama dengan Figma.
  - Foto hanya membulat 4px di sudut kiri, mengikuti Figma.
  - Halaman berada di atas footer (seperti Contact), supaya koin footer lewat di belakangnya.
  - Link About di menu bar dan footer sekarang ke `about.html`.
- [x] 3. Principles: tampilan statis prinsip 01 dibandingkan dengan Figma.
  - Diukur di 1440 (dari atas section): teks pembuka 40,238; angka y 440; judul 489; deskripsi 538; ilustrasi 730,200 (670 × 420); papan 130,41 di dalamnya. Sama dengan Figma.
  - Ilustrasi 01 dibuat dalam HTML/CSS dari "P-1.3" (1785:3145), dengan aset SVG Figma di `src/assets/images/about/principles/`. Di dalam `.p-board`, 1em = 1 piksel Figma.
  - Kartu yang diangkat diberi latar tidak tembus, karena di render Figma kartu di bawahnya tidak terlihat.
  - Ilustrasi 2–6 berupa gambar sementara `principle-2…6.jpg`. Keenam teks dan gambar sudah ada di halaman, tapi hanya 01 yang tampil.
  - Teks "Impot/Export" mengikuti Figma.
- [x] 4. Principles: pin dan pergantian dengan scroll (`src/js/principles-scroll.js`).
  - Section setinggi minimal satu layar, dengan isinya di tengah (200px di atas dan bawah, seperti Figma). Section di-pin di tengah layar, dan setiap prinsip mendapat 0,7 tinggi layar scroll.
  - Saat prinsip berganti, teks lama memudar ke atas (0,3 detik), lalu teks baru naik masuk (0,5 detik); arahnya terbalik saat scroll naik. Gambar memudar silang (0,4–0,5 detik). Angka aktif berganti (0,4 detik).
  - Klik angka meluncur ke prinsip itu (1,2 detik).
  - **1 usapan = 1 prinsip** (keputusan pengguna 30 Okt 2026, karena scroll bebas sering melewati satu prinsip).
    - Selama section ditahan, event roda ditangkap sebelum Lenis. Event pertama dari satu usapan meluncurkan halaman ke prinsip berikutnya (0,9 detik). Selama meluncur, semua event ditahan.
    - Setelah itu, sisa usapan yang sama diabaikan: inersia trackpad yang terus melemah, atau roda yang terus diputar.
    - Usapan baru dikenali bila roda diam 180 ms, atau bila event tiba-tiba menguat (lebih dari 1,5× event sebelumnya).
    - Perbaikan (laporan pengguna: "scroll berkali-kali tidak pindah"):
      - Versi pertama menunggu jeda 180 ms. Inersia trackpad bisa berlangsung 1–2 detik, jadi usapan baru ikut diabaikan.
      - Status meluncur bergantung pada `onComplete` Lenis dengan `lock`, dan bisa tertahan. Sekarang memakai timer.
    - Masuk dari atas selalu mendarat di 01, dan dari bawah di 06. Dari 06 ke bawah atau dari 01 ke atas, scroll kembali bebas.
    - Masuk ke section memakai scroll halus Lenis biasa, yang boleh berlanjut 6% tinggi layar ke dalam pin (tidak terlihat). Section sedikit melambat saat datang, lalu menempel dengan gerak pelan. Dari bawah sama, ke 06.
      - Versi 1: diluncurkan 0,9 detik ke tengah 01. Kecepatan berubah mendadak.
      - Versi 2: berhenti tepat di awal pin. Terasa direm ("terlalu halus").
      - Versi 3: sisa usapan berlanjut sampai 90% bagian 01. Menempel saat masih cepat (6–12 px per frame), terasa "sedikit kasar".
      - Diukur per frame (versi sekarang): sekitar 4–5 px per frame saat menempel. Tetap di 01, dan usapan berikutnya pindah ke 02.
    - Layar sentuh dan keyboard tetap scroll bebas.
    - Diuji dengan simulasi:
      - Usapan trackpad dengan inersia ±1,6 detik, beruntun tanpa jeda: 4 usapan menghasilkan 01→02→03→04.
      - Notch roda satu per satu: 05, 06, lalu keluar.
      - Roda diputar terus ke atas (8 notch): mundur satu prinsip saja.
  - Storyboard P-1 (±4,7 detik) dimainkan saat section masuk layar (`top 60%`) dan setiap kali kembali ke 01. Kembali ke posisi awal saat di-scroll ke atas section. Bila dibuka atau dimuat ulang lebih ke bawah, papan langsung tampil di langkah terakhir.
  - Frame storyboard di Figma tidak sepenuhnya konsisten (ada kartu yang muncul dan hilang antar-frame), jadi kartu yang tidak ada di frame berikutnya dibuat memudar.
  - Reduced motion: pergantian langsung, dan papan selalu di langkah terakhir.
  - Tanpa JS: hanya prinsip 01 yang tampil, tanpa pin. Ini berbeda dari rencana awal, karena menampilkan keenamnya akan mengubah tata letak Figma.
  - Diuji: pergantian 01→02→06, keluar dari pin, klik angka 04, muat ulang di 04 (sempat salah lalu diperbaiki), kembali ke 01 (storyboard mulai lagi), reduced motion, 1280 × 720, dan homepage/Contact tanpa error.
- [x] 5. Galeri foto.
  - Diukur di 1440 (dari atas galeri): foto 0,0 (1130 × 636); 900,716 (460 × 589); 0,988 (805 × 411); 0,1479 (345 × 325); 440,1650 (920 × 478). Tinggi galeri 2128, jarak 201 dari Principles. "Play Video" 505,296 (120 × 44). Semua sama dengan Figma.
  - "Play Video" hanya label, belum ada aksinya.
  - Tampilan kaca tombol "Play Showreel" di hero dipindah ke komponen bersama `components/_glass-button.scss` (`.glass-button`), dipakai di hero dan galeri. Posisi tombol hero tetap di `_hero.scss`, dan tampilannya tidak berubah.
- [x] 6. Daftar tim.
  - Diukur di 1440 (dari atas kalimat pembuka): kalimat 40,0 (900 × 58); baris pertama y 138; baris kedua y 192 (selisih 54); baris terakhir y 1812; garis terakhir y 1850. Jabatan di x 502 (462 dari nama). Jarak 100 dari galeri dan 128 ke footer. Semua sama dengan Figma.
  - Nama dan jabatan mengikuti Figma, termasuk "Jr. UIX Desiger".
- [x] 7. Build; cek di 1280 / 1440 / 2560, juga muat ulang di tengah halaman. Tidak ada scroll horizontal dan tidak ada error. Homepage dan Contact tetap normal.

## Kriteria selesai
- Posisi dan ukuran di 1440 sama dengan Figma (dicek dengan screenshot).
- Principles berganti 01 → 06 saat scroll turun, dan kembali saat scroll naik. Tidak ada lompatan saat masuk atau keluar pin.
- Halaman lain tidak berubah. Tidak ada scroll horizontal.

## Keputusan pengguna (30 Okt 2026)
1. **Teks 03–06:** pakai teks Figma dulu (sama dengan 01). Diganti saat teks finalnya ada.
2. **Ilustrasi 2–6:** screenshot dari Figma sebagai gambar sementara.
3. **Animasi P-1:** mengikuti storyboard Motion-01. Main otomatis sekali (±3–4 detik) saat prinsip 01 aktif, lalu berhenti di frame terakhir. Dibuat sebagai HTML/SVG, bukan gambar.
4. **"Play Video":** label saja dulu, tanpa aksi.

## Belum jelas
- Link "Schedule a call": sementara ke `contact.html` (Calendly menyusul, seperti di Contact).

## Tambahan: animasi scroll galeri (permintaan pengguna, 30 Okt 2026)
Tidak ada di Figma. Referensinya fluid.glass dan art-yakushev.com, dan pengguna memilih arah D: terbuka + parallax. Tata letak foto tetap seperti Figma.
- **Terbuka:** setiap foto terbuka dari celah tipis horizontal di tengahnya (clip-path), sambil gambarnya turun dari zoom 125% ke 100%. Animasi ini terikat scroll, dari foto masuk di bawah layar sampai bagian atasnya di 45% layar. Label "Play Video" muncul setelah foto pertama terbuka.
- **Parallax:** setiap foto naik dengan kecepatannya sendiri selama melintasi layar (20–70 px), supaya terasa berlapis. Selisihnya dijaga di bawah 80px, yaitu jarak antar-foto yang bertumpuk, supaya foto tidak saling menimpa.
- Scroll tetap bebas. Tanpa JS atau dengan reduced motion: foto diam seperti Figma.
- File: `src/js/about-gallery.js` (baru), `src/js/main.js`.
- [x] Dibuat dan dicek di browser (urutan frame saat scroll, muat ulang di tengah galeri).
  - Diukur saat scroll: foto ke-3 dengan bagian atas di 814px masih tertutup 29% di atas dan bawah dengan zoom 1,15. Pada 500px tinggal 0,6%, dan zoom 1,00.
  - Parallax berjalan: misalnya foto ke-2 +26px, foto ke-3 +22px, dan foto pertama −11px di saat yang sama.
  - Tidak ada error. Setelah muat ulang di tengah galeri, foto tampil sesuai posisi scroll.
- **Tambahan kedua** (pengguna: "cukup bagus, tapi masih kurang"; dua pilihan dari usulan):
  - **Gambar bergeser di bingkainya:** gambar dibuat 115% dari bingkainya (saat terbuka, zoom turun dari 135% ke 115%). Selama bingkainya naik melintasi layar, gambar turun pelan dari −6% ke +6%.
  - **Arah terbuka berbeda-beda:** foto besar di atas terbuka dari pita tengah (horizontal), potret di kanan dari kanan, foto lebar di kiri dari kiri, foto kecil di kiri bawah dari bawah, dan foto lebar di kanan bawah dari pita tengah (vertikal).
  - [x] Dicek: arah terbuka setiap foto benar (frame dan nilai clip-path). Di semua posisi, gambar selalu menutupi bingkainya tanpa celah. Tidak ada error.
- **Revisi** (pengguna: arah terbuka berbeda-beda terasa ramai, ingin yang elegan dan mulus seperti art-yakushev):
  - **Muncul:** semua foto memakai tirai dari bawah (pilihan pengguna). Foto terbuka dari tepi bawah ke atas sambil zoom turun dari 135% ke 115%.
  - **Scroll:** gambar di dalam bingkai sekarang naik (+6% → −6%) selama bingkai melintasi layar, sedikit lebih cepat dari bingkainya, jadi terasa muncul dari bawah. Sebelumnya gambar turun.
  - Parallax antar-foto (20–70 px) tetap.
  - [x] Dicek di 13 posisi scroll: semua foto terbuka dari bawah (clip-path atas dari 100% ke 0%), gambar terus naik, dan bingkai selalu tertutup gambar. Tidak ada error.
- **Revisi gerak per foto** (pengguna: geraknya sama semua, ingin cukup acak). Setiap foto sekarang punya nilai sendiri. Nilainya tetap (tidak diacak setiap kunjungan):

  | Foto | Naik (px) | Geser gambar | Terbuka penuh di |
  |---|---|---|---|
  | 1 | 80 | 5% | 45% |
  | 2 | 120 | 9% | 55% |
  | 3 | −20 (tertinggal) | 4% | 40% |
  | 4 | 20 | 8% | 60% |
  | 5 | −40 (tertinggal) | 6% | 50% |

  - Nilai naik dibuat zig-zag, dan dipilih dengan simulasi supaya foto yang bertumpuk (jarak 80px) tetap berjarak minimal 40px di layar setinggi 720–1100px.
  - Zoom dinaikkan ke 140% → 120%, memberi ruang geser sampai 10%.
  - [x] Dicek di browser (60 posisi scroll, tinggi layar 900 dan 720): jarak terdekat 40px, dan gambar selalu menutupi bingkai.
- **Revisi: mengikuti art-yakushev.com** (permintaan pengguna). Pola diambil dari skrip referensi (kartu portofolio): bingkai naik saat melintasi layar, kartu kecil lebih cepat dari kartu besar, gambar di dalamnya bergerak berlawanan (turun), scrub 0,5.
  - Foto besar (1, 3, 5): bingkai ±96 px, gambar ±9% (turun).
  - Foto kecil (2, 4): bingkai ±150 px, gambar ±9%.
    - Referensi memakai ±400 px karena kartu kecilnya bersebelahan, tidak bertumpuk. Di sini ±400 px akan menimpa foto di atasnya sampai 224 px.
    - Pengguna memilih versi aman (±150 px, jarak terdekat 26 px).
  - Tirai dan zoom-saat-terbuka dihapus, karena referensi tidak memakainya (keputusan pengguna). Gambar tetap 120% dari bingkainya, dan bingkai sekarang `overflow: hidden`.
  - Nilai per foto dan arah terbuka yang berbeda-beda dari revisi sebelumnya diganti oleh pola ini.
  - [x] Dicek: posisi dan ukuran bingkai sesuai Figma. Jarak terdekat foto bertumpuk 26 px di layar setinggi 900 dan 720, gambar selalu menutupi bingkai, dan tidak ada error.
- **Revisi: kartu melesat seperti referensi** (pengguna: "belum melihat hal serupa dengan referensi"; memilih "melesat, tata letak sedikit dirapikan").
  - Menggeser foto kecil ke samping tidak cukup:
    - Di samping foto pertama (1130 px) hanya tersisa 230 px, sedangkan foto potret lebarnya 460 px.
    - Foto kecil kiri bawah akan menabrak foto terakhir.
  - Karena itu jarak vertikal ditambah 300 px di atas setiap foto kecil (dari simulasi: tambahan terkecil yang aman).
  - Posisi y sekarang: foto 2 di 1015,63, foto 3 di 1288, foto 4 di 2079, foto 5 di 2250. Tinggi galeri 2728 (Figma 2128). Posisi x dan ukuran tetap seperti Figma.
  - Foto kecil bergerak ±400 px seperti referensi, dan foto besar ±96 px.
  - [x] Dicek di browser: jarak terdekat semua pasangan yang bertumpuk 76 px (tinggi layar 900 dan 720), gambar selalu menutupi bingkai, dan tidak ada error. Rangkaian screenshot memperlihatkan foto kecil menyalip foto besar di sampingnya.
- **Revisi: jalan tengah** (pengguna: tambahan 300 px menimbulkan ruang kosong yang lebar).
  - Tambahan dikurangi jadi 150 px di atas setiap foto kecil, dan foto kecil bergerak ±290 px (pilihan pengguna dari tabel: tambahan 0 → ±140, 100 → ±240, 150 → ±290, 300 → ±400).
  - Posisi y sekarang: foto 2 di 865,63, foto 3 di 1138, foto 4 di 1779, foto 5 di 1950. Tinggi galeri 2428.
  - [x] Dicek di browser: jarak terdekat 36 px (tinggi layar 900 dan 720), gambar selalu menutupi bingkai, dan tidak ada error.
- **Dikembalikan** (pengguna: "kembalikan 2x sebelum ini") ke pola referensi dengan jarak persis Figma: foto kecil ±150 px, foto besar ±96 px, tinggi galeri 2128. Tambahan jarak 300 px dan 150 px di atas dibatalkan.
  - [x] Dicek: posisi y kembali seperti Figma, jarak terdekat 26 px, gambar menutupi bingkai, dan tidak ada error.
- **Tambahan: fokus saat mendekat** (saran no. 1, dipilih pengguna).
  - Gambar masuk buram (12 px) dengan warna pudar (saturasi 35%), lalu jadi tajam dan berwarna penuh saat titik tengah foto di 60% tinggi layar. Saat meninggalkan layar, foto tetap tajam. Scrub 0,5, sama dengan gerak melayang.
  - [x] Dicek: nilai blur dan saturasi turun bertahap sesuai posisi (misalnya foto 1 di 771 px: 8,6 px / 0,53; di 490 px: 2,7 px / 0,85; di tengah: 0 / 1). Tepi bingkai bersih, tanpa pinggiran putih. Saat scroll berjalan 4 detik, frame stabil di 16,7 ms (60 fps), dan tidak ada error.
  - **Revisi** (pengguna: buramnya hampir tidak terlihat). Kurva `power1.out` membuat buram hilang paling cepat saat foto baru muncul di bawah layar. Sekarang memakai `power2.in` (buram bertahan lama, lalu menajam di akhir), buram awal 20 px, dan fokus penuh tepat di tengah layar (50%).
    - Diukur pada foto 1 (posisi atas → blur/saturasi): 715 px → 19,8/0,35; 546 → 18,7/0,39; 377 → 15,8/0,48; 208 → 10,2/0,66; 40 → 1,1/0,96.
  - **Dikembalikan** (pengguna: "kembali ke sebelumnya") ke buram 12 px, `power1.out`, dan fokus penuh di 60%.
- **Pengganti blur: hitam-putih → berwarna** (pilihan pengguna).
  - Gambar masuk hitam-putih, lalu warnanya terisi merata (`power1.inOut`) sampai titik tengah foto di 55% tinggi layar. Saat meninggalkan layar, warna tetap penuh. Efek blur dihapus.
  - [x] Diukur (grayscale foto 1 menurut posisi atasnya): 715 px → 0,90; 546 → 0,64; 377 → 0,27; 208 → 0,05; 40 → 0. Screenshot memperlihatkan foto yang baru masuk hitam-putih, sedangkan foto di atasnya sudah berwarna. Tidak ada error.
- **Pengganti hitam-putih: tirai dari bawah** (permintaan pengguna), digabung dengan gerak melayang.
  - Foto terbuka dari tepi bawah (clip-path atas 100% → 0%) sambil zoom turun dari 135% ke 120%. Foto terbuka penuh saat bagian atasnya di 45% tinggi layar. Scrub 0,5. Efek hitam-putih dihapus.
  - [x] Diukur pada foto 1 (posisi atas → sisa tirai, zoom): 771 px → 49%, 1,27; 602 → 11,5%, 1,22; 433 → 0,6%, 1,20. Foto 2 dan 3 sama polanya.
  - Selama tirai masih menutup penuh, zoom belum diterapkan (tidak terlihat). Begitu tirai mulai terbuka, gambar selalu menutupi bingkai. Tidak ada error.
  - **Lebih lambat** (pengguna): tirai sekarang terbuka penuh di 30% tinggi layar (sebelumnya 45%), jadi jarak scroll-nya sekitar 27% lebih panjang.
