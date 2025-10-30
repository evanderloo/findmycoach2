import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export type DemandTile = {
  lat: number;
  lng: number;
  score: number;
  pendingRequests: number;
  pings: number;
};

export async function fetchDemandTiles(params: { sport?: string; granularity?: number }) {
  const sport = params.sport ?? 'Beach Volleyball';
  const precision = params.granularity ?? 0.02; // ~2km bucket

  const tiles = await prisma.$queryRaw<DemandTile[]>(Prisma.sql`
    WITH demand AS (
      SELECT
        round(ST_Y(dp."location"::geometry) / ${precision}) * ${precision} AS lat,
        round(ST_X(dp."location"::geometry) / ${precision}) * ${precision} AS lng,
        COUNT(*) AS pings,
        0::int AS pending_requests
      FROM "DemandPing" dp
      WHERE dp."sport" = ${sport}
      GROUP BY 1, 2
    ),
    requests AS (
      SELECT
        round(ST_Y(sr."location"::geometry) / ${precision}) * ${precision} AS lat,
        round(ST_X(sr."location"::geometry) / ${precision}) * ${precision} AS lng,
        COUNT(*) AS pending_requests
      FROM "SessionRequest" sr
      WHERE sr."sport" = ${sport} AND sr."status" = 'PENDING'
      GROUP BY 1, 2
    )
    SELECT
      COALESCE(d.lat, r.lat) AS lat,
      COALESCE(d.lng, r.lng) AS lng,
      COALESCE(d.pings, 0) AS pings,
      COALESCE(r.pending_requests, 0) AS pendingRequests,
      (COALESCE(d.pings, 0) * 0.6 + COALESCE(r.pending_requests, 0) * 1.4) AS score
    FROM demand d
    FULL OUTER JOIN requests r ON d.lat = r.lat AND d.lng = r.lng
  `);

  return tiles;
}
