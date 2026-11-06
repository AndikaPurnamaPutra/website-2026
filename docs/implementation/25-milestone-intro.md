# 25 — Milestone: animasi masuk

Status: **Selesai (4 Nov 2026), menunggu review**, disetujui pengguna. Branch: `milestone/v1` (dari `trusted/v1`).

## Rencana
- Angka yang menghitung, gelombang gradasi "$139M+", dan kalimat tinta tetap (momen utama section).
- Ditambah dengan bahasa situs: eyebrow dan judul naik per baris (berbalik saat scroll ke atas); bersama hitungan angka, garis tiap baris tergambar dari kiri dan labelnya naik.
- Tidak dibuat naik sebagai satu blok (pengguna setuju): angka tetap jadi bintangnya, dan Milestone sudah naik keluar saat Motto masuk.
- Garis baris diubah dari `box-shadow` ke garis tersendiri (`::after`) supaya bisa digambar; tampilan diam sama.

## File
- `src/js/milestone-counter.js`, `src/scss/sections/_milestone.scss`

## Langkah
- [x] Script dan style.
- [x] Build, cek di browser (1440 × 900): eyebrow dan judul naik, garis baris tergambar dari kiri bersama hitungan angka, label naik; garis diam tetap 1px #f0f0f0; tanpa error.

## Odometer (pengguna: hitungan masih biasa; referensi revelatio.studio `component_metrics`, diukur)
- Hitung naik dan blur diganti odometer: tiap digit bergulir di jendelanya sendiri (kolom 0–9) lalu berhenti di angkanya; digit paling kiri berputar sekali, makin ke kanan makin banyak, semua mendarat bersamaan (1,8 dtk `expo.out`). Awalan dan akhiran ("$", "M+", "+") naik. Setelah berhenti, kembali menjadi teks biasa; gelombang gradasi "$139M+" berjalan.
- Tiap baris mulai saat masuk layar (80%), berurutan ke bawah; garis dan label baris itu ikut.
- Odometer dibuat saat barisnya masuk (setelah web font siap) dan lebarnya diukur dari teks itu sendiri, jadi tidak ada lompatan saat kembali menjadi teks (diukur: 161px dan 93px sama sebelum dan sesudah).
