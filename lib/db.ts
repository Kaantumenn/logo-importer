import sql from "mssql";

const config: sql.config = {
  server: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate:
      process.env.DB_TRUST_CERT === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (pool?.connected) {
    return pool;
  }

  pool = await new sql.ConnectionPool(config).connect();

  console.log("✅ SQL Server Connected");

  return pool;
}

export { sql };
