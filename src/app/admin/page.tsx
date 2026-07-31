import { PLANS } from "@/config/pricing";
import { FEATURE_FLAGS } from "@/config/site";
import { getSessionUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  const user = await getSessionUser();

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
            Connect Supabase to populate AI usage, sports-data costs, alert volume, and affiliate
            clicks. Follow YOUR_NEXT_STEPS.md in the repo.
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
