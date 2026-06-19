import { PrismaClient } from "@prisma/client";

/**
 * Supabase's transaction pooler (PgBouncer, port 6543) does not support
 * prepared statements, which Prisma uses by default — causing errors like
 * `42P05: prepared statement "s1" already exists`. Appending `pgbouncer=true`
 * tells Prisma to disable prepared statements. We only add it for pooler
 * connections so local dev (direct connection) is unaffected.
 */
function buildDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  const usesPooler = url.includes(":6543") || url.includes("pooler.supabase");
  if (usesPooler && !/[?&]pgbouncer=true/.test(url)) {
    return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
  return url;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: buildDatabaseUrl(),
    },
  },
  log: ["error"],
});

export default prisma;
