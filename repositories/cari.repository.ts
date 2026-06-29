import { getPool, sql } from "@/lib/db";
import { LogoCari } from "@/types/logo";

export async function findCariByCode(
  firm: string,
  code: string
): Promise<LogoCari | null> {
  const pool = await getPool();

  const tableName = `LG_${firm}_CLCARD`;

  const result = await pool
    .request()
    .input("code", sql.VarChar, code)
    .query(`
      SELECT TOP 1
        LOGICALREF AS logicalRef,
        CODE AS code,
        DEFINITION_ AS definition
      FROM ${tableName}
      WHERE LTRIM(RTRIM(CODE)) = LTRIM(RTRIM(@code))
    `);

  return result.recordset[0] ?? null;
}
