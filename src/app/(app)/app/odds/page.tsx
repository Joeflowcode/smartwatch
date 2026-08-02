import Link from "next/link";
import { FormattedOdds } from "@/components/app/formatted-odds";
import { AffiliateDisclosureNote } from "@/components/legal/affiliate-note";
import { Badge } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createOddsProvider } from "@/lib/providers";
import { formatPercent } from "@/lib/utils";

export default async function OddsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; market?: string }>;
}) {
  const params = await searchParams;
  const provider = createOddsProvider();
  const [{ data: events, meta }, { data: odds }] = await Promise.all([
    provider.getEvents({ sport: params.sport }),
    provider.getOdds({
      sport: params.sport,
      markets: params.market ? [params.market] : undefined,
    }),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
          Odds comparison
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Prices include vig. Best line highlighted per selection.
          {meta.isMock ? (
            <Badge className="ml-2 border-amber-500/40 text-amber-700 dark:text-amber-300">
              Mock · {new Date(meta.fetchedAt).toLocaleString()}
            </Badge>
          ) : null}
        </p>
      </div>

      <AffiliateDisclosureNote compact />

      <form className="grid grid-cols-2 gap-3 text-sm sm:flex sm:flex-wrap">
        <select
          name="sport"
          defaultValue={params.sport ?? ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3"
        >
          <option value="">All sports</option>
          <option value="nba">NBA</option>
          <option value="nfl">NFL</option>
          <option value="mlb">MLB</option>
          <option value="nhl">NHL</option>
        </select>
        <select
          name="market"
          defaultValue={params.market ?? ""}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3"
        >
          <option value="">All markets</option>
          <option value="moneyline">Moneyline</option>
          <option value="spread">Spread</option>
          <option value="total">Total</option>
        </select>
        <button
          type="submit"
          className="col-span-2 h-10 rounded-md bg-[var(--primary)] px-4 text-[var(--primary-foreground)] sm:col-span-1"
        >
          Filter
        </button>
      </form>

      {events.length === 0 ? (
        <EmptyState
          title="No games match these filters"
          description="Try another sport or clear the market filter."
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const eventOdds = odds.filter((o) => o.eventId === event.id);
            const bySelection = new Map<string, typeof eventOdds>();
            for (const quote of eventOdds) {
              const key = `${quote.market}:${quote.selection}:${quote.line ?? ""}`;
              const list = bySelection.get(key) ?? [];
              list.push(quote);
              bySelection.set(key, list);
            }
            const flat = [...bySelection.entries()].flatMap(([, quotes]) => {
              const best = Math.max(...quotes.map((q) => q.decimalOdds));
              return quotes.map((q) => ({ q, best }));
            });

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    <Link href={`/app/games/${event.id}`} className="hover:underline">
                      {event.awayTeamName} @ {event.homeTeamName}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {event.sportId.toUpperCase()} · {new Date(event.startsAt).toLocaleString()} ·{" "}
                    {event.venue}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {flat.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No quotes for this market filter on this game.
                    </p>
                  ) : (
                    <>
                      {/* Mobile stacked quotes */}
                      <div className="space-y-2 md:hidden">
                        {flat.map(({ q, best }) => (
                          <div
                            key={q.id}
                            className={`rounded-lg border border-[var(--border)] px-3 py-2 text-sm ${
                              q.decimalOdds === best ? "bg-[var(--primary)]/5" : ""
                            }`}
                          >
                            <div className="flex justify-between gap-2">
                              <span className="font-medium capitalize">
                                {q.market} · {q.selection}
                                {q.line != null ? ` (${q.line})` : ""}
                              </span>
                              <FormattedOdds
                                american={q.americanOdds}
                                decimal={q.decimalOdds}
                              />
                            </div>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                              {q.sportsbook} · implied {formatPercent(q.impliedProbability)} ·{" "}
                              {new Date(q.updatedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Desktop table */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="text-xs text-[var(--muted-foreground)]">
                            <tr>
                              <th className="pb-2 font-medium">Market</th>
                              <th className="pb-2 font-medium">Selection</th>
                              <th className="pb-2 font-medium">Book</th>
                              <th className="pb-2 font-medium">Price</th>
                              <th className="pb-2 font-medium">Implied</th>
                              <th className="pb-2 font-medium">Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {flat.map(({ q, best }) => (
                              <tr
                                key={q.id}
                                className={
                                  q.decimalOdds === best
                                    ? "bg-[var(--primary)]/5 font-medium"
                                    : undefined
                                }
                              >
                                <td className="py-2 capitalize">{q.market}</td>
                                <td className="py-2">
                                  {q.selection}
                                  {q.line != null ? ` (${q.line})` : ""}
                                </td>
                                <td className="py-2">{q.sportsbook}</td>
                                <td className="py-2">
                                  <FormattedOdds
                                    american={q.americanOdds}
                                    decimal={q.decimalOdds}
                                  />
                                </td>
                                <td className="py-2">{formatPercent(q.impliedProbability)}</td>
                                <td className="py-2 text-xs text-[var(--muted-foreground)]">
                                  {new Date(q.updatedAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
