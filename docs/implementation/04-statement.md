# 04 — Section Statement

Status: **Selesai (23 Okt 2026), menunggu review** · Figma: Homepage `1523:3214` → Section-2 `1523:3259` (1440 × 931).
Referensi interaksi: "Section-2 (Button/Text Interaction)" `1516:2441`. Frame Idle `1516:2442` dan Hover `1516:2468` berasal dari versi lama: label "Let's Talk" dan ukuran teks berbeda.
Bergantung pada: 01 (design system), 03 (skala proporsional).

Label: **[T]** dari layer Figma · **[D]** diturunkan · **[?]** belum pasti.

---

## 1. Tujuan dan ruang lingkup

**Termasuk:** eyebrow, paragraf statement 4 baris dengan ikon dekoratif dan ilustrasi folder, tombol "Schedule a call", dan teks "Free 15min call".

**Tidak termasuk:** animasi teks (lihat pertanyaan 3), mobile, dan section lain.

Semua ukuran ditulis dengan `fluid()`, mengikuti aturan skala di `docs/design-system.md`.

---

## 2. Requirement dari desain

### 2.1 Layout [T]
- Padding section: 220px atas/bawah. Isi selebar **1050px** (`--container-narrow`), di tengah.
- Isi tersusun vertikal dan rata tengah: statement (367px), gap 40px, CTA (84px).
- Statement: eyebrow, gap 32px, lalu blok paragraf setinggi 308px.

### 2.2 Eyebrow [T]
"( End-to-end identity for digital leaders )": `.text-16` dengan line-height 1.7, `.text-muted`, rata tengah.

### 2.3 Paragraf statement [T]
- Font: General Sans 400, **42px / line-height 1.6 / -0.04em** (varian statement di design system).
- 4 baris, masing-masing rata tengah, jarak antar baris 77px:

| Baris | Isi | Geser horizontal dari tengah |
|---|---|---|
| 1 | "We specialize" · **ikon dekoratif** 66×52 · "in a diverse range of cutting-edge" (gap 20px) | -10px |
| 2 | "technologies, ensuring that we can tailor the" | -4.5px |
| 3 | "perfect solution to meet" · **ilustrasi folder** 120×78 · "your project's unique" (gap 49px dan 44px) | +2.5px |
| 4 | "requirements, innovation, and high-quality results." | -5px |

- Pergeseran kecil tiap baris diambil persis dari Figma.
- Paragraf ini tetap satu elemen `<p>`. Pemenggalan baris dibuat dengan susunan baris tetap, agar sama dengan Figma.

### 2.4 Ikon dekoratif [T]
SVG utuh 66×52 dari Figma: dua lingkaran gradient dan ikon sparkle. Dipakai apa adanya.

### 2.5 Ilustrasi folder [T]
Di Figma, ilustrasi ini terdiri dari tiga lapisan, dan akan dibuat ulang dengan susunan yang sama:
1. Kotak abu-abu 120×22 (`--color-border-strong`, radius 4px), 56px dari atas, dengan bayangan elips di dalamnya (SVG).
2. Bagian bawah folder, terpotong di dalam kotak itu.
3. Bagian atas folder (98×70) di atas kotak.

Hasilnya: folder terlihat seperti "masuk ke dalam saku". Kedua potongan memakai **gambar folder yang sama** dengan posisi yang sama, jadi terlihat menyatu.

### 2.6 Tombol CTA [T]
- Bingkai: border 1px `#111`, radius 8px, padding kanan 8px, gap 8px.
- Label: latar `#111`, radius 4px, padding 10px 20px, teks "Schedule a call" `.text-18`, warna putih.
- Ikon panah dalam lingkaran, 32px (SVG dari Figma, dibalik vertikal seperti di Figma, sehingga panahnya mengarah ke kanan atas).
- Di bawah tombol (gap 16px): "Free 15min call", `.text-14.text-medium`, line-height 1.7, `.text-muted`.

### 2.7 Interaksi tombol (dari frame referensi)
| State | Tampilan |
|---|---|
| Idle | Hanya label hitam |
| Hover | Bingkai, ikon panah, dan teks "Free 15min call" muncul |

