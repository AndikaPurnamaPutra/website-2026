# 21 — Tema halaman: body terang ↔ gelap

Status: **Dikerjakan (3 Nov 2026)**, disetujui pengguna. Referensi: revelatio.studio (latar seluruh halaman berkedip putih ↔ hitam di batas section).

## Rencana
- Warna latar dan teks ada di `body` sebagai tema: terang (putih / #111) dan gelap (#111 / putih), lewat token `--theme-*`. Section mengikuti tema body.
- Cakupan sekarang: Statement → Services → Our Work. Section gelap lain (Motto, footer) belum diubah.
- Services punya versi terang (tidak ada di Figma, usulan disetujui): latar putih, teks #111, kartu `--color-surface-muted`, garis `--color-divider`, border tag `--color-border-strong`. Gambar dan video tetap.
- Body berganti ke gelap saat tepi atas Services di 30% layar, kembali terang saat tepi atas Our Work di 50% layar. Pergantiannya seperti revelatio.studio (diperiksa di situsnya: kelas `dt` di `<html>`, peralihan warna 0,35 dtk `ease`), hampir seperti saklar lampu, berbalik saat scroll ke atas.
- Kartu Services punya dua lapisan latar (terang `--color-surface-muted`, gelap kaca Figma) yang saling memudar (0,35 dtk), bukan satu warna yang berubah menjadi warna lain (pengguna).
- Tanpa JS: Services tetap gelap seperti Figma.

## File
- `src/scss/base/_tokens.scss` (token tema), `src/scss/base/_reset.scss` (body)
- `src/scss/sections/_services.scss` (warna dari token tema)
- `src/js/page-theme.js` (baru), `src/js/main.js`

## Langkah
- [x] Token, body, Services.
- [x] Script pergantian tema (dua penanda, bukan satu rentang: rentang yang mulai di atas pin Services tidak menghitung panjang pin itu).
- [ ] Build, cek di browser kedua arah; pin Services dan tinta Statement tetap jalan.

## Revisi (3 Nov 2026, pengguna: Services terasa terdorong; waktu, Services terang, dan pudaran terasa aneh)
- Services kembali gelap sejak awal seperti Figma; versi terang dan kartu dua lapisan dihapus.
- Pergantian langsung tanpa pudaran. Token tema tinggal `--theme-bg` dan `--theme-fg` (dipakai body, Statement, Our Work).
- Gelap saat tepi atas Services di 50% layar (separuh layar sudah gelap oleh Services, separuh atas ikut gelap), terang saat tepi atas Our Work di 50%.
- Fase melambat saat Services mendarat (`ENTRY` di `services-scroll.js`) dimatikan (0, sebelumnya 0,15).

## Revisi 2 (3 Nov 2026, pengguna: hanya Statement yang berubah, dan pergantian langsung terlalu kasar)
- Di revelatio.studio section berikutnya juga terang sampai saat berganti (dicek di rekaman), jadi Services kembali mengikuti tema: terang saat naik, gelap bersama seluruh halaman. Kartu dua lapisan yang saling memudar.
- Peralihan kembali 0,35 dtk `ease` seperti revelatio.studio (tidak langsung).
- Titik: gelap saat tepi atas Services di 50% layar, terang saat tepi atas Our Work di 50%. Services tetap tanpa fase melambat.
- **Revisi 3:** tombol "Schedule a call" tidak lagi memudar lewat abu-abu (sempat menyatu dengan latar di tengah peralihan); ia berganti sekaligus 0,1 dtk setelah peralihan mulai. Halaman kembali terang begitu Services mulai lanjut dari gambar penuh terakhir ke section berikutnya (awal `EXIT` di `services-scroll.js`), bukan menunggu Our Work.
- **Revisi 4 (pengguna: tombol dan kartu masih aneh; dicek dengan peralihan diperlambat 8×):** kartu Services dua lapisan "menyala" di tengah peralihan, jadi diganti satu warna yang dihitung dari latar (`color-mix` latar + 4% warna teks: #f6f6f6 terang, ≈ #1b1b1b gelap) sehingga selalu bergerak bersama latar. Tombol "Schedule a call" tidak lagi berganti mendadak: ia memudar keluar, warnanya ditukar saat tak terlihat, lalu memudar masuk, dalam 0,35 dtk yang sama.
- **Revisi 5:** titik gelap lebih awal, saat tepi atas Services di 85% layar (baru muncul di bawah), supaya Services hampir tidak terlihat dalam versi terangnya (tidak ada di Figma) dan yang berubah terutama Statement.
