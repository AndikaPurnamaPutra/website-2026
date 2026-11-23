// Sanity Studio for the One Week Wonders website
// (docs/implementation/41-cms-migration.md, stage 3). Labels in simple
// Indonesian for the people who fill it in. The sections are singletons: one
// document each, edited in place; the collections hold the items they pick.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes, singletonTypes } from "./schemaTypes/index.js";

const singleton = (S, type, title) => S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

export default defineConfig({
  name: "default",
  title: "OWW Website",
  projectId: "ao8vrenr",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title("Konten")
          .items([
            S.listItem()
              .title("Homepage")
              .child(S.list().title("Homepage").items([singleton(S, "servicesSection", "Section Services"), singleton(S, "ourWorkSection", "Section Our Work"), singleton(S, "trustedSection", "Section Trusted")])),
            singleton(S, "workPage", "Halaman Work"),
            S.divider(),
            // Every published service shows on the homepage, in this order (drag).
            orderableDocumentListDeskItem({ type: "service", title: "Services", S, context }),
            // Selected Work follows this order (drag); Recently Added goes by date.
            orderableDocumentListDeskItem({ type: "project", title: "Projects", S, context }),
            orderableDocumentListDeskItem({ type: "category", title: "Categories", S, context }),
            orderableDocumentListDeskItem({ type: "format", title: "Formats", S, context }),
            orderableDocumentListDeskItem({ type: "client", title: "Clients", S, context }),
            orderableDocumentListDeskItem({ type: "testimonial", title: "Testimonials", S, context }),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // No "new section" button: each section exists once.
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.includes(schemaType)),
  },
  document: {
    // A section cannot be deleted or duplicated.
    actions: (actions, { schemaType }) =>
      singletonTypes.includes(schemaType) ? actions.filter(({ action }) => ["publish", "discardChanges", "restore"].includes(action)) : actions,
  },
});
