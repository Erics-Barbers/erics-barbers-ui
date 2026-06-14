import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "app/**/*.{ts,tsx}",
      "api/repositories/**/*.{ts,tsx}",
      "proxy.ts",
      "test/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/api/generated",
              importNames: ["AuthService"],
              message:
                "Keep generated auth client calls out of browser auth flows. Use generated DTO types only, and keep auth behavior in BFF route handlers or a server-only auth helper.",
            },
            {
              name: "../generated",
              importNames: ["AuthService"],
              message:
                "Keep generated auth client calls out of browser auth flows. Use generated DTO types only, and keep auth behavior in BFF route handlers or a server-only auth helper.",
            },
            {
              name: "../../generated",
              importNames: ["AuthService"],
              message:
                "Keep generated auth client calls out of browser auth flows. Use generated DTO types only, and keep auth behavior in BFF route handlers or a server-only auth helper.",
            },
            {
              name: "@/api/generated/services/AuthService",
              message:
                "Keep generated auth client calls out of browser auth flows. Use generated DTO types only, and keep auth behavior in BFF route handlers or a server-only auth helper.",
            },
            {
              name: "../generated/services/AuthService",
              message:
                "Keep generated auth client calls out of browser auth flows. Use generated DTO types only, and keep auth behavior in BFF route handlers or a server-only auth helper.",
            },
            {
              name: "../../generated/services/AuthService",
              message:
                "Keep generated auth client calls out of browser auth flows. Use generated DTO types only, and keep auth behavior in BFF route handlers or a server-only auth helper.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
