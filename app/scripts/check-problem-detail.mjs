import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "src");
const allowlist = ["src/lib/api/problem.ts"];

const forbidden = /\bproblem(?:Details)?\??\.detail\b|\.detail\s*}/gi;

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return walk(path);
    }

    return /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path) ? [path] : [];
  });

const findings = [];

for (const file of walk(sourceDir)) {
  const relative = file.slice(root.length + 1).replaceAll("\\", "/");

  if (allowlist.includes(relative)) {
    continue;
  }

  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      for (const match of line.matchAll(forbidden)) {
        findings.push(`${relative}:${index + 1} "${match[0].trim()}"`);
      }
    });
}

if (findings.length > 0) {
  console.error(
    "ProblemDetails.detail usado fuera de problem.ts (FRONTEND.md §1.4.5):",
  );
  for (const finding of findings) {
    console.error(`  ${finding}`);
  }
  process.exit(1);
}

console.log("ProblemDetails.detail no se renderiza en ningún sitio.");
