import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const openStreetMapHost = "tile.openstreetmap.org";
const openStreetMapName = "OpenStreetMap";
const tilePlaceholders = ["{z}", "{x}", "{y}"];

const parseEnvFile = (path) => {
  if (!existsSync(path)) {
    return {};
  }

  const values = {};

  for (const line of readFileSync(path, "utf8").replace(/^\uFEFF/, "").split("\n")) {
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator > 0) {
      values[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
    }
  }

  return values;
};

const fromEnvFiles = {
  ...parseEnvFile(join(root, ".env")),
  ...parseEnvFile(join(root, ".env.local")),
};

const resolve = (key) => (process.env[key] ?? fromEnvFiles[key] ?? "").trim();

const tileUrl = resolve("VITE_MAP_TILE_URL");
const attribution = resolve("VITE_MAP_ATTRIBUTION");
const providerName = resolve("VITE_MAP_PROVIDER_NAME");
const disabled = resolve("VITE_MAP_ENABLED") === "false";

const servesOpenStreetMap = tileUrl === "" || tileUrl.includes(openStreetMapHost);
const namesOpenStreetMap =
  providerName === "" || providerName === openStreetMapName;

const contractedProviderFindings = () => {
  const findings = [];

  if (!tileUrl.startsWith("https://")) {
    findings.push(
      "VITE_MAP_TILE_URL — tiene que ser https: Leaflet pide las teselas por el WebView y Android bloquea http:",
    );
  }

  if (!tilePlaceholders.every((placeholder) => tileUrl.includes(placeholder))) {
    findings.push("VITE_MAP_TILE_URL — le faltan los marcadores {z}/{x}/{y}");
  }

  if (attribution === "" || attribution.includes(openStreetMapName)) {
    findings.push(
      "VITE_MAP_ATTRIBUTION — cada proveedor exige la suya, y sigue siendo la de OpenStreetMap",
    );
  }

  if (namesOpenStreetMap) {
    findings.push(
      `VITE_MAP_PROVIDER_NAME — sirves teselas de otro proveedor y los textos legales siguen nombrando a ${openStreetMapName}`,
    );
  }

  return findings;
};

const openStreetMapFindings = () =>
  namesOpenStreetMap
    ? [
        `VITE_MAP_TILE_URL — una app publicada no puede consumir ${openStreetMapHost}: la Tile Usage Policy de la OSMF exige permiso previo`,
      ]
    : [
        `VITE_MAP_PROVIDER_NAME — dice «${providerName}» y las teselas salen de ${openStreetMapName}`,
      ];

if (disabled) {
  console.log("Mapa desactivado: la app no pide ni una tesela.");
  process.exit(0);
}

const findings = servesOpenStreetMap
  ? openStreetMapFindings()
  : contractedProviderFindings();

if (findings.length === 0) {
  console.log(`Teselas de ${providerName}, con su atribución.`);
  process.exit(0);
}

console.error("La app no es publicable con esta configuración de mapa. Pendiente:");

for (const finding of findings) {
  console.error(`  - ${finding}`);
}

console.error(
  "\nDefine esas variables en peaker-mobile/app/.env, o desactiva el mapa con\n" +
    "VITE_MAP_ENABLED=false. El porqué está en .claude/deploy/blockers.md §B5.",
);

process.exit(1);
