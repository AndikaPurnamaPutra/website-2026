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

### Snap disamakan dengan What we do (28 Okt 2026)
scrub 1 → 0,5, snap 0,4–1 detik `power2.inOut` → 0,6–0,9 detik `power3.out` tanpa jeda. Terukur sama dengan What we do: ±0,3 detik deteksi, lalu ±0,7 detik meluncur.

### Urutan masuk motto 1 dan label, versi 3 (28 Okt 2026)
Atas permintaan pengguna: motto 1 muncul lebih dulu, dan label "( Our Motto's )" baru muncul ketika motto sudah benar-benar di tengah (section tertahan).
- Motto 1 muncul dari blur di 0,45–0,8 timeline masuk (lengkap sebelum pin). Terukur: 0,37 di 50%, 0,98 di 70%.
- Label: animasi otomatis (memudar 0 → 0,5 sambil naik 8px, 0,6 detik `power2.out`) yang dipicu ScrollTrigger tersendiri di 24px sebelum pin (`top top+=24`), dan berbalik saat scroll kembali ke atas. Dibuat otomatis karena pengguna berhenti di langkah 0 saat section tertahan. Saat halaman dimuat di bawah titik itu, label langsung tampil.
- Terukur: label 0 hingga 100px sebelum pin; 0,29 / 0,49 / 0,5 pada 0,15 / 0,45 / 1 detik setelah tiba di pin; tampil juga bila scroll roda berhenti 14px sebelum pin; kembali 0 saat scroll ke atas; langsung 0,5 setelah muat ulang di langkah 3. Langkah 0–5 maju/mundur tetap benar. Reduce motion: tampil tanpa animasi.

### Langkah tahan sebelum footer (27 Okt 2026, opsi A disetujui)
- Setelah langkah 5 (highlight "One Week Wonders Studio™") ada **satu scroll lagi (langkah 6)** sebelum section dilepas ke footer, supaya frame terakhir dan tombol Get a Quote sempat terbaca.
- Di langkah 6 hanya cahaya yang "bernapas" sedikit: posisi bergeser ke x 736,5 / y −355,5 dan skala 0,83 → 0,87 (`sine.inOut`). Teks dan tombol tetap sama seperti Figma 1527:4241.
- Diuji di 1440px: maju 5 → 6 → footer dan mundur footer → 6 → 5 berjalan per langkah, footer baru naik setelah langkah 6. Langkah 6 tetap terjaga setelah resize ke 1920px. Reduced motion juga lolos.

### Transisi Milestone → Motto dimulai lebih lambat (27 Okt 2026, permintaan pengguna)
- Sebelumnya transisi mulai saat Motto baru masuk dari bawah layar, dan teks gelap Milestone masih terlihat di atas latar abu-abu.
- Sekarang transisi baru mulai saat Motto sudah masuk 25% dari bawah layar (`start: "top 75%"`). Milestone memudar lebih dulu selagi latar masih putih, baru setelah itu latar menggelap.
- Terukur di 1440px (posisi atas Motto dari atas layar): Milestone 1 → 0,22 → 0 di 70 / 60 / 50%. Latar putih sampai 50%, lalu #c3c3c3 di 40%, #636363 di 30%, #1b1b1b di 20%, dan #111 di 10%. Motto 1 0,37 di 30% dan penuh di 10%. Scroll kembali ke atas mengembalikan Milestone dan latar putih.

### Variasi transisi Milestone → Motto: dicoba, tidak dipakai (27 Okt 2026)
Pengguna memilih tetap memakai transisi scrub dengan wrapper (versi "mulai lebih lambat" di atas). Waktunya disesuaikan lagi di bagian berikut. Tiga variasi sudah dicoba dan dibatalkan:
1. Transisi hanya di section Motto, tanpa wrapper, mulai di 15% dari atas layar.
2. Berbasis waktu (seperti manual.studio), dipicu di 15%.
3. Berbasis waktu, dipicu di 60%, dengan teks Milestone versi terang dan menu bar gelap.

### Transisi dimulai lebih dekat, dengan serah terima (27 Okt 2026, saran disetujui)
- Tujuannya supaya jarak Milestone → Motto 1 (±710px di 1440px: padding bawah Milestone 200px ditambah Motto 1 di tengah section) tidak terasa kosong.
- `start: "top 50%"` (sebelumnya 75%). Urutannya, diukur dari posisi atas Motto: Milestone memudar 50 → 35%, latar menggelap 40 → 15%, Motto 1 muncul 30 → 10% (saat itu Motto 1 sudah terlihat di ±80 → 60% layar), dan latar Motto 15 → 0%.
- Terukur di 1440px: Milestone 1 / 0,77 / 0,22 / 0 di 50 / 45 / 40 / 35%. Latar #e8e8e8 / #acacac / #636363 / #272727 / #111 di 35 / 30 / 25 / 20 / 15%. Motto 1 0,58 / 0,88 / 1 di 25 / 20 / 10%.
- Sisa fase kosong (abu-abu tanpa teks) hanya di sekitar 35 → 27%, ±80px scroll. Teks putih Motto 1 baru terbaca setelah latar cukup gelap.
- Langkah 0–4 dan scroll balik tetap benar.

