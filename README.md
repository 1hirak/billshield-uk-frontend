# BillShield UK — Frontend

React + TypeScript single-page application that helps UK households under cost-of-living pressure understand their bills, identify savings, find support, and build a 30-day survival plan.

---

## Architecture Overview

```
src/
├── api/
│   ├── client.ts        # fetch wrapper (JSON + multipart)
│   ├── endpoints.ts     # 15 API endpoint functions
│   └── types.ts         # TypeScript interfaces for all API shapes
├── pages/               # 9 route-level page components
│   ├── LandingPage.tsx
│   ├── OnboardingPage.tsx        (3-step wizard with validation)
│   ├── BillUploadPage.tsx        (drag-drop + skip-to-demo button)
│   ├── BillReviewPage.tsx        (editable extraction + confidence badges)
│   ├── DashboardPage.tsx         (summary cards + chart + top-3 actions)
│   ├── ScenarioSimulatorPage.tsx (sliders + toggles + bar chart)
│   ├── SupportMapPage.tsx        (postcode search + 7 filters + Google Maps)
│   ├── ThirtyDayPlanPage.tsx     (week-by-week checklist)
│   └── SettingsPage.tsx          (edit profile + delete data)
├── components/
│   ├── layout/AppLayout.tsx      (desktop sidebar + mobile drawer + mode toggle)
│   ├── dashboard/                (SummaryCard, PressureChart, BillBreakdownCard)
│   ├── recommendations/RecommendationCard.tsx (expandable action card)
│   ├── ErrorBoundary.tsx         (React error boundary)
│   ├── mode-toggle.tsx           (dark/light/system theme toggle)
│   ├── theme-provider.tsx        (custom ThemeProvider)
│   └── ui/                       (52 shadcn/ui primitives)
├── hooks/                        (useMobile)
├── lib/utils.ts                  (cn() CSS utility)
├── utils/
│   ├── formatters.ts             (formatCurrency, formatPence, formatKwh, etc.)
│   ├── badgeStyles.ts            (confidence/effort/urgency/safety/saving badges)
│   └── storage.ts                (localStorage helpers for householdId/billId)
├── main.tsx                      (entry point)
├── App.tsx                       (BrowserRouter + routes)
└── index.css                     (Tailwind v4 + shadcn theme tokens)
```

---

## Routes & API Endpoints

| Path | Page | Key API Call |
|------|------|-------------|
| `/` | LandingPage | `POST /dev/seed` (demo) |
| `/onboarding` | OnboardingPage | `POST /households` |
| `/upload` | BillUploadPage | `POST /bills/upload` (multipart) |
| `/review/:billId` | BillReviewPage | `GET /bills/{id}` → `PATCH /bills/{id}/confirm` |
| `/dashboard` | DashboardPage | `GET /dashboard/{householdId}` |
| `/scenarios` | ScenarioSimulatorPage | `POST /scenarios/simulate` |
| `/support` | SupportMapPage | `GET /support-services?postcode=&filters=...` |
| `/plan` | ThirtyDayPlanPage | `POST /plans/30-day` |
| `/settings` | SettingsPage | `GET /households/{id}` → `PATCH /households/{id}` |

---

## Data Flow

```
Browser (localStorage)
  ├── householdId → persisted after onboarding
  ├── billId → persisted after upload
  └── Pages read from storage, pass to API client

API Client (fetch)
  ├── request<T>() → JSON requests
  └── uploadRequest<T>() → FormData requests (multipart)

User Flow
  1. Landing → Onboarding (3-step wizard + form validation)
  2. Bill Upload → Review (confidence badges + editable fields)
  3. Dashboard (summary cards + pressure forecast chart + top-3 ranked actions)
  4. Scenario Simulator (sliders + toggles with instant frontend computation)
  5. Support Map (25-33 mock services per postcode + Google Maps directions)
  6. 30-Day Plan (this-week / next-2-weeks / by-day-30 checklist)
  7. Settings (profile update + data deletion)
```

---

## Key Frontend Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No auth** | MVP — householdId in localStorage is sufficient |
| **Direct API calls** | Backend has CORS wildcard (`*`) — frontend hosted anywhere |
| **Appliance slider frontend-only** | Instant £1-£3/mo computation, no API call needed |
| **Skip-to-demo button** | Creates a mock PDF blob, uploads + auto-confirms — full dashboard in one click |
| **Heating safety guardrails** | Vulnerable households get safety warnings instead of heating savings |
| **Recharts** | ComposedChart for pressure forecast, BarChart for scenario breakdown |
| **shadcn/ui** | 52 accessible primitives with Tailwind v4 |
| **ThemeProvider** | Dark/light/system with keyboard shortcut (`D` key) |
| **Sonner** | Toast notifications for success/error feedback |

---

## Saving Label Badges

