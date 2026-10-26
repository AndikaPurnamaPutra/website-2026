# 09 — Menu Bar Menempel (Sticky) dengan Efek Kaca

Status: **Selesai (26 Okt 2026), menunggu review** · Pilihan pengguna: **C** (26 Okt 2026) · Figma acuan: Menu Bar `1574:2063` di Homepage `1574:796`.
Keputusan pengguna (26 Okt 2026): menu bar dibuat **menempel di atas saat scroll, dengan efek kaca**. Ini menggantikan keputusan sebelumnya (menu bar ikut tergulir, di `02-hero.md`).

Label: **[T]** dari layer Figma · **[D]** diturunkan · **[U]** usulan.

---

## 1. Desain di Figma [T]
- Menu bar selebar layar (1440px), tinggi **104px** (padding 40px di semua sisi, isi 24px).
- Latar **`rgba(255,255,255,0.1)`** (putih 10%). Tidak ada nilai blur di data Figma.
- Isi sama seperti sekarang: logo, navigasi, dan warna teks `#111`.
- Hanya ada versi di atas hero (latar terang). **Tidak ada desain untuk menu bar di atas section gelap.**

---

## 2. Masalah yang perlu diputuskan

Saat menempel, menu bar akan melewati **section gelap**, yaitu What we do (`#111`) dan nanti Motto. Ada dua akibat:
1. **Teks dan logo hitam tidak terbaca** di atas latar gelap.
2. Di What we do (section yang tertahan saat scroll), menu bar setinggi 104px **menutupi label "(What we do)" dan bagian atas kartu layanan** (kartu dimulai di y = 98px).

**Pilihan:**

| | Cara kerja | Kelebihan | Kekurangan |
|---|---|---|---|
| **A** | **Sembunyi saat scroll ke bawah, muncul saat scroll ke atas** | Konten tidak tertutup saat membaca. Pola umum di website agency | Saat muncul di atas section gelap, teks hitam tetap sulit terbaca |
| **B** | **Warna berubah otomatis**: teks dan logo jadi putih di atas section gelap | Selalu terbaca | Tetap menutupi bagian atas section What we do. Versi putih logo tidak ada di Figma (saya buat dengan membalik warna bagian hitam logo) |
| **C (usulan)** | **A + B**: sembunyi saat scroll ke bawah, muncul saat scroll ke atas, dan warnanya menyesuaikan latar | Konten tidak tertutup **dan** selalu terbaca | Paling banyak pekerjaan (masih sederhana: CSS + sedikit JS dengan ScrollTrigger) |

---

## 3. Usulan detail [U]
1. **Posisi:** `position: sticky; top: 0`. Menu bar tetap berada di alur halaman, jadi tidak ada lompatan layout. Padding atas hero diubah dari 80 menjadi 40px, supaya posisi isi hero tetap sama persis (40 + 24 + 40 + 40 = 144px).
2. **Efek kaca:** latar putih 10% (dari Figma), ditambah `backdrop-filter: blur(20px) saturate(160%)`. Nilai blur adalah usulan, karena tidak ada di Figma.
3. **Sembunyi/muncul (pilihan A/C):** geser ke atas keluar layar (0,4 detik, ease-out quint). Muncul lagi begitu pengguna scroll ke atas. Selalu terlihat di bagian paling atas halaman.
4. **Warna adaptif (pilihan B/C):** teks `#111` → putih saat menu bar berada di atas section dengan atribut `data-header-theme="dark"` (What we do, dan nanti Motto). Transisi warna 0,3 detik. Logo ternyata seluruhnya gelap (gradient radial `#111` → `#474747`, tanpa bagian berwarna), jadi logo dan chevron dibuat putih dengan `filter: brightness(0) invert(1)`. Tidak perlu inline SVG.
5. **Dropdown "Work"** (dummy) tetap berfungsi. Di atas section gelap, panel dropdown tetap putih dengan teks gelap.
6. **Reduce motion:** sembunyi/muncul dan perubahan warna tanpa animasi.
7. **Z-index** di atas semua section, termasuk section What we do yang tertahan.

---

