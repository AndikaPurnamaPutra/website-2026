// Homepage → Our Work section: its texts and how many projects Recently
// Added shows. The projects and categories are their own documents.
import { defineField, defineType } from "sanity";

export const ourWorkSection = defineType({
  name: "ourWorkSection",
  title: "Section Our Work",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Label kecil", type: "string", initialValue: "( Our Work )", validation: (rule) => rule.required().max(40) }),
    defineField({ name: "headingLine1", title: "Judul baris 1", type: "string", description: "Maksimal 24 karakter.", validation: (rule) => rule.required().max(24) }),
    defineField({ name: "headingLine2", title: "Judul baris 2", type: "string", description: "Maksimal 24 karakter.", validation: (rule) => rule.required().max(24) }),
    defineField({ name: "recentTitle", title: "Judul carousel terbaru", type: "string", initialValue: "Recently Added", validation: (rule) => rule.required().max(30) }),
    defineField({
      name: "recentCount",
      title: "Jumlah project terbaru",
      type: "number",
      description: "5–8 project terbaru menurut tanggal publish.",
      initialValue: 5,
      validation: (rule) => rule.required().integer().min(5).max(8),
    }),
    defineField({ name: "selectedTitle", title: "Judul carousel pilihan", type: "string", initialValue: "Selected Work", validation: (rule) => rule.required().max(30) }),
    defineField({
      name: "moreWorkHref",
      title: "Link tombol More Work",
      type: "string",
      description: "Mis. /work. Kosongkan bila belum ada.",
      validation: (rule) => rule.custom((value) => (!value || /^(\/|#|https?:\/\/)/.test(value) ? true : "Mulai dengan /, # atau https://")),
    }),
  ],
  preview: { prepare: () => ({ title: "Section Our Work" }) },
});
