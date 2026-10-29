# 05 — Section What we do (Services)

Status: **Selesai (23 Okt 2026), menunggu review**
Figma:
- Tampilan di homepage: Section-03 `1523:3292` (1440 × 1024).
- Storyboard animasi: "Section-3 (Details)" `1516:2229`, berisi 7 frame:

| # | Frame | Isi |
|---|---|---|
| 0 | Concept `1516:2230` | Daftar akordeon (semua layanan terlihat). **Berbeda dari homepage final** |
| 1 | Branding `1516:2261` | Sama dengan homepage final |
| 2 | Brand Strategy `1516:2285` | Kartu Branding naik ke atas, Brand Strategy aktif |
| 3 | UI/UX Design `1516:2323` | (nama layer: "Brand Strategy") |
| 4 | AI/Web Development `1516:2365` | |
| 5 | Illustration `1516:2405` | Kartu terakhir, tidak ada tumpukan di belakang |
| 6 | Fullscreen `1516:2439` | Gambar melebar penuh |

**Data animasi Figma kosong** (`get_motion_context`): tidak ada durasi, easing, atau jarak scroll. Semua gerakan di antara frame adalah **usulan** (bagian 5).

Label: **[T]** dari layer Figma · **[D]** diturunkan · **[U]** usulan.

---

## 1. Tujuan dan ruang lingkup

**Tujuan:** section gelap yang **tertahan (pinned) saat di-scroll**. Setiap langkah scroll mengganti layanan aktif (kartu dan gambar), sesuai storyboard.

**Termasuk:** layout statis (frame 1), 5 layanan, animasi scroll dengan GSAP + ScrollTrigger, dan pembersihan animasi (untuk Barba nanti).
**Tidak termasuk:** frame "Concept" (lihat pertanyaan 1), mobile, dan section lain.

---

## 2. Requirement dari desain

### 2.1 Layout (frame 1 / homepage) [T]
- Latar `#111`, tinggi 1024px.
- Label "(What we do)": Inter Medium 16px, line-height 1.7, putih, opacity 0.5, posisi (40, 39).
- **Gambar** 1015 × 944, posisi (385, 40), radius 4px, `object-fit: cover`.
- **Kartu aktif** 345px, posisi (20, 98):
  - Latar `--color-glass`, blur 100px, radius 4px, padding 20px. Isi tersusun vertikal dengan gap 32px:
  - Judul: General Sans 28px, line-height 1, putih (`.text-heading-28`).
  - Garis pemisah 0.5px, `--color-divider-dark`.
  - Tag: border 1px `--color-border-dark`, radius 4px, padding 6px 10px, Inter 14px putih, gap 8px, bisa turun baris.
  - Deskripsi: Inter 14px, line-height 1.5, putih, opacity 0.5.
- **Tumpukan di belakang** (2 kartu berikutnya, hanya judulnya yang terlihat):
  - Kartu 1: lebar 317 (0,919×), judul 22px, menonjol 16px di bawah kartu aktif.
  - Kartu 2: lebar 285 (0,826×), judul 20px, menonjol 32px.
  - Nilai blur dan radiusnya juga ikut mengecil, jadi ini **kartu yang sama yang diperkecil**. [D] Dibuat dengan `transform: scale()`.
- Paragraf bawah: "Visual trends evolve…", Inter 14px, line-height 1.5, putih, opacity 0.5, lebar 305px, di kiri bawah (40, ±900).

### 2.2 Konten 5 layanan [T]
| Layanan | Tag | Deskripsi |
|---|---|---|
| Branding | Logo, Brand Identity, Motion Design, Packaging | We delve into your brand's core values, mission, and vision to create a cohesive identity that resonates with your target audience. |
| Brand Strategy | Social Media, Strategic Design, Market Research, Brand Development | We turn your vision into a focused brand strategy that gives your business clarity, direction, and room to grow. |
| UI/UX Design | Mobile, Website, UX, Prototyping, Design System, Dashboard | We create intuitive digital experiences that make complex ideas feel simple, useful, and unmistakably yours. |
| AI/Web Development | CMS Development, AI Integration, Framer, Webflow, Custom Code | We transform thoughtful designs into fast, intelligent digital products—combining clean code and AI capabilities to perform beautifully across every screen. |
| Illustration | Custom Illustration, Iconography, 2D/3D Art, Mascot, Brand Asset | We craft custom illustrations and visual assets that bring personality, emotion, and a memorable identity to your brand. |