Homepage final menampilkan **state hover** sebagai tampilan default. Lihat pertanyaan 1.

### 2.8 Aset
| Aset | Format | Tujuan |
|---|---|---|
| Ikon dekoratif | SVG | `src/assets/images/statement/decorative-icon.svg` |
| Bayangan folder | SVG | `src/assets/images/statement/folder-shadow.svg` |
| Folder | PNG 2000×2000 (405 KB) | `src/assets/images/statement/folder.png` |
| Panah dalam lingkaran | SVG | `src/assets/icons/arrow-circle.svg` (dipakai lagi di CTA section Motto) |

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/statement.pug` | Baru | Markup section |
| `src/pug/mixins/cta-button.pug` | Baru | Mixin tombol CTA. Dipakai lagi di section Motto ("Get a Quote", versi putih) |
| `src/pug/layouts/default.pug` | Ubah | Memanggil mixin sekali, supaya bisa dipakai di semua halaman |
| `src/scss/components/_cta-button.scss` | Baru | Style tombol CTA (varian terang ditambahkan nanti) |
| `src/scss/sections/_statement.scss` | Baru | Style section |
| `src/scss/main.scss` | Ubah | Menambah 2 `@use` |
| `src/pug/pages/index.pug` | Ubah | Memanggil `statement.pug` setelah hero |
| `src/assets/…` | Baru | Aset di tabel 2.8 |

**Kenapa tombol dibuat sebagai komponen:** tombol yang sama (bingkai, label, ikon, teks kecil) muncul lagi di section Motto dengan warna terbalik. Membuatnya sekali mencegah duplikasi.

---

## 4. Urutan implementasi
1. Unduh aset dan periksa.
2. Buat komponen tombol CTA (mixin dan SCSS).
3. Buat markup dan style section Statement.
4. Tambahkan interaksi hover (jika disetujui, pertanyaan 1).
5. Build, ukur posisi di browser (1440px dan 1920px), bandingkan dengan Figma, lalu perbaiki.
6. Perbarui checklist.

---

## 5. Keputusan (dijawab pengguna, 23 Okt 2026)

1. **Tampilan tombol: (B).** Awalnya hanya label hitam. Saat hover atau fokus keyboard, bingkai, ikon, dan teks "Free 15min call" muncul. Transisi 0,3 detik ease-out dengan CSS (*durasi dan easing adalah usulan, karena tidak ada di Figma*). Ruang untuk teks kecil disediakan sejak awal. Animasi dimatikan jika pengguna memilih "reduce motion" di sistem operasinya.
2. **Tujuan tombol:** `#` dulu.
3. **Animasi teks:** tidak ada dulu.
4. **Gambar folder:** diperkecil ke 400×400 px.

Varian terang tombol (untuk section Motto) dibuat saat section Motto dikerjakan, bukan sekarang.

---

## 6. Verifikasi dan acceptance criteria
- [x] `npm run build` tanpa error.
- [x] Tinggi section 931px di 1440px (terukur 930,98).
- [x] Posisi eyebrow, keempat baris, ikon, folder, tombol, dan teks kecil selisihnya ≤ 2px dari Figma di 1440px (selisih terbesar 2,3px pada lebar teks "We specialize", karena perbedaan render font; posisinya selisih 1,2px).
- [x] Di 1920px semua ukuran = 1,333× (selisih terbesar 0,7px).
- [x] Ilustrasi folder terlihat sama dengan Figma (dibandingkan lewat screenshot).
- [x] Panah mengarah ke kanan atas, sama seperti di Figma.
- [x] Interaksi tombol (B) diuji dengan hover mouse sungguhan lewat Chrome DevTools: idle → transisi → hover → kembali idle. Tinggi CTA tetap 83,8px di semua state.
- [x] Aset tampil di screenshot dan tidak ada link Figma sementara di kode.
- [x] Hero tidak diubah dan tampil normal di screenshot halaman penuh.

**Catatan:**
- Label tombol memakai line-height 22px (tinggi kotak teks di Figma), karena "normal" di browser 1px lebih pendek.
- Di Figma ada jarak 1px antar frame section (hero 1439px, Statement mulai di y=1440). Di website, section langsung bersambung tanpa jarak 1px itu.

