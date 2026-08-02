import { PLANS } from "@/config/pricing";
import { FEATURE_FLAGS } from "@/config/site";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { getSessionUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  const [user, metrics] = await Promise.all([getSessionUser(), getAdminMetrics()]);
  const flagsOn = Object.values(FEATURE_FLAGS).filter(Boolean).length;
  const churn =
    metrics.activePaid != null && metrics.canceled != null && metrics.activePaid + metrics.canceled > 0
      ? `${((metrics.canceled / (metrics.activePaid + metrics.canceled)) * 100).toFixed(1)}%`
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Signed in as {user?.email ?? "unknown"}. Access requires{" "}
          <code className="text-xs">app_metadata.role = admin</code> or{" "}
          <code className="text-xs">ADMIN_EMAILS</code>.
        </p>
      </div>

      {metrics.mode === "demo" ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-sm text-[var(--muted-foreground)]">
          Metrics are offline until Supabase + Stripe are connected. Plan catalog and flags below
          are live config, not revenue data.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Users",
            value: metrics.users == null ? "Demo" : String(metrics.users),
            hint: metrics.mode === "demo" ? "Connect Supabase" : "profiles count",
          },
          {
            label: "MRR estimate",
            value: metrics.mrrUsd == null ? "Not connected" : formatCurrency(metrics.mrrUsd),
            hint: metrics.mode === "demo" ? "Needs Stripe webhook sync" : "list-price × paid plans",
          },
          {
            label: "Trials",
            value: metrics.trialCount == null ? "Demo" : String(metrics.trialCount),
            hint: "status = trialing",
          },
          {
            label: "Churn proxy",
            value: churn ?? "Demo",
            hint: "canceled / (active paid + canceled)",
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--muted-foreground)]">{item.hint}</CardContent>
          </Card>
        ))}
      </div>

      {metrics.notes.length ? (
        <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--muted-foreground)]">
          {metrics.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plans ({Object.keys(PLANS).length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            {Object.values(PLANS).map((p) => (
              <p key={p.id}>
                {p.name}: {formatCurrency(p.monthlyPriceUsd)}/mo · AI/day{" "}
                {p.limits.dailyAiQuestions}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Feature flags ({flagsOn} on / {Object.keys(FEATURE_FLAGS).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            {Object.entries(FEATURE_FLAGS).map(([key, enabled]) => (
              <p key={key}>
                {key}: {enabled ? "on" : "off"}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage & freshness</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Connect Supabase to populate AI usage, sports-data costs, alert volume, and affiliate
            clicks. Health endpoint: <code className="text-xs">/api/health</code>.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support & audit</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Support inquiries, suspensions, and audit logs use RLS admin policies after migration.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
