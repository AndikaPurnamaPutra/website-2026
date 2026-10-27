# 08 — Section Milestone

Status: **Selesai (26 Okt 2026), menunggu review** · Figma acuan: Homepage `1574:796` → Milestones `1574:1160` (1440 × 859).
Data animasi Figma: kosong.

Label: **[T]** dari layer Figma · **[D]** diturunkan · **[U]** usulan.

---

## 1. Tujuan dan ruang lingkup
**Termasuk:** judul section di kiri, serta 3 angka statistik dan satu paragraf di kanan.
**Tidak termasuk:** animasi (lihat pertanyaan 1), mobile, dan section lain.

---

## 2. Requirement dari desain [T]

### 2.1 Layout
- Latar putih. Padding 200px atas/bawah, 40px kiri/kanan (kontainer 1360px).
- Dua kolom, rata atas: intro di kiri, dan blok statistik selebar **670px** di kanan (mulai x = 690px dalam kontainer).

### 2.2 Intro (kiri)
Gap 16px:
- "( Milestone Achieved )": `.text-16.text-muted`, line-height 1.
- "From Concept / To Impact": `.text-heading-42`, 2 baris.

### 2.3 Statistik (kanan)
Blok vertikal, gap 40px: 3 baris statistik (gap 16px), lalu paragraf.

| Angka | Label |
|---|---|
| **$139M+** (gradient biru) | Capital raised |
| 120+ | Acquisitions |
| 8 | Unicorn branded |

