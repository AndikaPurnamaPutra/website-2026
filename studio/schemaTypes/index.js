import { service } from "./service.js";
import { servicesSection } from "./servicesSection.js";
import { project } from "./project.js";
import { category } from "./category.js";
import { ourWorkSection } from "./ourWorkSection.js";
import { client } from "./client.js";
import { testimonial } from "./testimonial.js";
import { trustedSection } from "./trustedSection.js";
import { format } from "./format.js";
import { workPage } from "./workPage.js";

export const schemaTypes = [service, servicesSection, project, category, ourWorkSection, client, testimonial, trustedSection, format, workPage];
// One document each (sanity.config.js).
export const singletonTypes = ["servicesSection", "ourWorkSection", "trustedSection", "workPage"];
