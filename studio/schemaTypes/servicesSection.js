// Homepage → Services section: its texts. The services themselves are the
// published "service" documents, in the order dragged in their list.
import { defineField, defineType } from "sanity";

export const servicesSection = defineType({
  name: "servicesSection",
  title: "Section Services",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Label kecil",
      type: "string",
      initialValue: "(What we do)",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "note",
      title: "Catatan di bawah",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
  ],
  preview: { prepare: () => ({ title: "Section Services" }) },
});
