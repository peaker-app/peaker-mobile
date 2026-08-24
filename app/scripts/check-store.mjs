import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const listingsDir = join(root, "store", "listings");

const limits = {
  name: 30,
  subtitle: 30,
  shortDescription: 80,
  promotionalText: 170,
  keywords: 100,
  description: 4000,
  privacyPolicyUrl: 200,
};

const required = Object.keys(limits);

const parse = (text) => {
  const fields = {};

  for (const block of text.split(/^## /m).slice(1)) {
    const newline = block.indexOf("\n");
    fields[block.slice(0, newline).trim()] = block.slice(newline + 1).trim();
  }

  return fields;
};

const findings = [];
const files = readdirSync(listingsDir).filter((name) => name.endsWith(".md"));

for (const file of files) {
  const fields = parse(readFileSync(join(listingsDir, file), "utf8"));

  for (const key of required) {
    const value = fields[key];

    if (value === undefined || value === "") {
      findings.push(`${file}: falta "${key}"`);
      continue;
    }

    if ([...value].length > limits[key]) {
      findings.push(
        `${file}: "${key}" ocupa ${[...value].length} y el limite es ${limits[key]}`,
      );
    }
  }

  if (fields.keywords?.includes(", ")) {
    findings.push(`${file}: "keywords" no admite espacios tras las comas`);
  }
}

if (files.length === 0) {
  findings.push("No hay ninguna ficha en store/listings/");
}

if (findings.length > 0) {
  console.error("Fichas de tienda fuera de norma:");
  for (const finding of findings) {
    console.error(`  ${finding}`);
  }
  process.exit(1);
}

console.log(`Fichas correctas: ${files.length} idiomas dentro de los limites.`);
