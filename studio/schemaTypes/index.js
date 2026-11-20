import { service } from "./service.js";
import { servicesSection } from "./servicesSection.js";

export const schemaTypes = [service, servicesSection];
// One document each (sanity.config.js).
export const singletonTypes = ["servicesSection"];
