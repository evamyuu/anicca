# ANICCA — DEFINITIVE ROOT STRUCTURE & ARCHITECTURE DECISION RECORD
> **Version:** 3.0 | **Date:** May 2026  
> **Scope:** Complete project tree with every folder explained, architecture justified, testing strategy defined, and asset management specified.

---

## PART 1 — ARCHITECTURE DECISION RECORD (ADR)

### ADR-001: Chosen Architecture — Three Patterns Working Together

**Status:** Accepted  
**Decision makers:** Evelin Brandão Cordeiro & Pabllo Vinicyus

#### The combination adopted

```
┌─────────────────────────────────────────────────────────────────┐
│  MACRO SYSTEM LEVEL          →  Clean Architecture (Uncle Bob)  │
│  (Backend FastAPI + entire system boundary)                     │
│    Domain → Application → Infrastructure → Presentation         │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND ORGANIZATION       →  Feature-Sliced Design (FSD)    │
│  (React Native + Next.js internal structure)                    │
│    app → pages → widgets → features → entities → shared        │
├─────────────────────────────────────────────────────────────────┤
│  UI STATE LAYER              →  MVVM (in-React form)           │
│  (Inside each feature's presentation)                           │
│    View = Component | ViewModel = Custom Hook | Model = Types   │
└─────────────────────────────────────────────────────────────────┘
```

#### Why NOT just MVVM
MVVM alone becomes a flat bag of ViewModels with no hierarchy as the app grows.
There is no rule about where a ViewModel can import from — causes circular deps.
Does not prescribe how the backend is organized.

#### Why NOT just Clean Architecture alone
Clean Architecture describes layers but NOT how to organize features within a layer.
You still end up with a `features/` folder that becomes unstructured over time.

#### Why NOT just Feature-Sliced Design alone
FSD is frontend-only. The FastAPI backend needs its own structure (Clean Arch).
FSD does not prescribe state management or testing strategy.

#### Why this combination wins
- Clean Architecture → system-wide separation, testability, swappable adapters (e.g. replace Whatsmiau with Meta API in one file)
- FSD → features are organized with strict layer rules: a `feature` cannot import from another `feature`, only from `entities` and `shared`. This eliminates spaghetti imports.
- MVVM → every screen has a `useXxxViewModel` hook that is the single source of state for that view — easy to test in isolation without rendering any component

#### FSD Layer Rules (strictly enforced via ESLint `eslint-plugin-fsd` or import rules)
```
app          → can import from: pages, widgets, features, entities, shared
pages        → can import from: widgets, features, entities, shared
widgets      → can import from: features, entities, shared
features     → can import from: entities, shared
entities     → can import from: shared
shared       → can import from: NOTHING above (no circular deps)

Rule: NEVER import upward. A shared/ file NEVER imports from features/.
Rule: NEVER import sideways between features. feature/ani NEVER imports feature/body-map.
```

---

## PART 2 — COMPLETE PROJECT ROOT TREE

```
anicca/                                    ← Monorepo root (Turborepo + pnpm)
│
├── .github/                               ← GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml                         ← CI: lint + typecheck + test on every PR
│   │   ├── cd-staging.yml                 ← CD: deploy to staging on merge to main
│   │   ├── cd-production.yml              ← CD: deploy to prod on release tag
│   │   └── codeql.yml                     ← Security scanning (GitHub CodeQL)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS                         ← Who reviews what (LGPD-sensitive files flagged)
│
├── .husky/                                ← Git hooks (pre-commit: lint + typecheck)
│   ├── pre-commit
│   └── commit-msg                         ← Enforces Conventional Commits format
│
├── apps/
│   ├── mobile/                            ← React Native (Expo SDK 52) iOS + Android
│   ├── web/                               ← Next.js 14 — Patient/Caregiver portal
│   ├── web-doctor/                        ← Next.js 14 — Doctor clinical panel
│   └── api/                               ← FastAPI (Python 3.12) — BFF + agents
│
├── packages/
│   ├── ui/                                ← Shared design system
│   ├── types/                             ← Shared TypeScript domain types
│   ├── api-client/                        ← TypeScript HTTP client SDK
│   ├── config/                            ← Shared ESLint, Prettier, TS, Tailwind configs
│   ├── i18n/                              ← Internationalization (pt-BR strings)
│   └── utils/                             ← Pure utility functions (no platform deps)
│
├── docs/                                  ← Project documentation (not code)
│   ├── adr/                               ← Architecture Decision Records
│   │   ├── ADR-001-architecture.md        ← This document
│   │   ├── ADR-002-whatsapp-provider.md   ← Whatsmiau vs Meta Cloud API decision
│   │   ├── ADR-003-llm-provider.md        ← Claude Sonnet selection rationale
│   │   └── ADR-004-database.md            ← PostgreSQL + pgvector decision
│   ├── lgpd/                              ← LGPD compliance documentation
│   │   ├── RIPD-DPIA.md                   ← Data Protection Impact Assessment
│   │   ├── consent-flows.md               ← Consent flow documentation
│   │   └── data-retention-policy.md
│   ├── api/                               ← API documentation (auto-generated from FastAPI)
│   ├── design/                            ← Design system reference
│   │   ├── color-palette.md
│   │   ├── typography.md
│   │   └── component-catalog.md
│   └── onboarding.md                      ← Developer onboarding guide
│
├── scripts/                               ← Development and automation scripts
│   ├── generate-types.sh                  ← Generates Zod schemas from FastAPI OpenAPI
│   ├── seed-database.sh                   ← Seeds local dev database
│   ├── check-licenses.sh                  ← Checks all package licenses (healthcare compliance)
│   └── audit-deps.sh                      ← npm/pip security audit
│
├── turbo.json                             ← Turborepo pipeline config
├── pnpm-workspace.yaml                    ← pnpm workspace definition
├── package.json                           ← Root: scripts + turbo devDep only
├── .npmrc                                 ← pnpm config: shamefully-hoist=false
├── .env.example                           ← Template (never commit .env)
├── .env.test                              ← Test environment variables (safe to commit)
├── .gitignore
├── .prettierrc                            ← Extends packages/config/prettier.config.js
├── .eslintrc.js                           ← Extends packages/config/eslint.config.js
└── README.md                              ← Project overview + quickstart
```

---

## PART 3 — `apps/mobile/` — COMPLETE STRUCTURE

### Architecture inside mobile: FSD + MVVM + Clean Architecture presentation layer

