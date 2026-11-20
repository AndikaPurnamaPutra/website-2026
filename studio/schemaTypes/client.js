// A client logo (Homepage → Trusted; src/components/home/TrustedClients.astro).
// Every published one shows, in the order dragged in the Studio, unless
// switched off; the website takes the first 20. The logo's width follows
// from the SVG's own proportions and the height set here.
import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const client = defineType({
  name: "client",
  title: "Client",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "client", newItemPosition: "after" }),
    defineField({
      name: "show",
      title: "Tampilkan di homepage",
      type: "boolean",
      description: "Matikan untuk menyembunyikan logo tanpa menghapusnya. Homepage menampilkan 4–20 logo.",
      initialValue: true,
    }),
    defineField({ name: "name", title: "Nama", type: "string", description: "Dibaca pembaca layar (alt logo).", validation: (rule) => rule.required().max(40) }),
    defineField({
      name: "logo",
      title: "Logo (SVG)",
      type: "file",
      options: { accept: ".svg,image/svg+xml" },
      description: "Hanya SVG, warna gelap di latar terang, tanpa ruang kosong di sekelilingnya.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logoHeight",
      title: "Tinggi logo (px)",
      type: "number",
      description: "Tinggi di desktop, 16–40 (kebanyakan logo 34). Lebarnya mengikuti proporsi SVG.",
      initialValue: 34,
      validation: (rule) => rule.required().min(16).max(40),
    }),
    defineField({
      name: "href",
      title: "Link (See More)",
      type: "string",
      description: "Mis. /work/benq. Kosongkan bila belum ada.",
      validation: (rule) => rule.custom((value) => (!value || /^(\/|#|https?:\/\/)/.test(value) ? true : "Mulai dengan /, # atau https://")),
    }),
  ],
  preview: {
    select: { title: "name", show: "show" },
    prepare: ({ title, show }) => ({ title, subtitle: show === false ? "Disembunyikan" : undefined }),
  },
});