### Motto menumpuk ke padding bawah Milestone (27 Okt 2026, disetujui)
- Jarak dari teks terakhir Milestone ke Motto 1 adalah ±710px di 1440px: padding bawah Milestone 200px ditambah Motto 1 di tengah layar 512px. Mengubah timing tidak mengurangi jarak ini.
- Dengan transisi JS aktif (`.tone-shift.is-toned`), `.milestone` diberi margin bawah negatif, sehingga section Motto dimulai lebih tinggi. Percobaan pertama 200px (jarak ke Motto 1 ±495px), lalu dipilih **350px** (`fluid(-350)`), sehingga jarak ke Motto 1 menjadi ±345px. Tumpukannya tidak terlihat, karena latar Motto masih transparan dan Milestone memudar sebelum latar gelap. Frame Motto yang tertahan tidak berubah. Tanpa JS atau dengan reduced motion, padding 200px tetap seperti Figma.
- Terukur di 1440px dengan 350px: saat atas Motto di 50%, teks Milestone berakhir di 662px dan Motto 1 di 1007px. Milestone memudar saat teksnya di 66 → 46% layar, dan Motto 1 muncul di ±73 → 67%. Urutan transisi sama seperti sebelumnya. Langkah 0–6 maju dan mundur, muat ulang di langkah 6, dan pelepasan ke footer tetap benar.

### Ekor huruf terpotong pada gradien per huruf (27 Okt 2026)
- Ekor huruf "g" di "Trendsetting Design" sempat terpotong saat gradien menyala, karena salinan gradien diposisikan absolut, sehingga kotaknya hanya setinggi line-height (46px), sedangkan teksnya 52px.
- Peran kedua salinan sekarang ditukar: salinan gradien tetap inline (kotak gradien setinggi teks penuh, sama seperti teks aksen tanpa JS), dan salinan putih yang absolut di atasnya.
- Terukur di 1440px: kedua salinan tepat di atas huruf asli (selisih 0px) di ketiga baris, dan kotak gradien 52px. Screenshot langkah 0, 3, dan 5: ekor "g" utuh.

### Tanpa snap: scroll halus dengan zona diam (27 Okt 2026, saran disetujui)
- Masukan pengguna: snap terasa "tertahan". Penyebabnya, setelah scroll berhenti browser butuh ±0,3 detik untuk mendeteksinya, lalu halaman ditarik ke langkah terdekat, dan satu gerakan scroll hanya memindahkan satu langkah.
- Snap dihapus dari What we do dan Motto. Scrub 0,8 detik. Setiap langkah tetap selebar satu layar scroll, tapi dibagi: transisi (panjang 1) + **zona diam** `REST = 0.6` (setengah sebelum transisi pertama, setengah setelah transisi terakhir), sehingga ±40% setiap langkah menahan tampilan langkah itu walaupun scroll berjalan. Posisi timeline dipetakan dengan `stepTime()`. Label `stepN` ada di tengah zona diam (`restTime()`), dan dipakai untuk menjaga langkah saat resize.
- Terukur di 1440: langkah 1 diam di 0,85–1,15, flip ke motto 2 di 1,5, motto 3 dan CTA di ±3,85, cahaya ke tengah di 4,5–4,85, tahan terakhir (bernapas) di 5,5–5,9, lalu dilepas ke footer. Gradien huruf tetap berjalan dengan waktunya sendiri. Resize di langkah 3 ke 1920px tetap di langkah 3.

### Teks Milestone bisa diseleksi lagi (27 Okt 2026, masukan pengguna)
- Karena Motto dimulai 350px lebih tinggi, section Motto (masih transparan) menutupi bagian bawah Milestone, sehingga paragraf "Visual trends evolve…" tidak bisa diseleksi atau diklik (elemen di bawah kursor: `motto`).
- Dengan transisi JS aktif, Milestone diletakkan di atas Motto (`position: relative; z-index: 1`). Hanya `.milestone__inner` yang menangkap pointer, dan setelah Milestone memudar (`visibility: hidden`), klik kembali sampai ke Motto.
- Terukur: paragraf, baris angka, dan judul Milestone kini terkena kursor (OK). Tombol Get a Quote dan label Motto tetap terkena kursor saat Motto tertahan.

