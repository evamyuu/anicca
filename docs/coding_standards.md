# Anicca — Coding Standards & Documentation Reference

> **Canonical reference for all architectural and code quality decisions.**
> Every contributor and AI agent MUST follow this document strictly.

---

## 1. Documentation Standard

### 1.1 TypeScript / React Native / Next.js

**Standard:** [TSDoc](https://tsdoc.org/) — the Microsoft standard for TypeScript, enforced via **TypeDoc**.

**Tool:** [`typedoc`](https://typedoc.org/) — generates HTML API docs from TSDoc comments.

#### Rules
- Every exported `function`, `class`, `interface`, `type`, `enum`, and `const` MUST have a TSDoc block (`/** */`).
- No inline `//` comments inside function bodies. Logic must be self-documenting (Clean Code).
- All documentation in **English**.
- `@internal` tag for non-exported members that still need a doc block.
- `@see` for cross-references to related symbols or external URLs.

#### TSDoc Tags Used

| Tag | Purpose |
|---|---|
| `@param name` | Document a parameter |
| `@returns` | Document return value |
| `@throws {ErrorType}` | Document thrown errors |
| `@see` | Cross-reference |
| `@example` | Usage example |
| `@deprecated` | Mark deprecated API |
| `@internal` | Non-public API |
| `@remarks` | Extended description |
| `@defaultValue` | Default value of a parameter |
| `@since` | Version/phase when introduced |

### 1.2 Python (FastAPI / Domain)

**Standard:** [Google-style docstrings](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings) — enforced via **Sphinx + autodoc + napoleon**.

**Tool:** `sphinx` + `sphinx.ext.autodoc` + `sphinx.ext.napoleon`

#### Rules
- Every module, class, method, and function MUST have a Google-style docstring.
- No `#` inline comments inside function bodies. Exception: `# type: ignore` and `# noqa` pragmas only.
- All documentation in **English**.

---

## 2. Corporate File Header

### 2.1 TypeScript / TSX / JavaScript

Every file MUST begin with the following TSDoc `@fileoverview` block:

```typescript
/**
 * @fileoverview [One-sentence description of the file's responsibility]
 *
 * @module [FSD layer path, e.g., features/ani-chat/ui/ChatInputBar]
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
```

**Rules:**
- `@module` MUST reflect the FSD layer path relative to `src/`.
- The description must be one sentence, imperative mood (e.g., "Renders..." "Manages..." "Provides...").
- No blank line between the header and the first `import`.

### 2.2 Python

Every `.py` file MUST begin with the following module docstring:

```python
"""
[One-sentence description of the module's responsibility.]

Module:    [module.path]
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
```

### 2.3 JSON / YAML / Config files

JSON and YAML files do not support comments, so no header is required.
`package.json`, `turbo.json`, `tsconfig.json`, `app.json`, etc. are exempt.

---

## 3. Clean Code Rules

1. **No narrative `//` comments.** If a comment is needed to explain what code does, refactor the code.
2. **No "TODO" comments** committed to `main`. Use GitHub Issues instead.
3. **No "Placeholder" comments** in production code. Stubs must use `throw new NotImplementedError()`.
4. **Function bodies must be self-documenting** — use descriptive variable and function names.
5. **Magic numbers** must be extracted to named constants in `shared/constants/`.

---

## 4. TypeDoc Configuration

```json
// typedoc.json (root)
{
  "entryPointStrategy": "packages",
  "entryPoints": [
    "packages/types",
    "packages/utils",
    "packages/ui",
    "packages/i18n",
    "packages/api-client",
    "apps/mobile/src"
  ],
  "out": "docs/api",
  "theme": "default",
  "readme": "README.md",
  "name": "Anicca API Documentation",
  "includeVersion": true,
  "categorizeByGroup": true
}
```

---

## 5. Architecture Rules (from ANICCA_ROOT_STRUCTURE.md)

### 5.1 FSD Layer Import Rules (ESLint-enforced)

```
app     → imports: pages, widgets, features, entities, shared
pages   → imports: widgets, features, entities, shared
widgets → imports: features, entities, shared
features → imports: entities, shared
entities → imports: shared
shared  → imports: NOTHING above (zero circular deps)
```

### 5.2 MVVM Pattern

- **View** = React component (renders UI, dispatches events)
- **View** = React component (renders UI, dispatches events)
- **ViewModel** = Custom hook named `use[Feature]ViewModel` or `use[Feature]`
- **Model** = TypeScript types in `@anicca/types`

Views MUST NOT contain business logic.
ViewModels MUST NOT import from `react-native` UI primitives.

### 5.3 Reusable UI Components

- **Never create bespoke, inline components** (e.g., using raw `TouchableOpacity` or `Text` for buttons/headers) when a shared component exists.
- **Always use shared components** from `apps/mobile/src/shared/ui/` or `packages/ui` (e.g., `Button`, `Typography`, `Input`) to ensure visual consistency, maintain scalability, and inherit accessibility features.
- If a component pattern is repeated (e.g., a specific card style), abstract it into a reusable component.

### 5.4 Zustand Store Rules

- One store per domain (auth, onboarding, ani-chat, routine)
- Stores live in `feature/model/` or `shared/lib/`
- `partialize` MUST be explicit — never persist entire store state

### 5.4 API Layer Rules

- All HTTP calls go through `shared/api/http-client.ts`
- Endpoint strings MUST come from `shared/constants/api-endpoints.const.ts`
- Feature-level `api/` files contain only typed wrappers over `httpClient`

---

## 6. WhatsApp / Whatsmiau Integration

**Provider:** [Whatsmiau Cloud](https://whatsmiau.dev)
**Dashboard:** https://whatsmiau.dev/dashboard

### 6.1 Architecture

```
Patient (WhatsApp) → Whatsmiau Webhook → POST /api/v1/whatsapp/webhook
                                              ↓
                                    WhatsmiaClient.verify_webhook_signature()
                                              ↓
                                    ProcessWhatsAppMessageUseCase
                                              ↓
                                    Ani LangGraph Orchestrator
                                              ↓
                                    WhatsmiaClient.send_text() / send_buttons()
```

### 6.2 Message Types Handled

| Incoming | Outgoing |
|---|---|
| `text` | `text` |
| `image` (document upload) | `buttons` (interactive) |
| `document` (PDF laudo) | `list` (menu options) |
| `button_reply` | `template` (onboarding) |
| `list_reply` | |

### 6.3 Security

- Webhook signature verified via HMAC-SHA256 (`WHATSMIAU_WEBHOOK_SECRET`)
- Phone numbers stored only as pseudonymized hash (`phoneToAnonymousId()` from `@anicca/utils`)
- Raw phone number kept only in encrypted Redis session (TTL 24h)

---

## 7. LGPD Compliance Checklist (per feature)

- [ ] No raw CPF/CNS/name stored in logs
- [ ] Pseudonymization via `hashWithSalt()` before persistence
- [ ] Consent check before any health data write
- [ ] `sharedWithDoctor` flag respected on all read paths
- [ ] Sentry `beforeSend` strips PII fields

---

## 8. Accessibility Checklist (WCAG 2.1 AA)

- [ ] All interactive elements have `accessibilityRole`
- [ ] All interactive elements have `accessibilityLabel`
- [ ] Touch targets ≥ 48dp (Android) / 44pt (iOS)
- [ ] Text size ≥ 16px (accessible mode: 18px)
- [ ] Color contrast ratio ≥ 4.5:1 for normal text

---

*Last updated: 2026-05-29 — Author: Evelin Brandão Cordeiro*
