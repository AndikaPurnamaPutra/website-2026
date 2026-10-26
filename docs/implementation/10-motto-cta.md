# 10 — Section Motto + CTA

Status: **Selesai (27 Okt 2026), menunggu review**
Figma: section storyboard "CTA - Darkmode" `1527:4259`. Urutan dari pengguna (27 Okt 2026):

| Langkah | Frame A (awal) | Frame B (setelah scroll) |
|---|---|---|
| 1 | `1527:4134` "Trendsetting Design, Grounded in Logic." putih semua, tanpa ellipse | `1527:4169` "Trendsetting Design" gradient biru, Ellipse 8998 muncul dari bawah (y = 802) |
| 2 | `1527:4185` "Design to advocates and investors into believers." putih, ellipse y = 802 | `1527:4201` "believers." gradient biru, ellipse naik (x = −24, y = 647) |
| 3 | `1527:4219` "One Week Wonders Studio™" putih, Vector 3209 "Left Light" menggantikan ellipse, tombol muncul | `1527:4241` seluruh teks gradient biru, cahaya pindah ke tengah ("Center Light") |

Data animasi Figma: kosong. Label: **[T]** dari Figma · **[P]** penjelasan pengguna · **[U]** usulan.

---

## 1. Requirement dari desain [T]
- Section 1440 × 1024. Padding 180px atas/bawah, isi 1050px di tengah, tersusun vertikal dengan gap 254px: label, motto, CTA.
- **Latar:** gradient vertikal `#111` → `#1F1F1F`. Di langkah 3, gradient miring 227,5° `#111` 13,4% → `#1F1F1F` 69,7%. Di atasnya tekstur (gambar) `mix-blend-mode: screen`, opacity 10%.
- **Label** "( Our Motto's )": Inter Medium 16px, line-height 1,7, putih 50%.
- **Motto:** General Sans 42px, line-height 1,1, −0,03em, putih, satu baris di tengah.
- **Gradient aksen (versi gelap, berbeda dari gradient brand):** `#81C4FB` 18,9% → `#718BFC` 52,4% → `#81C4FB` 80,9%, sudut ±185–188°. Bagian yang diberi gradient: "Trendsetting Design" (langkah 1), "believers." (langkah 2), dan seluruh "One Week Wonders Studio™" (langkah 3).
- **Ellipse 8998** (1440 × 724, cahaya lembut dari bawah, SVG dari Figma) dan **Vector 3209** (cahaya diagonal, SVG dari Figma).
- **CTA "Get a Quote":** versi terang dari komponen tombol CTA yang sudah ada (label putih dengan teks `#111`, bingkai putih, ikon panah putih, "Free 15min call" putih 50%). **Hanya muncul di langkah 3** [P].

## 2. Alur animasi [P] dan detail usulan [U]
Section **tertahan saat di-scroll** (seperti What we do). Satu langkah scroll = satu perubahan, dengan snap.

0. **Masuk dari Milestone [P]:** latar berubah dari terang ke gelap secara halus saat section mulai menutupi layar. [U] Dibuat dengan scrub: warna latar halaman bergeser dari putih ke `#111` selama ±60% tinggi layar terakhir sebelum section tertahan. Menu bar ikut berubah ke tema gelap.
1. **Motto 1 muncul [P]:** fade yang elegan. [U] Huruf muncul dari blur halus sambil naik sedikit, bergantian per kata.
   → scroll → **"Trendsetting Design" menjadi gradient** [P], dengan crossfade halus seperti "$139M+" di Milestone. **Ellipse naik dari bawah** mengikuti scroll [P].
2. **Pergantian ke motto 2 seperti flip clock [P]:** [U] setiap huruf/kata berputar ke atas (rotateX) seperti kartu jam flip. Motto lama terlipat ke atas, motto baru terbuka dari bawah, bergantian per kata.
   → scroll → **"believers." menjadi gradient**, dan ellipse naik sedikit (y 802 → 647).
3. **Pergantian ke motto 3 (flip) [P]**, dengan **ellipse memudar dan digantikan Vector 3209 "Left Light"** secara halus [P]. Tombol **"Get a Quote" muncul** [P].
   → scroll → **seluruh teks menjadi gradient**, dan **cahaya bergeser dari kiri ke tengah** (posisi dan rotasi Vector sesuai frame Center Light). Latar berubah ke gradient miring.
4. Setelah langkah terakhir, section dilepas dan halaman lanjut ke footer.

**Reduce motion:** langkah tetap berganti saat scroll, tetapi tanpa gerakan (pergantian instan).
**Tanpa JS:** tampil langkah 3 final (motto studio dengan gradient, tombol terlihat).