### Cahaya yang lebih halus dan label CTA (27 Okt 2026, saran disetujui)
Masukan pengguna: gerak cahaya terasa kasar, terutama perpindahan dari kiri ke tengah yang memakai rotasi.

Rencana:
- **Dua lapisan cahaya** (`light.svg` = Vector 3209, sama dengan Figma): kiri di posisi frame 1527:4219, dan tengah di posisi akhir 1527:4241 (rotasi 47,3° dan skala 0,83 sebagai posisi tetap, tidak dianimasikan). **Tidak ada rotasi yang dianimasikan.**
- **Berbasis waktu, bukan scrub:** cahaya punya timeline sendiri (`off → left → center → hold`) yang diputar ke label yang sesuai saat timeline scroll melewati tengah langkahnya (cara yang sama dengan gradien huruf), dan berbalik saat scroll ke atas. Setiap segmen 1,6 detik `sine.inOut`.
  - Kiri masuk: memudar masuk sambil bergeser dari −80px.
  - Kiri → tengah: kiri memudar keluar sambil bergeser sedikit ke kanan, dan cahaya tengah memudar masuk sambil sedikit membesar (0,78 → 0,83).
  - Tahan terakhir: cahaya tengah "bernapas" (posisi dan skala 0,87 seperti sebelumnya), sekarang dengan tempo tetap.
- **Label** (temuan dari Figma): di 1527:4219/4241 label menjadi **"( Got an idea? Let’s work with us )"**. Label berganti bersamaan dengan flip ke motto 3 (dua teks ditumpuk, saling memudar). Tanpa JS, frame terakhir menampilkan label CTA.

Hasil:
- Terukur di 1440: langkah 3: kedua cahaya 0, label "Our Motto’s". Langkah 4: kiri 1 (x 0), label CTA 1. Perpindahan ke tengah (di tengah segmen): kiri 0,75, tengah 0,25 (skala 0,79). Rotasi cahaya tengah 47,3° di semua keadaan (tidak berputar). Langkah 5: tengah 1 (skala 0,83). Tahan: skala 0,87.
- Scroll ke atas melewati beberapa langkah: perjalanan dibatasi maksimal 1,6 detik (dari tahan ke mati ±2 detik termasuk scrub), bukan 3 × 1,6 detik.
- Screenshot langkah akhir cocok dengan frame Center Light (label CTA, cahaya tengah dari atas).
- Reduced motion: keadaan langsung (langkah 3 mati, langkah 4 kiri, langkah 5,6 tengah). Tanpa JS: hanya cahaya tengah dan label CTA (frame terakhir).

### Cahaya mengalir sebagai satu gerakan (27 Okt 2026, saran disetujui)
- Masukan pengguna: cahaya hanya bergerak di setiap perpindahan langkah. Sekarang cahaya mengikuti **seluruh scroll dari langkah 3 sampai akhir pin pada satu lintasan** (`LIGHT_FROM = 3.2` → `steps`, dalam layar), tidak berhenti di zona diam, dan **menyusul scroll ±1,5 detik** (`quickTo` pada waktu timeline cahaya, `power3.out`).
- Lintasan: kiri menyala dan bergeser masuk (0–1), lalu crossfade panjang kiri → tengah (0,9–2,3; tengah 0,78 → 0,83), lalu tengah bernapas (2,3–3,2; skala 0,87). Tetap tanpa rotasi yang dianimasikan.
- **Ambient** (usulan, tidak ada di Figma): wadah `.motto__lights` bergeser ±24 / 16px dan kecerahannya berdenyut 1 ↔ 0,8, dengan siklus 9 / 7 / 4,5 detik `sine.inOut` (yoyo). Hanya berjalan saat Motto di layar, dan dimatikan untuk reduced motion.
- Terukur di 1440 (posisi pin dalam layar → kiri / tengah): 3,5 → 0,26 / 0; 3,9 → 0,9 / 0; 4,1 → 0,98 / 0,02; 4,5 → 0,63 / 0,37; 4,9 → 0,15 / 0,85; 5,5 → 0 / 1 (skala 0,84); akhir → skala 0,87. Lompat 3,5 → 5: 0,3 detik 0,72 / 0,28; 1 detik 0,09 / 0,91. Rotasi tengah tetap 47,3°. Gradien huruf dan label tidak berubah.

