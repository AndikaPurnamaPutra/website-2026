# 12 — Skala Huruf Terpisah dari Skala Layout (rem)

Status: **Selesai (27 Okt 2026), menunggu review**
Keputusan pengguna (27 Okt 2026): opsi B. Huruf membesar lebih pelan dari layout, maksimal **1,2×** di 2560px, berbasis `rem`.

---

## 1. Tujuan
Di layar besar huruf terasa terlalu besar, karena ikut skala layout (1,778× di 2560px). Huruf dibuat tumbuh lebih pelan, sementara layout (gambar, jarak, kolom) tetap seperti sekarang.

| Lebar layar | Layout (`--px`) | Huruf (`--type-px`, baru) |
|---|---|---|
| 1280px | 0,889× | 0,889× (sama seperti sekarang) |
| **1440px** | **1×** | **1×, sama persis dengan Figma** |
| 1920px | 1,333× | 1,086× |
| 2560px ke atas | 1,778× | 1,2× |

Contoh di 2560px: headline hero 142 → **96px**, judul section 75 → **50px**, teks 14 → **16,8px**.

## 2. Cara kerja
- Token baru di `_tokens.scss`:
  `--type-px: clamp(<1280 floor>, min(100vw / 1440, 0.0625rem + (100vw - 1440px) × 0.2 / 1120), 0.075rem)`
  - Di bawah 1440px: sama dengan `--px` (turun sampai 0,889× di 1280px).
  - Di atas 1440px: naik linear dari 1× ke 1,2× di 2560px.
  - Satuan dasar `0.0625rem` (= 1px saat ukuran huruf browser 16px), jadi **pengaturan ukuran huruf pengguna dihormati**.
- Fungsi SCSS baru `type(<figma px>)` di `_functions.scss`, berdampingan dengan `fluid()`.
- **Yang memakai `type()`:** semua `font-size`, line-height yang ditulis dalam px, dan ukuran yang mengikuti tinggi teks (misalnya kotak input dan tombol yang membungkus teks).
- **Yang tetap `fluid()`:** jarak antar section, lebar kolom, gambar, kartu, dan posisi elemen.
- Letter-spacing (em) dan line-height tanpa satuan otomatis mengikuti huruf.
- **JS:** `design-px.js` mendapat `typePx()` dengan rumus yang sama, untuk perhitungan yang bergantung pada ukuran huruf (lihat bagian 3).

## 3. Bagian yang perlu dicek dan mungkin disesuaikan
| Bagian | Risiko | Rencana |
|---|---|---|
| Typography `.text-*` (12 kelas) | — | ganti ke `type()` |
| Hero: headline 80px di kotak 790px | baris bisa berubah dari 3 menjadi 2 | lebar kotak headline juga memakai `type()`, supaya pemenggalan baris tetap sama dengan Figma |
| Hero: info, pill jam | teks dan pill | `type()` untuk teks dan pill |
| Statement: 4 baris nowrap dengan ikon/folder, tinggi baris 77px | ikon dan folder dihitung dari ukuran huruf | ukuran ikon, folder, celah, dan tinggi baris memakai `type()`, supaya tetap menempel di teks |
| Tombol CTA dan `.button` | tinggi tombol mengikuti teks | padding dan line-height tombol memakai `type()` |
| What we do: kartu glass | tinggi kartu dari isi teks; JS menghitung posisi tumpukan dari tinggi kartu | lebar kartu tetap layout. Posisi tumpukan dihitung ulang dari tinggi nyata (sudah begitu). Diuji per langkah |
| Our Work: kategori, judul, caption | — | `type()` |
| Trusted Clients: tinggi kartu testimoni 260px | kutipan lebih kecil, jadi aman | kartu tetap layout |
| Milestone: angka, label, paragraf | — | `type()` |
| Motto: baris 42px, salinan per huruf (em) | posisi huruf diukur JS dalam em, jadi aman | `type()` |
| Footer: kolom link, input, tombol kecil | lebar kolom mengikuti teks | `type()` untuk teks dan gap antar kolom |
| Menu bar | sudah px tetap (Figma) | diganti ke `rem` (14px → 0,875rem) supaya ikut pengaturan browser |

## 4. Urutan kerja
1. Token `--type-px`, fungsi `type()`, dan `typePx()` di JS.
2. Kelas typography dan semua `font-size` di section dan komponen.
3. Ukuran yang terikat pada teks (bagian 3), section per section.
4. Uji di 1280, 1440, 1920, dan 2560px, dan dengan ukuran huruf browser 20px.
5. Dokumentasi (`design-system.md`), commit, push.

## 5. Verifikasi dan acceptance criteria
- [ ] **1440px: tidak ada yang bergeser.** Posisi elemen kunci semua section sama dengan pengukuran sebelumnya (selisih ≤ 0,5px).
- [ ] 2560px: ukuran huruf = nilai Figma × 1,2. Layout tetap × 1,778.
- [ ] Headline hero tetap 3 baris. Ikon dan folder Statement tetap menempel di teks. Tidak ada teks yang terpotong atau bertabrakan di 1920 dan 2560px (screenshot setiap section).
- [ ] Langkah What we do dan Motto tetap benar di 2560px.
- [ ] Ukuran huruf browser 20px: huruf membesar 1,25×, layout tidak rusak.
- [ ] Tidak ada scroll horizontal. Build tanpa error.

## 6. Pertanyaan
1. **Menu bar:** tetap ukuran Figma (14px), hanya diubah ke `rem` supaya ikut pengaturan browser. Setuju?
2. **Batas 1,2× di 2560px:** bisa diubah nanti, cukup satu angka.

## 7. Checklist
- [x] Analisis (16 `font-size` dan 12 kelas typography, ukuran yang terikat teks)
- [x] Rencana ini ditulis
- [x] Persetujuan
- [x] Langkah 1–3: implementasi
- [x] Langkah 4: verifikasi
- [x] Langkah 5: dokumentasi, commit, push

---

### Hasil
- Fungsi bernama `fs()` (bukan `type()`, karena `type` adalah nama fungsi bawaan CSS).
- **1280 dan 1440px:** 48 elemen kunci di semua section sama dengan sebelum perubahan, tinggi halaman sama. Satu-satunya selisih: kolom footer 0,6–0,9px, karena sekarang ditambatkan ke tepi kanan (56px, sesuai Figma) supaya teks yang lebih besar tumbuh ke kiri, bukan keluar layar.
- **2560px:** headline 142 → 96px, judul 75 → 50,4px, angka Milestone 85 → 57,6px, kutipan 25 → 16,8px. Layout tetap 1,778×. Headline hero tetap 3 baris, judul Trusted Clients 2 baris, ikon Statement tetap berjarak 20px (× skala huruf) dari teks.
- **What we do:** potongan dan posisi kartu tumpukan sekarang memakai skala huruf (kartu ikut ukuran teks), jadi kedua kartu tumpukan terlihat di semua lebar layar. Langkah 0–5 dan Motto 0–5 diuji di 2560px. Salinan huruf Motto tepat di atas huruf asli (0px).
- **Ukuran huruf browser 20px:** huruf 1,25× di semua lebar layar (rumus dibuat sepenuhnya berbasis rem). Tidak ada scroll horizontal di 1280, 1440, 1920, dan 2560px.