## 3. File
| File | Aksi |
|---|---|
| `src/pug/partials/motto.pug` | Baru: 3 motto, CTA versi terang, ellipse dan vector |
| `src/scss/sections/_motto.scss` | Baru |
| `src/scss/components/_cta-button.scss`, `src/pug/mixins/cta-button.pug` | Ubah: varian terang |
| `src/js/motto-scroll.js` | Baru: timeline pin + scrub + snap, transisi latar. Mengembalikan fungsi cleanup |
| `src/js/main.js`, `src/scss/main.scss`, `src/pug/pages/index.pug` | Ubah |
| `src/assets/images/motto/` | Baru: tekstur, Ellipse 8998, Vector 3209 |

## 4. Pertanyaan
1. **"Fade dari terang ke gelap" saat masuk dari Milestone:** apakah maksudnya warna latar ikut berubah dari putih ke gelap mengikuti scroll (usulan 0)? Di Figma kedua section bersebelahan tanpa transisi.
2. **Flip clock:** per kata (lebih terbaca, usulan) atau per huruf (lebih mirip jam flip asli, lebih ramai)?
3. **Tombol "Get a Quote"** mengarah ke mana? Usulan: `#` dulu.
4. **Jarak scroll:** satu langkah = satu tinggi layar, total 6 langkah (sekitar 6 layar scroll). Disetujui?

## 5. Verifikasi
- [x] Tampilan di setiap snap sama dengan frame Figma (1B, 2B, 3A, 3B dibandingkan berdampingan): teks, gradient, ellipse/cahaya, latar, tombol. Tanpa JS: posisi motto (466, 460) dan CTA (626, 760) sama dengan Figma.
- [x] Transisi diuji dengan scroll roda mouse sungguhan: setiap scroll maju tepat satu langkah (0 → 5). Masuk dari Milestone: latar putih memudar ke gelap. Keluar ke halaman berikutnya belum bisa diuji karena footer belum ada.
- [x] 1920px mengikuti skala 1,333× (selisih ≤ 0,7px).
- [x] Reduce motion: langkah tetap berganti tanpa gerakan, tanpa efek masuk. Tanpa JS: frame terakhir.
- [x] Menu bar berubah ke tema gelap di section ini. Build tanpa error.

## 6. Checklist
- [x] Analisis storyboard (6 frame) dan penjelasan pengguna
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban pertanyaan (latar ikut scroll: ya; flip per kata; tombol `#`; 6 layar scroll)
- [x] Layout statis + aset
- [x] Timeline animasi
- [x] Verifikasi, dokumentasi, commit, push

---

### Catatan implementasi
- **Gradient aksen** mengikuti Figma per motto: langkah 1 `#0B1550 → #718BFC → #81C4FB` (185,87°), langkah 2–3 `#81C4FB → #718BFC → #81C4FB` (184,89° / 188,17°). Kotak gradient = **seluruh baris** (seperti Figma), jadi setiap kata aksen menampilkan potongannya (`--pw`/`--wx` dihitung JS). Sempat salah memakai lebar kata aksen saja, sehingga "Design" terlihat lebih gelap dari Figma. Sudah diperbaiki.
- **Flip per kata:** setiap kata berputar pada porosnya sendiri (`transformPerspective` per kata). Kata lama keluar dulu, kata baru masuk sesudahnya. Versi pertama memakai perspektif baris, sehingga kata miring dan bertumpuk. Sudah diperbaiki.
- **Cahaya:** dua Vector di Figma berbeda bentuk, jadi kiri → tengah dibuat crossfade sambil bergeser 60px.
- **Tekstur:** 4096px / 5,4 MB → 1600px / 0,5 MB (tampil 10% opacity).
- Varian tombol CTA `light` ditambahkan ke komponen yang sudah ada.

---

### Revisi setelah review (27 Okt 2026)
1. **Transisi latar satu layar penuh:** Milestone dan Motto dibungkus `.tone-shift`. Latar wrapper berubah `#fff → #111` mengikuti scroll (saat Motto masuk dari bawah sampai tertahan), isi Milestone memudar keluar sambil naik 40px, lalu latar Motto (gradient + tekstur) muncul di akhir. Lapisan putih (veil) lama dihapus.
   - Bug yang ditemukan: nilai awal `fromTo` yang posisinya belum tercapai dihapus oleh refresh ScrollTrigger, sehingga latar Motto tampil terlalu cepat. Diperbaiki dengan `gsap.set` untuk kondisi awal dan `.to()` di timeline.