### Satu cahaya lembut (27 Okt 2026, keputusan pengguna)
- Masukan pengguna: cahaya masih kasar dan tidak menyatu, dan cahaya tengah terlihat sejak awal section (di browser pengguna: CSS tanpa JS menampilkan frame terakhir sebelum JS menyembunyikannya).
- Dua bentuk cahaya segitiga Figma (1527:4219 / 4241, `light.svg`) diganti **satu pendar lembut** `.motto__glow`: radial gradient putih 10% → 5% → 0, kotak 1500 × 1100 dengan pusat di tengah atas (top −430). Bentuknya sedikit berbeda dari Figma (disetujui pengguna). Tidak ada rotasi.
- **Tersembunyi lewat CSS** begitu JS aktif (`.motto.is-enhanced .motto__glow { opacity: 0; visibility: hidden }`), jadi tidak bergantung pada urutan animasi. Tanpa JS: pendar di posisi akhir (frame terakhir).
- Lintasan (satu timeline, mengikuti scroll dari 3,2 layar sampai akhir pin dengan jeda menyusul ±1,5 detik): muncul di kiri atas (offset −390, +140; skala 0,9 → 1), meluncur ke tengah atas, lalu bernapas (skala 1 → 1,06). Gerak ambient tetap pada wadah `.motto__lights`.
- Terukur di 1440 (scroll roda dari Milestone): tersembunyi sampai 3,0; opacity 0,03 / 0,34 / 0,88 / 1 di 3,3 / 3,6 / 3,9 / 4,2 (pusat ±355, 270); meluncur 4,5 → 5,4 (pusat 425,238 → 744,120); bernapas sampai lebar 1590. Screenshot langkah 4 (kiri atas) dan langkah akhir (tengah atas).
- `light.svg` tidak dipakai lagi.

### Kembali ke dua sinar Figma, dengan perpindahan searah (27 Okt 2026, saran disetujui)
- Pengguna tidak menyukai pendar bulat. Kembali ke dua sinar Figma (`light.svg`, kiri 1527:4219 dan tengah 1527:4241), dengan gerak versi terakhir: satu lintasan sepanjang scroll (3,2 layar → akhir pin), jeda menyusul ±1,5 detik, dan gerak ambient pada `.motto__lights`.
- **Perpindahan searah:** selama 1,4 unit kedua sinar bergerak ke arah yang sama (dari kiri ke tengah atas). Sinar kiri bergeser 35% dari jarak kiri → tengah sambil memudar. Sinar tengah datang dari 65% jarak itu (skala 0,8) ke posisinya (skala 0,83) sambil menyala. Posisi memakai `sine.inOut`, sedangkan opacity bersilang linear, sehingga jumlahnya tetap 1 (tidak ada lonjakan terang). Sudut sinar tengah tetap 47,3° (tidak dianimasikan). Di akhir sinar tengah bernapas (skala 0,87).
- **Tersembunyi lewat CSS** begitu JS aktif (`.motto.is-enhanced .motto__light`), jadi sinar tengah tidak lagi terlihat sejak awal section. Tanpa JS: hanya sinar tengah (frame terakhir).
- Terukur di 1440 (scroll roda): tersembunyi sampai 3,0; kiri 0,03 / 0,34 / 0,82 / 0,96 di 3,3 / 3,6 / 3,9 / 4,2. Perpindahan 4,2 → 5,4: kiri / tengah 0,72 / 0,28 → 0,48 / 0,52 → 0,24 / 0,76 → 0 / 1, dengan jumlah 1,00 di setiap titik. Kedua sinar bergeser searah (kiri x 0 → 251, tengah x 466 → 716). Sudut tetap 47°.

### Cahaya yang tenang (27 Okt 2026, saran disetujui)
- Masukan pengguna: versi yang bergerak terasa "memusingkan" (gerak ambient yang terus berjalan, jeda menyusul yang membuat cahaya masih bergerak setelah scroll berhenti, dan sinar besar yang bergeser).
- Sekarang **kedua sinar Figma diam di posisi Figma**, tidak bergeser dan tidak berputar. Gerak ambient dan wadah `.motto__lights` dihapus. Hanya kecerahan yang berubah, pelan (2 detik `sine.inOut`, dengan waktunya sendiri), saat scroll melewati tengah langkah: langkah 4 sinar kiri menyala; langkah 5 sinar kiri meredup sementara sinar tengah menyala (kurva sama, jumlah tetap 1). Setelah itu semuanya diam. Scroll ke atas membaliknya (paling lama 2 detik). Langkah tahan tidak lagi menggerakkan cahaya. Tetap disembunyikan lewat CSS sampai waktunya.
- Terukur di 1440: posisi kiri (0, 0) dan tengah (717, −365) sama di semua titik. Langkah 0 dan 3: 0 / 0. Langkah 4: kiri 0,28 setelah 0,8 detik, 1 setelah 3,3 detik. Langkah 5: 0,57 / 0,43 setelah 1 detik, 0 / 1 setelah 3,5 detik (jumlah 1,00). Langkah 6: tetap 0 / 1. Kembali ke langkah 3: 0 / 0.

