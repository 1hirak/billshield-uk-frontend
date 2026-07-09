import type {
  BillConfirmResponse,
  BillExtraction,
  BillUploadResponse,
  DashboardData,
  HealthResponse,
  Household,
  HouseholdPayload,
  ScenarioPayload,
  ScenarioResult,
  SeedResponse,
  SupportServicesResponse,
  ThirtyDayPlan,
} from "./types";

function uid(): string {
  return crypto.randomUUID();
}

const DEMO_HOUSEHOLD_ID = "hh_demo_001";
const DEMO_BILL_ID = "bill_demo_001";

export function mockHealthCheck(): HealthResponse {
  return {
    status: "ok",
    appName: "BillShield UK",
    version: "0.1.0",
    environment: "demo",
    mockMode: true,
  };
}

export function mockSeedDemoData(): SeedResponse {
  return {
    householdId: DEMO_HOUSEHOLD_ID,
    billId: DEMO_BILL_ID,
    message: "Demo data seeded successfully",
  };
}

export function mockCreateHousehold(payload: HouseholdPayload): Household {
  return {
    ...payload,
    id: uid(),
    normalizedPostcode: payload.postcode.replace(/\s+/g, "").toUpperCase(),
    createdAt: new Date().toISOString(),
  };
}

export function mockGetHousehold(householdId: string): Household {
  return {
    id: householdId,
    postcode: "BS1 4ST",
    normalizedPostcode: "BS14ST",
    householdType: "family_with_children",
    incomeBand: "25k_40k",
    energyProvider: "BrightSpark Energy",
    paymentMethod: "direct_debit",
    monthlyRentOrMortgage: 950,
    monthlyFoodCost: 420,
    monthlyTransportCost: 180,
    monthlyCouncilTax: 145,
    monthlyBroadbandMobileCost: 55,
    monthlyWaterCost: 38,
    receivesQualifyingBenefits: false,
    hasChildren: true,
    hasPensioner: false,
    hasHealthCondition: false,
    hasDisability: false,
    isSingleAdult: false,
    bedrooms: 3,
    occupants: 4,
    waterMetered: true,
    createdAt: "2025-06-01T10:00:00Z",
  };
}

export function mockUploadBill(householdId: string): BillUploadResponse {
  const billId = uid();
  return {
    billId,
    householdId,
    status: "extracted",
    message: "Bill scanned successfully",
    extractionSummary: {
      supplier: "BrightSpark Energy",
      tariffName: "Standard Variable Direct",
      monthlyDirectDebit: 142,
      overallConfidence: "high",
      needsReviewFields: ["contractEndDate"],
    },
  };
}

export function mockGetBillExtraction(billId: string): BillExtraction {
  return {
    billId,
    householdId: DEMO_HOUSEHOLD_ID,
    status: "extracted",
    billType: "energy",
    originalFilename: "energy-bill-june-2025.pdf",
    uploadedAt: "2025-06-15T14:30:00Z",
    extraction: {
      supplier: { value: "BrightSpark Energy", confidence: "high" },
      tariffName: { value: "Standard Variable Direct", confidence: "high" },
      monthlyDirectDebit: { value: 142, confidence: "high" },
      electricityUnitRatePencePerKwh: { value: 27.34, confidence: "high" },
      electricityStandingChargePencePerDay: { value: 60.12, confidence: "medium" },
      gasUnitRatePencePerKwh: { value: 7.62, confidence: "high" },
      gasStandingChargePencePerDay: { value: 31.44, confidence: "medium" },
      annualElectricityUsageKwh: { value: 2900, confidence: "medium" },
      annualGasUsageKwh: { value: 11000, confidence: "medium" },
      billPeriodStart: { value: "2025-05-01", confidence: "high" },
      billPeriodEnd: { value: "2025-05-31", confidence: "high" },
      paymentMethod: { value: "direct_debit", confidence: "high" },
      tariffType: { value: "standard_variable", confidence: "high" },
      contractEndDate: { value: null, confidence: "needs_review" },
    },
    reviewWarning:
      "We could not confirm the contract end date. Please check if you are on a fixed deal or if it has already ended.",
  };
}

