import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const punctuationOnlyStrings = [
  "·",
  "—",
  "–",
  "/",
  ":",
  ",",
  ".",
  "…",
  "(",
  ")",
  "«",
  "»",
];

const humanFacingAttributes = [
  "alt",
  "aria-description",
  "aria-label",
  "aria-placeholder",
  "aria-roledescription",
  "aria-valuetext",
  "placeholder",
  "title",
].join("|");

const physicalDirectionUtilities =
  "(^|[\\s\"'`:])(m[lr]|p[lr])-|(^|[\\s\"'`:])(left|right)-|text-(left|right)|border-[lr](-|$|[\\s\"'`])|rounded-[lr](-|$|[\\s\"'`])";

const directionMessage =
  "Utilidad direccional física de Tailwind: usa su equivalente lógico ms-/me-/ps-/pe-/start-/end-/text-start/text-end/border-s/border-e (FRONTEND.md §1.2.6).";

const unshimmedNextModules = [
  "next",
  "next-intl/server",
  "next-intl/navigation",
  "next-intl/routing",
  "next/headers",
  "next/link",
  "next/navigation",
  "next/server",
  "server-only",
].map((name) => ({
  name,
  message:
    "Módulo de Next sin equivalente en móvil. Solo 'next-intl', 'next/image' y 'next/dynamic' están aliasados a src/shims (MOBILE.md §3.1.1).",
}));

const vendoredNextPlugin = {
  rules: {
    "no-img-element": { create: () => ({}) },
  },
};

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "@next/next": vendoredNextPlugin },
    linterOptions: { reportUnusedDisableDirectives: "off" },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      "no-irregular-whitespace": [
        "error",
        { skipStrings: true, skipTemplates: true, skipRegExps: true },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.{ts,tsx}", "src/test/**"],
    plugins: { react },
    settings: { react: { version: "detect" } },
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: punctuationOnlyStrings,
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute[name.name=/^(${humanFacingAttributes})$/] > Literal[value!=""]`,
          message:
            "Texto literal en atributo visible: usa useTranslations (FRONTEND.md §4.1.2).",
        },
        {
          selector: `Literal[value=/${physicalDirectionUtilities}/]`,
          message: directionMessage,
        },
        {
          selector: `TemplateElement[value.raw=/${physicalDirectionUtilities}/]`,
          message: directionMessage,
        },
        {
          selector:
            "MemberExpression[property.name='detail'][object.name=/[Pp]roblem/]",
          message:
            "ProblemDetails.detail nunca se renderiza: es español fijo. Traduce por title con translateProblem (FRONTEND.md §1.4.5).",
        },
      ],
      "no-restricted-imports": ["error", { paths: unshimmedNextModules }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{ts,mjs}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  globalIgnores([
    "dist/**",
    "coverage/**",
    "android/**",
    "ios/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
