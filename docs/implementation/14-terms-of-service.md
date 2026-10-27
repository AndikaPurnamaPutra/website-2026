# 14 — Halaman Terms of Service

Status: **Selesai (27 Okt 2026), menunggu review**
Figma: "Terms of Service" 1611:11735 (1440 × 4493). Desktop dulu; mobile menunggu desain.

## Keputusan
- Sama dengan Privacy Policy (`13-privacy-policy.md`): bar "Back + logo", teks persis Figma, footer sama, koin footer di belakang isi.
- Footer global (keputusan pengguna): "Terms & Conditions" → **"Terms of Service"** (`terms-of-service.html`), "Legal" dihapus. Berlaku di semua halaman.

## Isi
- Judul "One Week Wonders - Terms of Service"; info: Effective Date, Last Updated, **Entity**, Address, Contact Email.
- 10 bagian. Pola baru dibanding Privacy Policy:
  - **Subbagian bernomor** (3.1 … 7.2): nomor SemiBold di kolom 26px, jarak 8px, isi di sebelahnya.
  - **Paragraf dengan lead tebal** ("**Rush Fees** Any deliverable …").
  - Daftar tanpa label tebal (mis. Explicit Exclusions, Refund Policy).
- Teks persis Figma. **Subbagian 3.2 "Invoicing & Payment Terms" muncul dua kali di Figma; ditampilkan sekali** (keputusan pengguna, 27 Okt 2026). Karena itu halaman 86px lebih pendek dari Figma mulai subbagian 3.3.

## Implementasi
- Kerangka halaman legal dijadikan mixin bersama `src/pug/mixins/policy.pug` (`+policyPage(title, meta, sections)`), dipakai Privacy Policy dan Terms of Service. Tipe item baru: `lead`, `num`, dan entri daftar berupa teks biasa.
- Style bersama `src/scss/pages/_policy.scss` (dulu `_privacy-policy.scss`), ditambah `.policy__subsection` / `.policy__subnumber`.
- Halaman: `src/pug/pages/terms-of-service.pug`.

## Hasil
- **1440px sama persis dengan Figma:** judul 144, info 142, bagian 524 / 776 / 1262 / 2026 / 2226 / 2592 / 2966 / 3226 / 3478 / 3678, subbagian 3.1–3.5 di 1308 / 1526 / 1612 / 1698 / 1784 / 1870, akhir isi 3802, footer 3930, tinggi halaman 4493.
- Privacy Policy setelah dipindah ke mixin tetap sama persis (bagian 524 … 3104, footer 3330, tinggi 3893).
- Footer: "Privacy Policy" dan "Terms of Service" saja; dari homepage → Terms of Service → Back kembali ke homepage.
- Tidak ada scroll horizontal di 1280, 1440, dan 2560px.