export function mockConfirmBillFields(billId: string, payload: Record<string, unknown>): BillConfirmResponse {
  return {
    billId,
    householdId: DEMO_HOUSEHOLD_ID,
    status: "confirmed",
    confirmedFields: payload,
    message: "Bill fields confirmed successfully",
  };
}

export function mockGetDashboard(householdId: string): DashboardData {
  return {
    householdId,
    summary: {
      monthlyHouseholdPressure: 1930,
      estimatedDisposableBuffer: 320,
      energyBillRisk: "medium_high",
      potentialMonthlySavings: 87,
    },
    monthlyPressureForecast: [
      { month: "Jul", energy: 142, rent: 950, food: 420, transport: 180, councilTax: 145, water: 38, broadbandMobile: 55 },
      { month: "Aug", energy: 138, rent: 950, food: 420, transport: 180, councilTax: 145, water: 38, broadbandMobile: 55 },
      { month: "Sep", energy: 145, rent: 950, food: 430, transport: 180, councilTax: 145, water: 38, broadbandMobile: 55 },
      { month: "Oct", energy: 165, rent: 950, food: 440, transport: 185, councilTax: 145, water: 38, broadbandMobile: 55 },
      { month: "Nov", energy: 190, rent: 950, food: 450, transport: 185, councilTax: 145, water: 38, broadbandMobile: 55 },
      { month: "Dec", energy: 210, rent: 950, food: 480, transport: 185, councilTax: 145, water: 38, broadbandMobile: 55 },
    ],
    billBreakdown: {
      electricityUsageCostMonthly: 66,
      gasUsageCostMonthly: 70,
      standingChargesMonthly: 28,
      monthlyDirectDebit: 142,
      estimatedAnnualCost: 1704,
      currentTariffStatus: "Standard variable — not the cheapest available",
      standingChargeInsight: "Standing charges make up about 17% of your energy cost. These are fixed regardless of usage.",
      insight: "Your energy cost is above average for a 3-bed family home. Switching tariff could save significantly.",
      avoidableCostMonthly: 45,
      unavoidableStandingChargeMonthly: 28,
    },
    topRecommendedActions: [
      {
        id: "rec_1",
        rank: 1,
        engineType: "tariff_switch",
        title: "Switch to a fixed-rate tariff",
        description: "You are on a standard variable tariff paying more than necessary. Fixed deals are currently available around £118/month.",
        whatDetected: "Standard variable tariff at £142/month",
        whyItMatters: "Fixed tariffs lock in a lower rate and protect against price rises",
        monthlySavingPounds: 24,
        annualSavingPounds: 288,
        savingLabel: "estimated_saving",
        effort: "low",
        confidence: "high",
        urgency: "high",
        safetyRisk: "none",
        eligibilityCaveat: null,
        safetyCaveat: null,
        nextStep: "Use a comparison site to find the best fixed deal for your usage",
        steps: ["Go to Ofgem-accredited comparison site", "Enter your postcode and current usage", "Choose a fixed tariff", "The new supplier handles the switch"],
        ctaLabel: "Compare tariffs",
        callScript: null,
      },
      {
        id: "rec_2",
        rank: 2,
        engineType: "usage_reduction",
        title: "Reduce heating by 1 degree",
        description: "Reducing your thermostat by 1°C can save around 10% on heating costs with minimal comfort impact.",
        whatDetected: "Gas usage of 11,000 kWh/year (above median for household size)",
        whyItMatters: "Small changes compound over winter months when bills peak",
        monthlySavingPounds: 12,
        annualSavingPounds: 144,
        savingLabel: "estimated_saving",
        effort: "low",
        confidence: "medium",
        urgency: "medium",
        safetyRisk: "low",
        eligibilityCaveat: null,
        safetyCaveat: "Do not reduce below 18°C if anyone in your household is elderly or has a health condition.",
        nextStep: "Turn your thermostat down by 1°C and monitor for a week",
        steps: ["Find your thermostat", "Reduce by 1°C", "Monitor comfort for 7 days", "Check next bill for impact"],
        ctaLabel: "I will try this",
        callScript: null,
      },
      {
        id: "rec_3",
        rank: 3,
        engineType: "benefit_check",
        title: "Check Warm Home Discount eligibility",
        description: "The Warm Home Discount provides £150 off your electricity bill. Eligibility has expanded recently.",
        whatDetected: "Family with children on middle income band",
        whyItMatters: "A one-off credit that reduces winter bill pressure",
        monthlySavingPounds: 0,
        annualSavingPounds: 150,
        savingLabel: "support_value",
        effort: "medium",
        confidence: "only_if_eligible",
        urgency: "medium",
        safetyRisk: "none",
        eligibilityCaveat: "You may qualify if your household income is below the threshold or you receive qualifying benefits.",
        safetyCaveat: null,
        nextStep: "Contact your energy supplier or check GOV.UK",
        steps: ["Visit GOV.UK Warm Home Discount page", "Check eligibility criteria", "Apply through your supplier if eligible"],
        ctaLabel: "Check eligibility",
        callScript: "Hi, I'd like to check if I'm eligible for the Warm Home Discount. My account number is [X]. Can you confirm whether I qualify based on my circumstances?",
      },
    ],
    otherRecommendedActions: [
      {
        id: "rec_4",
        rank: 4,
        engineType: "water",
        title: "Review water meter usage",
        description: "With a water meter and 4 occupants, checking for leaks and wastage could reduce your water bill.",
        monthlySavingPounds: 8,
        annualSavingPounds: 96,
        savingLabel: "potential_saving",
        effort: "low",
        confidence: "medium",
        urgency: "low",
        safetyRisk: "none",
      },
      {
        id: "rec_5",
        rank: 5,
        engineType: "broadband",
        title: "Negotiate broadband renewal",
        description: "Your broadband contract may have rolled onto a higher rate. Call to negotiate or switch.",
        monthlySavingPounds: 15,
        annualSavingPounds: 180,
        savingLabel: "estimated_saving",
        effort: "medium",
        confidence: "medium",
        urgency: "low",
        safetyRisk: "none",
        callScript: "Hi, my contract has ended and I'd like to discuss what deals you have for existing customers. I've seen [competitor] offering [price] — can you match or beat that?",
      },
    ],
    insights: [
      { type: "caution", title: "Winter spike ahead", body: "Energy costs are forecasted to rise 40% between October and December. Building a buffer now will help." },
      { type: "info", title: "Standing charges are fixed", body: "About £28/month of your energy bill is standing charges — you pay these even with zero usage. They cannot be reduced by using less energy." },
    ],
  };
}

