// A work category (Homepage → Our Work: the links beside the heading).
// Shown in the order dragged in the Studio; the website takes the first 6
// (more would not fit beside the heading on desktop).
import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "category", newItemPosition: "after" }),
    defineField({
      name: "title",
      title: "Nama",
      type: "string",
      description: "Maksimal 16 karakter. Homepage menampilkan 6 category pertama.",
      validation: (rule) => rule.required().max(16),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Untuk alamat halaman nanti. Klik Generate.",
      options: { source: "title", maxLength: 40 },
      validation: (rule) => rule.required(),
    }),
  ],
});
