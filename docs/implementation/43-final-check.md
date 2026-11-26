# 43 — Cek akhir sebelum go live (26 Nov 2026)

Diminta user setelah `cms/sanity` digabung ke `dev`. Dicek pada build lokal (`npm run build`, data asli dari Sanity) di Chrome.

## Cek otomatis: lolos semua

Cakupan:

- 8 halaman: `/`, `/work`, `/work?q=branding`, `/work?type=case-study`, `/about`, `/contact`, `/privacy-policy`, `/terms-of-service`.
- 10 ukuran layar: 320, 390, 430, 744, 834, 1024, 1280, 1440, 1920, 2560.
- Setiap halaman di-scroll sampai bawah.

Hasilnya, tidak ada masalah pada:

- error JS atau console, dan respons 4xx/5xx
- halaman yang bisa digeser ke samping, atau elemen yang keluar layar
- gambar rusak, atau gambar tanpa `alt`
- footer di akhir halaman: tampil penuh, isinya tidak pudar, lapisan gelapnya hilang
- 18 link internal (semuanya 200)

Judul h1 terbaca utuh oleh pembaca layar, termasuk yang dianimasikan per huruf. Setiap halaman sudah punya title, description, Open Graph, favicon, dan `lang="en"`.

## Yang perlu keputusan atau isi dari user

1. **Link yang masih `#`:**
   - Instagram, LinkedIn: alamat akun.
   - Team, Services, Blog (menu dan footer): halaman belum ada. Tentukan apakah disembunyikan dulu atau diarahkan ke tempat lain.
   - "Schedule a call" (Contact): link kalender (mis. Calendly).
   - "See More" di kartu Services, "View Branding" dan kartu Our Work di homepage, serta galeri di Contact: menunggu halaman detail project (desain Figma belum ada).
2. **Domain situs** (`src/data/site.js`, `siteUrl`): selama belum diisi, `og:image` (gambar saat link dibagikan), `canonical`, dan `og:url` sengaja tidak ditulis ([PageMeta.astro](../../src/components/PageMeta.astro)). Sitemap juga belum ada, dan sebaiknya dibuat setelah domainnya diketahui.
3. **Teks:** judul Privacy Policy tertulis "Privacy and Policy". Perlu dicek apakah memang begitu di Figma.
