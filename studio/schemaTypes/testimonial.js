// A testimonial card (Homepage → Trusted, the moving row). Every published
// one shows, in the order dragged in the Studio, unless switched off; the
// website takes the first 8.
import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

const QUOTE_MAX = 220;
const plain = (blocks) => (blocks ?? []).map((block) => (block.children ?? []).map((child) => child.text ?? "").join("")).join("\n");

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "testimonial", newItemPosition: "after" }),
    defineField({
      name: "show",
      title: "Tampilkan di homepage",
      type: "boolean",
      description: "Matikan untuk menyembunyikan tanpa menghapusnya. Homepage menampilkan 3–8 testimonial.",
      initialValue: true,
    }),
    defineField({ name: "company", title: "Perusahaan", type: "string", description: "Dibaca pembaca layar (alt logo).", validation: (rule) => rule.required().max(40) }),
    defineField({
      name: "logo",
      title: "Logo perusahaan (SVG)",
      type: "file",
      options: { accept: ".svg,image/svg+xml" },
      description: "Hanya SVG, warna gelap, tanpa ruang kosong di sekelilingnya.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logoHeight",
      title: "Tinggi logo (px)",
      type: "number",
      description: "14–28 (kebanyakan 20–24). Lebarnya mengikuti proporsi SVG.",
      initialValue: 24,
      validation: (rule) => rule.required().min(14).max(28),
    }),
    defineField({
      name: "quote",
      title: "Kutipan",
      type: "array",
      description: `Satu paragraf, maksimal ${QUOTE_MAX} karakter, dengan tanda kutip “…”. Link boleh: blok teksnya lalu klik ikon link.`,
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [defineField({ name: "href", title: "URL", type: "url", validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }) })],
              },
            ],
          },
        }),
      ],
      validation: (rule) =>
        rule.required().custom((blocks) => {
          if ((blocks ?? []).length > 1) return "Hanya satu paragraf.";
          const length = plain(blocks).length;
          return length > QUOTE_MAX ? `Terlalu panjang: ${length}/${QUOTE_MAX} karakter.` : true;
        }),
    }),
    defineField({ name: "name", title: "Nama", type: "string", validation: (rule) => rule.required().max(30) }),
    defineField({ name: "role", title: "Jabatan", type: "string", validation: (rule) => rule.required().max(30) }),
    defineField({
      name: "avatar",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      description: "Ditampilkan bulat, 34px. Persegi, minimal 68px (lebih besar lebih baik). Klik wajahnya (titik fokus).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "noise",
      title: "Kartu bertekstur (noise)",
      type: "boolean",
      description: "Latar kartu berbintik halus, seperti kartu BOWT.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "company", subtitle: "name", media: "avatar", show: "show" },
    prepare: ({ title, subtitle, media, show }) => ({ title, subtitle: show === false ? `${subtitle} · Disembunyikan` : subtitle, media }),
  },
});