export function mockSimulateScenario(payload: ScenarioPayload): ScenarioResult {
  let saving = 0;
  const breakdown: ScenarioResult["breakdown"] = [];

  if (payload.heatingReductionCelsius > 0) {
    const s = payload.heatingReductionCelsius * 12;
    saving += s;
    breakdown.push({ category: "Heating reduction", monthlySaving: s, confidence: "medium", savingLabel: "estimated_saving" });
  }
  if (payload.applianceReductionPercent > 0) {
    const s = Math.round(payload.applianceReductionPercent * 0.8);
    saving += s;
    breakdown.push({ category: "Appliance usage", monthlySaving: s, confidence: "medium", savingLabel: "estimated_saving" });
  }
  if (payload.shiftAppliancesToOffPeak) {
    saving += 5;
    breakdown.push({ category: "Off-peak shifting", monthlySaving: 5, confidence: "low", savingLabel: "potential_saving" });
  }
  if (payload.requestDirectDebitReview) {
    saving += 8;
    breakdown.push({ category: "Direct debit review", monthlySaving: 8, confidence: "medium", savingLabel: "cashflow_improvement" });
  }
  if (payload.applyForCouncilTaxReduction) {
    saving += 25;
    breakdown.push({ category: "Council tax reduction", monthlySaving: 25, confidence: "only_if_eligible", savingLabel: "potential_saving" });
  }
  if (payload.switchToSocialBroadbandTariff) {
    saving += 15;
    breakdown.push({ category: "Social broadband tariff", monthlySaving: 15, confidence: "only_if_eligible", savingLabel: "potential_saving" });
  }
  if (payload.checkWaterMeterOrSocialTariff) {
    saving += 8;
    breakdown.push({ category: "Water review", monthlySaving: 8, confidence: "medium", savingLabel: "potential_saving" });
  }
  if (payload.changePaymentDate) {
    saving += 0;
    breakdown.push({ category: "Payment date change", monthlySaving: 0, confidence: "high", savingLabel: "cashflow_improvement" });
  }

  return {
    householdId: payload.householdId,
    estimatedMonthlySaving: saving,
    estimatedAnnualSaving: saving * 12,
    confidence: "medium",
    overallRisk: payload.heatingReductionCelsius > 2 ? "medium" : "none",
    safetyWarning: payload.heatingReductionCelsius > 2 ? "Reducing heating by more than 2°C may not be comfortable for all household members." : null,
    tariffWarning: null,
    breakdown,
    notes: [
      "These are estimates based on your household profile.",
      "Actual savings depend on your specific circumstances and eligibility.",
    ],
  };
}

