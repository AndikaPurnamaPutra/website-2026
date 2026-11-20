// Homepage → Trusted section: its texts. The logos and testimonials are
// their own documents (Clients, Testimonials).
import { defineField, defineType } from "sanity";

export const trustedSection = defineType({
  name: "trustedSection",
  title: "Section Trusted",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Label kecil", type: "string", initialValue: "( Trusted Clients )", validation: (rule) => rule.required().max(40) }),
    defineField({ name: "heading", title: "Judul", type: "text", rows: 2, description: "Maksimal 110 karakter.", validation: (rule) => rule.required().max(110) }),
    defineField({ name: "more", title: "Teks di bawah logo", type: "string", initialValue: "and hundred more...", validation: (rule) => rule.required().max(40) }),
  ],
  preview: { prepare: () => ({ title: "Section Trusted" }) },
});