```
apps/mobile/
│
├── app/                                   ← Expo Router v4 (file-based routing)
│   │                                        IMPORTANT: This is ONLY routing — no logic here.
│   │                                        Screens import from src/pages/ (FSD pages layer)
│   │
│   ├── _layout.tsx                        ← Root layout: providers, splash, font loading
│   │
│   ├── (auth)/                            ← Route group: unauthenticated screens
│   │   ├── _layout.tsx                    ← Auth layout (redirects if already logged in)
│   │   ├── login.tsx                      ← Delegates to src/pages/auth/LoginPage.tsx
│   │   └── register.tsx                   ← Delegates to src/pages/auth/RegisterPage.tsx
│   │
│   ├── (onboarding)/                      ← Route group: 7-step onboarding
│   │   ├── _layout.tsx                    ← Onboarding layout (progress bar, Ani animation)
│   │   ├── step-1-welcome.tsx
│   │   ├── step-2-profile.tsx
│   │   ├── step-3-info.tsx
│   │   ├── step-4-ani-personality.tsx
│   │   ├── step-5-avatar.tsx
│   │   ├── step-6-permissions.tsx
│   │   └── step-7-hub.tsx
│   │
│   ├── (tabs)/                            ← Route group: authenticated main navigation
│   │   ├── _layout.tsx                    ← Tab bar: Hub | Ani | Routine | Docs
│   │   ├── hub/
│   │   │   ├── index.tsx                  ← Delegates to src/pages/hub/HubPage.tsx
│   │   │   └── [module].tsx               ← Dynamic GenUI module
│   │   ├── ani/
│   │   │   └── index.tsx                  ← Delegates to src/pages/ani/AniChatPage.tsx
│   │   ├── routine/
│   │   │   └── index.tsx
│   │   └── docs/
│   │       └── index.tsx
│   │
│   ├── body-map/
│   │   └── index.tsx                      ← Full-screen body map (modal stack)
│   ├── symptom/
│   │   ├── ctcae.tsx
│   │   └── [id].tsx
│   ├── journaling/
│   │   ├── index.tsx
│   │   └── history.tsx
│   ├── tickets/
│   │   ├── index.tsx
│   │   └── new.tsx
│   ├── documents/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── avatar/
│   │   └── customize.tsx
│   ├── settings/
│   │   └── index.tsx
│   └── +not-found.tsx                     ← 404 screen
│
│
├── src/                                   ← All app source code — FSD structure
│   │
│   │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│   │   FSD LAYER 1: app/  →  Already handled by Expo Router /app
│   │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│   │
│   ├── pages/                             ← FSD LAYER 2: pages (full screens)
│   │   │                                    Each page = one screen with its ViewModel hook
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── useLoginViewModel.ts       ← MVVM ViewModel for login screen
│   │   ├── hub/
│   │   │   ├── HubPage.tsx
│   │   │   └── useHubViewModel.ts
│   │   ├── ani/
│   │   │   ├── AniChatPage.tsx
│   │   │   └── useAniChatViewModel.ts
│   │   ├── routine/
│   │   │   ├── RoutinePage.tsx
│   │   │   └── useRoutineViewModel.ts
│   │   ├── body-map/
│   │   │   ├── BodyMapPage.tsx
│   │   │   └── useBodyMapViewModel.ts
│   │   ├── ctcae/
│   │   │   ├── CtcaePage.tsx
│   │   │   └── useCtcaeViewModel.ts
│   │   ├── journaling/
│   │   │   ├── JournalingPage.tsx
│   │   │   ├── JournalingHistoryPage.tsx
│   │   │   └── useJournalingViewModel.ts
│   │   ├── documents/
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── DocumentDetailPage.tsx
│   │   │   └── useDocumentsViewModel.ts
│   │   ├── tickets/
│   │   │   ├── TicketsPage.tsx
│   │   │   ├── NewTicketPage.tsx
│   │   │   └── useTicketsViewModel.ts
│   │   ├── onboarding/
│   │   │   ├── steps/
│   │   │   │   ├── WelcomeStep.tsx
│   │   │   │   ├── ProfileStep.tsx
│   │   │   │   ├── InfoStep.tsx
│   │   │   │   ├── AniPersonalityStep.tsx
│   │   │   │   ├── AvatarStep.tsx
│   │   │   │   ├── PermissionsStep.tsx
│   │   │   │   └── HubIntroStep.tsx
│   │   │   └── useOnboardingViewModel.ts
│   │   ├── avatar/
│   │   │   ├── AvatarCustomizePage.tsx
│   │   │   └── useAvatarViewModel.ts
│   │   └── settings/
│   │       ├── SettingsPage.tsx
│   │       └── useSettingsViewModel.ts
│   │
│   ├── widgets/                           ← FSD LAYER 3: widgets (composed UI blocks)
│   │   │                                    Widgets assemble features into larger blocks
│   │   │                                    Example: HubDashboard widget = GenUI + search + cards
│   │   ├── hub-dashboard/
│   │   │   ├── HubDashboard.tsx           ← Composes: SmartSearch + GenUI + QuickActions
│   │   │   └── index.ts
│   │   ├── ani-chat-window/
│   │   │   ├── AniChatWindow.tsx          ← Composes: ChatBubbles + TypingIndicator + InputBar
│   │   │   └── index.ts
│   │   ├── routine-today/
│   │   │   ├── RoutineTodayWidget.tsx     ← Composes: Temperature + Meds + Hydration + Sleep
│   │   │   └── index.ts
│   │   ├── body-map-interactive/
│   │   │   ├── BodyMapInteractiveWidget.tsx
│   │   │   └── index.ts
│   │   ├── journaling-checkin/
│   │   │   ├── JournalingCheckinWidget.tsx
│   │   │   └── index.ts
│   │   └── documents-library/
│   │       ├── DocumentsLibraryWidget.tsx
│   │       └── index.ts
│   │
│   ├── features/                          ← FSD LAYER 4: features (user interactions)
│   │   │                                    Each feature = one user action/flow
│   │   │                                    Rule: features CANNOT import from other features
│   │   │
│   │   ├── ani-chat/                      ← Feature: send message to Ani, receive response
│   │   │   ├── ui/
│   │   │   │   ├── AniMessageBubble.tsx
│   │   │   │   ├── UserMessageBubble.tsx
│   │   │   │   ├── AniTypingIndicator.tsx
│   │   │   │   └── ChatInputBar.tsx
│   │   │   ├── model/
│   │   │   │   ├── useAniChat.ts          ← Sends message, receives GenUI response
│   │   │   │   └── ani-chat.store.ts      ← Zustand: messages[], isTyping
│   │   │   ├── api/
│   │   │   │   └── ani-chat.api.ts        ← API calls to /api/v1/messages
│   │   │   └── index.ts                   ← Public API (barrel export)
│   │   │
│   │   ├── register-symptom/              ← Feature: tap body map region, open modal, save
│   │   │   ├── ui/
│   │   │   │   ├── SymptomRegistrationModal.tsx
│   │   │   │   ├── IntensitySlider.tsx
│   │   │   │   └── SymptomTypeSelector.tsx
│   │   │   ├── model/
│   │   │   │   └── useRegisterSymptom.ts
│   │   │   ├── api/
│   │   │   │   └── symptoms.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── track-medication/              ← Feature: mark medication as taken
│   │   │   ├── ui/
│   │   │   │   ├── MedicationItem.tsx
│   │   │   │   └── MedicationPeriodGroup.tsx
│   │   │   ├── model/
│   │   │   │   ├── useMedicationTracking.ts
│   │   │   │   └── medication.store.ts
│   │   │   ├── api/
│   │   │   │   └── medication.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── log-temperature/               ← Feature: enter body temperature
│   │   │   ├── ui/
│   │   │   │   ├── TemperatureInput.tsx
│   │   │   │   └── TemperatureAlertBanner.tsx  ← Educational info ≥37.8°C (NOT SaMD)
│   │   │   ├── model/
│   │   │   │   └── useTemperatureLog.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── track-hydration/               ← Feature: tap water glasses
│   │   │   ├── ui/
│   │   │   │   ├── HydrationGlass.tsx
│   │   │   │   └── HydrationProgress.tsx
│   │   │   ├── model/
│   │   │   │   └── useHydrationTracking.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── log-sleep/                     ← Feature: log sleep hours + quality
│   │   │   ├── ui/
│   │   │   │   ├── SleepDurationInput.tsx
│   │   │   │   └── SleepQualitySelector.tsx
│   │   │   ├── model/
│   │   │   │   └── useSleepLog.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── mood-checkin/                  ← Feature: nightly journaling check-in
│   │   │   ├── ui/
│   │   │   │   ├── MoodEmojiSelector.tsx  ← 4 mood options
│   │   │   │   ├── JournalTextEditor.tsx
│   │   │   │   └── WellbeingExerciseCard.tsx
│   │   │   ├── model/
│   │   │   │   └── useMoodCheckin.ts
│   │   │   ├── api/
│   │   │   │   └── journaling.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── upload-document/               ← Feature: upload medical report via camera/gallery
│   │   │   ├── ui/
│   │   │   │   ├── DocumentUploadButton.tsx
│   │   │   │   └── OcrProcessingOverlay.tsx
│   │   │   ├── model/
│   │   │   │   └── useDocumentUpload.ts
│   │   │   ├── api/
│   │   │   │   └── documents.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── open-ticket/                   ← Feature: open support ticket (3-step flow)
│   │   │   ├── ui/
│   │   │   │   ├── TicketTypeGrid.tsx     ← Step 1: visual cards for ticket type
│   │   │   │   ├── TicketDescriptionForm.tsx  ← Step 2: text + LLM suggestion
│   │   │   │   └── TicketChannelSelector.tsx  ← Step 3: SUS/convenio/particular routing
│   │   │   ├── model/
│   │   │   │   └── useOpenTicket.ts
│   │   │   ├── api/
│   │   │   │   └── tickets.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sync-wearable/                 ← Feature: sync Google Health Connect data
│   │   │   ├── model/
│   │   │   │   └── useHealthConnect.ts    ← Steps, sleep, HR, HRV from Health Connect
│   │   │   └── index.ts
│   │   │
│   │   ├── customize-avatar/              ← Feature: change Ani avatar appearance
│   │   │   ├── ui/
│   │   │   │   ├── SkinToneSelector.tsx
│   │   │   │   ├── HairAccessorySelector.tsx
│   │   │   │   ├── ExpressionSelector.tsx
│   │   │   │   └── MedicalAccessorySelector.tsx
│   │   │   ├── model/
│   │   │   │   └── useAvatarCustomization.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── select-ani-personality/        ← Feature: choose Ani's communication style
│   │   │   ├── ui/
│   │   │   │   └── PersonalityCard.tsx
│   │   │   ├── model/
│   │   │   │   └── usePersonalitySelection.ts
│   │   │   └── index.ts
│   │   │
│   │   └── manage-consent/               ← Feature: view and revoke LGPD consents
│   │       ├── ui/
│   │       │   ├── ConsentToggle.tsx
│   │       │   └── ConsentHistoryList.tsx
│   │       ├── model/
│   │       │   └── useConsentManagement.ts
│   │       ├── api/
│   │       │   └── consent.api.ts
│   │       └── index.ts
│   │
│   ├── entities/                          ← FSD LAYER 5: domain entities
│   │   │                                    Pure data models + display components for entities
│   │   │                                    NO business logic — only data shape + basic display
│   │   │
│   │   ├── patient/
│   │   │   ├── model/
│   │   │   │   ├── patient.types.ts       ← Patient, CancerType, TreatmentModality
│   │   │   │   └── patient.store.ts       ← Zustand: current patient profile
│   │   │   ├── ui/
│   │   │   │   └── PatientBadge.tsx       ← Shows patient name + cancer type badge
│   │   │   └── index.ts
│   │   │
│   │   ├── symptom/
│   │   │   ├── model/
│   │   │   │   ├── symptom.types.ts       ← BodyMapEntry, CtcaeGrade, CtcaeSymptom
│   │   │   │   └── ctcae-symptoms.data.ts ← 7 primary symptoms definition
│   │   │   ├── ui/
│   │   │   │   ├── CtcaeGradeBadge.tsx    ← Badge showing grade 0-4 with color
│   │   │   │   └── SymptomChip.tsx        ← Small chip with emoji + label
│   │   │   └── index.ts
│   │   │
│   │   ├── medication/
│   │   │   ├── model/
│   │   │   │   └── medication.types.ts    ← Medication, MedicationPeriod, DoseStatus
│   │   │   ├── ui/
│   │   │   │   └── MedicationChip.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── journal-entry/
│   │   │   ├── model/
│   │   │   │   └── journal-entry.types.ts ← JournalEntry, MoodLevel, WellbeingExercise
│   │   │   ├── ui/
│   │   │   │   └── MoodIndicator.tsx      ← Emoji circle for mood display
│   │   │   └── index.ts
│   │   │
│   │   ├── ticket/
│   │   │   ├── model/
│   │   │   │   └── ticket.types.ts        ← Ticket, TicketType, TicketStatus, TicketChannel
│   │   │   ├── ui/
│   │   │   │   └── TicketStatusBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── document/
│   │   │   ├── model/
│   │   │   │   └── document.types.ts      ← MedicalDocument, DocumentCategory, OcrResult
│   │   │   ├── ui/
│   │   │   │   └── DocumentCategoryIcon.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── journey/
│   │   │   ├── model/
│   │   │   │   └── journey.types.ts       ← JourneyMilestone, Law60DaysStatus
│   │   │   └── index.ts
│   │   │
│   │   └── gen-ui/
│   │       ├── model/
│   │       │   └── gen-ui.types.ts        ← GenUiCard, GenUiCardType, AniResponse
│   │       ├── ui/
│   │       │   ├── GenUiRenderer.tsx      ← Routes card type to correct card component
│   │       │   ├── cards/
│   │       │   │   ├── GenUiCtcaeCard.tsx
│   │       │   │   ├── GenUiBodyMapCard.tsx
│   │       │   │   ├── GenUiTimelineCard.tsx
│   │       │   │   ├── GenUiMedicationCard.tsx
│   │       │   │   ├── GenUiLaw60DaysCard.tsx
│   │       │   │   ├── GenUiWearableCard.tsx
│   │       │   │   ├── GenUiMoodChartCard.tsx
│   │       │   │   └── GenUiClinicalTrialCard.tsx
│   │       └── index.ts
│   │
│   └── shared/                            ← FSD LAYER 6: shared (used by everyone)
│       │                                    Completely domain-agnostic. Zero business logic.
│       │
│       ├── ui/                            ← Generic UI atoms imported from packages/ui
│       │   ├── Button.tsx                 ← Re-exports from packages/ui with mobile adaptations
│       │   ├── Card.tsx
│       │   ├── Badge.tsx
│       │   ├── Input.tsx
│       │   ├── Modal.tsx
│       │   ├── Avatar.tsx
│       │   ├── Spinner.tsx
│       │   ├── Toast.tsx
│       │   ├── ProgressBar.tsx
│       │   ├── Divider.tsx
│       │   ├── AccessibleText.tsx         ← Text with WCAG-safe font size enforcement
│       │   ├── SafeAreaWrapper.tsx
│       │   ├── KeyboardAvoidingWrapper.tsx
│       │   ├── EmptyState.tsx             ← Ani illustration for empty screens
│       │   ├── ErrorState.tsx             ← Error with retry action
│       │   └── SkeletonLoader.tsx         ← Animated placeholders during loading
│       │
│       ├── hooks/                         ← Utility hooks (no domain knowledge)
│       │   ├── useTheme.ts                ← Dark/light mode + Tailwind class helpers
│       │   ├── useAccessibility.ts        ← Font scale, screen reader detection
│       │   ├── useDebounce.ts
│       │   ├── useKeyboard.ts
│       │   ├── useSafeAreaInsets.ts
│       │   ├── usePushNotifications.ts
│       │   └── useNetworkStatus.ts        ← Online/offline detection
│       │
│       ├── api/                           ← Base HTTP client (no endpoints — just the client)
│       │   ├── http-client.ts             ← Axios instance: base URL, interceptors, auth header
│       │   └── api-error-handler.ts
│       │
│       ├── lib/                           ← Library configurations
│       │   ├── query-client.ts            ← TanStack Query client config
│       │   ├── sentry.ts                  ← Sentry init (no PII)
│       │   └── zustand-persist.ts         ← AsyncStorage persist middleware
│       │
│       ├── constants/                     ← App-wide constants (no business logic)
│       │   ├── api-endpoints.const.ts     ← All API route strings as typed constants
│       │   ├── app-config.const.ts        ← App name, version, bundle ID
│       │   ├── accessibility.const.ts     ← Min font sizes, touch targets
│       │   └── ctcae-grade-colors.const.ts ← CTCAE grade → color mapping
│       │
│       ├── utils/                         ← Pure functions (imported from packages/utils)
│       │   └── index.ts                   ← Re-exports from @anicca/utils
│       │
│       └── providers/                     ← React context providers (app-level setup)
│           ├── QueryProvider.tsx
│           ├── ThemeProvider.tsx
│           ├── FontProvider.tsx           ← Loads Nunito via @expo-google-fonts/nunito
│           └── AuthProvider.tsx
│
│
├── assets/                                ← ALL static files for the mobile app
│   │                                        (React Native asset resolution goes here)
│   │
│   ├── images/                            ← Raster images (.png, .jpg, .webp)
│   │   ├── brand/
│   │   │   ├── logo.png                   ← Anicca logo (light bg)
│   │   │   ├── logo-dark.png              ← Anicca logo (dark bg)
│   │   │   ├── logo@2x.png                ← Retina variants
│   │   │   ├── logo@3x.png
│   │   │   └── splash-screen.png
│   │   ├── onboarding/
│   │   │   ├── onboarding-step-1.png
│   │   │   ├── onboarding-step-2.png
│   │   │   └── onboarding-step-3.png
│   │   ├── body-map/
│   │   │   ├── body-silhouette-front.png  ← Fallback PNG if SVG fails
│   │   │   └── body-silhouette-back.png
│   │   ├── placeholder/
│   │   │   ├── document-placeholder.png
│   │   │   └── avatar-placeholder.png
│   │   └── illustrations/
│   │       ├── empty-state-ani.png        ← Ani illustration for empty screens
│   │       ├── success-ani.png
│   │       └── error-ani.png
│   │
│   ├── icons/                             ← App icons (for app stores + adaptive icons)
│   │   ├── icon.png                       ← 1024x1024 main app icon
│   │   ├── icon-adaptive-foreground.png   ← Android adaptive icon foreground
│   │   ├── icon-adaptive-background.png   ← Android adaptive icon background
│   │   ├── notification-icon.png          ← Small notification icon (monochrome)
│   │   └── favicon.png                    ← Web favicon (Expo web)
│   │
│   ├── svg/                               ← SVG assets compiled at build time
│   │   │                                    Used via react-native-svg + SVGR transformer
│   │   ├── body-map/
│   │   │   ├── body-front.svg             ← Body silhouette front view (interactive)
│   │   │   ├── body-back.svg              ← Body silhouette back view (interactive)
│   │   │   └── region-overlays/           ← Individual region SVG paths per anatomical area
│   │   │       ├── head.svg
│   │   │       ├── neck.svg
│   │   │       ├── chest-left.svg
│   │   │       ├── chest-right.svg
│   │   │       ├── abdomen-upper.svg
│   │   │       ├── abdomen-lower.svg
│   │   │       ├── pelvis.svg
│   │   │       ├── arm-left.svg
│   │   │       ├── arm-right.svg
│   │   │       ├── leg-left.svg
│   │   │       ├── leg-right.svg
│   │   │       ├── back-upper.svg
│   │   │       ├── back-lower.svg
│   │   │       ├── shoulder-left.svg
│   │   │       └── shoulder-right.svg
│   │   ├── icons-ui/                      ← UI icon SVGs (not app store icons)
│   │   │   ├── icon-heart.svg
│   │   │   ├── icon-pill.svg
│   │   │   ├── icon-thermometer.svg
│   │   │   ├── icon-water-drop.svg
│   │   │   ├── icon-moon.svg
│   │   │   ├── icon-document.svg
│   │   │   ├── icon-chat.svg
│   │   │   ├── icon-body.svg
│   │   │   ├── icon-calendar.svg
│   │   │   ├── icon-alert.svg
│   │   │   ├── icon-check.svg
│   │   │   ├── icon-law-scale.svg
│   │   │   ├── icon-smartwatch.svg
│   │   │   └── icon-ticket.svg
│   │   ├── avatar/                        ← SVG parts for the user avatar
│   │   │   ├── body-base.svg
│   │   │   ├── hair-short.svg
│   │   │   ├── hair-long.svg
│   │   │   ├── head-bald.svg
│   │   │   ├── accessory-turban.svg
│   │   │   ├── accessory-scarf.svg
│   │   │   ├── accessory-cap.svg
│   │   │   ├── accessory-port-a-cath.svg  ← Port-a-cath chemo accessory
│   │   │   ├── accessory-iv-bag.svg
│   │   │   └── accessory-none.svg
│   │   └── brand/
│   │       ├── logo.svg                   ← Vector logo (preferred over PNG)
│   │       └── ani-cat.svg                ← Ani mascot base SVG
│   │
│   ├── animations/                        ← Lottie JSON animations for Ani
│   │   ├── ani-wave.json                  ← Welcome / greeting
│   │   ├── ani-thinking.json              ← Processing / loading
│   │   ├── ani-celebrate.json             ← Success / milestone
│   │   ├── ani-sleeping.json              ← Silence protocol / inactivity
│   │   ├── ani-empathy.json               ← Journaling / emotional moments
│   │   └── loading-pulse.json             ← Generic loading (not Ani)
│   │
│   └── fonts/                             ← Font files (Nunito via @expo-google-fonts)
│       │                                    NOTE: With @expo-google-fonts/nunito,
│       │                                    you do NOT need .ttf files here — the package
│       │                                    handles loading. This folder is for any
│       │                                    CUSTOM fonts not available via Google Fonts.
│       └── .gitkeep                       ← Keep folder in git (currently empty)
│
│
├── __tests__/                             ← TOP-LEVEL test directory (mirrors src/ structure)
│   │                                        See Part 6 for full testing strategy
│   ├── pages/
│   │   └── hub/
│   │       └── HubPage.test.tsx
│   ├── features/
│   │   ├── ani-chat/
│   │   │   ├── AniMessageBubble.test.tsx
│   │   │   └── useAniChat.test.ts
│   │   ├── register-symptom/
│   │   │   └── useRegisterSymptom.test.ts
│   │   └── mood-checkin/
│   │       └── useMoodCheckin.test.ts
│   ├── entities/
│   │   └── gen-ui/
│   │       └── GenUiRenderer.test.tsx
│   ├── shared/
│   │   ├── ui/
│   │   │   ├── Button.test.tsx
│   │   │   └── AccessibleText.test.tsx
│   │   └── hooks/
│   │       └── useTheme.test.ts
│   ├── mocks/                             ← Jest mocks and test fixtures
│   │   ├── __mocks__/
│   │   │   ├── @expo-google-fonts/        ← Mock font loading in tests
│   │   │   │   └── nunito.ts
│   │   │   ├── react-native-svg.ts        ← Mock SVG for unit tests
│   │   │   ├── react-native-health-connect.ts
│   │   │   └── expo-router.ts
│   │   ├── fixtures/                      ← Static test data
│   │   │   ├── patient.fixture.ts
│   │   │   ├── symptom.fixture.ts
│   │   │   ├── medication.fixture.ts
│   │   │   └── ani-response.fixture.ts
│   │   ├── handlers/                      ← MSW API handlers for integration tests
│   │   │   ├── messages.handlers.ts       ← Mock /api/v1/messages
│   │   │   ├── body-map.handlers.ts
│   │   │   ├── symptoms.handlers.ts
│   │   │   └── index.ts
│   │   └── server.ts                      ← MSW server setup
│   └── setup.ts                           ← Jest global setup (extends expect, etc.)
│
├── e2e/                                   ← End-to-End tests (Maestro)
│   ├── flows/
│   │   ├── onboarding-complete.yaml       ← Full 7-step onboarding flow
│   │   ├── register-symptom.yaml          ← Patient registers symptom via Body Map
│   │   ├── ani-chat-basic.yaml            ← Send message, receive response
│   │   ├── open-ticket.yaml               ← 3-step ticket opening
│   │   ├── daily-routine.yaml             ← Temperature + meds + hydration
│   │   └── journaling-checkin.yaml        ← Nightly mood check-in
│   └── maestro.config.yaml
│
├── app.json                               ← Expo config
├── app.config.ts                          ← Dynamic Expo config (reads env vars)
├── babel.config.js
├── metro.config.js                        ← Metro bundler (monorepo symlink support)
├── tailwind.config.js                     ← Extends packages/config/tailwind.config.js
├── tsconfig.json                          ← Extends packages/config/tsconfig.json
├── jest.config.ts                         ← Jest config (jest-expo preset)
├── jest.setup.ts                          ← Jest setup file
├── .env.example
└── package.json
```

