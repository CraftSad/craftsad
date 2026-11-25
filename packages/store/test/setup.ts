/**
 * Preloaded by `bun test` (see bunfig.toml) before any test module, so the
 * env-reading modules (`@acme/db`) see a deterministic value instead of
 * whatever a local `.env` contains.
 *
 * Nothing connects to POSTGRES_URL: tests exercise pricing and layout only.
 */
process.env.POSTGRES_URL = "postgres://test:test@localhost:5432/test";