### Konsep "lampu sorot di atas panggung" (27 Okt 2026, disetujui)
Masukan pengguna: versi tenang terasa jelek. Pengguna ingin bentuk cahaya seperti di Figma, dibuat dengan versi sendiri, dan bergerak mulus (tidak patah-patah).

- **Penyebab patah-patah:** cahaya berupa SVG besar dengan `feGaussianBlur`. Setiap perubahan skala membuat browser menggambar ulang dan mem-blur ulang di setiap frame.
- **Cahaya dibuat ulang dengan gradien CSS** (tanpa filter blur, digambar sekali, lalu dipindahkan oleh GPU):
  - **Pendar bawah** (Ellipse 8998: elips 1440 × 724 di y 802, gradien putih 4% → 1%, blur 50): elemen bulat dengan gradien yang sama dan tepi lembut lewat `mask-image` radial.
  - **Sinar** (Vector 3209: segitiga dari ujungnya, sebaran ±40°, gradien putih 1% → 4% menjauhi ujung, blur 64): elemen dengan gradien sepanjang sinar, bentuk dan tepi lembut lewat `mask` conic (sudut) dan radial (ujung jauh).
- **Satu perjalanan cahaya yang utuh**, mengikuti scroll di seluruh pin dan dihaluskan (menyusul ±0,6 detik), tidak berhenti di zona diam:
  - 0 → 1: pendar bawah muncul (frame 1527:4169).
  - 1 → 3: pendar naik perlahan ke posisi 1527:4201.
  - 3,2 → 4: pendar memudar sementara sinar menyala di kiri atas (1527:4219).
  - 4 → 5: lampu sorot meluncur ke tengah atas sambil sinarnya menegak (berputar di ujungnya sendiri, seperti lampu sorot), sampai posisi 1527:4241.
  - 5 → 6: diam.
- Tanpa gerak ambient. Kedua cahaya disembunyikan lewat CSS sampai JS menampilkannya. Tanpa JS: frame akhir (sinar tengah). Reduced motion: langsung ke keadaan langkahnya.
- `light.svg` dan `ellipse.svg` tidak dipakai lagi.

Hasil:
- Terukur di 1440 (scroll roda dari Milestone; posisi dalam layar sejak pin): pendar bawah 0,12 / 0,64 / 1 di 0,4 / 0,7 / 1,0, lalu naik y 0 → −155 di 1 → 3. Di 3,3 / 3,6 / 3,9 pendar 0,95 / 0,49 / 0,04 sementara sinar 0,05 / 0,51 / 0,96 (sinar kiri, −46,4°). Lampu sorot meluncur: 4,2 → (−655, 334) −42°; 4,5 → (−378, 193) −24°; 4,8 → (−85, 44) −5°; 5,1 → (0, 0) 0,9°. Setelah itu diam.
- Screenshot langkah 4 dan 5 dibandingkan dengan frame Figma "Left Light" dan "Center Light": arah, posisi, dan kecerahan sinar mirip.
- Reduced motion: langsung ke keadaan langkahnya. `light.svg` dan `ellipse.svg` tidak dipakai lagi.
- **Tidak ada kilatan sinar saat dimuat** (masukan pengguna: segitiga terlihat sejak awal; tidak bisa direproduksi di pengujian, termasuk dengan GPU dan layar 2×, di mana langkah 0 sama dengan Figma per area). Penyebab yang paling mungkin: sebelum JS berjalan, CSS menampilkan keadaan tanpa JS. Sekarang `<head>` langsung memasang kelas `js` pada `<html>` sebelum apa pun digambar (`src/pug/layouts/default.pug`), dan sinar serta pendar disembunyikan oleh `.js .motto :is(.motto__beam, .motto__ellipse)` sejak gambar pertama. Terukur: langkah 0 tersembunyi; langkah 1 pendar; langkah 4–5 sinar.

