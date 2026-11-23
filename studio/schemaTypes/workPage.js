// The Work page (/work, plan 42): its texts, search suggestions and the
// hero's moving collage (its own pictures, decorative). The projects themselves are the "project"
// documents: Selected Work = switched on (drag order), each section = the
// projects of that kind (drag order). Limits keep the hero, the tabs and the
// empty state tidy on phones (AGENTS.md §16).
import { defineField, defineType } from "sanity";

const text = (name, title, max, extra = {}) =>
  defineField({ name, title, type: "string", description: `Maksimal ${max} karakter.`, validation: (rule) => rule.required().max(max), ...extra });

export const workPage = defineType({
  name: "workPage",
  title: "Halaman Work",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Section" },
    { name: "search", title: "Pencarian" },
  ],
  fields: [
    text("headingLine1", "Judul baris 1", 40, { group: "hero" }),
    text("headingLine2", "Judul baris 2", 40, { group: "hero" }),
    defineField({
      name: "intro",
      title: "Teks di bawah judul",
      type: "text",
      rows: 2,
      group: "hero",
      description: "Maksimal 120 karakter. Enter = pindah baris (di desktop; di HP baris mengikuti lebar layar).",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "collage",
      title: "Gambar kolase (bergerak)",
      type: "array",
      group: "hero",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "3–10 gambar (4:3, lebar min. 1200px); berjalan pelan di kanan atas, berulang. Hiasan, jadi tanpa teks alt.",
      validation: (rule) => rule.required().min(3).max(10),
    }),
    text("selectedTitle", "Judul Selected Work", 30, { group: "sections", initialValue: "Selected Work" }),
    text("selectedText", "Teks Selected Work", 80, { group: "sections" }),
    text("caseStudyTitle", "Judul Case Study", 24, { group: "sections", initialValue: "Case Study" }),
    text("liveTitle", "Judul Live Sites", 24, { group: "sections", initialValue: "Live Sites" }),
    text("showcaseTitle", "Judul Design Showcase", 24, { group: "sections", initialValue: "Design Showcase" }),
    text("searchTitle", "Judul pencarian", 40, { group: "search", initialValue: "What are you building?" }),
    text("searchPlaceholder", "Contoh di kolom cari", 60, { group: "search" }),
    defineField({
      name: "suggestions",
      title: "Saran pencarian",
      type: "array",
      group: "search",
      of: [{ type: "string", validation: (rule) => rule.max(30) }],
      options: { layout: "tags" },
      description: "2–4 saran, maks. 30 karakter. Tampil sampai pengunjung mencari sendiri (lalu pencarian terakhirnya yang tampil).",
      validation: (rule) => rule.required().min(2).max(4).unique(),
    }),
    defineField({
      name: "emptyText",
      title: "Teks bila tidak ada hasil",
      type: "string",
      group: "search",
      description: "Di bawah judul “Nothing like … yet.”. Maksimal 90 karakter.",
      validation: (rule) => rule.required().max(90),
    }),
    text("emptyButton", "Tombol bila tidak ada hasil", 24, { group: "search", initialValue: "Tell us about it" }),
    defineField({
      name: "emptyHref",
      title: "Link tombol",
      type: "string",
      group: "search",
      initialValue: "/contact",
      validation: (rule) => rule.required().custom((value) => (/^(\/|#|https?:\/\/|mailto:)/.test(value ?? "") ? true : "Mulai dengan /, #, https:// atau mailto:")),
    }),
  ],
  preview: { prepare: () => ({ title: "Halaman Work" }) },
});
