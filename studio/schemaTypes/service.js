// A service (Homepage → Services; src/components/home/Services.astro).
// Every published one shows, in the order dragged in the Studio's list
// (orderRank), unless "Tampilkan di homepage" is off; the website takes the
// first 7. Limits keep the card and its stack panel on phones tidy
// (AGENTS.md §16).
import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

const isVideo = (parent) => parent?.mediaType === "video";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "service", newItemPosition: "after" }),
    defineField({
      name: "show",
      title: "Tampilkan di homepage",
      type: "boolean",
      description: "Matikan untuk menyembunyikan service tanpa menghapusnya. Homepage menampilkan 3–7 service (yang ke-8 dan seterusnya tidak tampil).",
      initialValue: true,
    }),
    defineField({
      name: "title",
      title: "Judul",
      type: "string",
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "text",
      title: "Deskripsi",
      type: "text",
      rows: 3,
      description: "Maksimal 220 karakter (supaya kartu di HP tetap muat).",
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "tags",
      title: "Tag",
      type: "array",
      of: [{ type: "string", validation: (rule) => rule.max(24) }],
      options: { layout: "tags" },
      description: "2–6 tag, masing-masing maksimal 24 karakter.",
      validation: (rule) => rule.required().min(2).max(6),
    }),
    defineField({
      name: "mediaType",
      title: "Jenis media",
      type: "string",
      options: { list: [{ title: "Gambar", value: "image" }, { title: "Video", value: "video" }], layout: "radio", direction: "horizontal" },
      initialValue: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Gambar",
      type: "image",
      options: { hotspot: true },
      description: "Lebar minimal 1600px. Klik bagian penting gambar (titik fokus).",
      hidden: ({ parent }) => isVideo(parent),
      validation: (rule) => rule.custom((value, { parent }) => (!isVideo(parent) && !value?.asset ? "Gambar wajib diisi." : true)),
    }),
    defineField({
      name: "video",
      title: "Video (MP4)",
      type: "file",
      options: { accept: "video/mp4" },
      description: "MP4, sebaiknya di bawah 8 MB. Diputar tanpa suara dan berulang.",
      hidden: ({ parent }) => !isVideo(parent),
      validation: (rule) => rule.custom((value, { parent }) => (isVideo(parent) && !value?.asset ? "Video wajib diisi." : true)),
    }),
    defineField({
      name: "poster",
      title: "Poster video",
      type: "image",
      description: "Gambar pertama video, tampil sebelum video berjalan.",
      hidden: ({ parent }) => !isVideo(parent),
      validation: (rule) => rule.custom((value, { parent }) => (isVideo(parent) && !value?.asset ? "Poster wajib diisi." : true)),
    }),
    defineField({
      name: "alt",
      title: "Teks alternatif (alt)",
      type: "string",
      description: "Isi gambar/video dalam satu kalimat, untuk pembaca layar dan mesin pencari.",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Halaman service, mis. /services/branding. Kosongkan bila belum ada.",
      validation: (rule) => rule.custom((value) => (!value || /^(\/|#|https?:\/\/)/.test(value) ? true : "Mulai dengan /, # atau https://")),
    }),
  ],
  preview: {
    select: { title: "title", media: "image", poster: "poster", show: "show" },
    prepare: ({ title, media, poster, show }) => ({ title, subtitle: show === false ? "Disembunyikan" : undefined, media: media || poster }),
  },
});
