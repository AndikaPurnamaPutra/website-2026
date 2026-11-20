import { service } from "./service.js";
import { servicesSection } from "./servicesSection.js";
import { project } from "./project.js";
import { category } from "./category.js";
import { ourWorkSection } from "./ourWorkSection.js";

export const schemaTypes = [service, servicesSection, project, category, ourWorkSection];
// One document each (sanity.config.js).
export const singletonTypes = ["servicesSection", "ourWorkSection"];
