# Project Instructions — OWW Website

## 1. Main Goal

Build the website based on the provided Figma designs.
Treat Figma as the source of truth for layout, typography, colors, spacing, assets, and interactions.

## 2. Follow the Design Exactly

- Inspect the relevant Figma frames and pages before implementing them.
- Use the connected Figma MCP to inspect designs and retrieve available assets when needed.
- Do not invent sections, content, buttons, icons, illustrations, or interactions that are not present in the design.
- Do not redesign or reinterpret the design without permission.
- Match the design as closely as possible, including spacing, sizing, typography, colors, and responsive behavior.
- If an important design detail is unclear or missing, ask before making a major assumption.
- Reuse provided assets instead of creating substitutes.

## 3. Required Tech Stack

- Astro for HTML templates and the build, with static output (plain HTML pages). It replaced Pug + Gulp (user decision, 12 Nov 2026; reasons and the migration in `docs/implementation/41-cms-migration.md`).
- Sanity as the headless CMS. Its content is fetched at build time only; no CMS code runs in the visitor's browser. Sanity Studio is hosted separately, not inside the website.
- Sass (SCSS) for styling.
- Vanilla JavaScript for DOM interactions.
- GSAP and ScrollTrigger for animations when required by the design.
- Barba.js for page transitions when required by the design.

Do not introduce React, Vue, Tailwind CSS, TypeScript, or other frameworks unless explicitly requested. This includes Astro's UI integrations (`@astrojs/react`, `@astrojs/vue` and the like).

### Astro rules

