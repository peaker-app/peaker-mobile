import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "src");
const extensions = [".ts", ".tsx", ".css"];

const forbidden = [
  { pattern: /(?:^|[\s"'`:{])(?:ml|mr|pl|pr)-[\w[\].%/-]+/g, hint: "usa ms-/me-/ps-/pe-" },
  { pattern: /(?:^|[\s"'`:{])(?:left|right)-[\w[\].%/-]+/g, hint: "usa start-/end-" },
  { pattern: /\btext-(?:left|right)\b/g, hint: "usa text-start/text-end" },
  { pattern: /\bborder-[lr](?:-[\w[\].%/-]+)?(?=$|[\s"'`])/g, hint: "usa border-s/border-e" },
  { pattern: /\brounded-[lr](?:-[\w[\].%/-]+)?(?=$|[\s"'`])/g, hint: "usa rounded-s/rounded-e" },
];

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return walk(path);
    }

    return extensions.some((ext) => path.endsWith(ext)) ? [path] : [];
  });

const findings = [];

for (const file of walk(sourceDir)) {
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, index) => {
    for (const { pattern, hint } of forbidden) {
      for (const match of line.matchAll(pattern)) {
        findings.push(
          `${file.slice(root.length + 1)}:${index + 1} "${match[0].trim()}" — ${hint}`,
        );
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Utilidades direccionales físicas encontradas (FRONTEND.md §1.2.6):");
  for (const finding of findings) {
    console.error(`  ${finding}`);
  }
  process.exit(1);
}

console.log("Sin utilidades direccionales físicas en src/.");
