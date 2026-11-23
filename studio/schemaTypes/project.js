// A project (Homepage → Our Work; src/components/WorkCarousel.astro).
// Recently Added: the newest by "Tanggal publish", automatically. Selected
// Work: the projects switched on, in the order dragged in the Studio
// (orderRank). The card is one 4:3 frame filled by the cover; the focus point
// (hotspot) decides which part shows. No alt text: the picture sits in the
// link beside the project's title, so it is decorative (alt="").
// Work page (/work, plan 42): the kind picks the section (Case Study, Live
// Sites, Design Showcase); the card's line reads first category · format ·
// year (of "Tanggal publish"); search looks in title, categories, format and
// keywords.
import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

const KINDS = { caseStudy: "Case Study", live: "Live Sites", showcase: "Design Showcase" };

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [orderRankOrdering, { title: "Tanggal publish (terbaru)", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  fields: [
    orderRankField({ type: "project", newItemPosition: "after" }),
    defineField({
      name: "title",
      title: "Judul",
      type: "string",
      description: "Maksimal 60 karakter (satu baris di bawah kartu).",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Untuk alamat halaman project nanti. Klik Generate.",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Category",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "kind",
      title: "Jenis",
      type: "string",
      description: "Menentukan section di halaman Work.",
      options: {
        list: [
          { title: "Case Study", value: "caseStudy" },
          { title: "Live Sites", value: "live" },
          { title: "Design Showcase", value: "showcase" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "showcase",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "reference",
      to: [{ type: "format" }],
      description: "Mis. Landing Page, Mobile App. Boleh kosong (mis. Branding).",
    }),
    defineField({
      name: "liveUrl",
      title: "Alamat website live",
      type: "url",
      description: "Kartu Live membuka alamat ini di tab baru.",
      hidden: ({ parent }) => parent?.kind !== "live",
      validation: (rule) =>
        rule.uri({ scheme: ["https", "http"] }).custom((value, { parent }) => (parent?.kind === "live" && !value ? "Wajib untuk Live Sites." : true)),
    }),
    defineField({
      name: "keywords",
      title: "Kata kunci pencarian",
      type: "array",
      of: [{ type: "string", validation: (rule) => rule.max(30) }],
      options: { layout: "tags" },
      description: "Kata yang mungkin dicari pengunjung tetapi tidak ada di judul, mis. bank, fintech, kesehatan. Maks. 8.",
      validation: (rule) => rule.max(8).unique(),
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
      description: "Sebaiknya 4:3, lebar minimal 1200px. Klik bagian penting gambar (titik fokus): kartu memotong gambar menjadi 4:3 di sekitarnya.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Tanggal publish",
      type: "date",
      description: "Recently Added menampilkan project terbaru menurut tanggal ini. Tahunnya tampil di kartu halaman Work.",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "selected",
      title: "Tampilkan di Selected Work",
      type: "boolean",
      description: "Di homepage dan halaman Work. Urutannya mengikuti urutan (drag) di daftar Projects. Tampil 4–10 project.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", media: "cover", date: "publishedAt", selected: "selected", kind: "kind" },
    prepare: ({ title, media, date, selected, kind }) => ({
      title,
      media,
      subtitle: [KINDS[kind], date, selected && "Selected Work"].filter(Boolean).join(" · "),
    }),
  },
});
