import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const legalMessagesDir = join(root, "messages", "legal");
const listingsDir = join(root, "store", "listings");

const marker = "[PENDIENTE";

const required = [
  ["VITE_LEGAL_HOLDER", "nombre o razón social del titular"],
  ["VITE_LEGAL_TAX_ID", "NIF"],
  ["VITE_LEGAL_ADDRESS", "domicilio completo"],
  ["VITE_LEGAL_EMAIL", "correo de contacto"],
];

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

const resolve = (key) => process.env[key] ?? fromEnvFiles[key] ?? "";

const pendingIn = (directory, extension) =>
  readdirSync(directory)
    .filter((file) => file.endsWith(extension))
    .filter((file) => readFileSync(join(directory, file), "utf8").includes(marker));

const findings = [];

for (const [key, description] of required) {
  const value = resolve(key).trim();

  if (value === "") {
    findings.push(`${key} — sin definir (${description})`);
  } else if (value.includes(marker)) {
    findings.push(`${key} — sigue con el marcador (${description})`);
  }
}

for (const file of pendingIn(legalMessagesDir, ".json")) {
  findings.push(`messages/legal/${file} — contiene marcadores sin sustituir`);
}

for (const file of pendingIn(listingsDir, ".md")) {
  findings.push(`store/listings/${file} — privacyPolicyUrl sigue sin dominio real`);
}

if (findings.length === 0) {
  console.log("Ficha del titular, textos legales y fichas de tienda sin marcadores.");
  process.exit(0);
}

console.error("La app no es publicable todavía. Pendiente:");

for (const finding of findings) {
  console.error(`  - ${finding}`);
}

console.error(
  "\nDefine esas variables en peaker-mobile/app/.env y sustituye el dominio en\n" +
    "store/listings/. El detalle está en .claude/docs/LEGAL.md.",
);

process.exit(1);
