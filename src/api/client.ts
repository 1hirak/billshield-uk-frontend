import {
  mockHealthCheck,
  mockSeedDemoData,
  mockCreateHousehold,
  mockGetHousehold,
  mockUploadBill,
  mockGetBillExtraction,
  mockConfirmBillFields,
  mockGetDashboard,
  mockSimulateScenario,
  mockGetSupportServices,
  mockGenerateThirtyDayPlan,
} from "./mock-data";
import type {
  HouseholdPayload,
  ScenarioPayload,
} from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !BASE;

async function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (USE_MOCK) {
    await delay();
    return resolveMock<T>(path, options);
  }

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

export async function uploadRequest<T>(path: string, body: FormData): Promise<T> {
  if (USE_MOCK) {
    await delay(800);
    const householdId = body.get("householdId") as string;
    return mockUploadBill(householdId) as unknown as T;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  return res.json();
}

function resolveMock<T>(path: string, options?: RequestInit): T {
  const method = options?.method?.toUpperCase() || "GET";

  if (path === "/health") return mockHealthCheck() as unknown as T;
  if (path === "/dev/seed" && method === "POST") return mockSeedDemoData() as unknown as T;
  if (path === "/dev/reset" && method === "POST") return { message: "Reset complete" } as unknown as T;

  if (path === "/households" && method === "POST") {
    const payload = JSON.parse(options?.body as string) as HouseholdPayload;
    return mockCreateHousehold(payload) as unknown as T;
  }

  const householdMatch = path.match(/^\/households\/(.+)$/);
  if (householdMatch && method === "GET") {
    return mockGetHousehold(householdMatch[1]) as unknown as T;
  }
  if (householdMatch && method === "PATCH") {
    return mockGetHousehold(householdMatch[1]) as unknown as T;
  }

  const billConfirmMatch = path.match(/^\/bills\/(.+)\/confirm$/);
  if (billConfirmMatch && method === "PATCH") {
    const payload = JSON.parse(options?.body as string);
    return mockConfirmBillFields(billConfirmMatch[1], payload) as unknown as T;
  }

  const billDataDeleteMatch = path.match(/^\/bills\/(.+)\/data$/);
  if (billDataDeleteMatch && method === "DELETE") {
    return { billId: billDataDeleteMatch[1], status: "deleted", message: "Bill data deleted" } as unknown as T;
  }

  const billMatch = path.match(/^\/bills\/(.+)$/);
  if (billMatch && method === "GET") {
    return mockGetBillExtraction(billMatch[1]) as unknown as T;
  }

  const dashboardMatch = path.match(/^\/dashboard\/(.+)$/);
  if (dashboardMatch) {
    return mockGetDashboard(dashboardMatch[1]) as unknown as T;
  }

  const recsMatch = path.match(/^\/recommendations\/(.+)$/);
  if (recsMatch) {
    const dashboard = mockGetDashboard(recsMatch[1]);
    return { recommendations: dashboard.topRecommendedActions } as unknown as T;
  }

  if (path === "/scenarios/simulate" && method === "POST") {
    const payload = JSON.parse(options?.body as string) as ScenarioPayload;
    return mockSimulateScenario(payload) as unknown as T;
  }

  if (path.startsWith("/support-services")) {
    const url = new URL(path, "http://localhost");
    const postcode = url.searchParams.get("postcode") || "BS1 4ST";
    const filtersParam = url.searchParams.get("filters");
    const filters = filtersParam ? filtersParam.split(",") : undefined;
    return mockGetSupportServices(postcode, filters) as unknown as T;
  }

  if (path === "/plans/30-day" && method === "POST") {
    const payload = JSON.parse(options?.body as string);
    return mockGenerateThirtyDayPlan(payload.householdId) as unknown as T;
  }

  throw new Error(`Mock API: unhandled route ${method} ${path}`);
}