| Label | Color | Meaning |
|-------|-------|---------|
| `estimated_saving` | Green | Calculated from bill data |
| `potential_saving` | Amber | Depends on eligibility |
| `cashflow_improvement` | Blue | Frees up monthly cash |
| `support_value` | Purple | Grant or benefit |
| `green_only` | Emerald | May reduce carbon, not bills |
| `risk_reduction` | Red | Reduces risk of debt |
| `billing_accuracy` | Blue | Ensures correct billing |
| `support_access` | Purple | Access to local services |
| `planning` | Slate | Budgeting step |
| `no_direct_saving` | Slate | No financial benefit |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 |
| Language | TypeScript 5.9 |
| Build tool | Vite 7.3 |
| Routing | React Router 6.30 |
| Charts | Recharts 3.8 |
| Styling | Tailwind CSS 4.2 |
| UI Primitives | shadcn/ui (Radix) |
| Icons | Lucide React |
| Toasts | Sonner |
| Testing | Vitest 3.1 + React Testing Library 16 (95 tests) |
| E2E Tests | Playwright (18 tests, separate repo) |

---

## Component State Diagram

```
LandingPage
  └── loading: boolean          Demo button spinner

OnboardingPage
  ├── step: 1 | 2 | 3           Wizard step
  ├── form: HouseholdPayload     All 20 onboarding fields
  ├── stepError: string|null     Inline validation
  ├── loading/error              Submit state
  └── COST_FIELDS, ELIGIBILITY_FIELDS  Form templates

BillUploadPage
  ├── file: File|null            Selected file
  ├── dragOver: boolean          Drop zone highlight
  ├── loading: boolean           Upload in progress
  ├── skipping: boolean          Skip-to-demo in progress
  └── error: string|null         Validation/API errors

BillReviewPage
  ├── extraction: BillExtraction Fetched from API
  ├── edited fields (local)     User corrections before confirm
  └── confidence badges          high/medium/needs_review per field

DashboardPage
  ├── data: DashboardData|null   Full API response
  ├── loading: boolean           Initial fetch
  └── error: string|null         Retry-able error banner
  (no bill → EmptyState card)
  (bill present → 4 SummaryCards + PressureChart + BillBreakdownCard
                 + top-3 RecommendationCards + Insights)

ScenarioSimulatorPage
  ├── heating: 0-2              Slider (frontend-only render)
  ├── appliance: 0-30%          Slider (frontend compute: appliance × 0.10)
  ├── offPeak, ddReview,       6 toggles (backend API)
  │   councilTax, broadband,
  │   water, paymentDate
  ├── result: ScenarioResult    Backend API response
  ├── displayResult (useMemo)   Merges appliance + backend result
  ├── loading: boolean          500ms debounce
  └── error: string|null

SupportMapPage
  ├── postcode: string          From household / manual input
  ├── filters: string[]         7 checkbox toggles
  ├── data: SupportServicesResponse  25-33 services
  ├── loading/error, emptyState
  └── pin grid (click-to-scroll)

ThirtyDayPlanPage
  ├── plan: ThirtyDayPlan       API response
  ├── completedItems: Set       Local checkbox state (not persisted)
  ├── loading/error
  └── download/copy actions

SettingsPage
  ├── household: Household      Fetched on mount
  ├── form: edit fields         energyProvider + 6 costs
  ├── notification toggles      Local state only
  └── delete: billId            Soft-delete + localStorage clear

AppLayout
  ├── mobileOpen: boolean       Slide-out drawer
  ├── location: useLocation     Hides sidebar on landing page (/)
  └── ModeToggle                Dark/light/system theme

ErrorBoundary
  ├── hasError: boolean         Catches unhandled errors
  └── error: Error|null         Displays friendly fallback + retry
```

---

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| JS bundle (gzipped) | ~200 KB | 807 KB uncompressed, gzip via nginx |
| CSS bundle (gzipped) | ~30 KB | 131 KB uncompressed |
| First Contentful Paint | ~170 ms | HTML + CSS inline, no blocking JS |
| JS download (gzip) | ~220 ms | On typical broadband connection |
| Return visits | ~0 ms | `Cache-Control: immutable, max-age=31536000` (1 year) |
| Dashboard API call | ~300 ms | 12 engines run synchronously (~30ms each) |
| Scenario simulator | ~180 ms | Pure toggle logic, no heavy compute |
| Support services | ~180 ms | 25-33 in-memory mock entries |
| Health check | ~170 ms | No DB or engine execution |
| Appliance slider | **0 ms** | Frontend-only compute: `appliance × 0.10` |
| Scenario debounce | 500 ms | Prevents excessive API calls while adjusting |
| Loading skeleton | Instant | Pure CSS `animate-pulse`, zero JS |
| CORS overhead | 0 ms | Backend has wildcard `*` — no preflight issues |
| EC2 memory | 908 MB total | ~400 MB free, 2 GB swap configured |
| EC2 CPU | 2 vCPUs | Uvicorn 2 workers |
| SQLite | WAL mode | Journal mode + `synchronous=NORMAL` for Docker |
| Tests | 95 unit + 18 E2E | Vitest ~1.3s, Playwright ~2.6s |
| TypeScript | 0 errors | Strict mode, no unused locals |

---

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm test          # 95 vitest tests
npm run typecheck # TypeScript validation
```

## Environment

```env
VITE_API_BASE_URL=http://32.199.166.215:8000/api/v1
```

Override via `.env.local` for local development.
## Backend

FastAPI backend: [billshield-uk-backend](https://github.com/1hirak/billshield-uk-backend)

Deployed at: `http://32.199.166.215:8000`  
API docs: `http://32.199.166.215:8000/docs`  
CORS: allows all origins (wildcard `*`)
