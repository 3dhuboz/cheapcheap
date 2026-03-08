import { apiGet } from '../lib/api';
import { FuelStation, FuelType } from '../types';

export async function getNearbyFuel(
  lat: number,
  lng: number,
  radiusKm: number,
  fuelType: FuelType
): Promise<{ cheapest: FuelStation; stations: FuelStation[] }> {
  return apiGet('/fuel/nearby', { lat, lng, radius_km: radiusKm, fuel_type: fuelType });
}

export async function getFuelMapData(bounds: {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
}, fuelType: FuelType, zoomLevel: number): Promise<FuelStation[]> {
  return apiGet('/fuel/map', {
    ne_lat: bounds.ne_lat,
    ne_lng: bounds.ne_lng,
    sw_lat: bounds.sw_lat,
    sw_lng: bounds.sw_lng,
    fuel_type: fuelType,
    zoom_level: zoomLevel,
  });
}

export async function getFuelPrediction(stationId: string, fuelType: FuelType) {
  return apiGet(`/fuel/predict`, { station_id: stationId, fuel_type: fuelType });
}
