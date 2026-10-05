import { applyD1Migrations, env } from "cloudflare:test";
import { beforeEach } from "vitest";
import { useFreshClientIp } from "./testHelpers";

// Each test file starts from the real schema, applied from migrations/, and
// each test from empty tables (the database is shared within a file).
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

beforeEach(async () => {
  useFreshClientIp();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM boards"),
    env.DB.prepare("DELETE FROM sessions"),
    env.DB.prepare("DELETE FROM users"),
  ]);
});
