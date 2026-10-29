# 11 — Footer

Status: **Selesai (27 Okt 2026), menunggu review** · Figma acuan: Homepage `1574:796` → Footer `1574:1193` (1440 × 563).
Data animasi Figma: kosong. Label: **[T]** dari Figma · **[U]** usulan.

---

## 1. Tujuan dan ruang lingkup
Footer yang sama untuk semua halaman (dipasang di layout, seperti menu bar): logo, form "Get in Touch", koin, tiga kolom link, deskripsi agensi, dan baris hak cipta.
**Tidak termasuk:** halaman yang dituju link (belum ada), mobile.

## 2. Requirement dari desain [T]
- Latar putih, tinggi 563px, padding 40px kiri/kanan.
- **Logo** 50,25 × 24 di (40, 40), SVG yang sama dengan menu bar.
- **Get in Touch** di (40, 135), lebar 252px, gap 20px:
  - Label "Get in Touch": Inter 14px, line-height 1, opacity 0,5. Gap 16px.
  - Input: placeholder "Your company name", General Sans 16px, −0,04em, opacity 0,2. Garis bawah 0,5px `--color-divider` 12px di bawah teks (tinggi total 28px).
  - Tombol "Send email": latar `#111`, radius 4px, padding 10px 20px, Inter Medium **12px** putih. Lebih kecil dari tombol `.button` (18px), jadi diberi varian kecil.
- **Koin** 366 × 344 di (354, −125): sama dengan gambar koin hero, `object-position: bottom`, bayangan `0 4px 4px rgba(0,0,0,.25)`. **Menjorok 125px ke atas**, keluar dari footer dan menutupi bagian bawah section di atasnya.
- **Tiga kolom link** mulai x = tengah + 75px (795 di 1440), top 40, gap antar kolom 110px:
  - Judul kolom: Inter 14px, line-height 1, opacity 0,5. Gap 4px ke daftar.
  - Item: General Sans 20px, −0,02em, line-height normal (27px), gap 8px.
  - Social media: Instagram, Linkedin, Dribbble, Behance. Navigation: Works, About, Team, Services, Career, Blog. Contact: owwstudio@gmail.com, +62 878 869 785 4.
- **Deskripsi:** "Agency with incredible design and development expertise. / Based in Yogyakarta, Indonesia.", General Sans 20px, 2 baris, lebar 548px, di (40, 415).
- **Baris bawah** di bottom 40px, selebar 1344px, gap 16px: "©2026 / One Week Wonders Studio" (Inter 14px), garis 0,5px yang mengisi sisa ruang, lalu "Privacy Policy", "Terms & Conditions", "Legal" (gap 16px).

## 3. File
| File | Aksi |
|---|---|
| `src/pug/partials/footer.pug` | Baru |
| `src/pug/layouts/default.pug` | Ubah: footer setelah `main` |
| `src/scss/components/_footer.scss` | Baru |
| `src/scss/components/_cta-button.scss` | Ubah: varian kecil `.button--small` |
| `src/scss/main.scss` | Ubah |
| `src/js/footer-form.js` + `main.js` | Baru/ubah, **hanya jika** pertanyaan 1 = (a) |

Aset: logo dan koin sudah ada di project. Garis dibuat dengan CSS.

## 4. Hal yang perlu klarifikasi
1. **Form "Get in Touch":** isinya nama perusahaan, dan tombolnya "Send email". Apa yang terjadi saat dikirim?
   - **(a) Usulan:** membuka aplikasi email pengguna ke owwstudio@gmail.com, dengan subjek berisi nama perusahaan (`mailto:`). Tanpa server, langsung berfungsi.
   - (b) Dummy, belum melakukan apa-apa.
   - (c) Dikirim lewat layanan form (mis. Formspree). Butuh akun dan endpoint dari Anda.
2. **Link:** sosial media dan navigasi `#` dulu. Email → `mailto:`, telepon → `tel:+628788697854`. Setuju?
3. **Koin menjorok ke atas:** sesuai Figma, koin menutupi bagian bawah section Motto yang gelap (posisi akhir, setelah section dilepas). Tetap begitu?
4. **Hover (tidak ada di desain):** usulan link footer memudar ke opacity 0,5 dengan transisi 0,3 detik, dan tombol "Send email" tanpa efek. Atau tanpa efek sama sekali?
5. **Animasi:** tidak ada di Figma. Usulan: tanpa animasi.