---

## PART 4 — `apps/web/` and `apps/web-doctor/` — STRUCTURE

Both web apps follow the same FSD structure as mobile, adapted for Next.js App Router:

```
apps/web/
├── app/                                   ← Next.js App Router (routing only)
│   ├── (auth)/
│   │   ├── login/page.tsx                 ← Delegates to src/pages/auth/LoginPage.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                     ← Authenticated layout: sidebar + header
│   │   ├── hub/page.tsx
│   │   ├── ani/page.tsx
│   │   ├── routine/page.tsx
│   │   ├── body-map/page.tsx
│   │   ├── journaling/
│   │   │   ├── page.tsx
│   │   │   └── history/page.tsx
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                               ← Next.js Route Handlers (BFF proxy)
│   │   └── [...proxy]/route.ts
│   ├── layout.tsx                         ← Root layout: Nunito font + providers
│   ├── page.tsx                           ← Landing redirect
│   ├── not-found.tsx
│   └── globals.css                        ← Tailwind base + CSS vars for dark mode
│
├── src/                                   ← Same FSD layers as mobile
│   ├── pages/                             ← Full page components + ViewModels
│   ├── widgets/                           ← Composed UI blocks
│   ├── features/                          ← Same features as mobile (web-specific UI)
│   ├── entities/                          ← Same entities (shared types from @anicca/types)
│   └── shared/
│       ├── ui/                            ← shadcn/ui components with Nunito
│       ├── hooks/
│       ├── api/
│       ├── lib/
│       │   ├── query-client.ts
│       │   ├── auth.ts                    ← next-auth configuration
│       │   └── sentry.ts
│       ├── constants/
│       └── providers/
│
├── public/                                ← Next.js public folder (served as-is)
│   ├── images/
│   │   ├── logo.png
│   │   └── og-image.png                   ← Open Graph image for social sharing
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   └── manifest-icon-192.png
│   └── robots.txt
│
├── __tests__/                             ← Same structure as mobile
│   ├── pages/
│   ├── features/
│   ├── mocks/
│   └── setup.ts
│
├── e2e/                                   ← Playwright E2E tests
│   ├── auth.spec.ts
│   ├── hub.spec.ts
│   ├── body-map.spec.ts
│   └── journaling.spec.ts
│
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── jest.config.ts
└── package.json
```

