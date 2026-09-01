# Anicca Agent Guidelines

These rules dictate the core behavior of AI agents working on the Anicca project.
All agents **must strictly adhere** to these guidelines at all times.

## Code Comments & Documentation

- **No Obvious Comments**: Do not add redundant, obvious, or overly explanatory comments in the code (e.g., avoid `// Lighter warm background requested`).
- **Keep it Clean**: Write self-documenting code. Only add comments when the logic is highly complex, non-intuitive, or strictly necessary for future maintainability.

## UI Design & References

- **Design System First**: Whenever the user provides a reference screenshot or image for UI design, **USE IT EXCLUSIVELY FOR LAYOUT INSPIRATION**. Do not copy the colors from the image.
- **Brand Colors**: Always adhere strictly to the application's Design System and color palette defined in `BRAND` (`apps/mobile/src/shared/constants/brand-colors.const.ts` or equivalent). Do not use hardcoded hex codes unless they are part of the brand.

## Architecture & Reusability

- **Best Practices**: Always check and adhere to the architectural and coding standards outlined in `docs/architecture.md` and `docs/coding_standards.md` before writing or refactoring code.
- **Component Reusability**: Before building a new UI component or utility, always scan the existing codebase (especially `shared/ui` or equivalent folders) to verify if a reusable component already exists. Avoid duplicating logic or UI elements.
