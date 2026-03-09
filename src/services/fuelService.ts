import { supabase } from '../lib/supabase';
import { FuelStation, FuelType } from '../types';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchStationsWithPrices(fuelType: FuelType): Promise<FuelStation[]> {
  const { data: stations, error: sErr } = await supabase
    .from('fuel_stations')
    .select('*')
    .eq('is_active', true);
  if (sErr) throw sErr;

  const { data: prices, error: pErr } = await supabase
    .from('fuel_prices')
    .select('*');
  if (pErr) throw pErr;

  return (stations ?? []).map(s => {
    const stationPrices: Partial<Record<FuelType, number>> = {};
    (prices ?? []).filter(p => p.station_id === s.id).forEach(p => {
      stationPrices[p.fuel_type as FuelType] = p.price;
    });
    return {
      id: s.id,
      brand: s.brand ?? '',
      name: s.name,
      address: s.address ?? '',
      suburb: s.suburb ?? '',
      state: s.state ?? '',
      lat: s.lat,
      lng: s.lng,
      distance_km: 0,
      prices: stationPrices,
      trend: 'unknown' as const,
      predicted_low_at: null,
      advice: null,
      urgency: 'neutral' as const,
      scraped_at: new Date().toISOString(),
    };
  });
}

export async function getNearbyFuel(
  lat: number,
  lng: number,
  radiusKm: number,
  fuelType: FuelType
): Promise<{ cheapest: FuelStation; stations: FuelStation[] }> {
  const all = await fetchStationsWithPrices(fuelType);
  const nearby = all
    .map(s => ({ ...s, distance_km: haversineKm(lat, lng, s.lat, s.lng) }))
    .filter(s => s.distance_km <= radiusKm && s.prices[fuelType] != null)
    .sort((a, b) => (a.prices[fuelType] ?? 999) - (b.prices[fuelType] ?? 999));
  const cheapest = nearby[0] ?? all[0];
  return { cheapest, stations: nearby };
}

export async function getFuelMapData(bounds: {
  ne_lat: number; ne_lng: number; sw_lat: number; sw_lng: number;
}, fuelType: FuelType, _zoomLevel: number): Promise<FuelStation[]> {
  const all = await fetchStationsWithPrices(fuelType);
  return all.filter(s =>
    s.lat <= bounds.ne_lat && s.lat >= bounds.sw_lat &&
    s.lng <= bounds.ne_lng && s.lng >= bounds.sw_lng
  );
}

export async function getFuelPrediction(_stationId: string, _fuelType: FuelType) {
  return { trend: 'unknown', advice: 'No prediction data available yet.', urgency: 'neutral' };
}