---

## PART 5 — `apps/api/` — COMPLETE STRUCTURE (Clean Architecture)

```
apps/api/
│
├── src/
│   │
│   ├── domain/                            ← LAYER 1: Domain (zero dependencies)
│   │   ├── entities/                      ← Pure Python dataclasses — no imports from outside
│   │   │   ├── __init__.py
│   │   │   ├── patient.py
│   │   │   ├── journey.py
│   │   │   ├── symptom.py
│   │   │   ├── body_map_entry.py
│   │   │   ├── ticket.py
│   │   │   ├── medication.py
│   │   │   ├── journal_entry.py
│   │   │   └── clinical_entry.py
│   │   ├── value_objects/                 ← Immutable domain value types
│   │   │   ├── ctcae_grade.py             ← CtcaeGrade enum (0-4) with validation
│   │   │   ├── cancer_stage.py
│   │   │   └── treatment_modality.py
│   │   └── exceptions/                    ← Domain-specific exceptions
│   │       ├── patient_not_found.py
│   │       └── consent_not_granted.py
│   │
│   ├── application/                       ← LAYER 2: Application (imports domain only)
│   │   ├── use_cases/
│   │   │   ├── __init__.py
│   │   │   ├── process_medical_report.py
│   │   │   ├── register_symptom.py
│   │   │   ├── open_ticket.py
│   │   │   ├── track_medication.py
│   │   │   ├── log_temperature.py
│   │   │   ├── generate_contextual_journaling.py
│   │   │   ├── process_mood_checkin.py
│   │   │   ├── consult_guidelines_multi_agent.py
│   │   │   ├── send_whatsapp_message.py
│   │   │   └── process_whatsapp_webhook.py
│   │   ├── ports/                         ← Abstract interfaces (Dependency Inversion)
│   │   │   ├── llm_port.py
│   │   │   ├── storage_port.py
│   │   │   ├── ocr_port.py
│   │   │   ├── whatsapp_port.py
│   │   │   ├── patient_repository_port.py
│   │   │   ├── symptom_repository_port.py
│   │   │   └── session_cache_port.py
│   │   └── dto/                           ← Data Transfer Objects between layers
│   │       ├── register_symptom_dto.py
│   │       └── process_message_dto.py
│   │
│   ├── infrastructure/                    ← LAYER 3: Infrastructure (implements ports)
│   │   ├── repositories/
│   │   │   ├── postgres_patient_repository.py
│   │   │   ├── postgres_symptom_repository.py
│   │   │   ├── postgres_ticket_repository.py
│   │   │   └── postgres_document_repository.py
│   │   ├── cache/
│   │   │   └── redis_context_cache.py     ← Implements SessionCachePort
│   │   ├── llm/
│   │   │   └── anthropic_llm_adapter.py   ← Implements LlmPort (Claude Sonnet 4.5)
│   │   ├── agents/                        ← LangGraph agent implementations
│   │   │   ├── __init__.py
│   │   │   ├── graph/
│   │   │   │   ├── patient_graph.py       ← LangGraph state machine for patient profile
│   │   │   │   └── doctor_graph.py        ← LangGraph state machine for doctor profile
│   │   │   ├── nodes/                     ← Individual agent nodes
│   │   │   │   ├── intent_classifier.py
│   │   │   │   ├── context_retriever.py
│   │   │   │   ├── router_node.py
│   │   │   │   ├── rag_oncology_node.py
│   │   │   │   ├── ctcae_classifier_node.py
│   │   │   │   ├── body_map_node.py
│   │   │   │   ├── journaling_node.py
│   │   │   │   ├── documents_ocr_node.py
│   │   │   │   ├── ticket_node.py
│   │   │   │   ├── wearables_node.py
│   │   │   │   ├── pubmed_search_node.py
│   │   │   │   ├── clinical_guidelines_node.py
│   │   │   │   ├── oncokb_node.py
│   │   │   │   ├── clinical_trials_node.py
│   │   │   │   ├── briefing_node.py
│   │   │   │   └── synthesizer_node.py    ← Final response assembly
│   │   │   └── tools/                     ← LangChain tools for agents
│   │   │       ├── pubmed_tool.py
│   │   │       ├── oncokb_tool.py
│   │   │       └── clinical_trials_tool.py
│   │   ├── whatsapp/
│   │   │   └── whatsmiau_gateway.py       ← Implements WhatsAppPort
│   │   ├── ocr/
│   │   │   └── aws_textract_adapter.py    ← Implements OcrPort
│   │   ├── storage/
│   │   │   └── aws_s3_adapter.py          ← Implements StoragePort
│   │   ├── vector_store/
│   │   │   └── pgvector_store.py          ← RAG vector search
│   │   └── knowledge_graph/
│   │       └── neo4j_client.py            ← Phase 5
│   │
│   └── presentation/                      ← LAYER 4: Presentation (FastAPI routers)
│       ├── routers/
│       │   ├── whatsapp_router.py         ← POST /api/v1/whatsapp/webhook
│       │   ├── messages_router.py         ← POST /api/v1/messages (web/app)
│       │   ├── body_map_router.py
│       │   ├── symptoms_router.py
│       │   ├── tickets_router.py
│       │   ├── documents_router.py
│       │   ├── journaling_router.py
│       │   ├── routine_router.py
│       │   ├── profile_router.py
│       │   ├── doctor_router.py           ← Protected: requires role=doctor + consent
│       │   └── auth_router.py
│       ├── middleware/
│       │   ├── auth_middleware.py
│       │   ├── rate_limiter_middleware.py
│       │   ├── audit_logger_middleware.py ← LGPD: strips PII before logging
│       │   ├── channel_adapter_middleware.py
│       │   └── doctor_access_guard.py     ← Validates JWT + consent + patient-doctor link
│       └── schemas/                       ← Pydantic request/response schemas
│           ├── whatsapp_schemas.py
│           ├── message_schemas.py
│           ├── body_map_schemas.py
│           ├── symptoms_schemas.py
│           ├── tickets_schemas.py
│           ├── documents_schemas.py
│           ├── journaling_schemas.py
│           ├── routine_schemas.py
│           └── patient_schemas.py
│
├── tests/                                 ← Pytest test suite
│   ├── unit/
│   │   ├── domain/
│   │   │   ├── test_patient_entity.py
│   │   │   └── test_ctcae_grade.py
│   │   ├── application/
│   │   │   ├── test_register_symptom.py
│   │   │   ├── test_process_whatsapp_webhook.py
│   │   │   └── test_open_ticket.py
│   │   └── infrastructure/
│   │       └── test_whatsmiau_gateway.py
│   ├── integration/
│   │   ├── test_whatsapp_webhook_endpoint.py
│   │   ├── test_body_map_router.py
│   │   └── test_doctor_access_guard.py
│   ├── e2e/
│   │   └── test_full_patient_flow.py      ← pytest + httpx async client
│   ├── fixtures/
│   │   ├── patient_fixtures.py
│   │   └── symptom_fixtures.py
│   └── conftest.py                        ← Pytest fixtures + DB setup
│
├── alembic/                               ← Database migrations
│   ├── versions/
│   └── env.py
│
├── scripts/
│   ├── seed_rag_corpus.py                 ← Indexes INCA, Oncoguia, laws into pgvector
│   └── seed_dev_data.py                   ← Seeds local dev database with test patients
│
├── main.py                                ← FastAPI app entry point
├── config.py                              ← Pydantic Settings (reads .env)
├── requirements.txt
├── requirements-dev.txt                   ← Testing deps: pytest, httpx, factory-boy
├── pyproject.toml                         ← Ruff + mypy + pytest config
├── Dockerfile
├── docker-compose.yml                     ← PostgreSQL + Redis + API for local dev
└── .env.example
```

