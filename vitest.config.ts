import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";

// Two projects: the client's pure logic in jsdom, and the API inside the real
// Workers runtime with a fresh local D1 database for every test.
export default defineConfig(async () => {
  const migrations = await readD1Migrations("./migrations");
  return {
    test: {
      projects: [
        {
          test: { name: "client", environment: "jsdom", include: ["src/**/*.test.ts"] },
        },
        {
          plugins: [
            cloudflareTest({
              wrangler: { configPath: "./wrangler.jsonc" },
              miniflare: { bindings: { TEST_MIGRATIONS: migrations } },
            }),
          ],
          test: { name: "worker", include: ["worker/**/*.test.ts"], setupFiles: ["./worker/applyMigrations.ts"] },
        },
      ],
    },
  };
});
