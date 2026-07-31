import { PLANS } from "@/config/pricing";
import { FEATURE_FLAGS } from "@/config/site";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  // Role checks are enforced via Supabase app_metadata.role = admin in production.
  // Demo admin surfaces metrics placeholders for beta operators.

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Restricted metrics overview. Promote admins via Supabase{" "}
          <code className="text-xs">app_metadata.role = admin</code> — never user_metadata.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: "—" },
          { label: "MRR estimate", value: formatCurrency(0) },
          { label: "Trial conversions", value: "—" },
          { label: "Churn", value: "—" },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plans</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            {Object.values(PLANS).map((p) => (
              <p key={p.id}>
                {p.name}: {formatCurrency(p.monthlyPriceUsd)}/mo
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feature flags</CardTitle>
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
            AI usage, sports-data API usage, alert volume, affiliate clicks, and data freshness
            populate here once Supabase + providers are connected.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support & audit</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Support inquiries, suspensions, and audit logs are available via RLS-protected admin
            policies after migration.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
