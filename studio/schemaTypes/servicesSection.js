// Homepage → Services section: its texts and which services show, in order.
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
      name: "services",
      title: "Layanan yang tampil",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      description: "Urutan bisa digeser. 3–7 layanan (setiap layanan menambah panjang scroll di desktop).",
      validation: (rule) => rule.required().min(3).max(7).unique(),
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