- **Baris:** tinggi 101px, padding 24px atas/bawah, garis bawah 1px `--color-border-row` (#F0F0F0). Angka di kiri dan label di kanan, sejajar tengah.
- **Angka:** `.text-display-48` (General Sans 48px, line-height 1.1, -0.03em). "$139M+" memakai gradient brand biru dengan sudut 207,35°.
- **Label:** `.text-16`, line-height 1.
- Di Figma, garis bawah termasuk dalam tinggi 101px (3 × 101 + 2 × 16 = 335px). Garis dibuat dengan `box-shadow` agar tidak menambah tinggi. [D]

### 2.4 Paragraf
Inter Medium 20px, line-height 1.4, -0.02em, 3 baris di lebar 670px (tinggi 84px):
- "Visual trends evolve, but solid systems don't age." berwarna `#111`.
- Sisanya, "We build clean digital products designed to scale with your business for years, not just seasons.", berwarna `rgba(0,0,0,0.4)`.

---

## 3. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/milestone.pug` | Baru | Markup section |
| `src/scss/sections/_milestone.scss` | Baru | Layout, baris statistik, paragraf |
| `src/scss/main.scss`, `src/pug/pages/index.pug` | Ubah | Menyambungkan file baru |

Tanpa JS dan tanpa aset baru.

---

## 4. Urutan implementasi
1. Markup dan style.
2. Bandingkan dengan Figma (posisi ≤ 2px di 1440px, dan gradient "$139M+" sama).
3. Cek 1920px dan section sebelumnya.
4. Perbarui checklist, commit, dan push.

---

## 5. Keputusan (dijawab pengguna, 26 Okt 2026)
1. **Animasi angka (dari maksud desainer):** angka menghitung naik, dan **setelah hitungan selesai** gradient biru muncul di angka pertama ("$139M+"), sampai tampil seperti di desain.
   - Detail [U], karena tidak ada di data Figma:
     - Dipicu sekali saat blok statistik masuk layar (ScrollTrigger, saat bagian atas blok mencapai 80% tinggi layar).
     - Ketiga angka menghitung bersamaan selama 1,6 detik dengan ease `power2.out`: $0M+ → $139M+, 0+ → 120+, 0 → 8.
     - Selama menghitung, "$139M+" berwarna `#111`. Setelah selesai, lapisan gradient memudar masuk dalam 0,6 detik. Teks dengan `background-clip: text` tidak bisa ditransisikan langsung, jadi gradient dibuat sebagai lapisan salinan di atasnya.
     - Reduce motion: langsung tampil final dengan gradient.
     - Tanpa JS: angka final dan gradient langsung tampil (sama dengan desain).
   - File tambahan: `src/js/milestone-counter.js` (mengembalikan fungsi cleanup), dan `src/js/main.js` diubah.

---

## 6. Verifikasi dan acceptance criteria
- [x] `npm run build` tanpa error.
- [x] Tinggi section 858,4px di 1440px (Figma 859, karena Figma membulatkan tinggi teks angka 52,8px menjadi 53px). Intro, ketiga baris, label, dan paragraf selisihnya ≤ 0,6px dari Figma.
- [x] Gradient "$139M+" identik dengan Figma (screenshot berdampingan), baik tanpa JS maupun setelah animasi selesai.
- [x] Animasi diuji dengan JS aktif:
  - Sebelum masuk layar: $0M+ | 0+ | 0.
  - 0,3 detik: $64M+ | 56+ | 4.
  - 0,8 detik: $122M+ | 105+ | 7.
  - 1,7 detik: $139M+ | 120+ | 8, dan gradient mulai muncul.
  - 2,65 detik: gradient 100%, dan angka hitam di bawahnya disembunyikan.
  - Reduce motion: langsung final dengan gradient.
- [x] Di 1920px semua ukuran tepat 1,333× (tinggi section 1144,5, blok statistik x = 973,3, lebar 893,3).
- [x] Section sebelumnya tidak berubah (tinggi Trusted Clients tetap 1965,2px di 1920px).

---

## 7. Checklist progres
- [x] Analisis Figma (frame acuan, data animasi)
- [x] Rencana ini ditulis
- [x] Persetujuan dan jawaban klarifikasi
- [x] Langkah 1–3: Implementasi dan verifikasi
- [x] Langkah 4: Dokumentasi, commit, push

---

### Revisi animasi setelah review (27 Okt 2026)
Permintaan pengguna: hitungan dan munculnya gradient dibuat lebih elegan, dan kalimat aksen ikut beranimasi.
- **Hitung naik [U]:** angka muncul dari blur halus (6px → 0), naik 12px, dan memudar masuk (1,4 detik). Hitungan memakai `expo.out` selama 2,2 detik, dimulai bergantian per baris (jeda 0,15 detik).
- **Gradient [U]:** menyapu dari kiri ke kanan dengan tepi lembut selebar 30% (mask pada salinan gradient dan kebalikannya pada angka solid, variabel `--sweep`), 1 detik `power2.inOut`, dimulai di detik ke-2.
- **Kalimat aksen [U]:** awalnya `rgba(0,0,0,0.4)` seperti teks lain, lalu menjadi `#111` kata demi kata (0,5 detik per kata, jeda 0,06 detik), dimulai di detik ke-2,4.
- **Verifikasi:** urutan di-sampling dengan JS aktif (angka, opacity, blur, posisi sapuan, warna per kata). Screenshot di tengah sapuan, di tengah perubahan kata, dan di akhir. Tampilan akhir sama dengan desain. Reduce motion: langsung final, tanpa pemecahan kata.

### Revisi kedua (27 Okt 2026)
Sapuan kiri→kanan dan perubahan per kata dinilai aneh, kasar, dan terlalu cepat. Diganti sesuai saran yang disetujui:
- **Gradient:** crossfade dari hitam ke gradient selama 2 detik (`sine.inOut`). Di saat yang sama, gradient di dalam huruf bergeser pelan dari ukuran 220% ke 100% (2,6 detik, `power3.out`) lalu berhenti tepat di posisi Figma. Dimulai di detik ke-1,8.
- **Kalimat aksen:** seluruh kalimat berubah bersamaan dari abu-abu ke hitam, 1,2 detik `sine.inOut`, dimulai di detik ke-3,2. Tidak lagi dipecah per kata.
- **Verifikasi:** sampling opacity, ukuran gradient, dan warna kalimat sepanjang animasi. Screenshot di tengah crossfade dan di akhir. Tampilan akhir sama dengan desain.

### Revisi ketiga (27 Okt 2026): dipercepat ±35%
Dinilai terlalu lambat. Angka muncul 1 detik dan menghitung 1,6 detik (jeda per baris 0,12). Gradient mulai di detik ke-1,2: crossfade 1,2 detik, pergeseran 1,6 detik. Kalimat aksen mulai di detik ke-2, durasi 0,8 detik. Total sekitar 2,8 detik (sebelumnya sekitar 4,4 detik).

### Revisi keempat (27 Okt 2026): sedikit lebih cepat (±20%)
Angka muncul 0,8 detik dan menghitung 1,3 detik (jeda per baris 0,1). Gradient mulai di detik ke-1: crossfade 1 detik, pergeseran 1,3 detik. Kalimat aksen mulai di detik ke-1,6, durasi 0,7 detik. Total sekitar 2,3 detik.

### "$139M+": gelombang gradien seperti hero (27 Okt 2026, permintaan pengguna)
- Saat diam, "$139M+" berwarna hitam seperti "120+" dan "8" (sebelumnya gradien Figma tetap). Ini keputusan pengguna dan berbeda dari Figma.
- Efek gradien yang memudar masuk dan bergeser setelah hitungan diganti **gelombang gradien yang sama dengan h1 hero**: tiap karakter menyala dengan gradien brand (207,35°, satu kotak gradien selebar angka), lalu kembali hitam. Kecepatannya sama dengan hero.
- Gelombang berjalan sekali setelah **semua** hitungan selesai (hitungan menulis ulang semua angka sampai angka terakhir berhenti), lalu diputar ulang setiap kursor masuk ke baris "$139M+" (opsi A).
- Kode gelombang sekarang modul bersama `src/js/gradient-wave.js` + `components/_gradient-wave.scss`, dipakai hero dan Milestone. Salinan gradien lama (`.milestone__gradient`) dan kelas `is-counting` dihapus. Penanda di markup: `data-wave`.
- Terukur di 1440px: 6 salinan karakter tepat di atas angka (selisih 0px), lebar angka tetap 161,19px. Gelombang menyala setelah hitungan dan kembali hitam. Hover di baris memutar ulang (semua menyala, lalu kembali 0). Hero tetap sama (12 salinan, selisih 0px). Reduced motion: angka hitam, tanpa salinan.

### Kalimat pembuka: warna mengalir dari kiri ke kanan (27 Okt 2026, permintaan pengguna)
- Acuan: drone.riotters.com, di mana teks abu-abu menjadi gelap huruf demi huruf dari kiri ke kanan dengan tepi lembut, mengikuti scroll. Di sini **berjalan otomatis** (bukan scroll), **sekali**, dan tidak diputar ulang saat hover (keputusan pengguna).
- "Visual trends evolve, but solid systems don't age." sebelumnya berubah abu-abu → #111 sekaligus (0,7 detik). Sekarang gradien `ink 45% | abu-abu paragraf 55%` (lebar 220%, `background-clip: text`, kelas `.is-sweeping`) digeser dari ujung abu-abu ke ujung ink (`background-position` 100% → 0%) selama 1,6 detik `power2.inOut`, mulai di 1,6 detik timeline (setelah hitungan). Teks tidak dipecah, jadi jarak huruf tetap persis. Pada baris yang terbagi dua, gradiennya berlanjut ke baris berikutnya.
- Terukur: posisi 100% → 89% → 26% → 0% pada ±0,4 / 0,8 / 1,2 / 2,4 detik setelah mulai. Screenshot menunjukkan tepi lembut yang bergerak lalu kalimat hitam penuh. Tanpa JS atau dengan reduced motion: langsung hitam.
- **Pemicu sendiri** (saran disetujui): animasi angka dimulai saat Milestone masuk 20% ke layar, dan saat itu paragraf masih ±370px di bawah layar, jadi aliran warna (1,6–3,2 detik setelahnya) bisa selesai sebelum terlihat, dan bersamaan dengan gelombang "$139M+". Sekarang aliran dipicu saat paragraf masuk layar (`top 85%`, sekali), dengan jeda 0,2 detik dan durasi 1,3 detik `power2.inOut`. Terukur: setelah angka selesai dengan paragraf masih di bawah layar, posisi tetap 100% (abu-abu). Saat paragraf masuk: 100% → 77% → 5% → 0% pada ±0,2 / 0,7 / 1,2 / 1,8 detik.
