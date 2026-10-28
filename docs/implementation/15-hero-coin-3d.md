# 15 — Koin 3D di Hero (percobaan)

Status: **Percobaan berhasil dan dioptimasi (28 Okt 2026), menunggu review dan commit.**

## Asal
Pengguna memberikan skrip Three.js mandiri (`~/Downloads/web-coin/main.js` dengan aset `Oww-Pin.glb` dan `white_studio_04_2k.hdr`) untuk menggantikan gambar `hero__coin` (`coin.png`).

## Implementasi
- `src/js/hero-coin-scene.js` (dimuat oleh `hero-coin-3d.js`): kamera, 5 RectAreaLight, HDRI (intensitas 0,5, rotasi 200°), tone mapping ACES 0,35, model, putaran idle, dan drag dengan reset halus, **sama persis dengan skrip pengguna**. Penyesuaian untuk halaman:
  - Canvas tidak lagi selayar penuh, tapi di **stage 2× kotak koin** (896 × 840 di 1440), berpusat di koin PNG. Dengan begitu koin bisa terangkat dan berputar tanpa terpotong.
  - **Zoom kamera 1,14** supaya tinggi koin sama dengan PNG.
  - Scroll = kemajuan scroll hero (`top top` → `bottom top`), bukan akumulasi roda mouse di mana pun.
  - Render dijeda saat hero tidak terlihat. Pixel ratio maksimal 2.
  - `coin.png` tetap tampil sampai model siap, lalu memudar (0,6 detik). PNG tetap dipakai tanpa WebGL atau dengan reduced motion.
- `src/scss/sections/_hero.scss`: `.hero__coin--3d` (stage, fade-in, kursor grab) dan `.hero__coin.is-replaced`.
- Dependency baru: `three@0.169.0` (versi yang sama dengan skrip pengguna), dibundel dengan esbuild.
- Aset: `src/assets/models/oww-pin.glb` dan `white-studio-1k.hdr` (lihat Optimasi).

## Hasil
- Model dan HDRI termuat dengan GPU, dan PNG tergantikan.
- Ukuran dan posisi cocok dengan PNG: tinggi 399 vs 401px dan pusat (878, 580) vs (881, 579) di 1440; tinggi 533 vs 535px di 1920. Lebar 3D sedikit lebih besar karena sudut model berbeda dengan foto PNG.
- Scroll: koin berputar dan terangkat, dan tetap utuh di dalam stage (diuji di scroll 0 / 300 / 600 / 900).

## Optimasi ukuran (28 Okt 2026, disetujui)
- **GLB:** 14 tekstur 2048² (±7,6 MB; ±313 MB di memori GPU) diperkecil ke 1024 dalam WebP, dan geometri dikompres Meshopt, dengan `npx @gltf-transform/cli@4 optimize … --compress meshopt --texture-compress webp --texture-size 1024 --flatten false --join false --simplify false --instance false --palette false`. Tanpa `flatten/join` dimatikan, node `Coin-Rot_1/2` yang dipakai animasi akan hilang. Hasil: 12,1 MB → **872 KB**. Loader memakai `MeshoptDecoder`.
- **HDR:** versi 1k resmi Poly Haven (`white_studio_04_1k.hdr`, CC0), 5,6 MB → **1,36 MB**.
- **three.js dimuat terpisah:** `hero-coin-3d.js` hanya pemuat (setelah event `load`, `import()`), dan adegan ada di `hero-coin-scene.js`. esbuild memakai `outdir` + `splitting: true` (`gulpfile.js`). `main.js` 1,7 MB → **254 KB** (+ chunk bersama 105 KB). Adegan 3D 1,35 MB dimuat setelah halaman siap.
- **Total yang dimuat:** sebelumnya ±19,4 MB sekaligus. Sekarang ±360 KB JS di awal, lalu ±3,5 MB untuk koin 3D setelah halaman siap (terukur: JS adegan, HDR, dan GLB mulai di ±345–390 ms, setelah `load` di 352 ms).
- Kualitas: ukuran dan posisi tetap (tinggi 399px, pusat 878, 580 di 1440; scroll 300 sama dengan sebelumnya). Visual WebP 1024 setara dengan PNG 2048 di ukuran tampil.

## Catatan
- Opsional: `minify: true` di esbuild akan memperkecil lagi (three.js ±1,35 MB → ±0,6 MB). Belum diaktifkan karena mengubah build untuk seluruh JS.
- **Minify diaktifkan** (`minify: true`, permintaan pengguna): `main.js` 254 → 125 KB, chunk bersama 105 → 45 KB, adegan 3D 1,35 MB → 857 KB. Seluruh halaman diuji ulang (What we do, Motto, Milestone, hero, Privacy Policy, Terms of Service).

## Satu koin saja saat dimuat (28 Okt 2026, masukan pengguna)
- Sebelumnya, setelah refresh, koin PNG (diam) tampil lalu koin 3D (berputar, sudut berbeda) memudar di atasnya, jadi sesaat terlihat dua koin.
- Sekarang, dengan JS dan tanpa reduced motion, PNG disembunyikan sejak gambar pertama (`.js img.hero__coin:not(.is-fallback)`, kelas `js` dipasang di `<head>`), dan hanya koin 3D yang memudar masuk (0,6 detik). PNG kembali (`is-fallback`) kalau WebGL tidak tersedia, file adegan gagal dimuat, atau GLB error.
- Terukur setelah reload (setiap 150 ms): PNG tersembunyi di semua frame, 3D 0 → 0,42 → 0,71 → 0,92 → 1. Reduced motion: PNG terlihat, tanpa 3D. GLB dihapus sementara: PNG kembali terlihat.
