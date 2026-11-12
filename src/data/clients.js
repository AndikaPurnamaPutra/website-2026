// Trusted Clients (Figma Testimonials 1574:973, hover 1574:2077;
// src/components/home/TrustedClients.astro). Logo sizes are Figma px (scaled
// via --w/--h); BenQ, PayMongo and LABEL use the 34px height from the hover
// frame (user decision, 26 Oct 2026). paymongo, LABEL, demostack and the Good
// at Numbers mark are raster in Figma; replace them with designer SVGs when
// available. quote: HTML (a link in one of them).
export const clients = [
  { name: "BenQ", file: "benq", w: 113.574, h: 34 },
  { name: "YesWeHack", file: "yeswehack", w: 157.717, h: 34 },
  { name: "genasys", file: "genasys", w: 162, h: 32 },
  { name: "bunny.net", file: "bunny", w: 134.734, h: 40 },
  { name: "sprinter health", file: "sprinter", w: 137.903, h: 34 },
  { name: "Gcore", file: "gcore", w: 136.16, h: 34 },
  { name: "Kolleno", file: "kolleno", w: 135.429, h: 24 },
  { name: "medatus", file: "medatus", w: 141.667, h: 34 },
  { name: "PayMongo", file: "paymongo", w: 196.154, h: 34 },
  { name: "Renee", file: "renee", w: 130, h: 32 },
  { name: "LABEL", file: "label", w: 178.5, h: 34 },
  { name: "demostack", file: "demostack", w: 173.632, h: 26 }
];

export const testimonials = [
  { company: "Good at Numbers", logo: { goodAtNumbers: true }, quote: "“It’s insane work!”", name: "Jesuwin Prince", role: "Co-founder" },
  { company: "Riseloop", logo: { file: "riseloop.svg", w: 95.616, h: 20 }, quote: "“Nearly three years working with One Week Wonders on <a class=\"testimonial-card__link\" href=\"https://medicalnode.ai\" target=\"_blank\" rel=\"noopener\">medicalnode.ai</a> and Riseloop has been an excellent experience. Thanks to Izet and the team, every project was a success.”", name: "Maker Athian", role: "Founder" },
  { company: "BOWT", noise: true, logo: { file: "bowt.svg", w: 77.365, h: 18 }, quote: "“Great project management from Izet and a dedicated team that delivered a really good result—I’ll definitely choose OWW again.”", name: "Jelmer Stelpstra", role: "Owner" },
  { company: "bunny.net", logo: { file: "bunny-light.svg", w: 80.841, h: 24 }, quote: "“It’s been a pleasure working with such a talented team over the years—thank you for turning every crazy idea into amazing graphics!”", name: "Jure Anzelj", role: "Head of Marketing" },
  { company: "Kaam Care", logo: { file: "g8.svg", w: 53.615, h: 24, flip: true }, quote: "“Highly recommend working with them. They have a great communication skills and complete projects fast with excellent results.”", name: "Assad Qureshi", role: "Founder" }
];
