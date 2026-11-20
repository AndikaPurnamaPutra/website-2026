// Sanity Studio for the One Week Wonders website
// (docs/implementation/41-cms-migration.md, stage 3). Labels in simple
// Indonesian for the people who fill it in. The sections are singletons: one
// document each, edited in place; the collections hold the items they pick.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./schemaTypes/index.js";

const singleton = (S, type, title) => S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

export default defineConfig({
  name: "default",
  title: "OWW Website",
  projectId: "ao8vrenr",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Konten")
          .items([
            S.listItem()
              .title("Homepage")
              .child(S.list().title("Homepage").items([singleton(S, "servicesSection", "Section Services")])),
            S.divider(),
            S.documentTypeListItem("service").title("Layanan (Services)"),
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
