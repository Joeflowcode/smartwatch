import { createEmailProvider } from "@/lib/providers";
import { APP_NAME } from "@/config/site";

export type AlertEmailPayload = {
  to: string;
  ruleLabel: string;
  detail: string;
  deepLink?: string;
};

/** Send a rate-limited research alert email (Resend when configured, else mock). */
export async function sendAlertEmail(payload: AlertEmailPayload) {
  const provider = createEmailProvider();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = payload.deepLink ?? `${appUrl}/app/alerts`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 520px; color: #0f1c17;">
      <h1 style="font-size: 18px;">${APP_NAME} alert</h1>
      <p style="margin: 12px 0 4px; font-weight: 600;">${escapeHtml(payload.ruleLabel)}</p>
      <p style="margin: 0 0 16px; color: #4a5c55;">${escapeHtml(payload.detail)}</p>
      <p style="font-size: 13px; color: #4a5c55;">
        Research notice only — not a recommendation to wager. Manage rules in the app.
      </p>
      <p style="margin-top: 20px;">
        <a href="${link}" style="color: #0d7a5f;">Open alerts</a>
      </p>
    </div>
  `;

  return provider.send({
    to: payload.to,
    subject: `${APP_NAME}: ${payload.ruleLabel}`,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