2. **Flip satu baris:** seluruh baris berputar sebagai satu kartu. Perspektif 4000px supaya baris yang lebar tidak terlihat miring.
3. **Gradient per huruf:** teks aksen tetap utuh (kerning dan lebar sama dengan Figma). JS menaruh salinan per huruf tepat di atas posisi setiap huruf (diukur dalam em, diulang setelah font termuat), lalu huruf berubah ke gradient satu per satu dari kiri ke kanan. Versi pertama yang memecah teks menjadi span per huruf membuat baris 6px lebih lebar karena kerning hilang. Sudah diganti.
4. **Cahaya:** satu bentuk saja (Vector dari frame Left Light). Bentuk ini muncul dari kiri sambil bergeser masuk, lalu berputar di ujungnya (47,3°, skala 0,83) dan meluncur ke posisi Center Light. Semua gerak cahaya dan ellipse memakai `sine.inOut` dengan scrub 0,8, dan snap lebih lembut. Aset `light-center.svg` dihapus.

**Verifikasi ulang:** setiap langkah dibandingkan dengan Figma (1B, 2B, 3A, 3B). Lebar baris 710 / 854,5 / 508 px (Figma 712 / 856 / 510). Salinan huruf tepat di atas huruf asli (selisih 0px). Transisi masuk diambil di 25 / 50 / 75%, dan seluruh layar berubah serentak. Flip datar. Reduce motion: langkah berganti tanpa gerak. Tanpa JS dan 1920px sesuai.

### Revisi kedua setelah review (27 Okt 2026)
- **Tekstur full width:** sebelumnya berukuran tetap 1550 × 1033 (skala desain), sehingga di layar 2560px atau layar yang lebih tinggi dari desain tepinya terlihat. Sekarang menutupi seluruh section (`inset: 0`, `object-fit: cover`).
- **Cahaya selalu di tengah:** cahaya dan ellipse sekarang dihitung dari tengah layar (`left: calc(50% + …)`), bukan dari tepi kiri. Pusat berkas cahaya di langkah akhir berada di x ≈ 723 dari 1440 (tengah 720), dan tetap di tengah pada 1920 dan 2560px. Posisi di langkah 4 tetap di kiri sesuai frame 3A.
- **Lebih dinamis dan halus:** scrub 1, snap `power2.inOut` 0,4–1 detik, gerak ellipse/cahaya `power2.inOut`, flip satu baris `power3` dengan sedikit gerak naik/turun (10px), gradient per huruf lebih cepat per huruf dengan stagger lebih panjang.
- **Pencegahan bug:**
  - Efek masuk sekarang dipasang di wadah baris (`.motto__lines`), bukan di baris pertama. Sebelumnya baris pertama dianimasikan oleh dua timeline sekaligus.
  - Resize di tengah section mempertahankan langkah yang sama. Langkah dicatat saat scroll (dibekukan selama resize), lalu dikembalikan setelah ScrollTrigger refresh.
  - `overflow-anchor: none` di `html`, supaya scroll anchoring browser tidak menggeser posisi saat layout berubah (disarankan untuk section yang di-pin).
- **Pengujian:** maju 0 → 5 lalu mundur 5 → 0 dan kembali ke Milestone (semua langkah konsisten dari kedua arah); scroll cepat dan bolak-balik (selalu berakhir di langkah utuh); resize 1440 → 1920 → 1280 di setiap langkah (langkah tetap sama); muat ulang di langkah 3 lalu scroll ke atas (semua langkah dan motto pertama tampil benar); tekstur dan posisi cahaya di 1440×1024, 1440×1200, 1920×1080, dan 2560×1440.

### Revisi ketiga setelah review (27 Okt 2026)
- **Tekstur tanpa celah saat transisi:** tekstur sekarang berada di wrapper `.tone-shift` sebagai lapisan sticky setinggi layar (`margin-bottom: -100vh`) di atas konten (screen 10%). Lapisan ini memudar masuk bersamaan dengan latar yang menggelap, jadi tidak ada lagi garis pemisah antara area Milestone dan area Motto. Tekstur di dalam section Motto hanya dipakai tanpa efek masuk (tanpa JS atau reduce motion; kelas `is-toned` di wrapper). Diukur: perbedaan kecerahan di batas section ≤ 1,6/255.
- **Gradient otomatis (disetujui):** gelombang per huruf tidak lagi mengikuti scroll. Gelombang dimulai sendiri (±0,8 detik, kiri → kanan) saat scroll melewati tengah langkahnya, dan berbalik (kanan → kiri) saat scroll mundur. Flip, cahaya, dan ellipse tetap mengikuti scroll. Sinkronisasi diabaikan selama refresh/resize, lalu diulang setelah posisi dipulihkan (sebelumnya resize di langkah 5 sempat mengembalikan gradient ke putih).
- **Pengujian ulang:** maju/mundur semua langkah, muat ulang di langkah 4 lalu scroll ke atas, resize 1440 → 1920 → 1280 → 1440 di langkah 1–5 (langkah dan gradient tetap), sampel opacity gradient terhadap waktu (maju dan mundur).