---

## PART 6 — `packages/` — COMPLETE STRUCTURE

```
packages/
│
├── ui/                                    ← Shared design system
│   ├── src/
│   │   ├── components/                    ← Platform-agnostic primitives
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Card.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Badge/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Avatar/
│   │   │   ├── Spinner/
│   │   │   ├── Toast/
│   │   │   ├── ProgressBar/
│   │   │   └── index.ts                  ← Barrel: exports all components
│   │   ├── tokens/
│   │   │   ├── colors.ts                 ← Light mode palette
│   │   │   ├── colors.dark.ts            ← Dark mode palette (Windows-style)
│   │   │   ├── typography.ts             ← Nunito scales
│   │   │   ├── spacing.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── types/                                 ← Shared TypeScript domain types
│   ├── src/
│   │   ├── patient.types.ts
│   │   ├── symptom.types.ts
│   │   ├── journey.types.ts
│   │   ├── medication.types.ts
│   │   ├── journal-entry.types.ts
│   │   ├── ticket.types.ts
│   │   ├── document.types.ts
│   │   ├── agent.types.ts                ← GenUiCard, AniResponse
│   │   ├── whatsapp.types.ts             ← WhatsmiaWebhookPayload, MessageTypes
│   │   ├── consent.types.ts              ← ConsentRecord, ConsentType
│   │   └── index.ts
│   └── package.json
│
├── api-client/                            ← TypeScript HTTP SDK
│   ├── src/
│   │   ├── client.ts                     ← Axios instance base config
│   │   ├── endpoints/
│   │   │   ├── messages.endpoints.ts
│   │   │   ├── body-map.endpoints.ts
│   │   │   ├── symptoms.endpoints.ts
│   │   │   ├── tickets.endpoints.ts
│   │   │   ├── documents.endpoints.ts
│   │   │   ├── journaling.endpoints.ts
│   │   │   ├── routine.endpoints.ts
│   │   │   ├── profile.endpoints.ts
│   │   │   └── doctor.endpoints.ts
│   │   └── index.ts
│   └── package.json
│
├── i18n/                                  ← Internationalization strings
│   ├── src/
│   │   ├── locales/
│   │   │   └── pt-BR/
│   │   │       ├── common.json            ← Shared strings
│   │   │       ├── onboarding.json
│   │   │       ├── hub.json
│   │   │       ├── body-map.json
│   │   │       ├── ctcae.json             ← Symptom names + grade descriptions in pt-BR
│   │   │       ├── routine.json
│   │   │       ├── journaling.json
│   │   │       ├── tickets.json
│   │   │       ├── documents.json
│   │   │       ├── rights.json            ← Legal rights descriptions
│   │   │       ├── accessibility.json     ← Accessibility label strings
│   │   │       └── lgpd.json              ← Consent texts in CEFR A2 pt-BR
│   │   └── index.ts
│   └── package.json
│
├── config/                                ← Shared dev tool configs
│   ├── eslint.config.js                  ← Base ESLint: airbnb-ts + jsdoc + fsd-import-rules
│   ├── prettier.config.js
│   ├── tsconfig.json                     ← Base TypeScript strict config
│   ├── tsconfig.react-native.json        ← Extends base, RN-specific settings
│   ├── tsconfig.next.json                ← Extends base, Next.js-specific settings
│   └── tailwind.config.js               ← Shared Tailwind: Nunito + full token set
│
└── utils/                                 ← Pure utility functions
    ├── src/
    │   ├── date.utils.ts                 ← pt-BR date formatting
    │   ├── phone.utils.ts                ← Brazilian phone number formatting
    │   ├── cpf.utils.ts                  ← CPF validation + masking (display only, never store raw)
    │   ├── lgpd.utils.ts                 ← SHA-256 hashing, pseudonymization
    │   ├── ctcae.utils.ts                ← Grade → color, grade → label mapping
    │   ├── body-map.utils.ts             ← Region → label, intensity → CTCAE grade
    │   ├── law-60-days.utils.ts          ← Calculate days elapsed, semaphore status
    │   └── index.ts
    └── package.json
```

