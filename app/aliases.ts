import { fileURLToPath } from "node:url";

const resolve = (relative: string): string =>
  fileURLToPath(new URL(relative, import.meta.url));

export const moduleAliases: { find: string | RegExp; replacement: string }[] = [
  { find: "@", replacement: resolve("./src") },
  { find: /^next-intl$/, replacement: resolve("./src/shims/next-intl.ts") },
  { find: /^next\/image$/, replacement: resolve("./src/shims/next-image.tsx") },
  {
    find: /^next\/dynamic$/,
    replacement: resolve("./src/shims/next-dynamic.tsx"),
  },
];