### Lampu panggung: pergantian dengan iris (27 Okt 2026, opsi A disetujui)
- Seperti lampu panggung sungguhan: lampunya diam, dan pergantian adegan memakai lampu lain (*lighting cue*). Dua lampu CSS (`.motto__beam--left` / `--center`) diam di posisi Figma (kiri: ujung −12, −65, −46,4°, skala 1,205; tengah: ujung 704,5, −430,5, 0,9°, skala 1). Tidak bergeser dan tidak berputar.
- **Iris:** lampu menyala dengan sinar yang melebar dari celah (`scaleX` 12% → 100%) dan memanjang (`scaleY` 70% → 100%) sambil terang naik, 1,4 detik `power2.inOut`. Lampu mati dengan iris menutup (1,1 detik).
- **Cue** dengan waktunya sendiri saat scroll melewati tengah langkah: langkah 4 lampu kiri menyala; langkah 5 lampu kiri mati dan lampu tengah menyala 0,4 detik kemudian, menyorot judul. Scroll ke atas membaliknya (lompatan dua cue maksimal 1,5 detik).
- Pendar bawah tetap pada lintasan yang mengikuti scroll (langkah 1–3, memudar di 3,2–4).
- Terukur di 1440: langkah 3 kedua lampu 0 (lebar 12–14%). Lampu kiri terbuka: 0,06 / 0,24 / 0,6 / 0,87 / 1 dengan lebar 0,21 / 0,40 / 0,78 / 1,06 / 1,2 (setiap ±0,2 detik). Langkah 5: kiri 0,88 → 0,42 → 0,07 → 0 sementara tengah 0,01 → 0,11 → 0,89 → 1. Sudut tetap −46,4° dan 0,9°. Kembali ke langkah 3: keduanya mati, pendar menyala.
- `light.svg` dan `ellipse.svg` tidak dipakai lagi.

### Sinar segitiga dihapus (28 Okt 2026, permintaan pengguna)
- Kedua sinar lampu (kiri 1527:4219 dan tengah 1527:4241, `.motto__beam`) dihapus dari markup, CSS, dan JS (cue lampu panggung). Ini keputusan pengguna dan berbeda dari Figma.
- Pendar dari bawah (Ellipse 8998, langkah 1–3) tetap, dan memudar di langkah 4 seperti di Figma, jadi langkah 4–6 tanpa cahaya. Label CTA, tombol, dan langkah lain tidak berubah.
- Terukur di 1440: tidak ada elemen sinar. Pendar 0 / 1 / 1 / 0 / 0 / 0 di langkah 0 / 1 / 3 / 4,2 / 5,2 / 6. Label CTA dan tombol tetap muncul di langkah 4.

## Keluar dari Motto tanpa "tertahan" (28 Okt 2026, laporan pengguna)
- **Masalah:** setelah langkah 5 (seluruh kalimat bergradasi), pin masih menahan section selama ±1,2 layar scroll tanpa perubahan apa pun (langkah 6 "tahan sebelum footer"), lalu section dilepas dari diam langsung ke kecepatan penuh. Rasanya tertahan, lalu tiba-tiba lepas.
- **Perbaikan:**
  - Langkah 6 dihapus (`steps = 5`). Setelah langkah 5 tersisa setengah jeda biasa, lalu **keluar**: selama 0,4 layar terakhir pin, isi (`.motto__inner`) naik makin cepat (y = −0,2 layar × t²), sehingga kecepatannya mencapai kecepatan halaman tepat saat section dilepas.
  - Bagian keluar terikat langsung ke scroll (ScrollTrigger tanpa scrub). Di dalam timeline yang memakai scrub 0,8, isi sempat melonjak ±2× kecepatan scroll saat dilepas.
  - Panjang pin dihitung dari panjang timeline (`length`), sehingga satu layar tetap 1,6 satuan timeline.
- **Terukur** (kecepatan isi dibanding scroll, roda mouse): 0 → 0,06 → 0,33 → 0,59 → 0,81 → 0,96 → 1,0, lalu tetap 1. Section dilepas di 1,0, tanpa lonjakan.
- Screenshot langkah 5 (gradasi dan CTA), keluar, dan sesudah lepas (footer tersingkap) sesuai. Pin sekarang 4860px (sebelumnya 6 layar = 5400px di 900px).

## Dicoba lalu dibatalkan (29 Okt 2026)
Masuk meluncur ke pin, langkah yang lebih panjang dengan batas kecepatan, zona diam pendek, peralihan terang → gelap yang lebih panjang, flip dan highlight yang diselaraskan, lalu "satu gerakan scroll, satu langkah". Semuanya dibatalkan pengguna, dan Motto kembali ke versi di atas (commit 8d460a4). Perbaikan nilai awal setelah refresh di What we do (`time(0).invalidate()`) tetap dipakai.

## Peralihan Milestone → Motto lebih panjang (29 Okt 2026, permintaan pengguna)
- Sebelumnya latar berubah dari 255 ke 17 dalam ±120px scroll. Sekarang rentangnya dari atas Motto di **85%** layar (sebelumnya 50%) sampai pin, dan latar menggelap selama 70% rentang itu (±440px).
- Milestone memudar lebih pelan (0,45, `sine.inOut`), dan kalimat 1 muncul lebih awal (0,38), sehingga keduanya bertumpuk dan tidak ada layar kosong.