Teks tag layanan 3–5 akan dicek ulang dari layer Figma saat implementasi. Saat ini teks tersebut dibaca dari screenshot.

### 2.3 Perubahan antar frame (storyboard) [T]
- Kartu aktif **sebelumnya** naik ke y = −207 (hampir keluar dari atas), dengan judul mengecil dari 28 ke 24px. Bagian yang masih terlihat tertutup gradient gelap (lebar 373, tinggi 66–72px, dari `#111` ke transparan, blur 2px).
- Kartu aktif **baru** berpindah dari tumpukan ke posisi (20, 88). Mulai frame 2 posisinya 88, bukan 98. Label "(What we do)" tertutup gradient.
- Tumpukan di belakang selalu menampilkan 2 kartu berikutnya. Di frame 5 (Illustration), tumpukan kosong.
- Gambar berganti sesuai layanan (5 gambar berbeda).
- Frame 6: gambar Illustration melebar melebihi lebar layar (1472 × 571, rata bawah).

### 2.4 Inkonsistensi di Figma
- Tag di setiap kartu: 2 tag pertama Inter **Regular**, 2 tag berikutnya **Medium**. Lihat pertanyaan 4.
- Deskripsi di storyboard memakai General Sans, sedangkan homepage final memakai Inter. **Dipakai: Inter** (homepage final).
- Teks kartu tumpukan di storyboard tidak selalu sesuai urutan (misalnya di frame 3 masih tertulis "UI/UX Design" dan "Brand Strategy"). Di website, tumpukan akan selalu menampilkan 2 layanan berikutnya yang benar.