export function mockGetSupportServices(postcode: string, filters?: string[]): SupportServicesResponse {
  const allServices: SupportServicesResponse["services"] = [
    { id: "svc_1", name: "Bristol Energy Network — Warm Welcome", type: "warm_space", distanceMiles: 0.3, openingStatus: "open_now", shortDescription: "Free warm space with hot drinks and WiFi. Open Mon-Fri 9am-4pm.", addressLine1: "42 Broad Street", town: "Bristol", phone: "0117 900 1234", website: "https://bristolenergynetwork.org", directionsLabel: "0.3 miles" },
    { id: "svc_2", name: "South Bristol Food Bank", type: "food_bank", distanceMiles: 0.8, openingStatus: "open_now", shortDescription: "Emergency food parcels available with referral. Walk-ins accepted Tuesdays.", addressLine1: "15 East Street", town: "Bedminster", phone: "0117 966 5432", website: null, directionsLabel: "0.8 miles" },
    { id: "svc_3", name: "Citizens Advice Bristol", type: "citizens_advice", distanceMiles: 1.2, openingStatus: "opens_today", shortDescription: "Free advice on benefits, debt, housing, and consumer issues. Appointments and drop-in.", addressLine1: "12 Broad Quay", town: "Bristol", phone: "0808 278 7900", website: "https://citizensadvice.org.uk", directionsLabel: "1.2 miles" },
    { id: "svc_4", name: "Bedminster Library", type: "library", distanceMiles: 0.5, openingStatus: "open_now", shortDescription: "Free WiFi, warm space, and access to council services. Open 6 days a week.", addressLine1: "4 St Peter's Court", town: "Bedminster", phone: null, website: null, directionsLabel: "0.5 miles" },
    { id: "svc_5", name: "Bristol Council Emergency Support", type: "council_emergency_support", distanceMiles: 2.1, openingStatus: "appointment_only", shortDescription: "Emergency support for residents in crisis — fuel vouchers, hardship fund, and referrals.", addressLine1: "City Hall, College Green", town: "Bristol", phone: "0117 922 2000", website: "https://bristol.gov.uk", directionsLabel: "2.1 miles" },
    { id: "svc_6", name: "StepChange Debt Advice (Phone)", type: "debt_advice", distanceMiles: 0, openingStatus: "open_now", shortDescription: "Free, confidential debt advice by phone. No judgement, practical next steps.", addressLine1: "Phone service", town: "Nationwide", phone: "0800 138 1111", website: "https://stepchange.org", directionsLabel: "Phone" },
    { id: "svc_7", name: "Centre for Sustainable Energy", type: "energy_help", distanceMiles: 1.5, openingStatus: "closed_now", shortDescription: "Free energy advice for households struggling with bills. Help switching and grants.", addressLine1: "3 St Peter's Court", town: "Bristol", phone: "0800 082 2234", website: "https://cse.org.uk", directionsLabel: "1.5 miles" },
    { id: "svc_8", name: "Southville Community Fridge", type: "food_bank", distanceMiles: 0.6, openingStatus: "open_now", shortDescription: "Free surplus food available to anyone. No referral needed.", addressLine1: "Beauley Road", town: "Southville", phone: null, website: null, directionsLabel: "0.6 miles" },
  ];

  const filtered = filters && filters.length > 0
    ? allServices.filter((s) => filters.includes(s.type))
    : allServices;

  return {
    postcode,
    normalizedPostcode: postcode.replace(/\s+/g, "").toUpperCase(),
    radiusMiles: 5,
    mapPlaceholder: {
      centerLabel: `Near ${postcode}`,
      message: "Interactive map coming soon",
    },
    services: filtered,
    availableFilters: ["warm_space", "food_bank", "citizens_advice", "library", "council_emergency_support", "debt_advice", "energy_help"],
  };
}

