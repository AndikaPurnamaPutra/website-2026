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

const workPageData = cms["./cms/work-page.json"] ?? workPageFallback;

// Load test for the Work page (user, 25 Nov 2026): WORK_STRESS=200 npm run dev
// copies the projects until each kind has 200 (titles numbered). Only for
// trying a big catalogue locally; unset, nothing changes.
const stress = Number(globalThis.process?.env?.WORK_STRESS) || 0;
// The originals first, as they are (order, Selected Work); the copies after
// them, not in Selected Work.
const fill = (projects) => {
  const kinds = [...new Set(projects.map((project) => project.kind))];
  const copies = kinds.flatMap((kind) => {
    const own = projects.filter((project) => project.kind === kind);
    return Array.from({ length: Math.max(stress - own.length, 0) }, (_, i) => ({
      ...own[i % own.length],
      title: `${own[i % own.length].title} ${own.length + i + 1}`,
      selected: false,
    }));
  });
  return [...projects, ...copies];
};

export const workPage = stress > 0 ? { ...workPageData, projects: fill(workPageData.projects) } : workPageData;
