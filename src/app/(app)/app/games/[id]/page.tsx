import Link from "next/link";
import { notFound } from "next/navigation";
import { GameWatchActions } from "@/components/app/game-watch-actions";
import { Badge } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmerican } from "@/lib/betting/odds";
import {
  createInjuryProvider,
  createOddsProvider,
  createStatsProvider,
  createWeatherProvider,
  createAIProvider,
} from "@/lib/providers";
import { formatPercent } from "@/lib/utils";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const oddsProvider = createOddsProvider();
  const { data: events, meta } = await oddsProvider.getEvents();
  const event = events.find((e) => e.id === id);
  if (!event) notFound();

  const [{ data: odds }, { data: injuries }, { data: homeStats }, { data: weather }] =
    await Promise.all([
      oddsProvider.getOdds({ eventId: id }),
      createInjuryProvider().getInjuries({ eventId: id }),
      createStatsProvider().getTeamStats(event.homeTeamId),
      createWeatherProvider().getWeather({
        venue: event.venue ?? "",
        startsAt: event.startsAt,
      }),
    ]);

  const ai = createAIProvider();
  const summary = await ai.chat({
    messages: [
      {
        role: "user",
        content: `Summarize matchup ${event.awayTeamName} @ ${event.homeTeamName} using available data.`,
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            {event.sportId.toUpperCase()}
            {meta.isMock ? (
              <Badge className="ml-2 border-amber-500/40 text-amber-700 dark:text-amber-300">
                Mock data
              </Badge>
            ) : null}
          </p>
          <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
            {event.awayTeamName} @ {event.homeTeamName}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {new Date(event.startsAt).toLocaleString()} · {event.venue}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GameWatchActions
            eventId={event.id}
            label={`${event.awayTeamName} @ ${event.homeTeamName}`}
          />
          <Button asChild variant="outline">
            <Link href="/app">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current odds</CardTitle>
            <CardDescription>Market consensus from available books</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {odds.map((q) => (
              <div key={q.id} className="flex justify-between gap-2 border-b border-[var(--border)] py-2 last:border-0">
                <span>
                  {q.market} · {q.selection}
                  {q.line != null ? ` ${q.line}` : ""} · {q.sportsbook}
                </span>
                <span className="font-mono">
                  {formatAmerican(q.americanOdds)} ({formatPercent(q.impliedProbability)})
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI matchup summary</CardTitle>
            <CardDescription>Interpretation — not a prediction lock</CardDescription>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
            {summary.content}
            <p className="mt-3 text-xs">
              Citations: {summary.citations.join(", ") || "none"} ·{" "}
              {new Date(summary.meta.fetchedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Injuries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {injuries.map((inj) => (
              <div key={inj.id}>
                <p className="font-medium">
                  {inj.playerName} · {inj.status}
                </p>
                <p className="text-[var(--muted-foreground)]">{inj.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team context</CardTitle>
            <CardDescription>Do not overweight small samples</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            <ul className="space-y-1">
              {Object.entries(homeStats).map(([k, v]) => (
                <li key={k}>
                  <span className="text-[var(--foreground)]">{k}:</span> {String(v)}
                </li>
              ))}
            </ul>
            {weather ? (
              <p className="mt-3">
                Weather: {weather.temperatureF}°F, {weather.condition}, wind {weather.windMph} mph
              </p>
            ) : (
              <p className="mt-3">Indoor / no weather feed for this venue.</p>
            )}
            <p className="mt-3 text-xs">
              Key uncertainties: late scratches, minutes restrictions, travel fatigue, and line
              movement after this page was rendered.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