- "Satu gerakan scroll, satu langkah" dicoba sekali lagi di atas versi ini, lalu dibatalkan pengguna (terasa aneh). Motto tetap mengikuti scroll bebas.

## Jeda untuk membaca Milestone (29 Okt 2026, permintaan pengguna)
- **Masalah:** Motto menumpuk 350px ke bawah Milestone (`margin-bottom: fluid(-350)`, keputusan lama agar kalimat 1 datang lebih cepat), dan peralihan mulai saat atas Motto di 85% layar. Isi Milestone (±400px teks dengan ruang 200px di atas dan bawah) belum pernah tampil utuh sebelum memudar.
- **Sekarang:**
  - Tumpukan dihapus.
  - Peralihan mulai saat atas Motto di **75%** layar. Saat itu teks Milestone sudah melewati tengah layar dan masih utuh terlihat (atas teks ±17px).
  - Terukur: teks Milestone tampil utuh dan diam selama ±470px scroll (bawah teks masuk layar → peralihan mulai), lalu latar menggelap selama ±470px.
- **Ruang kosong dikurangi** (masukan pengguna: terlalu banyak ruang kosong setelah tumpukan dihapus): Motto kembali menumpuk **200px** (ruang kosong bawah Milestone), dengan peralihan tetap mulai di 75%. Terukur: teks Milestone utuh di layar selama ±280px scroll dan berada di tengah layar (242–642) saat peralihan mulai. Setelah itu memudar sambil latar menggelap (255 → 227 → 160 → 83 → 28).
- **Tahan setelah highlight terakhir** (permintaan pengguna): setelah "One Week Wonders Studio™" ber-gradasi, tampilan ditahan ±0,3 layar scroll (`HOLD`, ±1 gerakan scroll) sebelum keluar ke footer. Pin bertambah 0,3 layar.
- **Flip lebih elegan** (masukan pengguna: terlalu cepat):
  - Kurva `power3.in`/`power3.out` diganti `sine.in`/`sine.out`, karena power3 menumpuk putaran di tengah perpindahan.
  - `REST` 0,6 → 0,35: perpindahan mendapat jarak scroll lebih panjang tanpa memperpanjang section.
  - Scrub 0,8 → 1,2.
  - Terukur (sudut putar per 10px scroll, flip kalimat 1 → 2): maksimal **13,3° → 4,7°**, dan rentang scroll flip **410 → 640px**.
  - Screenshot langkah, keluar, scroll balik, dan reload: benar, tanpa exception.
- **Highlight kalimat 3 menunggu lebih lama** (masukan pengguna: terasa langsung muncul): terukur, jarak flip → highlight sama untuk kalimat 2 dan 3 (±600px). Tapi langkah kalimat 3 juga membawa label baru, latar diagonal, dan CTA. Highlight kalimat 3 sekarang dimulai di akhir langkahnya (`delay` 0,85, sebelumnya 0,5).

## Satu proses kira-kira satu gerakan scroll (30 Okt 2026, permintaan pengguna)
- Pengguna: perubahan tidak boleh langsung beruntun, baik saat maju maupun mundur, dan setiap proses terasa ±1 gerakan scroll (tanpa dikunci).
- Timeline sekarang dihitung dalam layar scroll:
  - Zona tenang `DWELL` 0,22 layar (±200px) sebelum dan sesudah setiap perubahan.
  - Flip `FLIP` 0,38 layar (±340px).
  - Highlight dipicu di satu titik (berjalan dengan waktunya sendiri).
  - Sebelum highlight kalimat 3 jedanya 0,35 layar (ada label baru, latar diagonal, dan CTA).
  - Lalu tahan 0,3 layar dan keluar 0,4 layar.
- **Hysteresis:** highlight yang sudah berjalan baru mundur setelah scroll naik 0,1 layar (±90px) melewati titiknya, sehingga scroll naik sedikit tidak langsung membatalkannya.
- Label langkah (`step0`–`step5`) ada di titik-titik tenang, untuk menjaga langkah saat resize.
- **Terukur** (1440 × 900, posisi dari awal pin, dicek setiap 30px):
  - **Maju:** kalimat 1 → highlight di 210 → tenang → flip 420–720 → kalimat 2 → highlight di 960 → tenang → flip 1170–1470 → kalimat 3 + CTA → highlight di 1800 → tahan ±260px → keluar.
  - **Mundur:** highlight 3 hilang di 1680 (120px di atas titik majunya) → flip 1440–1260 → highlight 2 hilang di 840 → flip 690–390 → highlight 1 hilang di 90.
  - Reload di tengah, lalu scroll ke atas: benar, tanpa exception.
