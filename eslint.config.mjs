import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Restrict scanning to the real Next project (this repo root),
  // and avoid accidental duplicate project scanning.
  globalIgnores([
    "**/.next/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.vercel/**",
    "**/out/**",
    "**/uploads/**",
    "**/next-env.d.ts",
    // Nested duplicate Next project (ignore to prevent ESLint hangs / duplicate scanning)
    "nxteraa-website/**",
    // Common generated folders
    "**/generated/**",
  ]),
]);

export default eslintConfig;