### 2.5 Aset
| Aset | Tujuan |
|---|---|
| 5 gambar layanan (perfume, storefront, aplikasi HiHi, Rowfest, ilustrasi kereta) | `src/assets/images/services/*.jpg` |

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/services.pug` | Baru | Data 5 layanan dan markup |
| `src/scss/sections/_services.scss` | Baru | Layout statis, kartu, tag, tumpukan, gradient |
| `src/js/services-scroll.js` | Baru | Timeline GSAP + ScrollTrigger (pin + scrub). Mengembalikan fungsi cleanup |
| `src/js/main.js` | Ubah | Memanggil `services-scroll.js` dan cleanup-nya |
| `src/scss/main.scss` | Ubah | `@use "sections/services"` |
| `src/pug/pages/index.pug` | Ubah | Memanggil partial setelah Statement |
| `src/assets/images/services/` | Baru | 5 gambar |

---

## 4. Urutan implementasi
1. Unduh 5 gambar dan cek isinya. Teks tag layanan 3–5 dicek dari layer Figma.
2. Markup dan CSS **statis**, yaitu frame 1. Tanpa JS, halaman tetap terlihat benar.
3. Bandingkan tampilan statis dengan Figma (posisi ≤ 2px).
4. Timeline animasi: pin, 4 langkah pergantian layanan, lalu langkah fullscreen.
5. Uji setiap langkah dengan menghentikan scroll di posisinya, lalu bandingkan dengan frame storyboard.
6. Uji cleanup, resize, dan reduce motion.
7. Perbarui checklist.

---

## 5. Usulan untuk bagian yang tidak ada di Figma [U]

1. **Jarak scroll:** satu langkah = satu tinggi layar (100vh). Total sekitar 5–6 layar scroll selama section tertahan.
2. **Cara bergerak:** mengikuti scroll (`scrub`), dengan **snap** ke setiap langkah, supaya tidak berhenti di tengah transisi.
3. **Pergantian gambar:** gambar baru muncul dengan crossfade (opacity), sambil sedikit membesar dari 1,05× ke 1×.
4. **Tinggi section saat tertahan:** desain berukuran 1440 × 1024, tetapi tinggi layar pengguna berbeda-beda (misalnya laptop 800px). Usulan: saat tertahan, tinggi section = tinggi layar, dan tinggi gambar = tinggi layar − 80px (margin 40px atas dan bawah, sama seperti Figma). Kartu tetap di posisinya dan paragraf bawah tetap menempel di kiri bawah.
5. **Langkah fullscreen:** gambar Illustration membesar hingga memenuhi layar (radius 0), lalu section dilepas dan halaman lanjut ke section Our Work.
6. **Reduce motion:** jika pengguna memilih "reduce motion", section tetap tertahan dan berganti per langkah, tetapi tanpa animasi gerak (perpindahan instan).

---

## 6. Keputusan (dijawab pengguna, 23 Okt 2026)
1. Frame "Concept" diabaikan.
2. Semua usulan di bagian 5 disetujui.
3. Langkah terakhir: gambar memenuhi layar.
4. Semua tag memakai Inter **Regular**.
5. Gambar layanan dikonversi ke JPG.

---

## 7. Verifikasi dan acceptance criteria
- [ ] `npm run build` tanpa error.
- [x] Tampilan awal (tanpa scroll) sama dengan `1523:3292` di 1440 × 1024: label, gambar, kartu (20, 98, 345 × 283), tumpukan (34, 335) dan (50, 353), paragraf bawah. Selisih ≤ 1px.
- [x] Setiap langkah, diuji dengan scroll roda mouse sungguhan, sesuai frame storyboard:

  | Langkah | Kartu sebelumnya | Kartu aktif | Tumpukan | Gambar |
  |---|---|---|---|---|
  | 0 Branding | – | 98 | 335, 353 | perfume |
  | 1 Brand Strategy | −207 | 88 | 325, 343 | storefront |
  | 2 UI/UX Design | −207 | 88 | 325, 343 | HiHi |
  | 3 AI/Web Development | −207 | 88 | 346 (sama dengan Figma, karena kartu ini lebih tinggi) | Rowfest |
  | 4 Illustration | −207 | 88 | – | ilustrasi |
  | 5 Fullscreen | | | | memenuhi section |
- [~] Kartu dan gambar hanya memakai `transform`, `opacity`, dan `clip-path`. **Pengecualian:** langkah fullscreen mengubah `inset` satu elemen gambar (posisi absolut, tidak menggeser elemen lain).
- [x] Di 1920px semua ukuran mengikuti skala 1,333× (kartu 26.7/117.3/460px, gambar 513/53).
- [x] Resize di tengah animasi (1440 → 1920): posisi dihitung ulang, progress tetap di langkah yang sama. Ditemukan dan diperbaiki: inline style gambar yang tertinggal.
- [ ] Fungsi cleanup **belum diuji langsung**, karena Barba belum dipasang. Akan diuji saat Barba ditambahkan.
- [x] Tanpa JS, tampilan frame 1 tetap utuh (diukur dengan JS dimatikan).
- [x] Hero dan Statement tidak diubah.
- [x] Reduce motion: di tengah langkah, tampilan tetap utuh di satu langkah (tanpa posisi setengah jalan).

**Perbaikan selama pengujian:**
1. Snap awalnya meloncat ke langkah terakhir saat scroll cepat. Diganti `labelsDirectional` + `inertia: false`: setiap gerakan scroll maju atau mundur tepat satu langkah.
2. Kartu tumpukan sempat tergambar di atas kartu aktif saat halaman dimuat (z-index di detik 0). Diperbaiki.
3. Kartu lama sempat menutupi kartu baru di tengah transisi. Sekarang kartu baru langsung di depan.

**Perbedaan kecil dari storyboard (disengaja):**
- Jumlah tumpukan mengikuti layanan yang benar-benar tersisa (di langkah 3 hanya 1).
- Judul kartu sebelumnya tidak mengecil dari 28 ke 24px, karena berada di luar layar.
- Di layar lebih lebar dari 1920px, gambar fullscreen memenuhi area isi selebar 1920px. Sisi kiri dan kanan tetap berwarna `#111`.

**Gambar:** 5 PNG (total ±18 MB) dikonversi ke JPG dan dibatasi 2400px (ilustrasi tetap 2732px untuk fullscreen). Total ±3 MB.

**Untuk diuji ulang nanti:** perpindahan keluar dari section ini ke section Our Work, setelah section itu dibuat. Saat ini halaman berakhir tepat di akhir section ini.

---

## 8. Checklist progres
- [x] Analisis Figma (homepage, storyboard 7 frame, data animasi)
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1: Aset dan teks
- [x] Langkah 2–3: Layout statis dan verifikasi
- [x] Langkah 4: Timeline animasi
- [x] Langkah 5–6: Uji per langkah, resize, reduce motion (cleanup menunggu Barba)
- [x] Langkah 7: Dokumentasi

