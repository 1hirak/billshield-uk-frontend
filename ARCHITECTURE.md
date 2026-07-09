# BillShield UK — Architecture & User Benefits

A household support web app that helps UK residents under cost-of-living pressure understand their bills, identify realistic savings, find local support, and create a practical 30-day survival plan.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│  bolt.new — React 19 + TypeScript 5.9 + Tailwind 4.2    │
│  Vite build → static SPA served from CDN                │
└───────────────────────┬─────────────────────────────────┘
                        │ fetch()
                        │ http://32.199.166.215:8000/api/v1/*
                        ▼
┌──────────────────────────────────────────────────────────┐
│          AWS EC2 (t2.micro, 2 vCPUs, 908 MB RAM)         │
│  Docker: FastAPI container (uvicorn 2 workers)           │
│  SQLite (WAL mode) + 2 GB swap                           │
└───────────────────────┬──────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐  ┌───────────┐  ┌──────────────┐
   │12 Engines│  │6 Providers │  │5 Repositories│
   │(ranking, │  │(OCR, tariff│  │(household,   │
   │tariff, DD│  │council,    │  │bill, rec,    │
   │heating,  │  │support,    │  │support, plan)│
   │eligibility│ │plan,carbon)│  │              │
   │water,    │  │ALL MOCKED  │  │SQLAlchemy 2.x│
   │food,debt)│  │            │  └──────────────┘
   └──────────┘  └───────────┘