---

## PART 7 — TESTING STRATEGY (Testing Trophy)

### Testing Pyramid adopted: Testing Trophy (Kent C. Dodds)
```
         ╔═══════════╗
         ║   E2E     ║  10% — Critical user journeys only (Maestro + Playwright)
         ╠═══════════╣
         ║Integration║  20% — API mocked via MSW; features working together
         ╠═══════════╣
         ║   Unit    ║  70% — ViewModels (hooks) + domain utilities + pure functions
         ╚═══════════╝
         Static typing (TypeScript strict) — catches most bugs before any test runs
```

### What gets tested where

| Layer | Test type | Tool | What to test |
|---|---|---|---|
| `shared/utils` | Unit | Jest | Pure functions: date format, CPF hash, grade color |
| `entities/*/model` | Unit | Jest | Type guards, data transformers, CTCAE calculators |
| `features/*/model` (hooks = ViewModels) | Unit | Jest + RNTL renderHook | State transitions, API call triggers, error handling |
| `features/*/ui` | Integration | RNTL | User interaction → state change → UI update |
| `widgets/` | Integration | RNTL + MSW | Widget renders correctly with mocked API data |
| `pages/` | Integration | RNTL + MSW | Full page: user opens, interacts, sees result |
| FastAPI routers | Integration | Pytest + httpx | Endpoint contract: request → response schema |
| FastAPI use cases | Unit | Pytest + mocks | Business logic without real DB or LLM |
| Agent nodes | Unit | Pytest + mocks | Individual agent output with mocked LLM |
| Full patient flow | E2E | Maestro (mobile) | Onboarding → register symptom → open ticket |
| Web flows | E2E | Playwright | Login → hub → body map → journaling |

