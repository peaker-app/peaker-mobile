/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_MAP_TILE_URL?: string;
  readonly VITE_MAP_ATTRIBUTION?: string;
  readonly VITE_MAP_PROVIDER_NAME?: string;
  readonly VITE_MAP_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