### Perbaikan setelah review (27 Okt 2026): jarak dan urutan kartu
- **Jarak tumpukan tidak konsisten:** kartu tumpukan diperkecil dari titik tengahnya, jadi jarak yang terlihat bergantung pada tinggi masing-masing kartu. Sekarang diperkecil dari tepi atas (`transform-origin: 50% 0`), dan posisinya dihitung supaya potongan judulnya selalu berakhir **16px dan 32px** di bawah kartu aktif (skala huruf). Posisi langkah 0 kini bagian dari timeline dan dihitung ulang setelah font termuat (sebelumnya di 1920px langkah 0 meleset: −18/0px).
- **Kartu masuk tampil di depan:** urutan tumpukan ditukar di awal transisi, sehingga kartu baru langsung berada di depan kartu aktif. Sekarang kartu yang sudah naik (offset −1) memakai `z-index` 5, di atas kartu aktif (4), jadi kartu yang keluar selalu meluncur di depan dan kartu baru muncul dari belakangnya. Berlaku untuk scroll maju dan mundur.
- **Diuji:** jarak di langkah 0–3 maju dan 2–0 mundur pada 1280 (14/28), 1440 (16/32), 1920 (17/34–35), 2560 (18–20/37–39) px. Screenshot transisi maju 1,2–1,8 dan mundur 2,8–2,2. Tanpa JS di 1440px: posisi sama dengan Figma.
- **Jarak kartu di atas (yang sudah naik):** sebelumnya posisinya tetap (y −207, skala layout), sehingga jaraknya ke kartu aktif bervariasi −9px (menumpuk di langkah AI/Web) sampai 249px (2560px). Sekarang kartu itu diposisikan dari ujung bawahnya: selalu **12px** di atas kartu aktif (Figma 76 → 88), skala huruf. Terukur: 1280 10–11px, 1440 12px, 1920 13px, 2560 14–15px, di langkah 1–4. Tumpukan bawah tetap 16/32px.
- **Scroll lebih halus (opsi A):** scrub 0,6 → 1, snap 0,2–0,6 detik → 0,5–1 detik `power2.inOut` dengan jeda 0,15 detik (sama seperti Motto). Terukur setelah satu gerakan roda: halaman diam di posisi scroll pengguna, lalu meluncur halus ke langkah berikutnya dalam ±0,75 detik.
- **Gambar layanan (opsi A):** crossfade opacity diganti reveal dari bawah seperti tirai (`clip-path: inset(100% 0 0 0)` → `inset(0)`, `power3.inOut`) sambil zoom 1,08 → 1. Gambar lama tetap utuh di bawahnya, jadi tidak ada momen dua gambar transparan. Diuji maju 1–5 dan mundur 4–0 (gambar yang tampil dan langkah layar penuh benar).
- **Video Branding (27 Okt 2026, permintaan pengguna):** gambar Branding diganti `branding.mp4` (H.264, 3000 × 2000, 10,7 detik, tanpa audio, 3 MB). `muted loop playsinline`, tanpa `autoplay`: JS memutarnya hanya saat section terlihat dan menjedanya saat keluar. Tidak diputar sama sekali dengan reduce motion. Poster `branding-poster.jpg` = frame pertama video (diambil lewat Chrome, 2400 × 1600, 292 KB), supaya tidak ada gambar lain yang muncul sebelum video siap. Diuji: dijeda di posisi atas halaman, berjalan di section (currentTime naik), dijeda lagi setelah keluar, diam dengan reduce motion. `branding.jpg` lama tidak dipakai lagi.
- **Video Brand Strategy:** `brand-strategy.mp4` (H.264, 1920 × 1080, 19 detik, tanpa audio, 13,5 MB), poster frame pertama (236 KB). Logika putar/jeda dipindah dari `services-scroll.js` ke modul bersama `src/js/inview-videos.js` (penanda `data-inview-video`), dipakai juga oleh hero. Diuji: video hero berjalan di atas halaman dan dijeda saat masuk What we do; kedua video layanan berjalan di What we do dan dijeda setelah keluar; semua diam dengan reduce motion.
- **Snap tanpa jeda (28 Okt 2026):** setelah scroll berhenti halaman sempat diam ±0,75 detik (scrub 1 + delay 0,15 + kurva lambat di awal). Sekarang scrub 0,5, delay 0, snap 0,6–0,9 detik `power3.out` (cepat di awal, mendarat lembut). Terukur: diam ±0,3 detik (deteksi akhir scroll oleh ScrollTrigger), lalu meluncur ke langkah berikutnya dalam ±0,7 detik. Pengaturan yang sama dipakai di Motto.

