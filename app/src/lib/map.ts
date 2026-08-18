export const defaultTileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const defaultAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const tileUrl = (): string =>
  import.meta.env.VITE_MAP_TILE_URL || defaultTileUrl;

export const tileAttribution = (): string =>
  import.meta.env.VITE_MAP_ATTRIBUTION || defaultAttribution;

export const worldView = { latitude: 20, longitude: 0, zoom: 2 } as const;
export const detailZoom = 11;
export const maxTileZoom = 19;

export const minLatitude = -90;
export const maxLatitude = 90;
export const minLongitude = -180;
export const maxLongitude = 180;
export const minRadiusMeters = 1000;
export const maxRadiusMeters = 50_000;
export const radiusStepMeters = 1000;
export const defaultRadiusMeters = 25_000;

export const isLatitude = (value: number): boolean =>
  Number.isFinite(value) && value >= minLatitude && value <= maxLatitude;

export const isLongitude = (value: number): boolean =>
  Number.isFinite(value) && value >= minLongitude && value <= maxLongitude;

export const isRadius = (value: number): boolean =>
  Number.isFinite(value) && value > 0 && value <= maxRadiusMeters;

export const clampRadius = (value: number): number =>
  Math.min(Math.max(value, minRadiusMeters), maxRadiusMeters);
