import { auth } from '@/lib/auth';
import { fetchDemandTiles } from '@/lib/demand';
import { DemandHeatmap } from '@/components/coach/demand-heatmap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DemandMapPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'COACH') {
    throw new Error('Unauthorized');
  }

  const tiles = await fetchDemandTiles({ sport: 'Beach Volleyball' });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Demand map</h1>
          <p className="text-sm text-slate-500">
            Heatmap shows player searches and open requests. Prioritize zones with the highest opportunity score.
          </p>
        </div>
        <Button asChild>
          <a href="/coach/calendar">Manage availability</a>
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Score = 60% searches + 40% pending requests
            </span>
            <span>Tap a hotspot to plan pop-up clinics or extend your travel radius.</span>
          </div>
          <DemandHeatmap tiles={tiles} />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {tiles
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((tile) => (
            <Card key={`${tile.lat}-${tile.lng}`}>
              <CardContent className="space-y-2 p-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Hotspot ({tile.lat.toFixed(3)}, {tile.lng.toFixed(3)})
                </h2>
                <p className="text-sm text-slate-500">
                  {tile.pings} recent searches • {tile.pendingRequests} open requests
                </p>
                <p className="text-sm text-slate-600">
                  Opportunity score <span className="font-semibold text-slate-900">{tile.score.toFixed(1)}</span>. Offer a clinic
                  or open new slots nearby.
                </p>
              </CardContent>
            </Card>
          ))}
      </section>
    </div>
  );
}
