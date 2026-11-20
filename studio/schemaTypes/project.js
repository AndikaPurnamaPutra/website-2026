// A project (Homepage → Our Work; src/components/WorkCarousel.astro).
// Recently Added: the newest by "Tanggal publish", automatically. Selected
// Work: the projects switched on, in the order dragged in the Studio
// (orderRank). The card is one 4:3 frame filled by the cover; the focus point
// (hotspot) decides which part shows. No alt text: the picture sits in the
// link beside the project's title, so it is decorative (alt="").
import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

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
      description: "Recently Added menampilkan project terbaru menurut tanggal ini.",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "selected",
      title: "Tampilkan di Selected Work",
      type: "boolean",
      description: "Urutan Selected Work mengikuti urutan (drag) di daftar Projects. Homepage menampilkan 4–10 project.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", media: "cover", date: "publishedAt", selected: "selected" },
    prepare: ({ title, media, date, selected }) => ({ title, media, subtitle: [date, selected && "Selected Work"].filter(Boolean).join(" · ") }),
  },
});
