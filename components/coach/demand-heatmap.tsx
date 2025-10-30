'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';
import type { DemandTile } from '@/lib/demand';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

type Props = {
  tiles: DemandTile[];
};

export function DemandHeatmap({ tiles }: Props) {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current || !mapboxgl.accessToken) return;
    const map = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [tiles[0]?.lng ?? -118.5, tiles[0]?.lat ?? 33.9],
      zoom: 10.5,
    });

    map.on('load', () => {
      const features = tiles.map((tile) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [tile.lng, tile.lat],
        },
        properties: {
          intensity: tile.score,
          pings: tile.pings,
          pending: tile.pendingRequests,
        },
      }));
      map.addSource('demand', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features,
        },
      });
      map.addLayer({
        id: 'demand-heat',
        type: 'heatmap',
        source: 'demand',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 50, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 14, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            0.2,
            'rgba(103,169,207,0.4)',
            0.4,
            'rgba(209,229,240,0.6)',
            0.6,
            'rgba(253,219,199,0.7)',
            0.8,
            'rgba(239,138,98,0.8)',
            1,
            'rgba(178,24,43,0.9)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 30, 14, 80],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.7, 14, 0.9],
        },
      });
      map.addLayer({
        id: 'demand-point',
        type: 'circle',
        source: 'demand',
        minzoom: 13,
        paint: {
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-color': '#1d4ed8',
          'circle-stroke-color': '#e2e8f0',
        },
      });
    });

    return () => {
      map.remove();
    };
  }, [tiles]);

  return <div ref={container} className="h-[520px] w-full rounded-3xl" aria-label="Demand heatmap" />;
}
