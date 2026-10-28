# 17 — Halaman Contact

Status: **Selesai (28 Okt 2026), menunggu review**
Figma: "Contact - Idle" 1611:1042 (1440 × 3058). Desktop dulu (belum ada breakpoint mobile di proyek ini, sama seperti halaman lain).

## Frame acuan
| Kondisi | Node |
|---|---|
| Awal | 1611:1042 |
| Hover input | 1611:1972 |
| Formulir terisi, belum pilih Project Type | 1611:2162 |
| Inquiries dipilih + dropdown Turnaround | 1611:2643, 1611:6250, 1611:6525 |
| Inquiries "Others" + kolom deadline | 1611:6716 |
| Partnership dipilih + dropdown | 1611:7000, 1611:7184 (daftar pilihan yang benar), 1611:7579 |
| Upload berjalan / selesai | 1611:2969, 1611:4948, 1611:5143 |
| Error | 1611:5344 |
| Submit hover / terkirim | 1611:5630, 1611:5825 |

## Keputusan pengguna (28 Okt 2026)
1. **Pengiriman: (A) tampilan dan interaksi dulu.** Submit disimulasikan dan tidak ada data yang dikirim. Pengiriman sungguhan (layanan form atau Vercel) dibuat di tahap berikutnya.
2. **Cloudflare Turnstile belum ada.** Yang dipasang gambar dari Figma (1611:1196, 297 × 63) sebagai placeholder. Verifikasi asli dipasang bersama pengiriman sungguhan.
3. **Upload:** progress bar berjalan 0% → 100% (disimulasikan), lalu kartu file berubah menjadi "… 100% uploaded" dengan tombol × untuk menghapus.
4. **Turnaround:**
   - Inquiries: 1 Week, 2-4 weeks, >4 weeks, Others. Kalau "Others" dipilih, muncul input "write your deadline".
   - Partnership: daftar di frame 7184 (lihat Detail kondisi).
5. **Kolom kiri sticky** saat formulir di kanan di-scroll.

## Usulan bawaan (disetujui pengguna, 28 Okt 2026)
- Turnaround **baru muncul setelah Project Type dipilih**, seperti di frame 1972/2162.
- Ikon (i) Project Type menampilkan tooltip pendek. Teksnya **bukan dari Figma** dan perlu dicek pengguna.
- "Schedule a call" sementara memakai `#`. "Office HQ ↗" membuka Google Maps dengan alamat dari Figma (tab baru).
- Typo diperbaiki: "Parnertship" → "Partnership", placeholder Email → "Your email", budget "$20K - $10K USD" → "$10K - $20K USD".
- Deretan foto proyek diam (sesuai desain).
- CTA "Get a Quote" / "Let's Talk" di homepage diarahkan ke `contact.html`.

