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

- Gulp for the development workflow and build process.
- Pug for HTML templates.
- Sass (SCSS) for styling.
- Vanilla JavaScript for DOM interactions.
- GSAP and ScrollTrigger for animations when required by the design.
- Barba.js for page transitions when required by the design.

Do not introduce React, Vue, Tailwind CSS, TypeScript, or other frameworks unless explicitly requested.
Do not introduce GrapesJS or another visual page builder unless explicitly requested.

## 4. Keep the Code Simple

- Avoid overengineering.
- Prefer straightforward, readable solutions.
- Do not create unnecessary abstractions, components, files, dependencies, or configuration.
- Do not install a library when a simple existing solution is sufficient.
- Use reusable Pug layouts and partials when they genuinely reduce duplication.
- Keep styles in SCSS and scripts in JavaScript.
- Follow the existing project structure and build workflow.
- Do not replace the existing stack or rewrite working configuration without a clear reason.

## 5. Project Structure

- Pug pages: `src/pug/pages/`
- Pug layouts: `src/pug/layouts/`
- Pug partials: `src/pug/partials/`
- SCSS: `src/scss/`
- JavaScript: `src/js/`
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
