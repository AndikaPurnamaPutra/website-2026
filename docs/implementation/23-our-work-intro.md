# 23 — Our Work: animasi masuk

Status: **Dikerjakan (3 Nov 2026)**, disetujui pengguna. Branch: `our-work/v1` (dari `services-motion/lights`).

## Rasa
Halaman kembali terang setelah Services yang gelap: "lampu ruangan dinyalakan lagi", tenang dan lapang. Bahasa yang sama dengan section lain: teks naik dari bawah di jendelanya (1 dtk, `power3.out`), garis tergambar dari kiri, kartu naik pelan dan gambarnya menyala.

## Rencana
- Kepala: eyebrow naik, dua baris judul naik berurutan, kategori naik satu per satu.
- Garis pembatas tergambar dari kiri.
- Tiap carousel: judul dan tombol panah naik; kartu naik 40px dan memudar masuk berurutan dari kiri, gambarnya menyala dari redup.
- Tombol "More Work" naik.
- Tiap bagian mulai saat masuk layar (85%), dengan waktunya sendiri, berbalik saat scroll ke atas. Tanpa efek hover baru (tidak ada di Figma). Reduced motion: langsung tampil.

## File
- `src/js/our-work-intro.js` (baru), `src/js/main.js`

## Langkah
- [ ] Script dan pendaftarannya.
- [ ] Build, cek di browser: urutan, kedua arah, huruf berekor tidak terpotong, carousel tetap bisa digeser.

## Tambahan (pengguna: masih biasa saja)
- Galeri bergerak: selama melintasi layar, deretan pertama bergeser ke kiri dan deretan kedua ke kanan (±240px, sekitar 20% kecepatan scroll; 160px terlalu halus), seperti berjalan melewati dua dinding galeri. Dipasang di track, jadi geser manual dan tombol panah tetap jalan.
- Hover kartu (tidak ada di Figma, diminta pengguna): gambar membesar 6% di dalam bingkainya (0,8 dtk).
- **Penyederhanaan (pengguna setuju):** kartu tidak lagi naik, memudar masuk, atau menyala; geseran galeri menjadi momennya. Tetap: teks naik, garis tergambar, geseran galeri, hover.
- **Perbaikan (pengguna: kartu kiri terpotong, panah hanya sekali):** geseran berpusat di posisi normal (±120px), jadi kartu pertama sejajar saat deretan di tengah layar. Begitu deretan digeser (panah atau sentuhan), geserannya kembali ke 0 dalam 0,6 dtk dan berhenti. Panah tetap: 5 kartu, sekitar 4 terlihat di 1440px, jadi memang hanya satu langkah (bukan infinite, keputusan pengguna).
- **Ganti ke tarikan kecepatan (pengguna memilih opsi 4):** deretan tidak lagi bergeser berdasarkan posisi scroll. Saat halaman di-scroll, deretan 1 tertarik ke kiri dan deretan 2 ke kanan sesuai kecepatan scroll (maks. 100px, 0,05px per px/dtk), lalu kembali rapi dalam 0,8 dtk saat scroll berhenti. Dipasang pada isi kartu, jadi scroll-snap dan panah tidak terganggu; aturan "berhenti setelah dijelajahi" dihapus.
- **Kembali ke geseran posisi (pengguna: tarikan kecepatan terasa maju mundur):** ±120px di sekitar posisi rapi mengikuti posisi scroll, tetap aktif setelah panah diklik, dibatasi supaya tidak bergeser ke kiri lebih jauh dari sisa kartu (ujung kanan tidak pernah kosong). Pada isi kartu, jadi scroll-snap tidak mengoreksinya.

## Opsi 2 (branch `our-work/v2`)
Sama dengan `our-work/v1`, tanpa geseran galeri saat scroll: deretan karya diam di tempatnya. Teks naik, garis tergambar, dan hover kartu tetap.
- Kartu di opsi 2: satu gerakan kecil saja, memudar masuk sambil naik 16px, berurutan dari kiri (jeda 0,06 dtk, 1 dtk `power3.out`), tanpa efek menyala (pengguna: simpel dan elegan).
- Kartu di opsi 2, revisi (pengguna: terlalu biasa dan terlalu cepat): gambar terbuka dari bawah di dalam bingkainya (1,4 dtk `power3.inOut`), lalu judul kartu naik; berurutan dari kiri dengan jeda 0,12 dtk.
- Kartu di opsi 2, revisi 2 (pengguna: bagus tapi terlalu heboh): gambar memudar masuk sambil terbuka sedikit dari bawah (15%), judul cukup memudar masuk, jeda 0,08 dtk, 1,2 dtk `power2.out`.
- Kartu di opsi 2, revisi 3 (pengguna: versi tirai lebih baik, sedikit diperhalus): tirai penuh dari bawah 1,6 dtk `power2.inOut`, gambar di dalamnya ikut naik pelan dari 8% (seperti gambar Services), judul naik 100% (lebih pendek) setelah gambar sebagian besar terbuka, jeda 0,1 dtk.
- Revisi 4 (pengguna: kartu muncul terlalu pelan): tirai dan gambar 1,1 dtk (sebelumnya 1,6), jeda 0,08 dtk, judul mulai di 0,6 dtk.