### Test file naming convention
```
ComponentName.tsx        → ComponentName.test.tsx
useHookName.ts           → useHookName.test.ts
utility.utils.ts         → utility.utils.test.ts
router_name.py           → test_router_name.py
use_case_name.py         → test_use_case_name.py
```

### Minimum coverage targets (enforced in CI)
```
packages/utils/          → 90% (pure functions — easy to test)
domain layer (Python)    → 85%
application use cases    → 80%
features/*/model hooks   → 75%
features/*/ui components → 60%
pages/                   → 50% (E2E covers critical paths)
Overall minimum          → 70%
```

### Accessibility testing (built into component tests)
```typescript
// Every component test MUST include accessibility checks:
import { render, screen } from '@testing-library/react-native';
import { axe } from 'jest-axe';                    // Web
// For RN: use accessibilityRole + accessibilityLabel assertions

it('meets accessibility requirements', async () => {
  const { container } = render(<CtcaeSymptomCard ... />);
  // Check: all interactive elements have accessibilityLabel
  expect(screen.getByRole('button', { name: /grade 0/i })).toBeTruthy();
  // Check: grade 4 shows emergency information
  // Check: minimum touch target size via testID + layout queries
});
```

---

## PART 8 — ACCESSIBILITY ARCHITECTURE