- Do not use Astro's View Transitions / `ClientRouter`: page transitions stay with Barba.js (`src/js/page-transition.js`).
- Clean URLs (user decision, 13 Nov 2026): pages are reached at `/about`, not `/about.html`. Keep `build.format: "file"` (the build writes `about.html`; Vercel serves it at `/about` through `cleanUrls` in `vercel.json` and redirects `/about.html` there) and no trailing slash (the pages' asset paths are relative). Internal links are root-relative without `.html`: `/`, `/about`, `/contact`.
- No scoped `<style>` in components: all styles stay in `src/scss/`.
- Load `src/js/main.js` once, in the layout. Inline scripts that must run before the first paint use `is:inline`.
- Content arrays live in `src/data/`, not inside components; for sections managed in Sanity, the same place takes the Sanity data.
Do not introduce GrapesJS or another visual page builder unless explicitly requested.

## 4. Keep the Code Simple

- Avoid overengineering.
- Prefer straightforward, readable solutions.
- Do not create unnecessary abstractions, components, files, dependencies, or configuration.
- Do not install a library when a simple existing solution is sufficient.
- Use reusable Astro layouts and components when they genuinely reduce duplication.
- Keep styles in SCSS and scripts in JavaScript.
- Follow the existing project structure and build workflow.
- Do not replace the existing stack or rewrite working configuration without a clear reason.

## 5. Project Structure

- Pages: `src/pages/`
- Layouts: `src/layouts/`
- Components: `src/components/`
- Content data: `src/data/`
- SCSS: `src/scss/`
- JavaScript: `src/js/`
- Files served as they are (fonts, icons, models, videos, favicon, robots.txt): `public/`
- Picture sources (JPG/PNG, converted to WebP by `scripts/images.mjs`): `src/assets/images/`
- Generated website: `dist/`

Create additional folders only when necessary.
Do not manually edit generated files inside `dist/`.

## 6. Animation Guidelines

- Use GSAP and ScrollTrigger for animations that match the reference design.
- Pay attention to animation timing, easing, duration, stagger, and scroll behavior.
- Do not add animations simply to make the website look more impressive.
- Keep animations performant and avoid unnecessary layout shifts.
- Clean up ScrollTriggers and event listeners when appropriate.
- If Barba.js is used, ensure animations and page initialization work correctly after navigation.

## 7. Responsive Behavior

- Inspect available Figma frames for different screen sizes.
- Match the provided responsive designs.
- If a breakpoint or mobile layout is not specified, use the existing design as guidance and ask when a major layout decision is unclear.
- Do not assume the desktop layout should simply be scaled down.
- Text is never smaller than 12px at any screen size: use `fs-text()` for text set at 12–13 in Figma.
- Touch targets are at least 44 × 44 on touch screens: add the element to the invisible layer in `src/scss/components/_tap-area.scss` rather than making it look larger.
- Check every layout change at the standard sizes (320, 360, 375, 390, 412, 430, 744, 820, 834, 1024, 1180, 1280, 1366, 1440, 1512, 1920, 2560, and a phone held sideways): no sideways scroll, nothing off the screen.

## 8. Code Quality

- Use clear, descriptive class names.
- Avoid duplicate CSS rules and unnecessary JavaScript.
- Do not add dependencies without explaining why they are needed.
- Preserve existing working functionality when making changes.
- Do not overwrite unrelated files or remove existing features without permission.

## 9. Workflow

Before implementing a page:

1. Inspect the relevant Figma design.
2. Identify its sections, assets, typography, layout, and interactions.
3. Explain any important uncertainties before proceeding.
4. Implement the design using the existing stack.
5. Run the build and fix errors caused by your changes.
6. Check the page in the browser and compare it with Figma.
7. Make focused corrections rather than rewriting everything.

Work in small, understandable steps.
Do not implement the entire website in one large, unreviewed change.

## 10. Communication

- Briefly explain what you plan to change before making significant changes.
- State which files you will create or modify.
- Explain important technical decisions in simple language.
- Ask for clarification when required information is missing.
- Never claim the design matches Figma without checking it.
- Reply to the user in simple Bahasa Indonesia; explain technical terms briefly.


## 11. Planning Before Implementation

For substantial tasks, create an implementation plan before modifying code.

A substantial task includes:
- Building a new page or a major page section.
- Implementing complex GSAP or ScrollTrigger animations.
- Adding page transitions with Barba.js.
- Refactoring shared layouts, architecture, or build configuration.
- Making changes that affect multiple files or pages.

### Planning Workflow

1. Inspect the existing project and relevant files first.
2. Identify the scope, requirements, dependencies, and affected files.
3. Create a Markdown plan under `docs/implementation/`.
4. Include:
   - Goal and scope.
   - Requirements based on the provided design.
   - Files to create or modify.
   - Implementation steps in order.
   - Important technical considerations.
   - Verification steps and acceptance criteria.
   - Uncertainties that require clarification.
5. Do not implement the planned changes until the user explicitly approves the plan.
6. After approval, follow the plan in small steps.
7. Update the plan checklist as work is completed.
8. If implementation requires a significant deviation, explain the reason and request approval before proceeding.

### Avoid Unnecessary Documentation

- Do not create a new plan for trivial fixes or isolated styling changes.
- Do not create duplicate plans for the same task. Update the existing plan when appropriate.
- Keep plans concise and actionable.
- Do not repeat the entire project instructions in implementation documents.
- Do not create documentation solely to report routine actions.

### Implementation and Verification

- Make only changes within the approved scope.
- Do not add unrequested features or visual elements.
- Run the relevant build or checks after implementation.
- Report what changed, which checks passed, and any remaining issues.
- Never claim a check passed unless it was actually executed.


## 12. Design System First

Before implementing website sections, establish the design system based on the supplied Figma designs.

- Treat Figma as the source of truth.
- Inspect available typography, colors, spacing, layout, grid, breakpoints, borders, radii, and other recurring design patterns.
- Record confirmed design decisions in `docs/design-system.md`.
- Clearly distinguish observed design values from assumptions.
- Do not invent design tokens or introduce arbitrary visual styles.
- Reuse existing design tokens and components where appropriate.
- Ask the user when a missing design decision materially affects the implementation.
- Keep the design system proportional to the actual project. Avoid unnecessary abstractions.

Do not begin implementing page sections until the user has reviewed and approved the design system foundation.

## 13. Section-by-Section Implementation

Build pages incrementally, one section at a time.

For each section:

1. Inspect the relevant Figma frame or section and its assets.
2. Review the approved design system.
3. Create or update a concise implementation plan in `docs/implementation/`.
4. Identify the exact files to create or modify.
5. Define the visual requirements, responsive behavior, animations, and acceptance criteria.
6. Wait for explicit user approval before implementing.
7. Implement only the approved section and its necessary dependencies.
8. Run the relevant build and inspect the result in the browser.
9. Compare the implementation against the reference design.
10. Fix discrepancies before marking the section complete.

### Scope Control

- Do not implement the entire landing page when only one section is approved.
- Do not modify unrelated sections or shared components without explaining why.
- Do not introduce placeholder content or additional visual elements unless requested.
- Reuse existing styles, components, and utilities when appropriate.
- If a section requires a shared component or a change to the design system, explain the dependency and request approval when it expands the approved scope.
- Keep completed sections stable while working on the next section.

### Progress Tracking

- Keep each implementation plan concise and actionable.
- Use a checklist to track implementation and verification.
- Update existing plans instead of creating duplicate documents.
- Report completed work, verification results, and remaining issues.
- Do not mark a section complete until its agreed acceptance criteria have been checked.


## 14. Git: Branches, Commit and Push

- Repository: https://github.com/AndikaPurnamaPutra/website-2026 (`origin`).
- Branches:
  - `main`: production. Vercel deploys it to the live site. Only finished, approved work.
  - `dev`: daily work. Every task is committed and pushed here (Vercel makes a preview deployment).
  - `preloader/v1`, `preloader/v2`, …: one branch per preloader version, made from `dev`, each with its own Vercel preview. The chosen version is merged into `dev` (after confirmation); the others are deleted or kept as an archive.
  - `astro/migration`: the move from Pug + Gulp to Astro (and later Sanity), made from `dev`; merged into `dev` once every check in `docs/implementation/41-cms-migration.md` passes, after confirmation.
- Commit each completed task separately on `dev`, with a clear message.
- **Always ask the user for confirmation before committing and pushing.** After a task is finished and verified, summarize the changes and the proposed commit message, then wait for explicit approval.
- **Merge `dev` into `main` only when the user says the work is final**, and ask for confirmation before merging and pushing `main`.
- Run the build before committing. Never commit `node_modules/` or `dist/`.


## 15. SEO and Performance

Apply these to every page, new or changed. Where a page does not meet them yet, list the gaps in its implementation plan.

### SEO

- Each page has a unique `<title>` and a meta description (about 150–160 characters), in the page's own words.
- Each page has Open Graph and Twitter Card tags (title, description, image 1200 × 630, URL) and a canonical URL.
- One `h1` per page; headings in order (no skipped levels); `lang` set on `html`.
- Every image has an `alt`: describe it, or `alt=""` when it is decorative.
- Links have descriptive text or an `aria-label` (not "click here").
- The site has a favicon, `robots.txt` and `sitemap.xml`; new pages are added to the sitemap.
- Add structured data (schema.org, JSON-LD) where it fits, e.g. the studio as an Organization.
- Do not hide text that should be indexed behind JavaScript only; the page must make sense without JS.

### Performance

- Images: serve modern formats (WebP or AVIF) at sizes that match their display (`srcset` / `sizes`); set `width` and `height` to avoid layout shifts; lazy-load images below the first screen.
- Videos: compress them; use a light preview version where a large file is not needed; set a poster.
- Fonts: WOFF2 with `font-display: swap`; preload the fonts used in the first screen.
- Scripts and styles: minified for production; no source maps shipped to production; load heavy parts (such as the 3D coin) only when needed.
- Animations: animate `transform`, `opacity` and `clip-path`; avoid animating layout properties; respect `prefers-reduced-motion`.
- Do not add a dependency or an asset without considering its weight.
- Check new or changed pages with Lighthouse (or an equivalent) and report the scores; aim for 90+ in Performance, Accessibility, Best Practices and SEO, and explain any gap.

## 16. Content from the CMS

Once a section's content comes from Sanity:

- Every field has limits (text length, number of items, picture size), so that the longest or largest allowed content cannot break the layout.
- The layout stays tidy at the smallest and the largest allowed number of items (for example 4 and 20 client logos).
- Editors never enter layout numbers (px, crops, positions): use the image hotspot and the options the schema offers.
- Alt text is required for every picture.
- Change that section's content in Sanity only, not in the code.