```

| Layer | Frontend | Backend |
|-------|----------|---------|
| Framework | React 19.2 | FastAPI 0.115 |
| Language | TypeScript 5.9 | Python 3.12 |
| Build | Vite 7.3 | — |
| Styling | Tailwind CSS 4.2 + shadcn/ui | — |
| Charts | Recharts 3.8 | — |
| ORM | — | SQLAlchemy 2.x |
| DB | — | SQLite / PostgreSQL |
| Server | — | Uvicorn (2 workers) |
| Tests | Vitest 3.1 + RTL (95) | Pytest + HTTPX (49) |
| E2E | Playwright (18) | — |
| Hosting | bolt.new | AWS EC2 |
| CORS | — | Wildcard `*` |

---

## 2. User Journey & Benefits

### The Problem

UK households face rising energy costs, confusing tariff structures, and scattered support options. People under financial pressure need **clear, ranked, actionable guidance** — not 50 generic tips or shame-based advice.

### The Solution: 4-Step Journey

| Step | Page | What the user does | Time | Concrete benefit |
|------|------|-------------------|------|-----------------|
| 1 | **Onboarding** | Enter postcode, household type, income band, monthly costs | 3 min | Personalised calculations tuned to your household profile |
| 2 | **Bill Upload** | Upload an energy bill PDF (or **skip to demo**) | 1 click | Instant extraction of tariff rates, DD amount, annual usage — no OCR wait |
| 3 | **Dashboard** | View monthly pressure summary, forecast chart, bill breakdown | Instant | Top-3 ranked actions with exact savings estimates — not 50 random tips |
| 4 | **Action** | Simulate scenarios, find local support, generate a 30-day plan | 5 min | Call scripts, step-by-step instructions, Google Maps directions to real services |

### Real Example: Family with children, £15k-£25k, Bristol (BS1)

| Action | Monthly saving | Type | Effort |
|--------|---------------|------|--------|
| Request Direct Debit review | **£22/mo** | Cashflow improvement | Low |
| Check Council Tax Reduction | **£35/mo** | Potential saving | Medium |
| Switch to broadband social tariff | **£18/mo** | Potential saving | Low |
| Reduce appliance use by 15% | **£2/mo** | Estimated saving | Low |
| **Total potential** | **£77/mo** | **£924/year** | |

Every recommendation includes **what was detected**, **why it matters**, **numbered steps**, and an **optional call script** (e.g., "I'm struggling to pay. I want to agree an affordable repayment plan based on my income and essential costs.").

### Why This Matters

- **No shame**: "Start with this low-effort step" — never "You're wasting money"
- **No false promises**: "May qualify" / "Potential saving" — never "You qualify" unless verified
- **No analysis paralysis**: Top-3 actions only. Extra actions below the fold. One click to expand details.
- **Safety first**: Heating advice suppressed for households with children, elderly, health conditions, or disabilities
- **Accessible**: Dark/light/system theme, `D` key shortcut, mobile-responsive sidebar+drawer

---

## 3. Backend Architecture

### Layer Diagram

```
Router Layer (9 routers, /api/v1/*)
  health  households  bills  dashboard  scenarios
  support-services  plans  recommendations  dev
                    │
                    ▼
Service Layer (7 services — business logic orchestration)
  household  bill  dashboard  scenario  support  plan  recommendation
         │                              │
         ▼                              ▼
Engine Layer (12 engines)       Provider Layer (6 interfaces)
  • ranking_engine              • OcrProvider
  • tariff_checker              • TariffBenchmarkProvider
  • direct_debit_health         • CouncilLookupProvider
  • meter_reading_reminder      • SupportLocatorProvider
  • heating_optimisation        • PlanGeneratorProvider
  • appliance_time_shifting     • CarbonWindowProvider
  • standing_charge_awareness       (all mocked for MVP)
  • eligibility_scanner
  • council_tax_checker
  • broadband_social_tariff
  • water_bill_optimiser
  • food_support
  • debt_arrears_triage
         │
         ▼
Repository Layer (5 repos — SQLAlchemy 2.x)
  household  bill  recommendation  support_service  plan
         │
         ▼
Data Models (5 models)
  Household ──< Bill
  Household ──< Recommendation >── Bill
  Household ──< ThirtyDayPlan
```

### 12 Recommendation Engines

| # | Engine | What it checks | How it calculates | Example output |
|---|--------|---------------|-------------------|----------------|
| 1 | **Ranking** | All generated candidates | `score = savingScore + urgencyScore + confidenceScore − effortPenalty − safetyPenalty + vulnerabilityBoost` | Ranks top-3 by composite score |
| 2 | **Tariff Checker** | User rates vs Ofgem benchmark | `% above benchmark × estimated annual saving` | "Your tariff appears above the benchmark. Check fixed deals." |
| 3 | **DD Health** | Monthly DD vs forecast usage | `annualDD = monthlyDD × 12; forecast = usage × unit rates + standing charges` | "Your DD is £22/mo higher than forecast. Request a review." |
| 4 | **Meter Reading** | Days from price-cap change (1 Jan/Apr/Jul/Oct) | `if today within 7 days of cap date: remind` | "Submit readings around the price-cap change." |
| 5 | **Heating** | Vuln flags (children, pensioner, health, disability) | `if vulnerable: non-temperature actions only (draught-proofing, curtains)` | "Close curtains at dusk. Draught-proof gaps around doors." |
| 6 | **Appliance** | Tariff type (flat vs Economy 7) | `if flat tariff: green_only (no £ saving); if Economy 7: potential £7/mo` | "On flat tariffs, off-peak use may be greener but not cheaper." |
| 7 | **Standing Charge** | Fixed daily costs | `(elecSC + gasSC) × 365 / 12 / 100` | "Even if you used no energy, standing charges would still apply." |
| 8 | **Eligibility** | Benefits, health, disability, pensioner | `match flags to: Warm Home Discount, Priority Services Register, hardship grants` | "You may qualify for the Warm Home Discount. Contact your supplier." |
| 9 | **Council Tax** | Income band + council tax ratio | `if income < £25k and councilTax > 8% of income: recommend CTR` | "Check Council Tax Reduction — potential £25-35/mo saving." |
| 10 | **Broadband** | Qualifying benefits + cost > £25/mo | `if receives benefits and cost > £25: recommend social tariff` | "You may be eligible for a broadband social tariff at ~£15/mo." |
| 11 | **Water** | Metered status + occupants vs bedrooms | `if unmetered and occupants < bedrooms: suggest water meter check` | "Check whether a water meter could save money." |
| 12 | **Debt Triage** | Disposable buffer (income − pressure) | `if buffer < 0: prioritise rent, council tax, energy as highest-consequence` | "Contact free debt advice. Prioritise essential bills." |

### Ranking Algorithm (plain English)

```
1.  Every engine generates RecommendationCandidates
2.  High safety-risk actions (score 999) are excluded entirely
3.  Each candidate is scored on a weighted formula:
      • Monthly saving: up to +100 points
      • Urgency: +5 (low), +15 (medium), +30 (high)
      • Confidence: +3 (low), +10 (medium), +20 (high)
      • Effort penalty: 0 (low), −8 (medium), −18 (high)
      • Safety penalty: 0 (none), −5 (low), −25 (medium)
      • Vulnerability relevance: +2 per flag (children, pensioner, etc.)
4.  Green-only actions (green_only, no_direct_saving) are demoted
5.  Candidates sorted by composite score, ranks assigned 1→N
6.  Top 3 displayed as "Top actions this month"
```

### Provider Abstraction

All external integrations use `Protocol` interfaces with mock implementations. Zero real API calls in MVP mode. Swapping to real providers requires a single import change:

| Provider | Interface method | Mock implementation | Future real implementation |
|----------|-----------------|-------------------|---------------------------|
| OCR | `extract_energy_bill(file_path)` | Returns pre-configured BrightSpark Energy data | AWS Textract / Google Vision / Azure DI |
| Tariff | `get_benchmark(postcode, payment_method)` | Returns Q3-2026 benchmark values | Ofgem price-cap API |
| Council | `get_council_for_postcode(postcode)` | Returns "{Area} City Council" | GOV.UK local authority lookup API |
| Support | `find_services(postcode, filters, radius)` | 25 wildcard + 22 area-specific entries | Mapbox Places API / local authority open data |
| Plan | `generate_plan(household, recommendations)` | Template-based deterministic plan | OpenAI GPT-4 / Claude API |
| Carbon | `get_low_carbon_windows(postcode)` | Returns tonight 22:00-06:00 | UK Carbon Intensity API |

### Data Model (ER Diagram)

```
┌──────────────┐         ┌──────────────┐
│  Household   │ 1───<N  │     Bill     │
├──────────────┤         ├──────────────┤
│ id (UUID PK) │         │ id (UUID PK) │
│ postcode     │         │ household_id │──FK──┐
│ household_   │         │ status       │      │
│   type       │         │ bill_type    │      │
│ income_band  │         │ extraction_  │      │
│ energy_      │         │   json       │      │
│   provider   │         │ confirmed_   │      │
│ payment_     │         │   fields_json│      │
│   method     │         │ storage_path │      │
│ 6 monthly    │         │ deleted_at   │      │
│   cost fields│         └──────────────┘      │
│ 9 vuln flags │                               │
│ created_at   │         ┌──────────────────┐  │
│ updated_at   │ 1───<N  │  Recommendation  │  │
└──────────────┘         ├──────────────────┤  │
       │                 │ id (UUID PK)     │  │
       │                 │ household_id ────FK──┘
       │                 │ bill_id ─────────FK──┐
       │                 │ engine_type     │     │
       │                 │ rank            │     │
       │                 │ title           │     │
       │                 │ monthly_saving  │     │
       │                 │ saving_label    │     │
       │                 │ effort, confid- │     │
       │                 │ ence, urgency   │     │
       │                 │ safety_risk     │     │
       │                 │ steps_json      │     │
       │                 │ call_script     │     │
       │                 │ status          │     │
       │                 └─────────────────┘     │
       │                                         │
       │         ┌──────────────────┐            │
       │ 1───<N  │  ThirtyDayPlan   │            │
       │         ├──────────────────┤            │
       │         │ id (UUID PK)     │            │
       │         │ household_id ────FK───────────┘
       │         │ this_week_json   │
       │         │ next_2_weeks_json│
       │         │ by_day_30_json   │
       │         │ tone             │
       │         └──────────────────┘
       │
       │     (read-only seed data)
       │         ┌──────────────────┐
       └─ ─ ─ ─ │ SupportService   │
                 ├──────────────────┤
                 │ id (UUID PK)     │
                 │ name             │
                 │ type             │
                 │ postcode_area    │
                 │ distance_miles   │
                 │ opening_status   │
                 │ address_line1    │
                 │ town, phone      │
                 │ website          │
                 └──────────────────┘
```

---

## 4. Frontend Architecture

### Page Routing Tree

```
App (ErrorBoundary → BrowserRouter)
└── AppLayout (sidebar + header + Outlet)
    ├── /                       LandingPage        (no sidebar, fullscreen hero)
    ├── /onboarding             OnboardingPage     GET/POST /households
    ├── /upload                 BillUploadPage     POST /bills/upload (multipart)
    ├── /review/:billId         BillReviewPage     GET /bills/{id} → PATCH confirm
    ├── /dashboard              DashboardPage      GET /dashboard/{householdId}
    ├── /scenarios              ScenarioSimulator  POST /scenarios/simulate + frontend compute
    ├── /support                SupportMapPage     GET /support-services + GET /households
    ├── /plan                   ThirtyDayPlanPage  POST /plans/30-day
    └── /settings               SettingsPage       GET/PATCH /households, DELETE /bills
```

### Component Hierarchy

```
App
├── ErrorBoundary
├── BrowserRouter
│   └── AppLayout
│       ├── DesktopSidebar (lg: fixed)
│       │   ├── Logo (→ /)
│       │   ├── 6 NavLinks (Dashboard, Upload, Scenarios, Support, Plan, Settings)
│       │   └── ModeToggle (dark/light/system)
│       ├── MobileHeader (lg: hidden)
│       │   ├── Logo (→ /)
│       │   ├── ModeToggle
│       │   └── HamburgerMenu (slide-out drawer)
│       └── Outlet → Page Components
│
├── SummaryCard (title, value, icon, variant)
├── PressureChart (ComposedChart: stacked bars + total line)
├── BillBreakdownCard (cost line items + tariff badge + insight)
├── RecommendationCard (expandable: title → badges → caveats → steps → call script)
│   └── Badges: savingLabel, effort, confidence, urgency, safetyRisk
├── EmptyState (title, description, action)
├── ErrorBanner (message, retry)
├── LoadingSkeleton (CSS animate-pulse cards)
├── ErrorBoundary (friendly fallback + retry button)
│
└── shadcn/ui (52 primitives: Button, Input, Select, Slider, Switch, Checkbox, Card, etc.)
```

### State Management Strategy

- **localStorage**: `householdId` + `billId` persisted across sessions. Read by every page. No Redux needed for MVP.
- **per-page useState**: Each page owns its own state. No shared store.
- **API cache**: None. Fresh fetch on every page visit (API is <300ms, no cache invalidation complexity needed).
- **Form state**: OnboardingPage has 20 fields in one `useState<HouseholdPayload>`. Updated via a single `update()` helper.
- **Debounce**: ScenarioSimulator debounces API calls by 500ms. The appliance slider bypasses the API entirely — computed via `useMemo` on the frontend.
- **Error boundary**: Class component catches unhandled React errors, shows fallback UI with retry button.

### API Client Pattern

```typescript
// src/api/client.ts
const BASE = import.meta.env.VITE_API_BASE_URL; // → http://32.199.166.215:8000/api/v1

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  return res.json();
}

// Multipart upload helper (no Content-Type — browser sets boundary)
async function uploadRequest<T>(path: string, body: FormData): Promise<T> { ... }
```

- 15 typed endpoint functions in `src/api/endpoints.ts`
- All request/response types in `src/api/types.ts` (315 lines, 30+ interfaces)
- Errors surfaced via `ErrorBanner` component + `sonner` toast notifications

### Performance Strategy

| Mechanism | What | Impact |
|-----------|------|--------|
| gzip compression | nginx `gzip on; gzip_types js css json html` | 807KB JS → 200KB (75% smaller) |
| Immutable caching | `Cache-Control: public, max-age=31536000, immutable` on `/assets/*` | Return visits: 0ms (browser cache) |
| Frontend compute | Appliance slider `appliance × 0.10` computed in `useMemo` | 0ms API latency, instant UI update |
| Debounce | Scenario simulator API calls debounced by 500ms | Prevents 10+ API calls during slider drag |
| CSS skeleton | `animate-pulse` pure CSS — zero JS for loading state | Instant render, no layout shift |
| CORS wildcard | Backend allows `*` origins | 0ms preflight overhead |
| SQLite WAL | Write-Ahead Logging for concurrent reads/writes | Dashboard writes don't block reads |
| Uvicorn workers | 2 workers on 2 vCPUs | Double concurrent request capacity |

### Key Design Decisions

| Decision | Why |
|----------|-----|
| **No authentication** | MVP — `householdId` in localStorage is sufficient. No signup friction. No token management. |
| **Wildcard CORS** | Convenience — frontend hosted on any platform. Bolt.new, Vercel, Netlify all work. |
| **Skip-to-demo button** | Reduces drop-off — one click from onboarding to full dashboard. Creates mock PDF blob, uploads + auto-confirms in 2 API calls. |
| **shadcn/ui + Tailwind** | 52 accessible primitives. Dark mode free. No runtime CSS-in-JS cost. |
| **No state library** | 9 pages, each self-contained. `useState` + `localStorage` is simpler than Redux/Zustand. |
| **Recharts for charts** | ComposedChart for pressure forecast. BarChart for scenario breakdown. Responsive. Themed. |
| **Sonner for toasts** | Lightweight. Auto-dismisses. Accessible. |
| **Custom ThemeProvider** | Dark/light/system + keyboard shortcut (`D`). Persisted in localStorage. No `next-themes` dependency at runtime. |
| **Error boundaries** | Friendly fallback instead of white screen crash. Retry button. Technical details in collapsible `<details>`. |

---

## 5. Data Flow — End-to-End Trace

### User clicks "Skip for now" on Bill Upload Page

```
User clicks "Skip for now — explore the dashboard"
  │
  ▼
createDemoPdfBlob()                    # In-memory PDF blob (zero disk I/O)
  │  "%PDF-1.4\n% BillShield MVP..."
  ▼
uploadBill({ householdId, file })      # POST /api/v1/bills/upload (multipart)
  │                                     #  ↓ backend: MockOcrProvider returns
  │                                     #     BrightSpark Energy extraction data
  ▼                                     #     Bill stored in DB, status=extracted
BillUploadResponse { billId, status }
  │
  ▼
confirmBillFields(billId, payload)     # PATCH /api/v1/bills/{id}/confirm
  │                                     #  ↓ backend: confirmed_fields_json stored
  │                                     #     status=confirmed
  ▼
BillConfirmResponse { status: "confirmed" }
  │
  ▼
navigate("/dashboard")                 # Client-side route change
  │
  ▼
DashboardPage useEffect()              # GET /api/v1/dashboard/{householdId}
  │                                     #  ↓ backend: runs 12 engines
  │                                     #     ranks top-3 actions
  │                                     #     calculates summary, forecast, breakdown
  ▼                                     #     returns full DashboardData
Dashboard renders:
  ├── 4 SummaryCards (Monthly pressure, Disposable buffer, Energy risk, Potential savings)
  ├── PressureChart (4-month stacked bars + total line)
  ├── BillBreakdownCard (electricity £66, gas £70, standing charges £28...)
  ├── Top-3 RecommendationCards (DD review £22/mo, Council Tax £35/mo, Broadband £18/mo)
  └── 2 Insights (standing charges, meter reading reminder)

Total latency: ~480ms (170ms upload + 100ms confirm + 210ms dashboard)
```

### Scenario Simulator — Appliance Slider (Frontend-Only Compute)

```
User drags "Reduce appliance use" slider from 0 → 15%
  │
  ▼
setAppliance(15)                       # Instant React state update
  │
  ▼
useMemo(() => {                        # Computed synchronously — no API call
  const applianceSaving = Math.round(15 * 0.10);  # £2/mo
  return {
    ...backendResult,
    estimatedMonthlySaving: 57 + 2,              # £59/mo total
    estimatedAnnualSaving: 684 + 24,             # £708/year
    breakdown: [...backendBreakdown, {            # Added to chart
      category: "Appliance reduction",
      monthlySaving: 2,
      savingLabel: "estimated_saving"
    }]
  };
}, [result, appliance])
  │
  ▼
UI updates instantly: £59/mo, £708/year, bar chart shows new category

Total latency: 0ms (no API call, no debounce)
```

### Scenario Simulator — Toggle Switches (Backend API with Debounce)

```
User toggles "Request Direct Debit review" ON
  │
  ▼
setDdReview(true)                       # Instant state update
  │
  ▼
useEffect → setTimeout(simulate, 500)   # Debounce: wait 500ms
  │                                      #  (cancelled if another toggle changes
  │                                      #   within 500ms)
  ▼
simulateScenario({...})                 # POST /api/v1/scenarios/simulate
  │                                      #  ↓ backend: checks household vulnerability
  │                                      #     returns breakdown array
  ▼
ScenarioResult { estimatedMonthlySaving: 57, breakdown: [...] }
  │
  ▼
UI updates: £57/mo, breakdown chart shows 3 categories

Total latency: ~680ms (500ms debounce + 180ms API)
```

### Error Handling Flow

```
API call fails (network error / 404 / 500)
  │
  ▼
fetch() returns !ok
  │
  ▼
client.ts throws new Error(err.error?.message || "API error {status}")
  │
  ▼
Page catches in try/catch:
  • setError(err.message)
  • toast.error(err.message)         # Sonner toast (top-right, auto-dismiss)
  │
  ▼
<ErrorBanner message={error.message} onRetry={() => refetch()} />
  │
  ▼
Uncaught React errors (rendering crash):
  <ErrorBoundary>
    → "Something went wrong"
    → Collapsible technical details
    → "Try again" button (resets error state)
```

---

## 6. Deployment Architecture

```
                    User's Browser
                         │
                    https://billshield.bolt.new
                         │
                    bolt.new CDN
                         │
                    ┌────┴────┐
                    │ Vite build → dist/
                    │ (static files: index.html,
                    │  ~200KB gzipped JS,
                    │  ~30KB gzipped CSS)
                    └─────────┘
                         │
                         │ fetch() → http://32.199.166.215:8000/api/v1/*
                         │ (CORS: wildcard * — any origin allowed)
                         ▼
            ┌────────────────────────────────┐
            │  AWS EC2: t2.micro, Ubuntu     │
            │  2 vCPUs, 908 MB RAM, 2 GB swap│
            │                                │
            │  docker compose up              │
            │  ┌──────────────────────────┐  │
            │  │ billshield-backend        │  │
            │  │ Python 3.12 FastAPI       │  │
            │  │ uvicorn --workers 2       │  │
            │  │ Port: 8000               │  │
            │  │                            │  │
            │  │ /app/uploads/              │  │
            │  │ /app/data/billshield.db    │  │
            │  │ (SQLite, WAL mode)        │  │
            │  └──────────────────────────┘  │
            │  restart: unless-stopped       │
            └────────────────────────────────┘
```

### EC2 Configuration

| Setting | Value | Why |
|---------|-------|-----|
| Instance type | t2.micro | Free tier, sufficient for mock MVP |
| vCPUs | 2 | Matches uvicorn `--workers 2` |
| RAM | 908 MB | Tight — Docker build needs swap |
| Swap | 2 GB | Survives `docker compose build` on limited RAM |
| Disk | 8 GB | SQLite DB + uploaded bills + Docker images |
| Security group | Ports 22 (SSH), 8000 (API), 3000 (frontend — deprecated) | |
| CORS | `*` (wildcard) | Frontend hosted on any platform |

### Docker Compose (Simplified)

```yaml
services:
  backend:
    build: .
    ports: ["8000:8000"]
    env_file: .env.prod
    volumes:
      - ./uploads:/app/uploads
      - backend_data:/app/data
    restart: unless-stopped
```

### Deploy from Scratch

```bash
# Local → EC2
tar czf deploy.tar.gz --exclude='.venv' billshield-backend/
scp deploy.tar.gz ubuntu@<ec2-ip>:~/

# EC2
ssh ubuntu@<ec2-ip>
tar xzf deploy.tar.gz && cd billshield-backend
sudo docker compose build --no-cache
sudo docker compose up -d
curl http://localhost:8000/api/v1/health   # → {"status":"ok"}
```

---

## 7. User Benefit Summary

### Convenience
- **One-click demo**: "Skip for now" → creates mock bill → auto-confirms → full dashboard in ~480ms
- **No account needed**: Your `householdId` stays in browser storage. No email, no password, no friction.
- **Works anywhere**: Frontend on any hosting platform. Backend handles CORS for all origins.

### Safety
- **No shame language**: "This may be worth checking" — never "You're wasting money"
- **Guarded heating advice**: For households with children, pensioners, or health conditions, we recommend draught-proofing instead of lowering the thermostat.
- **Debt signposting**: "Contact Citizens Advice or StepChange for free guidance" — never regulated debt advice.
- **Eligibility transparency**: "May qualify" / "Potential saving" / "Eligibility depends on your circumstances" — never guarantees what we can't verify.

### Actionability
- **Top-3 only**: No information overload. Three ranked actions. Click to expand details: what was detected, why it matters, numbered steps, call script.
- **Call scripts**: Every debt/arrears action includes a suggested phone script ("I'm struggling to pay. I want to agree an affordable repayment plan.").
- **Real directions**: Support service cards link to Google Maps with the actual address pre-filled.

### Transparency
- **Saving labels**: Every recommendation clearly marks whether the saving is estimated (calculated from your bill), potential (depends on eligibility), cashflow improvement (frees up monthly cash), or support value (a grant or benefit).
- **Mock data disclosed**: "This is an MVP demo — OCR is simulated. Real OCR integration is planned." — on every bill upload page.
- **Support services disclaimer**: "Mock data — 20+ illustrative services. Real addresses will be available in a future release."

### Privacy
- **Deletable**: `DELETE /api/v1/bills/{billId}/data` removes the uploaded file and extraction data.
- **No logging**: Bill contents are never logged. Postcodes are normalized for matching but not stored in logs.
- **No external calls**: In MVP mock mode, zero data leaves the server. No analytics, no tracking, no third-party APIs.

### Accessibility
| Feature | Implementation |
|---------|---------------|
| Dark mode | `D` key shortcut + theme dropdown (Light / Dark / System) |
| Mobile responsive | Collapsible sidebar → slide-out drawer on small screens |
| Keyboard navigation | All buttons, links, checkboxes, sliders keyboard-accessible |
| Screen reader | `sr-only` labels on icons, `aria-*` attributes via Radix primitives |
| Reduced motion | `tw-animate-css` respects `prefers-reduced-motion` |

---

## 8. Performance Benchmarks

| Metric | Value | Notes |
|--------|-------|-------|
| First page HTML | 469 B | Minimal shell, CSS inline in `<head>` |
| JS bundle (gzipped) | ~200 KB | 807 KB uncompressed → gzip 75% reduction |
| CSS bundle (gzipped) | ~30 KB | 131 KB uncompressed |
| First Contentful Paint | ~170 ms | No blocking JS |
| Dashboard API | ~300 ms | 12 engines, DB writes + reads, all in-process |
| Health check | ~170 ms | No DB, no engines |
| Scenario API | ~180 ms | Pure computation, no DB writes |
| Appliance slider | **0 ms** | Frontend-only `useMemo` compute |
| Return visits | **~0 ms** | Immutable cache (1 year) on hashed assets |
| 95 unit tests | ~1.3 s | Vitest |
| 18 E2E tests | ~2.6 s | Playwright against live EC2 |
| 49 backend tests | ~0.4 s | Pytest + HTTPX on in-memory SQLite |
