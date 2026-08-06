import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "scripts", "shared-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const portalRoot = join(root, manifest.portalRoot);
const update = process.argv.includes("--update");
const strict = process.argv.includes("--strict");

const digest = (path) =>
  createHash("sha256")
    .update(readFileSync(path, "utf8").replaceAll("\r\n", "\n"))
    .digest("hex");

const classify = (entry) => {
  const local = join(root, entry.path);
  const source = join(portalRoot, entry.path);

  if (!existsSync(local)) {
    return { level: "error", text: "no está vendorizado" };
  }

  if (!existsSync(source)) {
    return { level: "warn", text: "el origen ya no existe en el portal" };
  }

  const localHash = digest(local);
  const sourceHash = digest(source);

  if (localHash === sourceHash) {
    return { level: "ok", sourceHash };
  }

  if (!entry.divergence) {
    return { level: "error", text: "diverge del portal sin anotar", sourceHash };
  }

  if (entry.sourceSha256 && entry.sourceSha256 !== sourceHash) {
    return {
      level: "warn",
      text: `el origen cambió tras anotar la divergencia — revisar «${entry.divergence}»`,
      sourceHash,
    };
  }

  return { level: "ok", annotated: true, sourceHash };
};

if (!existsSync(portalRoot)) {
  console.log(
    `Portal no disponible en ${manifest.portalRoot}; comprobación omitida.`,
  );
  process.exit(0);
}

const findings = [];
let annotated = 0;

for (const entry of manifest.files) {
  const result = classify(entry);

  if (update && result.sourceHash && entry.divergence) {
    entry.sourceSha256 = result.sourceHash;
  }

  if (result.level === "ok") {
    annotated += result.annotated ? 1 : 0;
    continue;
  }

  findings.push({ level: result.level, line: `${entry.path} — ${result.text}` });
}

if (update) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Manifiesto actualizado con ${manifest.files.length} entradas.`);
  process.exit(0);
}

for (const finding of findings) {
  console.error(`  [${finding.level}] ${finding.line}`);
}

const errors = findings.filter((finding) => finding.level === "error").length;

console.log(
  `${manifest.files.length} ficheros vendorizados: ${
    manifest.files.length - findings.length
  } al día (${annotated} con divergencia anotada), ${findings.length} a revisar.`,
);

process.exit(strict && errors > 0 ? 1 : 0);