---

## 7. Checklist progres
- [x] Analisis Figma (section final, frame interaksi, data animasi)
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: Aset (folder 405 KB → 83 KB)
- [x] Langkah 2: Komponen tombol CTA
- [x] Langkah 3: Section Statement
- [x] Langkah 4: Interaksi hover
- [x] Langkah 5: Verifikasi dan perbaikan

## Tinta mengikuti scroll (28 Okt 2026, permintaan pengguna)
- Acuan: paragraf "Our processing pipeline…" di drone.riotters.com.
- Teks statement (baris 1–4) mulai **abu-abu** (`rgba(0,0,0,.2)`) dan menghitam dari kiri ke kanan dengan tepi lembut, baris demi baris, **mengikuti scroll**. Saat di-scroll ke atas, teks kembali abu-abu. Ikon dan folder tetap berwarna aslinya.
- Teknik sama dengan kalimat Milestone (gradient yang di-clip ke teks dan digeser, teks tidak dipecah), tapi terikat ke scroll.
  - Setiap potongan teks mendapat bagian scroll sesuai lebarnya, jadi kecepatan tinta merata.
  - Rentang scroll: dari `top 75%` sampai `center center`, sehingga kalimat sudah hitam penuh saat tepat di tengah layar.
- File: `src/js/statement-ink.js` (baru), `main.js`, `_statement.scss` (`.is-inked`).
- Tanpa JS atau dengan reduced motion: teks hitam seperti sebelumnya.
- Dicek dengan screenshot pada beberapa posisi scroll: baris 1 menghitam lebih dulu, lalu baris 2 dan 3, dan baris 4 abu-abu sampai gilirannya.
- Terukur:
  - Teks di tengah layar: semua potongan `0%` (hitam penuh).
  - Teks di bawah layar (scroll ke atas): semua `100%` (abu-abu).
- **Lebih lambat dan halus** (masukan pengguna: terlalu cepat, kurang halus dibanding referensi).
  - Terukur di referensi: paragraf mulai menghitam saat atasnya di ±87% layar dan selesai di ±28% (±530px scroll untuk 3 baris). Setiap huruf berubah dengan transisinya sendiri (abu `#c7cccb` → `#24363f`).
  - Sekarang rentangnya `top 90%` → `top 25%`, dan tinta mengejar posisi scroll dengan halus (`gsap.quickTo`, 0,6 detik, `power3.out`), sehingga tidak melompat saat scroll cepat.
  - **Selesai di tengah** (keputusan pengguna): rentang akhir `top 90%` → `center center`, ±510px scroll di 1440 × 900 (referensi ±530px). Kalimat sudah hitam penuh saat tepat di tengah layar, dan penghalusan tetap dipakai.

## Ikon biru hidup setelah tinta melewatinya (28 Okt 2026, permintaan pengguna)
- **Pemicu:** begitu tinta selesai menghitamkan "We specialize" (potongan teks pertama), ikon di sebelahnya beranimasi dengan waktunya sendiri (saran yang disetujui). Saat di-scroll kembali ke atas titik itu, animasinya berjalan mundur sampai ikon kosong. Kalau halaman dibuka di bawah titik itu, ikon langsung tampil jadi.
- **Urutan** (±1,5 detik, tidak ada di Figma):
  1. Garis outline tergambar melingkar (0–0,5 detik, `power2.inOut`, stroke-dashoffset).
  2. Lingkaran solid membesar dari pusatnya di tengah kotak, menumpuk di atas outline, dan bintang putih berputar −90° sampai tegak (mulai 0,35 detik, 0,45 detik, `back.out(1.6)`).
  3. Keduanya membelah sambil mengorbit 120° mengelilingi titik tengah (33, 26) sampai posisi Figma (outline (21, 31), solid (45, 21)), 0,75–1,5 detik, `power3.inOut`.
