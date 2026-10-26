# 09 — Menu Bar Menempel (Sticky) dengan Efek Kaca

Status: **Menunggu persetujuan** · Figma acuan: Menu Bar `1574:2063` di Homepage `1574:796`.
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
4. **Warna adaptif (pilihan B/C):** teks dan ikon `#111` → putih, dan bagian hitam logo → putih, saat menu bar berada di atas section dengan atribut `data-header-theme="dark"` (What we do, dan nanti Motto). Transisi warna 0,3 detik.
5. **Dropdown "Work"** (dummy) tetap berfungsi. Di atas section gelap, panel dropdown tetap putih dengan teks gelap.
6. **Reduce motion:** sembunyi/muncul dan perubahan warna tanpa animasi.
7. **Z-index** di atas semua section, termasuk section What we do yang tertahan.

---

## 4. File yang akan dibuat atau diubah

| File | Aksi | Isi |
|---|---|---|
| `src/pug/partials/header.pug` | Ubah | Logo inline SVG (supaya warnanya bisa diubah dengan CSS), atribut untuk JS |
| `src/scss/components/_header.scss` | Ubah | Sticky, efek kaca, padding 40px, state tersembunyi, tema gelap |
| `src/scss/sections/_hero.scss` | Ubah | Padding atas 80 → 40px |
| `src/js/header.js` | Baru (A/C/B) | Deteksi arah scroll dan section gelap. Mengembalikan fungsi cleanup |
| `src/js/main.js` | Ubah | Memanggil `header.js` |
| `src/pug/partials/services.pug` | Ubah (B/C) | `data-header-theme="dark"` |
| `docs/implementation/02-hero.md`, `docs/design-system.md` | Ubah | Catat perubahan keputusan |

---

## 5. Verifikasi dan acceptance criteria
- [ ] `npm run build` tanpa error.
- [ ] Di posisi paling atas halaman: menu bar 1440 × 104, dan posisi logo, navigasi, serta isi hero sama dengan sebelumnya (hero 1439px).
- [ ] Menu bar tetap di atas saat scroll, dengan latar putih 10% dan blur.
- [ ] Perilaku sembunyi/muncul dan warna sesuai pilihan, diuji dengan scroll roda mouse sungguhan, termasuk saat melewati section What we do yang tertahan.
- [ ] Dropdown "Work" tetap berfungsi.
- [ ] Reduce motion dihormati.
- [ ] Section lain tidak bergeser.

---

## 6. Checklist progres
- [x] Analisis Figma
- [x] Rencana ini ditulis
- [ ] Persetujuan dan pilihan A/B/C
- [ ] Implementasi
- [ ] Verifikasi
- [ ] Dokumentasi, commit, push