- **Flip menunggu highlight** (laporan pengguna: highlight belum selesai sudah flip, dan sebaliknya):
  - Timeline tidak lagi di-scrub oleh ScrollTrigger. Pin hanya menentukan tujuan, dan ticker menggerakkan timeline ke sana dengan halus (`FOLLOW` 3/detik, setara scrub ±1,2 detik).
  - Selama gelombang highlight masih berjalan, timeline tidak masuk ke flip sesudahnya. Selama highlight masih mundur, timeline tidak mundur ke flip sebelumnya. Setelah itu timeline menyusul.
  - Titik flip di sekitar setiap highlight disimpan di `toGradient(i, at, before, after)`.
  - Terukur dengan scroll cepat (0,4 detik):
    - Maju: highlight 1 selesai di 870 ms, flip mulai di 954 ms.
    - Mundur dari kalimat 2 ber-highlight: highlight hilang di 589 ms, flip mundur mulai di 1089 ms.
- **Rem per usapan** (laporan pengguna: satu usapan trackpad langsung sampai flip; pilihan A):
  - Lewat `addWheelFilter()` di `smooth-scroll.js` (opsi `virtualScroll` Lenis). Setiap usapan baru (jeda > 180 ms, arah berbalik, atau kekuatan naik lagi setelah melemah) mendapat batas: titik tenang berikutnya ke arah usapan (`calm`, toleransi 24px).
  - Usapan bergerak bebas sampai batas itu, berhenti lembut di sana (`lenis.scrollTo`), dan sisa momentumnya dibuang. Tidak ada luncuran otomatis.
  - Dimulai dari 0,6 layar sebelum pin. Setelah titik tenang terakhir, scroll bebas ke footer. Keyboard dan layar sentuh tetap scroll biasa.
  - **Terukur** (usapan trackpad simulasi, sedang dan kencang 3×):
    - Maju: satu usapan = satu titik (91 → 293 highlight 1 → 837 kalimat 2 → 1035 highlight 2 → 1634 kalimat 3 → 1890 highlight 3).
    - Mundur: satu usapan = satu titik (1633 → 1038 → 837).
    - Dari titik terakhir, satu usapan lanjut ke footer.
    - Roda diputar cepat (12 putaran dalam satu gerakan): berhenti di titik tenang berikutnya.
    - Reload tanpa exception.
  - **Rem hanya setelah highlight** (pengguna: perlu 2 usapan per kalimat): titik rem sekarang hanya kalimat 1, 2, dan 3 yang sudah ber-highlight. Satu usapan = flip + highlight satu kalimat. Jeda sebelum dan sesudah highlight tetap ada.
  - **Magnet setelah usapan** (pengguna: usapan sedang belum sampai ke kalimat berikutnya; pilihan A). Terukur: usapan sedang ±350px, sedangkan jarak antarkalimat ber-highlight ±740px.
    - Bila roda diam 200 ms dan halaman berhenti di antara dua kalimat (di area rem), halaman meluncur 0,6 detik (ease-out cubic) ke kalimat ber-highlight berikutnya, searah usapan terakhir.
    - **Terukur:**
      - Maju: usapan sedang → kalimat 1 (297), usapan ringan → kalimat 2 (1035), usapan sedang → kalimat 3 (1890), usapan kencang → bebas ke footer.
      - Satu putaran roda dari kalimat 1 → kalimat 2.
      - Mundur dari area tahan: 1890 → 1035 → 297 → keluar ke atas.
      - Reload tanpa exception.
  - **Flip dan highlight terpisah lagi** (pengguna: jangan digabung): rem dan magnet kembali di semua titik tenang. Satu usapan = satu perubahan (flip atau highlight).
    - **Perbaikan:**
      - Magnet tidak lagi bekerja bila usapan sudah direm tepat di titik tenang (`onCalm`). Sebelumnya usapan kencang yang berhenti di kalimat 2 polos ikut dilanjutkan ke highlight-nya.
      - Usapan ke atas dari footer direm mulai 0,6 layar di bawah titik tenang terakhir.
    - **Terukur** (usapan sedang, ringan, dan kencang bergantian):
      - Maju: 99 kalimat 1 → 297 highlight 1 → 837 kalimat 2 → 1033 highlight 2 → 1634 kalimat 3 → 1890 highlight 3 → bebas.
      - Mundur: 2243 → 1897 → 1634 (highlight 3 hilang) → 1035 (kalimat 2).
      - Satu usapan = satu perubahan di semua kasus. Reload tanpa exception.
