'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';

type CoachMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  ratingAvg: number;
};

type Props = {
  coaches: CoachMarker[];
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export function CoachMap({ coaches }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [coaches[0]?.longitude ?? -118.5, coaches[0]?.latitude ?? 33.9],
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl());

    coaches.forEach((coach) => {
      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<strong>${coach.name}</strong><br/>$${coach.pricePerHour.toFixed(0)}/hr · ⭐️${coach.ratingAvg.toFixed(1)}`,
      );
      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([coach.longitude, coach.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [coaches]);

  return <div ref={mapContainer} className="h-[420px] w-full rounded-2xl" aria-label="Coach map" />;
}
