// A project format (Work page: the middle word of a card's line, e.g.
// "UI/UX · Landing Page · 2026"; also found by the search). Drag order is
// only the Studio's list order.
import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const format = defineType({
  name: "format",
  title: "Format",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "format", newItemPosition: "after" }),
    defineField({
      name: "title",
      title: "Nama",
      type: "string",
      description: "Maksimal 20 karakter, mis. Landing Page, Mobile App, Dashboard.",
      validation: (rule) => rule.required().max(20),
    }),
  ],
});