### Where accessibility lives in the codebase

```
packages/i18n/src/locales/pt-BR/accessibility.json
  → All accessibilityLabel strings (never hardcoded in components)

apps/mobile/src/shared/constants/accessibility.const.ts
  → MIN_FONT_SIZE = 16
  → ACCESSIBLE_FONT_SIZE = 18
  → MIN_TOUCH_TARGET = 48   // dp (Android) / 44 pt (iOS)
  → MIN_CONTRAST_RATIO = 4.5

apps/mobile/src/shared/ui/AccessibleText.tsx
  → Enforces minimum font size based on accessibilityMode
  → Reads from useAccessibility() hook

apps/mobile/src/shared/hooks/useAccessibility.ts
  → Reads OS accessibility settings (accessibilityFontScale)
  → Reads user's accessibilityMode preference from profile store
  → Provides: isLargeText, isHighContrast, isScreenReaderActive

packages/ui/src/tokens/colors.ts + colors.dark.ts
  → All contrast ratios pre-validated against WCAG 2.1 AA
  → Comments note contrast ratio for each text/background combo
```

### WCAG 2.1 AA Checklist (enforced per component)
```
✅ 1.1.1 — All images have alt text (accessibilityLabel in RN)
✅ 1.3.1 — Semantic roles (accessibilityRole: 'button'|'header'|'list')
✅ 1.3.3 — Never convey info by color alone (always + text/icon)
✅ 1.4.1 — CTCAE grade buttons use both color AND text label (0-4)
✅ 1.4.3 — Contrast ≥4.5:1 for normal text; ≥3:1 for large text
✅ 1.4.4 — Text resizable up to 200% without losing content
✅ 2.1.1 — All functionality keyboard accessible (web)
✅ 2.4.3 — Focus order logical (tab order = visual order)
✅ 2.4.7 — Focus indicator visible on all interactive elements
✅ 3.3.1 — Form errors identified and described in text
✅ 3.3.2 — Labels for all form inputs (accessibilityLabel + label prop)
✅ 4.1.2 — Name, role, value for all UI components
```

---

## PART 9 — `packages/i18n/` — WHY A SEPARATE I18N PACKAGE

Even though Anicca is currently Portuguese-only, a dedicated i18n package is essential:

1. **CTCAE descriptions** must be in pt-BR for patients (CEFR A2 level)
2. **Accessibility labels** must be in pt-BR for screen readers (VoiceOver/TalkBack)
3. **LGPD consent text** must be reviewed by a lawyer and versioned separately from UI code
4. **Future expansion:** English support for researchers using the doctor panel
5. **Single source of truth:** UI components never contain hardcoded patient-facing strings

```typescript
// Usage in components:
import { t } from '@anicca/i18n';

// ❌ NEVER: <AccessibleText>Náusea</AccessibleText>
// ✅ ALWAYS: <AccessibleText>{t('ctcae.symptom.nausea')}</AccessibleText>
```

---

## PART 10 — IMPORT RULES SUMMARY (FSD + Clean Architecture)

```
Mobile/Web (FSD):
  app/        → imports from: pages, widgets, features, entities, shared
  pages/      → imports from: widgets, features, entities, shared, @anicca/*
  widgets/    → imports from: features, entities, shared, @anicca/*
  features/   → imports from: entities, shared, @anicca/*
              → NEVER imports from: other features/, widgets/, pages/
  entities/   → imports from: shared, @anicca/types
              → NEVER imports from: features/, widgets/, pages/
  shared/     → imports from: @anicca/* packages ONLY
              → NEVER imports from: features/, entities/, widgets/, pages/

API (Clean Architecture):
  domain/     → imports NOTHING from the project
  application → imports from: domain only
  infrastructure → imports from: domain, application (via ports)
  presentation → imports from: application, domain

Cross-app:
  @anicca/types    → imported by: all layers
  @anicca/utils    → imported by: shared/, entities/
  @anicca/ui       → imported by: shared/ui/ (re-exports)
  @anicca/i18n     → imported by: shared/ui/ components only
  @anicca/api-client → imported by: features/*/api/, entities/*/api/
```

---

*Version 3.0 — May 2026 — Complete root structure with architecture justification.*
*This document supersedes Sections 2 and 5 of ANICCA_MASTER_PROMPT_V2.md.*