## 4. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/header.pug` | Ubah | Atribut untuk JS |
| `src/scss/components/_header.scss` | Ubah | Sticky, efek kaca, padding 40px, state tersembunyi, tema gelap |
| `src/scss/sections/_hero.scss` | Ubah | Padding atas 80 → 40px |
| `src/js/header.js` | Baru (A/C/B) | Deteksi arah scroll dan section gelap. Mengembalikan fungsi cleanup |
| `src/js/main.js` | Ubah | Memanggil `header.js` |
| `src/pug/partials/services.pug` | Ubah (B/C) | `data-header-theme="dark"` |
| `docs/implementation/02-hero.md`, `docs/design-system.md` | Ubah | Catat perubahan keputusan |

---

## 5. Verifikasi dan acceptance criteria
- [x] `npm run build` tanpa error.
- [x] Di posisi paling atas halaman: menu bar 1440 × 104, latar `rgba(255,255,255,0.1)`, blur 20px, sticky. Logo (40, 40), navigasi, judul hero (40, 144), info, koin (678, 365), dan showreel sama dengan sebelumnya. Hero tetap berakhir di 1439.
- [x] Diuji dengan scroll roda mouse sungguhan:

  | Kondisi | Hasil |
  |---|---|
  | Paling atas halaman | terlihat, teks `#111` |
  | Scroll ke bawah | sembunyi (top −104) |
  | Scroll ke atas | muncul |
  | Di What we do (tertahan), scroll ke atas | muncul, teks dan logo putih, efek kaca terlihat di atas gambar |
  | Di What we do, scroll ke bawah | sembunyi, sehingga kartu tidak tertutup |
  | Di Our Work, scroll ke atas | muncul, kembali `#111` |
- [x] Dropdown "Work" tetap berteks `#111` di atas panel putih saat menu bar bertema putih.
- [x] Reduce motion: transisi dimatikan lewat CSS.
- [x] Section lain tidak bergeser (padding hero 80 → 40, koin `top` 301 → 261, sehingga posisi di halaman tetap). 1920px: menu bar 138,7px, judul hero di y = 192, koin di y = 486,7 (tepat 1,333×).

**Catatan:**
- Saat menu bar muncul (scroll ke atas) di atas What we do, menu bar menutupi sebagian bagian atas kartu. Ini konsekuensi yang diterima dari pilihan C. Menu bar sembunyi lagi begitu pengguna scroll ke bawah.
- Menu bar tetap terlihat selama ada link di dalamnya yang sedang difokus dengan keyboard (`:focus-visible`), supaya dropdown "Work" bisa dipakai dengan keyboard.

---

## 6. Checklist progres
- [x] Analisis Figma
- [x] Rencana ini ditulis
- [x] Persetujuan dan pilihan A/B/C (C)
- [x] Implementasi
- [x] Verifikasi
- [x] Dokumentasi, commit, push

---

### Revisi (27 Okt 2026): fixed, ukuran Figma, menyusut saat scroll
Keputusan pengguna: menu bar **selalu terlihat** (tidak sembunyi saat scroll ke bawah) dan tidak terlalu tinggi.
- `position: fixed`. `main` diberi `padding-top: fluid(104)` supaya semua section tetap di posisinya (hero, statement, our work, dan trusted sama seperti sebelumnya).
- **Ukuran tetap Figma di semua lebar layar** (tidak fluid): logo 50,25 × 24, teks 14px, gap 40px, padding atas-bawah 40px = 104px. Sebelumnya ikut skala, sehingga di 2560px tingginya 185px dengan logo 89 × 43. Tepi kiri-kanan tetap mengikuti `.container`, jadi logo sejajar dengan isi halaman.
- **Saat scroll (>10px):** padding menyusut ke 20px (tinggi 64px), transisi 0,4 detik. Kembali 104px di paling atas. Nilai 20px adalah usulan.
- Efek kaca dan tema gelap di atas section gelap tetap ada. Logika sembunyi/muncul dihapus dari `header.js`.
- Diuji dengan scroll roda: 104 → 64px, selalu di `top: 0`, tema gelap di What we do dan Motto, kembali 104px di atas. Langkah What we do dan Motto tetap benar.

### Revisi (27 Okt 2026): Figma 1611:6986, solid putih, tinggi tetap
- Padding 24px atas-bawah (tinggi 72px), sama di atas dan saat scroll. Latar putih solid dan bayangan `0 4px 10px rgba(0,0,0,.04)` dari Figma. Efek kaca dihapus.
- Tema gelap (teks putih) dihapus, karena teks putih tidak terbaca di atas latar putih. `header.js` dan atribut `data-header-theme` dihapus.
- Diuji: tinggi 72px dan logo di (40, 24) di posisi atas, setelah scroll, di What we do, dan di Motto.
