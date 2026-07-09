import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield, Loader as Loader2, FileText, CreditCard, Circle as HelpCircle, SlidersHorizontal, MapPin, CalendarCheck, TrendingDown, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoData } from "@/api/endpoints";
import { setHouseholdId, setBillId } from "@/utils/storage";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
      const result = await seedDemoData();
      setHouseholdId(result.householdId);
      if (result.billId) setBillId(result.billId);
      navigate("/dashboard");
    } catch {
      setLoading(false);
      toast.error("Demo data unavailable right now — try 'Start household check' instead.");
    }
  };

  return (
    <div className="min-h-svh flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-slate-100">BillShield UK</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDemo}
              disabled={loading}
              className="text-slate-600 dark:text-slate-400 hidden sm:flex"
            >
              {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              View demo
            </Button>
            <Button size="sm" onClick={() => navigate("/onboarding")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Start check
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Household bill support for the UK
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 text-balance leading-tight">
                Understand your bills. Find realistic savings. Get support.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                BillShield UK turns confusing household bills into clear, practical actions — so you can see what is driving your costs, what may be worth checking, and where support could be available.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/onboarding")}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  Start household check
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDemo}
                  disabled={loading}
                  className="w-full sm:w-auto border-slate-300 dark:border-slate-700"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  View demo dashboard
                </Button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                No bank connection needed. Start with your household details and a recent bill.
              </p>
            </div>

            {/* Right: preview card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/60 dark:shadow-none p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your top 3 actions this month</p>
                <span className="text-xs text-slate-400 dark:text-slate-500">Preview</span>
              </div>
              <div className="space-y-3">
                <PreviewActionItem
                  rank={1}
                  title="Request a Direct Debit review"
                  saving="Could improve cashflow by £22/month"
                  savingColor="text-green-700 dark:text-green-400"
                />
                <PreviewActionItem
                  rank={2}
                  title="Check Council Tax Reduction"
                  saving="You may qualify depending on your local council"
                  savingColor="text-amber-700 dark:text-amber-400"
                />
                <PreviewActionItem
                  rank={3}
                  title="Check broadband social tariff"
                  saving="Some eligible households can access lower-cost plans"
                  savingColor="text-violet-700 dark:text-violet-400"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                Ranked by saving, urgency, effort, confidence, and safety.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Problem */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20 space-y-10">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Bills are confusing. Support is scattered.
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Energy rates, standing charges, council tax, broadband tariffs, water bills, food pressure, and local support schemes can be hard to compare. BillShield brings the next steps together in one place, without overwhelming you with generic tips.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <ProblemCard
                icon={<FileText className="h-5 w-5 text-blue-600" />}
                title="Hard-to-read bills"
                body="See the key details from your bill in plain English, including unit rates, standing charges, Direct Debit amount, and tariff status."
              />
              <ProblemCard
                icon={<TrendingDown className="h-5 w-5 text-green-600" />}
                title="Unclear savings"
                body="Understand the difference between estimated savings, potential savings, and cashflow improvements."
              />
              <ProblemCard
                icon={<MapPin className="h-5 w-5 text-violet-600" />}
                title="Support is hard to find"
                body="Find practical routes such as council support, social tariffs, warm spaces, food support, and debt advice."
              />
            </div>
          </div>
        </section>

        {/* Section 2: How it works */}
        <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20 space-y-10">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              How BillShield works
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              A simple flow from bill upload to a practical 30-day plan.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Tell us about your household",
                body: "Add your postcode, household type, monthly costs, and a few eligibility signals. You can update this later.",
              },
              {
                step: 2,
                title: "Upload a recent bill",
                body: "Upload your latest energy bill so BillShield can extract the details that usually affect your monthly costs.",
              },
              {
                step: 3,
                title: "Review the key details",
                body: "Check the extracted fields before savings are calculated. Anything uncertain is clearly marked for review.",
              },
              {
                step: 4,
                title: "Get your action plan",
                body: "See your top recommended actions, try what-if scenarios, find local support, and create a 30-day plan.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                  {step}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Features */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20 space-y-10">
            <div className="max-w-xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Built around practical actions, not generic tips
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FileText className="h-5 w-5 text-blue-600" />}
                title="Bill OCR review"
                body="Check supplier, tariff, unit rates, standing charges, usage, payment method, and Direct Debit amount."
              />
              <FeatureCard
                icon={<CreditCard className="h-5 w-5 text-green-600" />}
                title="Direct Debit health check"
                body="See whether your Direct Debit looks high, low, or broadly aligned with forecast usage."
              />
              <FeatureCard
                icon={<HelpCircle className="h-5 w-5 text-amber-600" />}
                title="Support eligibility signals"
                body="Identify routes that may be worth checking, including Council Tax Reduction, social tariffs, hardship support, and local help."
              />
              <FeatureCard
                icon={<SlidersHorizontal className="h-5 w-5 text-blue-600" />}
                title="Scenario simulator"
                body="Test what could happen if you request a Direct Debit review, check council tax support, change broadband tariff, or adjust usage safely."
              />
              <FeatureCard
                icon={<MapPin className="h-5 w-5 text-violet-600" />}
                title="Local support map"
                body="Find nearby warm spaces, food support, Citizens Advice, libraries, council help, debt advice, and energy support."
              />
              <FeatureCard
                icon={<CalendarCheck className="h-5 w-5 text-green-600" />}
                title="30-day survival plan"
                body="Turn recommendations into a simple plan for this week, the next two weeks, and by day 30."
              />
            </div>
          </div>
        </section>

        {/* Section 4: Trust */}
        <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20 space-y-10">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Designed for people under pressure
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              BillShield uses supportive language, confidence levels, and safety caveats. It does not promise guaranteed savings where eligibility, tariffs, or local rules may affect the result.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustCard
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
              title="No shame"
              body="BillShield avoids blame-based language. It focuses on what can be checked next."
            />
            <TrustCard
              icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
              title="No unsafe advice"
              body="Heating suggestions include safety guardrails, especially for older people, children, disabled people, or anyone with health conditions."
            />
            <TrustCard
              icon={<Shield className="h-5 w-5 text-blue-600" />}
              title="No false certainty"
              body="Savings are clearly labelled as estimated, potential, cashflow improvement, support value, or billing accuracy."
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-900 dark:bg-slate-800">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
              Start with one bill. Leave with a clearer plan.
            </h2>
            <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              You do not need to solve everything at once. BillShield helps you start with the most practical actions for this month.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/onboarding")}
                className="bg-blue-500 hover:bg-blue-400 text-white w-full sm:w-auto"
              >
                Start household check
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDemo}
                disabled={loading}
                className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                View demo dashboard
              </Button>
            </div>
            <p className="text-sm text-slate-500">
              You can delete uploaded bill data at any time.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        BillShield UK — Your data stays private.
      </footer>
    </div>
  );
}

function PreviewActionItem({
  rank,
  title,
  saving,
  savingColor,
}: {
  rank: number;
  title: string;
  saving: string;
  savingColor: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-xs font-bold text-blue-700 dark:text-blue-300">
        {rank}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{title}</p>
        <p className={`text-xs mt-0.5 font-medium ${savingColor}`}>{saving}</p>
      </div>
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6 space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6 space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