- **Teknis:**
  - SVG ikon ditanam langsung di `statement.pug` (bentuk dan warna sama dengan `decorative-icon.svg`, dengan id gradient sendiri), supaya kedua bagiannya bisa digerakkan.
  - Transform SVG diatur langsung lewat atribut. `svgOrigin` milik GSAP menggeser x/y sendiri setiap frame, dan geserannya menumpuk (posisi akhir sempat terbalik).
  - Kode ada di `src/js/statement-ink.js` (`createIcon`).
- Tanpa JS atau dengan reduced motion: ikon tampil seperti Figma.
- Dicek per frame (setiap ±0,16 detik): garis tergambar → solid membesar di tengah → membelah melengkung → posisi Figma. Scroll balik: transform kembali ke awal (outline tak terlihat, solid skala 0).
- **Pemicu dipindah** (laporan pengguna: animasi outline tidak terlihat):
  - Dipicu tinta, animasi berjalan saat kalimat masih di dekat bawah layar (±85%), sehingga garis sudah tergambar sebelum dilihat.
  - Sekarang ikon punya pemicu sendiri: saat pusatnya di 70% tinggi layar (`center 70%`). Saat itu baris pertama sudah hitam.
  - Penggambaran garis 0,5 → 0,7 detik (solid mulai 0,55 detik, membelah 0,95–1,7 detik).
  - Halaman dibuka di bawah titik itu: ikon langsung jadi.
  - Terukur saat scroll pelan dengan roda: garis mulai tergambar saat pusat ikon di 68% layar, dan selesai di 62%.

## Folder keluar dari saku (28 Okt 2026, pilihan pengguna A)
- **Pemicu:** sama seperti ikon, yaitu saat pusat folder di 70% tinggi layar. Berjalan dengan waktunya sendiri dan mundur saat di-scroll kembali ke atas. Halaman dibuka di bawahnya: langsung jadi.
- **Urutan** (±1,1 detik, tidak ada di Figma):
  1. Saku abu-abu terbuka dari tengah (`scaleX` 0,3 → 1, memudar masuk, 0,45 detik, `power3.out`).
  2. Mulai 0,25 detik, folder naik keluar dari saku (`yPercent` 55 → 0, 0,85 detik, `back.out(1.4)`, dengan pantulan halus). Selama naik, potongan atasnya dipotong di mulut saku (`clip-path inset` bawah 20% → 0), jadi folder terlihat keluar dari dalam saku, bukan melewati depannya.
- Kode: `createFolder` di `src/js/statement-ink.js`. Pemicu ikon dan folder memakai pola yang sama.
- Terukur:
  - Sebelum: saku opacity 0, folder turun 66px dan terpotong di mulut saku.
  - Sesudah: saku opacity 1, `inset(0%)`, tanpa transform.
  - Scroll balik: kembali ke kondisi awal.
- **Kertas di dalam folder** (dicoba 28 Okt 2026, dibatalkan pengguna): `folder.png` sempat dipecah menjadi lapisan kertas dan badan folder, supaya kertas terdorong naik sesaat. Dikembalikan ke satu gambar seperti sebelumnya.
- **Ikon lebih lambat, membelah lurus** (29 Okt 2026, permintaan pengguna):
  - Orbit 120° dihapus: kedua bagian langsung berpisah dalam garis lurus ke posisi Figma.
  - Waktu: garis 1,1 detik; solid mulai 0,85 detik (0,7 detik, `back.out(1.4)`); membelah 1,6–2,7 detik (`power3.inOut`). Total ±2,7 detik (sebelumnya ±1,7).
  - Terukur (setiap ±0,28 detik): garis 129 → 118 → 53 → 5 → 0, lalu membelah `translate(12 −5)` → (10,6 −4,4) → (2,3 −1,0) → 0. Rasio x/y tetap, jadi gerakannya lurus.
- Dicoba lalu dibatalkan (29 Okt 2026): pemicu ikon di 85% layar dengan tahapan bertumpuk (2,25 / 3,15 / 4,5 detik). Pengguna memilih versi ±2,7 detik di atas.
- **Folder diselaraskan dengan ikon** (29 Okt 2026): saku 0,45 → 0,7 detik; folder naik 0,85 → 1,3 detik, mulai 0,45 detik, `back.out(1.2)` (sebelumnya 1.4). Total ±1,75 detik (sebelumnya ±1,1).
