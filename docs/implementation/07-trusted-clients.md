# 07 — Section Trusted Clients

Status: **Selesai (26 Okt 2026), menunggu review** · Figma acuan: Homepage `1574:796` → Testimonials `1574:973` (1440 × 1474).
Data animasi Figma: kosong.

Label: **[T]** dari layer Figma · **[D]** diturunkan · **[U]** usulan.

---

## 1. Tujuan dan ruang lingkup
**Termasuk:** judul, grid 12 logo klien, teks "and hundred more...", garis pemisah, dan carousel 5 kartu testimoni dengan fade di kedua tepi.
**Tidak termasuk:** halaman klien atau testimoni, mobile, dan section lain.

---

## 2. Requirement dari desain

### 2.1 Layout [T]
- Latar `--color-surface-muted` (#F6F6F6). Padding 180px atas/bawah. Isi selebar **1130px** (`--container-clients`), di tengah.
- Isi tersusun vertikal dan rata tengah, gap **80px**: header (146), blok logo (468), garis, testimoni (260). Total 1114px, ditambah padding = 1474px.

### 2.2 Header [T]
Lebar 699px, rata tengah, gap 16px:
- "( Trusted Clients )": `.text-16.text-muted`, line-height 1.
- "Helping startups and enterprises build scalable, future-ready digital products.": `.text-heading-42`, 2 baris.

### 2.3 Grid logo [T]
- 4 kolom × 3 baris. Sel 267,5 × 124px, gap 20px. Logo berada di tengah sel dengan ukuran persis dari Figma.
- Di bawahnya (gap 40px): "and hundred more...", `.text-16.text-muted`, rata tengah.

| Baris | Logo (ukuran di Figma) |
|---|---|
| 1 | BenQ (106,9 × 32), YesWeHack (157,7 × 34), genasys (162 × 32), bunny.net (134,7 × 40) |
| 2 | sprinter health (137,9 × 34), Gcore (136,2 × 34), Kolleno (135,4 × 24), medatus (141,7 × 34) |
| 3 | paymongo (184,6 × 32), Renee (130 × 32), LABEL (168 × 32), demostack (173,6 × 26) |

### 2.4 Garis pemisah [T]
1px `--color-divider`, selebar 1130px. Garis tanpa tinggi, seperti di Our Work.

### 2.5 Carousel testimoni [T]
- 5 kartu, masing-masing 400 × 260, gap 32px. Deretan selebar 2128px **berada di tengah halaman**: 3 kartu terlihat penuh, dan 2 kartu terpotong di kiri dan kanan.
- **Kartu:**
  - Latar putih, border 1px `--color-border`, radius 4px, padding 32px.
  - Isi disusun berjarak rata (logo perusahaan di atas, kutipan di tengah, penulis di bawah).
  - Kutipan: Inter 14px, line-height 1.4.
  - Penulis: avatar bulat 34px, gap 8px. Nama Inter Medium 12px dan jabatan Inter 12px opacity 0.5, line-height 1.4.
  - Kartu Riseloop berisi link "medicalnode.ai" berwarna `#3E78FF`.
- **Fade tepi:** gradient `#F6F6F6` → transparan, lebar 48px (kiri) dan 55px (kanan), tinggi 300px.

| # | Logo perusahaan | Kutipan (awal) | Penulis |
|---|---|---|---|
| 1 | Good at Numbers | "It's insane work!" | Jesuwin Prince, Co-founder |
| 2 | Riseloop | "Nearly three years working with One Week Wonders on medicalnode.ai…" | Maker Athian, Founder |
| 3 | BOWT | "Great project management from Izet…" | Jelmer Stelpstra, Owner |
| 4 | bunny.net | "It's been a pleasure working with such a talented team…" | Jure Anzelj, Head of Marketing |
| 5 | (logo g8) | "Highly recommend working with them…" | Assad Qureshi, Founder |

### 2.6 Aset dan cara ekspor (sesuai kesepakatan)
- **Logo vector** (9 logo grid + 4 logo testimoni: Riseloop, BOWT, bunny.net, g8, serta teks "Good at Numbers"): saya ekspor dari Figma sebagai SVG. Logo yang terdiri dari banyak potongan diekspor per node, lalu latar kanvas (`#1E1E1E`) dan bentuk dari frame induk dibuang. Setiap logo dicek dengan screenshot.
- **Logo berbasis gambar** (paymongo, LABEL, demostack, ikon "Good at Numbers"): PNG dari Figma **sementara**, dan diganti SVG dari desainer jika sudah ada. Resolusinya rendah (paymongo 300 × 52px), jadi bisa sedikit buram di layar retina.
- 5 avatar (PNG 34px dari Figma).
- Lokasi: `src/assets/images/clients/` dan `src/assets/images/testimonials/`.

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/trusted-clients.pug` | Baru | Data logo dan testimoni, serta markup |
| `src/scss/sections/_trusted-clients.scss` | Baru | Header, grid logo, garis, carousel, kartu, dan fade |
| `src/js/marquee.js` | Baru, **jika marquee disetujui** | Gerakan carousel. Mengembalikan fungsi cleanup |
| `src/js/main.js`, `src/scss/main.scss`, `src/pug/pages/index.pug` | Ubah | Menyambungkan file baru |
| `src/assets/images/clients/`, `src/assets/images/testimonials/` | Baru | Aset |

---

## 4. Urutan implementasi
1. Ekspor dan rapikan logo, unduh avatar, lalu cek setiap logo dengan screenshot.
2. Header, grid logo, teks, dan garis.
3. Carousel testimoni statis (posisi sama dengan Figma) dan fade tepi.
4. Bandingkan dengan Figma (posisi ≤ 2px di 1440px, dan logo sama secara visual).
5. Gerakan carousel (jika disetujui).
6. Uji di 1920px, saat resize, dan dengan reduce motion.
7. Perbarui checklist, commit, dan push.

---

## 5. Usulan untuk bagian yang tidak ada di Figma [U]
1. **Gerakan carousel testimoni:** deretan kartu terpotong di kedua sisi dengan fade, tanpa tombol panah. Pola ini biasanya dipakai untuk **marquee**, yaitu kartu bergerak pelan dan terus-menerus ke kiri, lalu berulang tanpa putus.
   - Kecepatan sekitar 40px per detik.
   - ~~Berhenti saat kursor berada di atas kartu.~~ **Dibatalkan (26 Okt 2026):** pengguna ingin marquee tetap bergerak saat hover.
   - Dibuat dengan GSAP, dengan kartu digandakan agar putarannya mulus.
2. **Reduce motion:** carousel diam di posisi seperti di Figma.
3. **Logo klien:** ~~tidak bisa diklik dan tanpa efek hover~~. Diganti setelah review: efek hover dari Figma dan link `#` (lihat "Tambahan setelah review").
4. **"medicalnode.ai":** link ke `https://medicalnode.ai`, dibuka di tab baru.

---

## 6. Keputusan (dijawab pengguna, 26 Okt 2026)
1. Carousel testimoni: **(a) marquee**, sesuai usulan 5.1.
2. Usulan 5.2–5.4 disetujui.
3. Warna link "medicalnode.ai" tetap `#3E78FF`.

---

## 7. Verifikasi dan acceptance criteria
- [x] `npm run build` tanpa error.
- [x] Tinggi section 1474px di 1440px. Header, grid, BenQ, teks, garis, kartu 1/2/5, isi kartu (logo, kutipan, penulis), dan kedua fade **tepat sama** dengan Figma. Selisih terbesar: logo demostack 0,9px.
- [x] 12 logo grid dan 5 logo testimoni sama secara visual dengan Figma (screenshot berdampingan, ditambah render di latar magenta untuk memastikan transparan).
- [x] Kartu ke-2, 3, dan 4 terlihat penuh, kartu ke-1 dan 5 terpotong di tepi, dan fade di kedua sisi.
- [x] Marquee: 39,9 px/detik. Saat reduce motion: diam, tanpa salinan kartu. Setelah review: berhenti-saat-hover dihapus, dan marquee terukur tetap 40,0 px/detik saat di-hover.
- [x] 1920px: semua ukuran 1,333× (tinggi section 1965px, kartu 533px).
- [x] Section sebelumnya tetap berfungsi (garis Our Work diukur ulang setelah dijadikan komponen bersama `.divider`).

**Temuan dan keputusan teknis selama implementasi:**
1. **Ekspor logo dari Figma:** ekspor per node membawa latar kanvas `#1E1E1E`, garis tepi frame, latar halaman, dan latar section. Lapisan-lapisan itu dibuang dengan skrip, lalu setiap logo dicek visual.
2. **Ekspor terpotong di luar frame:** Figma memotong ekspor sesuai area yang terlihat. Logo g8 (kartu ke-5) awalnya hanya 23px, dan ekspor "Good at Numbers" (kartu ke-1) kosong. Keduanya diambil dari aset vector utuhnya. Logo g8 ternyata "KAAM CARE", dibalik vertikal dengan CSS seperti di Figma.
3. **Ikon "Good at Numbers":** di Figma berupa gambar putih yang dipakai sebagai mask di atas `#111`. Dibuat sama dengan `mask-image` CSS (PNG 96px).
4. **Efek Noise pada kartu BOWT:** tidak muncul di data desain, tapi ditemukan lewat ekspor SVG (filter `feTurbulence`). Versi persis dari ekspor terlihat jauh lebih kasar di browser, jadi intensitasnya disetel sampai angka render-nya cocok dengan render Figma: kegelapan rata-rata 3,59 vs 3,58, cakupan 37,9% vs 38,3%.
5. **Komponen `.divider`:** garis pemisah Our Work dan Trusted Clients sekarang memakai satu komponen yang sama.

### Tambahan setelah review: hover logo (26 Okt 2026)
Sumber: Figma "Trusted Clients - Hovered" `1574:2077` (contoh pada Kolleno).

- **Desain [T]:** sel menjadi putih (`#FFF`, radius 4px, memenuhi sel 267,5 × 124). Logo membesar 1,1667× (24 → 28px) dan naik. Teks "See More" (General Sans Medium 13px, hitam, opacity 0,5) muncul 20px di bawah logo. Logo dan teks berada di tengah sel sebagai satu kelompok.
- **Keputusan pengguna:** berlaku untuk ke-12 logo. Seluruh sel menjadi link `#`. Animasi "elegan", dan reduce motion dihormati.
- **Animasi [U]:** latar putih memudar sambil membesar (0,96 → 1), logo membesar dan naik, "See More" muncul 60ms lebih lambat sambil naik 6px. Kurva ease-out quint `cubic-bezier(0.22, 1, 0.36, 1)`, 0,5 detik. Efek hover hanya aktif di perangkat yang mendukung hover (`@media (hover: hover)`). Fokus keyboard memunculkan efek yang sama.
- **Ukuran logo:** frame hover memakai tinggi 34px untuk BenQ (113,6 × 34), PayMongo (196,2 × 34), dan LABEL (178,5 × 34). Proporsinya sama, hanya diperbesar 6,25%. Atas keputusan pengguna ("yang lebih baik"), ukuran ini dipakai juga untuk tampilan normal.
- **Verifikasi:** diuji dengan hover mouse sungguhan. Posisi Kolleno saat hover sama persis dengan Figma: logo (629,7; 175,5) 158 × 28 vs (629,75; 175,5) 158 × 28, dan teks y = 223,5. Screenshot identik. Untuk bunny.net (40px), Kolleno (24px), dan demostack (26px): jarak logo ke teks 20px, dan ruang atas sama dengan ruang bawah. Setelah mouse keluar, semuanya kembali ke tampilan awal.

**Masih sementara:** logo paymongo, LABEL, demostack, dan ikon "Good at Numbers" masih berbasis gambar dari Figma. Ganti dengan SVG dari desainer jika sudah ada (file di `src/assets/images/clients/` dan `src/assets/images/testimonials/`).

---

## 8. Checklist progres
- [x] Analisis Figma (frame acuan baru, data animasi, uji ekspor logo)
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: Aset logo dan avatar
- [x] Langkah 2–4: Layout statis dan verifikasi
- [x] Langkah 5–6: Gerakan carousel dan pengujian
- [x] Langkah 7: Dokumentasi, commit, push
