import { Metadata } from 'next';
import Link from 'next/link';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { CoachMap } from '@/components/player/coach-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Prisma } from '@prisma/client';
import { SearchFeedbackForm } from '@/components/feedback/search-feedback-form';

export const metadata: Metadata = {
  title: 'Find coaches near you • FindMyCoach',
};

const searchSchema = z.object({
  sport: z.string().default('Beach Volleyball'),
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']).optional(),
  language: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  weekday: z.coerce.number().min(0).max(6).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().optional(),
});

export const dynamic = 'force-dynamic';

type CoachResult = {
  id: string;
  name: string;
  headline: string;
  bio: string | null;
  pricePerHour: number;
  languages: string[];
  certifications: string[];
  ratingAvg: number;
  ratingCount: number;
  latitude: number;
  longitude: number;
  radiusKm: number;
};

export default async function SearchPage({ searchParams }: { searchParams: Record<string, string | string[]> }) {
  const parsed = searchSchema.safeParse(Object.fromEntries(Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])));
  if (!parsed.success) {
    throw new Error('Invalid search parameters');
  }
  const filters = parsed.data;
  const session = await auth();

  const basePoint = filters.lat && filters.lng
    ? Prisma.sql`ST_SetSRID(ST_MakePoint(${filters.lng}, ${filters.lat}), 4326)::geography`
    : Prisma.sql`NULL`;

  const coaches = (await prisma.$queryRaw<CoachResult[]>(Prisma.sql`
    SELECT
      u."id" AS id,
      u."name" AS name,
      cp."headline" AS headline,
      cp."bio" AS bio,
      cp."pricePerHour"::float AS "pricePerHour",
      cp."languages" AS languages,
      cp."certifications" AS certifications,
      cp."ratingAvg" AS "ratingAvg",
      cp."ratingCount" AS "ratingCount",
      ST_Y(cp."baseLocation"::geometry) AS latitude,
      ST_X(cp."baseLocation"::geometry) AS longitude,
      cp."radiusKm" AS "radiusKm"
    FROM "CoachProfile" cp
    JOIN "User" u ON u."id" = cp."userId"
    WHERE
      (${filters.priceMin ?? null}::float IS NULL OR cp."pricePerHour" >= ${filters.priceMin ?? null}) AND
      (${filters.priceMax ?? null}::float IS NULL OR cp."pricePerHour" <= ${filters.priceMax ?? null}) AND
      (${filters.language ?? null}::text IS NULL OR ${filters.language ?? null} = ANY(cp."languages")) AND
      (${filters.skillLevel ?? null}::text IS NULL OR ${filters.skillLevel ?? null} = ANY(cp."levels")) AND
      (${filters.sport ?? null}::text IS NULL OR ${filters.sport ?? null} = ANY(cp."sports")) AND
      (${filters.weekday ?? null}::int IS NULL OR EXISTS (
        SELECT 1 FROM "Availability" a
        WHERE a."coachId" = cp."userId" AND a."weekday" = ${filters.weekday ?? null}
      )) AND
      (${filters.lat ?? null}::float IS NULL OR ${filters.lng ?? null}::float IS NULL OR ST_DWithin(cp."baseLocation"::geography, ${basePoint}, (${filters.radiusKm ?? 25}::float * 1000)))
    ORDER BY cp."ratingAvg" DESC NULLS LAST
  `)) ?? [];

  if (filters.lat && filters.lng) {
    await prisma.demandPing.create({
      data: {
        playerId: session?.user.role === 'PLAYER' ? session.user.id : null,
        sport: filters.sport,
        level: filters.skillLevel ?? 'INTERMEDIATE',
        location: {
          set: `SRID=4326;POINT(${filters.lng} ${filters.lat})`,
        },
      },
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white p-6 md:w-72">
          <h2 className="text-lg font-semibold text-slate-900">Filter results</h2>
          <form className="mt-4 space-y-4" method="get">
            <div>
              <label htmlFor="language" className="text-sm font-medium text-slate-700">
                Language
              </label>
              <input
                id="language"
                name="language"
                defaultValue={filters.language ?? ''}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                placeholder="English"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="priceMin" className="text-sm font-medium text-slate-700">
                  Min $/hr
                </label>
                <input
                  id="priceMin"
                  name="priceMin"
                  type="number"
                  min="0"
                  defaultValue={filters.priceMin ?? ''}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
              <div>
                <label htmlFor="priceMax" className="text-sm font-medium text-slate-700">
                  Max $/hr
                </label>
                <input
                  id="priceMax"
                  name="priceMax"
                  type="number"
                  min="0"
                  defaultValue={filters.priceMax ?? ''}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="weekday" className="text-sm font-medium text-slate-700">
                Day of week
              </label>
              <select
                id="weekday"
                name="weekday"
                defaultValue={filters.weekday?.toString() ?? ''}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <option value="">Any day</option>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lat" className="text-sm font-medium text-slate-700">
                Latitude
              </label>
              <input
                id="lat"
                name="lat"
                type="number"
                step="any"
                defaultValue={filters.lat ?? ''}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="lng" className="text-sm font-medium text-slate-700">
                Longitude
              </label>
              <input
                id="lng"
                name="lng"
                type="number"
                step="any"
                defaultValue={filters.lng ?? ''}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="radiusKm" className="text-sm font-medium text-slate-700">
                Radius (km)
              </label>
              <input
                id="radiusKm"
                name="radiusKm"
                type="number"
                step="0.5"
                min="1"
                defaultValue={filters.radiusKm ?? 25}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <Button type="submit" className="w-full">
              Update search
            </Button>
          </form>
        </aside>
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-semibold text-slate-900">Coaches near you</h1>
            <p className="text-sm text-slate-500">
              Filter by availability, budget, and language. Click a coach to request a session instantly.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <CoachMap
                coaches={coaches.map((coach) => ({
                  id: coach.id,
                  name: coach.name,
                  latitude: coach.latitude,
                  longitude: coach.longitude,
                  pricePerHour: coach.pricePerHour,
                  ratingAvg: coach.ratingAvg ?? 0,
                }))}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {coaches.length === 0 && (
              <Card className="border-dashed text-center">
                <CardContent className="space-y-3 py-10">
                  <h3 className="text-lg font-semibold text-slate-900">No coaches match yet</h3>
                  <p className="text-sm text-slate-500">
                    Try widening your radius or removing filters. Tell us what blocked you so we can add more coaches.
                  </p>
                  <SearchFeedbackForm />
                </CardContent>
              </Card>
            )}
            {coaches.map((coach) => (
              <Card key={coach.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-slate-900">{coach.name}</h3>
                      <Badge variant="outline">⭐ {coach.ratingAvg.toFixed(1)} ({coach.ratingCount})</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{coach.headline}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>${coach.pricePerHour.toFixed(0)}/hr</span>
                      <span>• Travels up to {coach.radiusKm} km</span>
                      {coach.languages.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <Button asChild>
                      <Link href={`/coaches/${coach.id}`}>View profile</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/coaches/${coach.id}/request`}>Request session</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