## Isi halaman (dari Figma 1611:1042)
- **Menu bar** biasa (partial `header`).
- **Konten** 1360 lebar, mulai y 144, dua kolom berjarak (justify-between):
  - **Kiri** (478, sticky): H1 General Sans 42 / tracking −1.26 "We'd love to hear from you. Tell us all the things."; deskripsi Inter Medium 14/1.6 #555; jarak 20, lalu 40 ke CTA "Schedule a call" (`.button`, 18) + "Free 15min call" (14/1.7, opacity .5, jarak 16). Blok bawah (381, 309 di bawah blok atas): foto 210 × 122 radius 4; jarak 35; "Office HQ" Inter Medium 14/1.6 + ikon panah 20px (#f6f6f6, radius 4); alamat Inter 14/1.6 opacity .5 (jarak 8); jarak 35; catatan Inter 13/1.7 #888 dengan email bergaris bawah #111.
  - **Kanan** kartu 786, putih, radius 8, padding 32, `drop-shadow(0 0 10px rgba(0,0,0,.05))`. Isi 722 lebar, jarak 40:
    - "Start a project?" General Sans 28 / 1 / tracking −1.12.
    - Field (jarak 40 antar-field, 16 label → isi): label Inter Medium 14/1.7 dengan `*` merah; input General Sans 20 / 1 / tracking −0.8, placeholder opacity .2, jarak 12 ke garis bawah.
    - Company Name\*, Your Name\*, Email\*.
    - Project Scope\* (pilih banyak): 12 chip, border 1px #cacaca, radius 4, padding 10/16, Inter 16 / 1 / −0.64, jarak 16 (wrap).
    - Project Budget (USD) (pilih satu): 5 chip.
    - Project Type\* + ikon (i) 24px (jarak 4): Inquiries / Partnership (pilih satu).
    - Turnaround\*: "Select timeline" + caret 24px, dropdown.
    - "Tell us about your project...": textarea tinggi 137, penghitung "0/200" Inter 12/1.6 opacity .5 di kanan bawah.
    - Document Attachment: kotak #f6f6f6, 0.5px dashed #cacaca, radius 4, padding 20/24; ikon FileArrowUp 32 + "Drag and drop here or click to upload" (13/1.5) / "PDF, DOC, PPTX or Media (max. 100mb)" (12/1.5 #888).
    - Garis pemisah, placeholder Turnstile 297 × 63.
    - Baris submit: tombol outline 156 (1px #111, radius 4, padding 10/20, Inter Medium 18) + catatan 13/1.7 opacity .5 dengan link "Privacy Policy" (→ `privacy-policy.html`).
- **Deretan foto** 128 di bawah konten: 6 gambar (210×281, 210×229, 440×480, 325×200, 210×229, 210×168), jarak 20, lebar total 1427 di tengah (keluar sedikit dari tepi kanan; dipotong).
- **Footer** biasa, 80 di bawah deretan foto (koin footer ikut, sama seperti di halaman lain).

## Detail kondisi (dari Figma)
Dibaca dari properti layer (28 Okt 2026).
- **Dasar:**
  - Bayangan kartu `0 0 20px rgba(0,0,0,.05)`.
  - Garis bawah input #cacaca 0.5px.
  - Tanda `*` #ff0000.
  - Placeholder input General Sans Regular 20, opacity .2. Isi input General Sans **Medium** 20, #111.
- **Hover input** (1972): garis bawah #111, tebal tetap 0.5.
- **Chip terpilih:** latar #111, border #111, teks putih Inter **Medium** 16.
- **Dropdown Turnaround** (2643/6716/7184):
  - Panel lebar penuh (722), 8px di bawah garis.
  - Latar putih, radius 8, padding 16, bayangan sama dengan kartu.
  - Item General Sans Medium 16, jarak 16. Item terpilih opacity 1, item lain .5, tanpa latar sorot.
  - Caret tetap (tidak berputar).
- **Others** (Inquiries, 6716): input "write your deadline" di dalam panel, 16px di bawah "Others". Lebar 690, General Sans 20, placeholder opacity .2, garis #cacaca 0.5.
- **Daftar Turnaround:**
  - Inquiries: 1 Week, 2-4 weeks, >4 weeks, Others.
  - Partnership (7184, Figma terbaru): 1-3 requests / week, 5-10 requests / week, > 10 requests / week, I would like an estimate. "1 Week" di Figma adalah sisa salinan dan dihapus (keputusan pengguna).
- **Upload berjalan** (4948): kartu sama dengan dropzone (#f6f6f6, 0.5 dashed #cacaca, radius 4, padding 20/24). Isinya:
  - Ikon file 40px (SVG dari Figma, label "PDF").
  - Nama file Inter 13 #111, lalu ukuran Inter 12 #888.
  - Progress bar 170 × 8: track #eaecf0, isi #111, ujung bulat.
  - Persen Inter Medium 14 #344054, jarak 12 dari bar.
- **Upload selesai** (5143):
  - Ikon file, nama file, dan baris "20mb - 100% uploaded" (Inter 12 #888).
  - Ikon × 20px di kanan. Progress bar hilang.
- **Error** (5344):
  - Pesan Inter Medium 14/1.7 #fc0000, 40px di bawah baris submit.
  - Garis bawah input yang kosong berubah #fc0000, dan placeholder-nya disembunyikan. Label tidak berubah merah, chip tidak berubah.
- **Submit hover** (5630): latar #111, teks putih.
- **Terkirim** (5825):
  - Isi field memudar (#111 opacity .2, setara #cfcfcf).
  - Chip terpilih berlatar #cfcfcf dengan teks putih.
  - Tombol "Submitted" berlatar #f6f6f6, teks #111 opacity .5, ikon centang hijau #29df00 20px.
  - Link "Submit another form" Inter Medium 14 bergaris bawah, 40px di bawah baris submit (tempat yang sama dengan pesan error).
- **Penyelarasan kecil (beda antar-frame di Figma, saya pilih satu):**
  - Tombol submit selalu setinggi 44 (di frame hover dan terkirim tingginya 42).
  - Catatan privasi selalu 13px (di frame terisi 12px).
  - Pemudaran saat terkirim memakai satu cara saja (opacity .2).
  - Progress bar berjalan 0 → 100% (di Figma hanya ada contoh 100%).

## Interaksi (JS: `src/js/contact-form.js`)
- Chip = `input type=checkbox/radio` yang disembunyikan + label bergaya chip (bisa dipakai dengan keyboard tanpa JS).
- Project Type mengatur daftar Turnaround dan menampilkan field Turnaround. Pilihan "Others" (Inquiries) menampilkan input deadline.
- Dropdown Turnaround: tombol + daftar (`listbox`), tutup dengan klik di luar atau Esc. Navigasi panah atas/bawah.
- Penghitung karakter textarea (maks. 200).
- Upload: klik atau drag & drop, satu file, tolak tipe atau ukuran (> 100 MB) yang tidak sesuai. Progress 0 → 100% disimulasikan (±1,5 detik), lalu kondisi selesai dengan ×.
- Submit: validasi field wajib (Company Name, Your Name, Email, Project Scope, Project Type, Turnaround). Kalau ada yang kosong, tampil pesan error sesuai Figma, yang menyebut field yang masih kosong saja, misalnya "Please fill out the required form (Company Name, Email, Project Scope, and Project Type)". Kalau lengkap, langsung ke kondisi "Submitted" (semua field nonaktif) + link "Submit another form" yang mengosongkan formulir.
- Kolom kiri sticky dengan CSS `position: sticky` (top = tinggi menu bar + jarak). Tanpa JS.

## File
| File | Perubahan |
|---|---|
| `src/pug/pages/contact.pug` | Halaman baru |
| `src/scss/pages/_contact.scss`, `src/scss/main.scss` | Style halaman |
| `src/js/contact-form.js`, `src/js/main.js` | Interaksi formulir |
| `src/assets/images/contact/*`, `src/assets/icons/*` | Foto kantor, 6 foto proyek, placeholder Turnstile, ikon (info, caret, upload, file, ×, centang, panah) dari Figma |
| `src/pug/partials/statement.pug`, `motto.pug` | CTA → `contact.html` (usulan) |

## Langkah
- [x] 1. Unduh aset dari Figma.
- [x] 2. Markup halaman + style kondisi awal; bandingkan dengan 1611:1042 di 1440.
- [x] 3. Kondisi chip, hover, dan sticky.
- [x] 4. Project Type → Turnaround (dropdown, Others).
- [x] 5. Textarea + upload simulasi.
- [x] 6. Validasi, error, dan terkirim.
- [x] 7. Build; cek di browser 1280 / 1440 / 1920; bandingkan setiap kondisi dengan frame Figma.

## Kriteria selesai
- Posisi dan ukuran elemen utama di 1440 sama dengan Figma (dicek dengan screenshot).
- Semua kondisi di tabel frame acuan bisa dicapai dan tampil sesuai Figma.
- Bisa dipakai dengan keyboard (Tab, Space/Enter, Esc).
- Homepage dan halaman legal tidak berubah (kecuali link CTA). Tidak ada scroll horizontal.

## Jawaban pengguna (28 Okt 2026)
- Yang sticky adalah **kolom kiri**, bukan daftar Turnaround.
- Typo budget diperbaiki.
- "1 Week" di daftar Partnership dihapus.
- Turnaround dicek hanya kalau sudah tampil, dan disebut di pesan error.
- **Pesan error** (saran saya, diserahkan ke saya):
  - Hanya menyebut field wajib yang masih kosong, dengan urutan sesuai formulir dan "and" sebelum nama terakhir. Contoh: "(Company Name, Email, Project Scope, and Project Type)".
  - Garis bawah input yang kosong berubah merah, sesuai Figma.
  - Begitu sebuah field diisi, garis merahnya hilang dan pesan diperbarui. Pesan hilang kalau semua field sudah lengkap.
  - Email yang formatnya salah dianggap belum diisi.

## Hasil (28 Okt 2026)
- **1440, kondisi awal:**
  - Kolom kiri di 40,144 (478 × 901). Blok kantor di y 713, sama dengan Figma (144 + 569).
  - Kartu formulir di 614,144 (786 lebar). Tinggi 1551 tanpa Turnaround, Figma 1547 (frame 1972). Selisih 4px karena baris teks kotak upload dibulatkan.
  - Deretan foto 1427 lebar mulai x 7 (Figma 6.5). Footer 80px di bawahnya. Tinggi halaman 2946, Figma 2942.
- **Kondisi yang diuji di browser** (lewat skrip, dengan screenshot):
  - Hover garis bawah input.
  - Error: pesannya persis "Please fill out the required form (Company Name, Email, Project Scope, and Project Type)". Garis Company Name dan Email merah.
  - Pesan error ikut berubah setelah field diisi, misalnya tinggal "(Turnaround)".
  - Dropdown Inquiries (1 Week / 2-4 weeks / >4 weeks / Others). "Others" memunculkan "write your deadline" dan fokus pindah ke sana.
  - Dropdown Partnership (4 pilihan, tanpa "1 Week").
  - Upload 20mb: 0 → 44% → selesai ("20mb - 100% uploaded" dan ×).
  - Submit hover.
  - Terkirim: field memudar, "Submitted" dengan centang hijau, "Submit another form".
  - Submit another form mengosongkan semuanya: Turnaround tersembunyi lagi dan field aktif kembali.
- **Sticky:** di layar 1024px tinggi, kolom kiri naik 61px, lalu diam (top 83) sampai akhir formulir.
- **Lebar layar:** tidak ada scroll horizontal di 1280, 1440, 1920, dan 2560.
- **CTA homepage** "Schedule a call" (Statement) dan "Get a Quote" (Motto) mengarah ke `contact.html`.
- **Catatan:**
  - Label tipe file memakai Inter SemiBold (Figma Bold 9px; Bold tidak dimuat di situs).
  - Setelah Others dipilih, field tertutup menampilkan "Others". Figma tetap menampilkan "Select timeline".
  - Kotak upload diberi garis gelap saat hover atau saat file diseret ke atasnya (tidak ada di Figma, sebagai tanda bisa di-drop).
- **Menu "Career" diganti "Contact"** (permintaan pengguna) di navbar (`header.pug`) dan footer (`footer.pug`, kolom Navigation). Keduanya mengarah ke `contact.html`, dan tampilannya sudah dicek di 1440.
- **Ukuran tetap 1× di atas 1440** (masukan pengguna, layar 2560 × 1451: masih terasa terlalu besar dan aneh; halaman harus tetap selebar layar).
  - **Penyebab:** di 2560 halaman memakai tiga skala sekaligus: menu bar 1×, teks dan formulir 1,2× (setelah langkah sebelumnya), jarak dan foto 1,78×. Judul turun ke y 256 (Figma 144), dan foto tengah 782 × 853.
  - **Perbaikan:** `.contact` mengganti `--px` dan `--type-px` di dalam halaman ini, sehingga keduanya berhenti di 1× di atas 1440. Di bawah 1440 tetap mengecil seperti situs lainnya. Kolom kiri, formulir, teks, dan jarak di dalamnya jadi berukuran Figma di semua layar lebar.
  - **Tetap mengikuti skala situs:** ruang menu bar (halaman digeser naik selisihnya, jadi judul tetap di y 144), jarak samping (sejajar dengan logo dan menu), dan deretan foto (tetap memenuhi lebar layar).
  - **Terukur:**
    - 1440 sama persis dengan sebelumnya.
    - 1920: kolom kiri 40,144 (478 × 901), formulir 786 lebar di kanan.
    - 2560: kolom kiri dan logo di x 71, tepi kanan formulir dan menu di 2489, judul di y 144.
    - Tanpa scroll horizontal.
- **Deretan foto jadi marquee** (permintaan pengguna):
  - Berjalan terus ke kiri (±40 px Figma per detik) dan **berhenti saat di-hover** atau difokus dengan keyboard. Dengan reduced motion, deretan diam seperti Figma.
  - Setiap foto adalah link (sementara `#`). Saat di-hover, judul proyek muncul 16px di bawah foto (Inter 13, seperti kartu Our Work). Judul tidak menggeser foto lain dan melipat di dalam lebar fotonya.
  - Judul: WELLMO dari Our Work. Lima lainnya **dummy** sesuai isi gambar: Finance Tracker, Factory Line A, S{TRI}, Renncybank, Goldsift Studio.
  - Script marquee testimonial dipakai ulang dan diganti nama dari `testimonials-marquee.js` ke `src/js/marquee.js`. Semua `[data-marquee]` sekarang dijalankan, dan `data-marquee="pause"` membuatnya berhenti saat hover. Testimonial tetap berjalan saat hover (keputusan lama).
  - Terukur: track bergerak (−79 → −145), diam saat hover (−185 → −185), lalu jalan lagi setelah kursor keluar (−225). Testimonial homepage tetap bergerak saat di-hover. Tanpa scroll horizontal di 1440 dan 2560.
- **Perbaikan dan efek scroll pada marquee** (masukan pengguna):
  - **Bug:** setelah foto diklik, fokus tertinggal di link dan marquee tetap berhenti meski kursor sudah keluar. Sekarang hanya fokus keyboard (`:focus-visible`) yang menahannya. Diuji dengan klik mouse sungguhan: setelah kursor keluar, marquee berjalan lagi.
  - **Efek scroll** (`data-marquee="pause scroll"`): scroll ke bawah mendorong marquee ke kiri, scroll ke atas ke kanan (0,4 px per px scroll, makin cepat scroll makin cepat). Setelah scroll berhenti, marquee **tetap ke arah scroll terakhir** dengan kecepatan dasar (keputusan pengguna). Lompatan scroll lebih dari 120px per frame (pemulihan posisi setelah reload) diabaikan.
  - **Saat kursor di atas foto, marquee diam, termasuk saat di-scroll** (keputusan pengguna).
  - `marquee.js` sekarang digerakkan per frame di ticker GSAP. Testimonial homepage tetap ke kiri dengan kecepatan sama, tidak terpengaruh scroll, dan tetap berjalan saat hover (terukur −71 → −212 sambil hover dan scroll ke atas).
  - Terukur di Contact:
    - Idle: −75 → −115 dalam 1 detik.
    - Scroll ke atas: berbalik ke kanan dan tetap ke kanan setelah berhenti (−699 → −659).
    - Hover + scroll: tetap −156.
- **Lebih cepat** (masukan pengguna, angka dari usulan saya): kecepatan dasar deretan foto 40 → **60 px/detik** (`data-marquee-speed="60"`), dan dorongan scroll 0,4 → **1×**, sehingga marquee bergeser sejauh halaman di-scroll.
  - Terukur: −202 → −262 dalam 1 detik. Scroll 270px ke bawah menggeser marquee 379px (90 dari kecepatan dasar + ±270 dari scroll).
  - Testimonial homepage tetap 40 px/detik.
- **Saat hover tetap ikut scroll** (keputusan pengguna, mengganti "diam termasuk saat di-scroll"): selama kursor di atas foto, gerak sendirinya berhenti, tapi scroll tetap mendorongnya. Setelah scroll berhenti, marquee diam lagi.
  - Terukur: hover −197 (diam), scroll 270px → −467, lalu tetap −467.