### Transisi dari Statement: dicoba, tidak dipakai (27 Okt 2026)
Semua versi berikut dicoba lalu dibatalkan oleh pengguna. Batasnya tetap langsung seperti di Figma.
1. Latar seluruh layar putih → hitam (mulai di 25%), dengan isi Services disembunyikan sampai latar gelap.
2. Statement ditahan lalu meredup sementara Services menutupinya.
3. Latar seluruh layar dengan wrapper, mulai di 50% (seperti Milestone → Motto), dengan tiga variasi kemunculan isi Services: disembunyikan, versi terang kartu, dan gambar dulu baru kartu.
4. Services "terbuka" dari gambarnya (clip-path membesar dari kotak gambar).

### Sudut kartu tetap 4px (27 Okt 2026, masukan pengguna)
- Radius sudut kartu terlihat berubah-ubah: kartu tumpukan diperkecil (skala 0,92 / 0,83) sehingga sudutnya ikut mengecil, dan potongan strip (`clip-path: inset(...)`) tidak membulat, jadi sudut bawah strip tajam lalu baru membulat saat kartu menjadi aktif.
- Sekarang potongan selalu membulat dengan radius `--radius-sm` dibagi skala kartu (`inset(... round r/scale)`), sehingga di layar setiap sudut tetap 4px (1440), selama berpindah juga. Radius bawaan kartu yang diperkecil selalu ≤ 4px, jadi tidak perlu dianimasikan.
- Terukur di 1440: radius potongan di layar 4 / 4 / 4 (kartu aktif, tumpukan 0,92, 0,83) di langkah 0, tengah perpindahan, dan langkah 1; di 2560 7,11 untuk semua. Posisi kartu tidak berubah (98 / 88).
- **Perbaikan lanjutan** (masukan pengguna: lebar kartu sempat berubah tiba-tiba): browser menyingkat `clip-path` saat dibaca kembali (`inset(0px round 4px)`), sehingga GSAP menganimasikan dari angka yang tidak sejajar dengan targetnya, dan radius sempat terbaca sebagai potongan sisi. Sekarang potongan bawah dan radius dianimasikan sebagai dua angka biasa (objek per kartu), lalu `clip-path` ditulis ulang di setiap update timeline. Terukur selama perpindahan langkah 0 → 1 (sampel setiap ±60ms): potongan kiri/kanan selalu 0, lebar berubah mulus mengikuti skala (317 → 344, 285 → 316), dan radius di layar 4,00px di setiap frame. Langkah 0–5 maju/mundur dan muat ulang tetap benar.

### Tanpa snap: scroll halus dengan zona diam (27 Okt 2026, saran disetujui)
- Masukan pengguna: snap terasa "tertahan". Penyebabnya, setelah scroll berhenti browser butuh ±0,3 detik untuk mendeteksinya, lalu halaman ditarik ke langkah terdekat, dan satu gerakan scroll hanya memindahkan satu langkah.
- Snap dihapus dari What we do dan Motto. Scrub 0,8 detik. Setiap langkah tetap selebar satu layar scroll, tapi dibagi: transisi (panjang 1) + **zona diam** `REST = 0.6` (setengah sebelum transisi pertama, setengah setelah transisi terakhir), sehingga ±40% setiap langkah menahan tampilan langkah itu walaupun scroll berjalan. Posisi timeline dipetakan dengan `stepTime()`. Label `stepN` ada di tengah zona diam (`restTime()`), dan dipakai untuk menjaga langkah saat resize.
- Terukur di 1440 (posisi dalam layar sejak pin): scroll tetap di tempat (tanpa tarikan). Langkah 0 diam di 0–0,2; kartu berpindah di 0,35–0,65; langkah 1 diam di 0,8–1,1. Layar penuh: 4,5 di tengah, selesai di 4,9.

## Masuk ke pin dengan halus (29 Okt 2026, permintaan pengguna)
- **Masalah:** section datang dengan kecepatan scroll penuh lalu langsung berhenti saat pin dimulai di `top top`, sehingga terasa tidak seamless.
- **Sekarang:**
  - Pin dimulai saat atas section masih 15% layar di bawah atas layar (`top top+=15%`).
  - Selama 0,3 layar scroll berikutnya, section meluncur naik ke atas sambil melambat. Posisinya mengikuti `−15% × (1 − (1 − t)²)` lewat CSS `translate` dan terikat langsung ke scroll (ScrollTrigger tanpa scrub), sehingga kecepatannya turun dari kecepatan halaman ke 0.
  - Langkah-langkah kartu dimulai setelah itu (`entryTime` ditambahkan ke `stepTime`/`restTime`), dan pin lebih panjang 0,3 layar.
  - `translate` dihapus selama ScrollTrigger mengukur (`refreshInit`), supaya pin diukur dari layout.
