# 22 — Services: gambar mengalir seperti floema.com

Status: **Selesai (3 Nov 2026), menunggu review**, disetujui pengguna. Branch: `services-motion/lights`.

## Temuan dari floema.com (diukur)
- Tirai gambar (`--reveal`) mengikuti scroll secara linear, ±2.000px per gambar, tanpa jeda dan tanpa easing per langkah.
- Gambar berikutnya mulai terbuka saat gambar sebelumnya masih tampil, jadi alirannya tidak terputus.
- Gambar di dalam tirai bergerak pelan (parallax): gambar yang tertutup naik dan sedikit membesar. Tidak ada peredupan.
- Hanya teks yang berganti di titik tertentu (kelas `is-active`).

## Rencana
- Gambar dipisah dari timeline kartu: timeline gambar sendiri, digerakkan langsung oleh posisi pin (tanpa pembatas kecepatan dan tanpa jeda), easing linear.
- Tiap peralihan gambar menyambung ke peralihan berikutnya (tanpa jeda), tiap gambar naik terus pelan (parallax) dan gambar yang tertutup sedikit membesar. Peredupan 60% dihapus.
- Satu langkah 1,1 layar scroll (1,5 terasa terlalu berat, 0,8 terlalu cepat untuk membaca kartu).
- Kartu, teks kartu, gambar pertama yang menyala, dan gambar penuh di akhir tetap seperti sekarang.

## File
- `src/js/services-scroll.js`

## Langkah
- [x] Timeline gambar terpisah, linear, menyambung, parallax.
- [x] Build, cek di browser (1440 × 900, tiap 200px): tirai tiap gambar bergerak rata ±15% per 200px, satu gambar ±1.350px, langsung disambung gambar berikutnya; gambar yang tertutup terus naik (sampai −82px) dan membesar 3%; kartu tetap berganti selaras dengan gambarnya.