export function mockGenerateThirtyDayPlan(householdId: string): ThirtyDayPlan {
  return {
    planId: uid(),
    householdId,
    generatedAt: new Date().toISOString(),
    title: "Your 30-Day Action Plan",
    intro: "Based on your household profile and energy bill, here are practical steps ordered by impact and effort. Tick them off as you go.",
    thisWeek: {
      title: "This Week",
      items: [
        { id: "p1", title: "Turn thermostat down 1°C", description: "A small change that saves around £12/month on gas.", estimatedSavingPounds: 12, savingLabel: "estimated_saving", effort: "low", done: false, callScript: null },
        { id: "p2", title: "Run an energy comparison", description: "Check if a fixed tariff would be cheaper than your standard variable rate.", estimatedSavingPounds: 24, savingLabel: "estimated_saving", effort: "low", done: false, callScript: null },
        { id: "p3", title: "Check Warm Home Discount eligibility", description: "Visit GOV.UK or call your supplier to see if you qualify for £150 off.", estimatedSavingPounds: null, savingLabel: "support_value", effort: "medium", done: false, callScript: "Hi, I'd like to check if I'm eligible for the Warm Home Discount. My account number is [X]." },
      ],
    },
    nextTwoWeeks: {
      title: "Next Two Weeks",
      items: [
        { id: "p4", title: "Call broadband provider to negotiate", description: "If your contract has ended, you are likely paying more than new customers.", estimatedSavingPounds: 15, savingLabel: "estimated_saving", effort: "medium", done: false, callScript: "Hi, my contract has ended. What deals do you have for existing customers? I've seen [competitor] offering [price]." },
        { id: "p5", title: "Check water usage for leaks", description: "Read your meter, wait 2 hours with no water use, then read again.", estimatedSavingPounds: 8, savingLabel: "potential_saving", effort: "low", done: false, callScript: null },
        { id: "p6", title: "Review direct debit amount", description: "Call your energy supplier to ensure your DD matches actual usage.", estimatedSavingPounds: 8, savingLabel: "cashflow_improvement", effort: "low", done: false, callScript: "Hi, I'd like to review my direct debit amount. Can you check if it matches my actual usage so I'm not overpaying?" },
      ],
    },
    byDayThirty: {
      title: "By Day 30",
      items: [
        { id: "p7", title: "Switch tariff if savings confirmed", description: "Complete the switch to the best deal you found.", estimatedSavingPounds: 24, savingLabel: "estimated_saving", effort: "low", done: false, callScript: null },
        { id: "p8", title: "Apply for council tax reduction if eligible", description: "Check if you qualify for a discount based on your circumstances.", estimatedSavingPounds: 25, savingLabel: "potential_saving", effort: "medium", done: false, callScript: null },
      ],
    },
    actions: {
      downloadAvailable: true,
      copyAvailable: true,
      regenerateAvailable: true,
    },
    reassurance: "Remember: small steps add up. Even completing 2-3 items from this plan could save your household over £50/month.",
  };
}
