import sql from "mssql";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} ortam değişkeni tanımlı değil. Vercel → Settings → Environment Variables bölümünden ekleyin.`
    );
  }
  return value;
}

function getConfig(): sql.config {
  return {
    server: requireEnv("DB_HOST"),
    port: Number(process.env.DB_PORT || "1433"),
    database: requireEnv("DB_DATABASE"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (pool?.connected) {
    return pool;
  }

  pool = await new sql.ConnectionPool(getConfig()).connect();

  console.log("✅ SQL Server Connected");

  return pool;
}

export { sql };
