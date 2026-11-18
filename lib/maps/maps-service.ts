export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  rating?: number;
  cuisine?: string;
  slug?: string;
  image?: string;
}

export class MapsService {
  // Tile URLs for free and open map rendering
  getTileUrl(): string {
    return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  }

  getAttribution(): string {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  }

  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Earth radius in km
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}

export const mapsService = new MapsService();
export default mapsService;