## 5. Verifikasi
- [x] Posisi semua elemen sama dengan Figma di 1440px (selisih ≤ 0,5px), tinggi 563px. Dibandingkan berdampingan dengan screenshot Figma. Baris bawah 1344px (berakhir 56px dari kanan, sejajar kolom Contact), sesuai Figma.
- [x] Koin menjorok 125px ke atas dan tampil di atas section Motto setelah section dilepas.
- [x] Scroll roda dari langkah terakhir Motto ke footer dan kembali: section dilepas, footer naik sampai akhir halaman, scroll ke atas masuk lagi ke Motto.
- [x] 1920px mengikuti skala 1,333×.
- [x] Section sebelumnya tidak berubah. Build tanpa error.

**Catatan:** form memakai `action="mailto:"` (tetap berfungsi tanpa JS). Dengan JS, subjeknya "Get in Touch — <nama perusahaan>". Aplikasi email yang terbuka bergantung pada pengaturan perangkat pengunjung. Kolom wajib diisi (`required`).

## 6. Checklist
- [x] Analisis Figma
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi (form mailto; link `#`/mailto/tel; koin menjorok; hover memudar; tanpa animasi)
- [x] Implementasi
- [x] Verifikasi, dokumentasi, commit, push

### Revisi (27 Okt 2026): koin di belakang section Motto
Atas permintaan pengguna, koin berada di **belakang** section Motto: bagian atasnya (125px) tertutup area gelap, sehingga koin seolah muncul dari bawah section itu. Caranya: wrapper `.tone-shift` diberi `z-index: 1` (di atas footer), dan `z-index` footer dihapus.
- Efek samping yang ditemukan: lapisan tekstur sticky di wrapper (yang memakai margin negatif) melewati batas bawah wrapper dan membuat latar footer abu-abu bertekstur. Diperbaiki dengan `overflow: clip` di wrapper (tidak mengganggu `position: sticky`). Latar footer kembali putih (diukur: 0/255).
- Diuji ulang: langkah-langkah Motto tetap tertahan dan berganti dengan benar, tekstur tetap menempel di layar, dan transisi masuk tetap tanpa garis pemisah.

## Footer diam dan tersingkap (28 Okt 2026, permintaan pengguna)
- Sebelumnya footer bergeser naik lebih lambat dari scroll (parallax), sehingga terasa ditarik. Sempat dibuat **diam di bawah layar**, dengan bagian di atasnya (Motto, `.contact`, `.policy`) bergeser naik seperti tirai yang menyingkapnya (lihat koreksi di bawah).
- Diukur di sstr.tech (acuan pengguna): isi footernya bergerak setengah kecepatan scroll (footer naik 463px, isinya 232px). Di sini dibuat diam penuh, sesuai keputusan pengguna.
- `footer-reveal.js`:
  - `y` bergerak dari −tinggi footer ke 0, dengan scrub, dari saat akhir `main` menyentuh bawah layar sampai akhir halaman.
  - **Perbaikan:** patokan rentangnya sekarang akhir `main`, bukan footer itu sendiri. Posisi footer sudah termasuk geserannya, sehingga rentang dimulai terlalu awal dan footer ikut bergerak bersama halaman di sebagian besar rentang. Masalah ini juga ada di versi 25%.
- Terukur di homepage, Contact, dan Privacy Policy (1440 × 900): logo footer tetap di y 377 pada 100% / 75% / 50% / 25% / 0% sisa jarak, tanpa exception. Koin footer tetap tampil (opacity 1).
- **Tidak diam penuh** (koreksi pengguna): footer bergerak naik **setengah kecepatan scroll**, sama seperti sstr.tech (`y` dari −50% tinggi footer ke 0, rentang dan patokan tetap). Terukur di homepage dan Contact: logo footer naik 659 → 377 (282px) selama 563px scroll terakhir (50%), tanpa exception.

## Koin footer 15px ke kanan (30 Okt 2026, keputusan pengguna)
- Terukur: tepi koin 3D di footer sama dengan foto Figma (kiri 405 vs 406, bawah 215 = 215). Tapi karena koin terus berputar pelan pada mukanya, logo "///" berada di sudut lain dan koin terasa lebih ke kiri (pusat berat visual 519 vs 535).
- Pilihan pengguna B: kotak koin digeser 15px ke kanan (`left: fluid(369)`, Figma 354). Koin 3D dan gambar cadangannya ikut.
