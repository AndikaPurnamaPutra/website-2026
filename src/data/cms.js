// Content for the components: from the CMS when scripts/cms.mjs has written
// it (src/data/cms/*.json, not in git), otherwise the content kept in this
// folder (docs/implementation/41-cms-migration.md, stage 3).
import { services, servicesEyebrow, servicesNote } from "./services.js";
import { ourWork } from "./work.js";
import { trusted } from "./clients.js";
import { workPage as workPageFallback } from "./work-page.js";

const cms = import.meta.glob("./cms/*.json", { eager: true, import: "default" });

// Picture and video names are paths under assets/images/ (without extension).
export const servicesSection = cms["./cms/services.json"] ?? {
  eyebrow: servicesEyebrow,
  note: servicesNote,
  services: services.map(({ image, video, ...service }) => ({
    ...service,
    image: image && `services/${image}`,
    video: video && `services/${video}`,
  })),
};

export const ourWorkSection = cms["./cms/work.json"] ?? ourWork;
export const trustedSection = cms["./cms/trusted.json"] ?? trusted;

export const workPage = cms["./cms/work-page.json"] ?? workPageFallback;
