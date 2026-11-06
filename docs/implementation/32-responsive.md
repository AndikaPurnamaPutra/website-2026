# 32 — Responsive (semua perangkat)

Branch: `responsive/plan` (dari `dev`). Status: rancangan, belum ada kode. Figma hanya punya desain desktop 1440;
tidak ada frame tablet atau mobile. Rencana ini menetapkan cara kerja dan
urutan; tiap tampilan baru tetap diusulkan dan disetujui dulu (AGENTS.md
§7, §13).

## Kondisi sekarang (dicek 6 Nov 2026, Chrome)
- Tidak ada media query tata letak; semua ukuran mengikuti `--px` / `--type-px`
  yang berhenti mengecil di 1280px. Di bawah 1280 halaman jadi lebih lebar
  dari layar.
- **390 (HP):** halaman 682–1245px lebar, jadi HP memperkecil seluruh halaman.
  Hero: judul tumpang-tindih dengan deskripsi dan koin; Contact: form keluar
  layar; navbar terpotong (hanya Work, About).
- **768 (tablet):** Home 828px, About 1244px (lebih lebar dari layar).
- **1024 (laptop kecil):** About melebar (1244px, scroll ke samping); lainnya
  muat tapi rapat.
- **1280 ke atas:** sesuai desain.
- Lighthouse mobile 50–73 terutama karena ini (plan 29).

## Usulan cara kerja
1. **Titik putus (breakpoint)**, desktop-first (kode sekarang desktop),
   disesuaikan dengan perangkat saat ini (lebar CSS):
   | Nama | Lebar | Acuan | Perangkat |
   |---|---|---|---|
   | Desktop | ≥ 1280 | Figma 1440 (sudah) | laptop 1280–1536, monitor 1920–2560, iPad Pro 13" lanskap |
   | Laptop | 1024–1279 | desktop dirapatkan | iPad Pro 13" potret, iPad lanskap 1080–1194 |
   | Tablet | 744–1023 | frame 834 (baru) | iPad mini 744, iPad / Air 810–820, iPad Pro 11" 834, HP lipat terbuka |
   | Mobile | < 744 | frame 390 (baru), aman sampai 320 | HP 360–440 |
   Ditambah dua aturan yang tidak bergantung pada lebar:
   - **Layar pendek** (tinggi < 500): HP lanskap 844–932 × ±390; section yang
     di-pin dan hero disesuaikan.
   - **Layar sentuh** (`hover: none`): interaksi hover diganti, berapa pun
     lebarnya (iPad besar ikut).
   Juga dicek: laptop 1366 × 768 (pendek).
2. **Skala:** satu "piksel desain" per rentang, jadi `fluid()` dan `fs()` tetap
   dipakai: tablet `--px = 100vw / 834`, mobile `--px = 100vw / 390`, dengan
   batas atas/bawah. Nilai mobile ditulis dalam piksel frame 390. JS
   (`design-px.js`) mengikuti. Teks tidak di bawah 12px.
3. **Satu mixin** `@include below(tablet)` / `below(mobile)` di
   `abstracts/`; tiap section menulis aturan tablet/mobile di filenya sendiri.
4. **Tanpa desain Figma:** untuk tiap section aku usulkan susunan mobile dan
   tablet (sketsa singkat + screenshot dari browser) sebelum dikerjakan; tidak
   menambah konten atau elemen baru di luar yang perlu (menu mobile).
5. **Perangkat sentuh:** interaksi hover (kursor "View", foto Tim, Play Video
   mengikuti kursor, magnet) mati di layar sentuh; yang penting punya padanan
   tap. Area sentuh minimal 44px.
6. **Performa mobile:** gambar `srcset` ukuran HP, video preview lebih kecil,
   koin 3D: resolusi lebih rendah atau gambar diam di HP (keputusan).

## Keputusan (disetujui pengguna, 6 Nov 2026: "setuju dengan usulanmu")
1. **Breakpoint** seperti di atas (tablet dari 744), plus layar pendek dan
   layar sentuh.
2. **Menu mobile** (referensi pengguna: jasminegunarto.com, kononenkogroup.com,
   telhaclarke.com.au, art-yakushev.com, bramvanvugt.com; perpaduan Bram +
   Telha + Art, disetujui):
   - HP (< 744): logo kiri, teks "Menu" kanan (bukan ikon), bar tetap
     transparan dan terbalik warna seperti desktop.
   - Buka: panel gelap (ink) turun dari atas seperti tirai (satu keluarga
     dengan preloader); "Menu" bergulir jadi "Close"; link besar (Work, About,
     Team, Services, Contact) naik satu per satu; di bawah, email, telepon dan
     sosial dari footer memudar masuk (tanpa konten baru).
   - Tutup: Close, Esc, atau ketuk link (menutup bersama transisi halaman);
     panel naik kembali.
   - Work = link biasa (tanpa kartu mega menu di HP).
   - Scroll dikunci saat terbuka; area sentuh ≥ 44px; keyboard dan pembaca
     layar (aria-expanded, fokus di dalam panel).
   - Tablet (744–1023) ke atas: navbar desktop tetap (5 link muat; iPad mini
     744 dicek khusus).
3. **Section yang di-pin di HP:** Statement dan Motto tetap di-pin (teks),
   Services dan Principles mengalir (kartu bertumpuk + gambar).
4. **Koin 3D di HP:** tetap 3D dengan resolusi lebih rendah; gambar diam bila
   perangkat lemah atau WebGL gagal (sudah ada fallback). Dicek ulang dengan
   Lighthouse mobile. *(Usulan; dikonfirmasi lagi saat langkah Hero.)*
5. **Preloader di HP:** urutan yang sama, waktu tunggu aset lebih pendek
   (aset HP lebih kecil). *(Usulan; dikonfirmasi lagi saat langkah 7.)*
6. **Perangkat dicek:** iPhone (Safari), Android (Chrome), iPad, laptop
   1366×768, monitor 1920/2560; di browser (emulasi) dan di perangkat asli
   pengguna.

## Urutan kerja (tiap langkah: usulan → setuju → kerjakan → cek)
1. Dasar: breakpoint, skala per rentang, mixin; `docs/design-system.md`
   diperbarui.
2. Navbar + menu mobile (mulai dari sini; referensi dari pengguna menyusul);
   footer.
3. Home per section: Hero → Statement → Services → Our Work → Trusted →
   Milestone → Motto.
4. About: Intro → Principles → Galeri → Tim.
5. Contact: teks, form, galeri.
6. Privacy / Terms.
7. Transisi halaman dan preloader di HP; interaksi sentuh.
8. Cek akhir: 320, 360, 375, 390, 412, 430, 744, 820, 834, 1024, 1180, 1280,
   1366×768, 1440, 1512, 1920, 2560; HP lanskap (844×390); Safari iOS;
   Lighthouse mobile.

## Kriteria selesai
- Tidak ada scroll ke samping di lebar mana pun dari 320px.
- Teks terbaca tanpa zoom (≥ 12px), area sentuh ≥ 44px.
- Desktop ≥ 1280 tidak berubah (dibandingkan screenshot sebelum).
- Lighthouse mobile 90+ di Accessibility, Best Practices, SEO; Performance
  dilaporkan dan diusahakan naik.

## Cek
- [x] Breakpoint disesuaikan dengan perangkat saat ini.
- [x] Keputusan 2–6 (usulan disetujui; 4 dan 5 dikonfirmasi lagi di
      langkahnya).
- [x] Referensi navbar dari pengguna; usulan navbar disetujui.
- [ ] Langkah 1–8.
