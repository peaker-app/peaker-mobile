import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceLocale = "en";
const targetLocales = ["es", "zh", "fr", "ar"];

const load = (locale) => ({
  ...JSON.parse(readFileSync(join(root, "messages", `${locale}.json`), "utf8")),
  ...JSON.parse(
    readFileSync(join(root, "messages", "legal", `${locale}.json`), "utf8"),
  ),
});

const flatten = (value, prefix = "") =>
  typeof value === "object" && value !== null
    ? Object.entries(value).flatMap(([key, nested]) =>
        flatten(nested, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

const difference = (a, b) => a.filter((key) => !b.includes(key));

const sourceKeys = flatten(load(sourceLocale)).sort();
const failures = [];

for (const locale of targetLocales) {
  const localeKeys = flatten(load(locale)).sort();
  const missing = difference(sourceKeys, localeKeys);
  const extra = difference(localeKeys, sourceKeys);

  if (missing.length > 0) {
    failures.push(`${locale}.json — faltan ${missing.length}: ${missing.join(", ")}`);
  }

  if (extra.length > 0) {
    failures.push(`${locale}.json — sobran ${extra.length}: ${extra.join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error("Paridad de diccionarios rota:");
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Paridad correcta: ${sourceKeys.length} claves en ${targetLocales.length + 1} idiomas.`,
);
