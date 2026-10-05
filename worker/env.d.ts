declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    AUTH_LIMITER: RateLimit;
    TEST_MIGRATIONS: import("cloudflare:test").D1Migration[];
  }
  // Tells the runtime types which module is the Worker, so tests can call
  // its fetch handler through `exports.default`.
  interface GlobalProps {
    mainModule: typeof import("./index");
  }
}