- **Terukur** (kecepatan section dibanding scroll, roda mouse): 1,0 → 0,91 → 0,75 → 0,59 → 0,39 → 0,15 → 0, lalu diam di atas.
- Screenshot langkah 0, langkah di tengah, layar penuh, dan sesudah dilepas sesuai. Refresh di tengah halaman: tanpa exception, dan `translate` tetap −135px.
- **Keluar juga halus** (permintaan pengguna, sama seperti Motto):
  - Di 0,4 layar terakhir pin, section naik makin cepat (−0,2 layar × t²), sehingga kecepatannya mencapai kecepatan halaman saat dilepas.
  - Terukur: 0 → 0,06 → 0,28 → 0,47 → 0,70 → 0,90 → 1,0, lalu tetap 1.
  - Karena section berakhir 0,35 layar (15% + 20%) lebih tinggi dari tempatnya di layout, section berikutnya (Our Work) ditarik naik sebesar itu (`margin-top`, diatur saat ScrollTrigger mengukur). Jaraknya tetap seperti Figma.
  - Terukur: setelah dilepas, bawah Services = atas Our Work (jarak 0, sama dengan sebelum perubahan). Selama keluar, celahnya menyempit 38 → 0px dan tertutup latar putih. Refresh di bawah section: tanpa exception.

## Gerak kartu tanpa hentakan, dengan batas kecepatan (29 Okt 2026, pilihan pengguna A)
- **Masalah:** zona diam panjang (±40% per langkah) dan kurva `power2.inOut` membuat pola berhenti, lalu melesat, lalu berhenti. Setelah zona diam diperpendek, scroll cepat membuat kartu ikut melesat.
- **Sekarang:**
  - Zona diam `REST` 0,6 → **0,18** (±15% per langkah). Kurva **`sine.inOut`** untuk kartu dan gambar. Satu langkah = **1,25 layar** scroll (sebelumnya 1). Pin juga lebih panjang.
  - **Batas kecepatan:** timeline tidak lagi di-scrub oleh ScrollTrigger. Pin (ScrollTrigger terpisah) hanya menentukan posisi tujuan, lalu ticker GSAP menggerakkan timeline ke sana: halus (`FOLLOW` 5/detik) dan **paling cepat satu perpindahan per 0,8 detik** (`MAX_SPEED`). Saat refresh (muat, resize, reload di tengah), timeline langsung ditempatkan di posisinya.
  - Masuk dan keluar halus (versi sebelumnya) tetap, dan sekarang mengacu ke `pin.start`/`pin.end`.
- Versi "satu gerakan scroll, satu kartu" (acuan simonholm.studio, dari sesi lain, belum di-commit) dibatalkan pengguna dan diganti versi ini.
- **Terukur** (scroll cepat, 8 putaran roda × 400):
  - Kecepatan kartu tertinggi 9725 → **3575 px/detik**.
  - Kartu menyusul ±1 detik setelah scroll berhenti (sebelumnya berhenti bersamaan).
  - Screenshot di 10/30/50/70/90% pin, scroll balik, dan reload di tengah: kartu dan gambar konsisten, tanpa exception.
- **Selaras dengan Lenis** (masukan pengguna: terasa lebih lambat dan tidak seiring scroll):
  - Batas 0,8 detik per perpindahan menahan kartu juga saat scroll normal, sehingga kartu tertinggal dari halaman.
  - Sekarang: `FOLLOW` 5 → 14 (mengikuti Lenis dengan rapat), `MAX_SPEED` satu perpindahan per **0,35 detik** (hanya terasa saat scroll sangat cepat), dan satu langkah kembali **1 layar**.
  - **Terukur** dibanding versi yang sudah di-commit (scrub 0,8, zona diam 0,6):

    | Scroll | Kecepatan kartu tertinggi | Kartu berhenti |
    |---|---|---|
    | Normal | 2105 → 1255 px/detik | bersamaan dengan scroll (sebelumnya berhenti lebih dulu di zona diam) |
    | Sangat cepat | 11727 → 2759 px/detik | bersamaan dengan scroll |
