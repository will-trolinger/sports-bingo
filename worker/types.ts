export interface Env {
  DB: D1Database;
  AUTH_LIMITER: RateLimit;
}

export interface User {
  id: number;
  username: string;
}

// What Hono's context carries for a request: the bindings, and the user once
// the session middleware has found one.
export interface AppEnv {
  Bindings: Env;
  Variables: { user: User };
}
