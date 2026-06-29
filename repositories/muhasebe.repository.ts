import { getPool, sql } from "@/lib/db";
import { LogoMuhasebe } from "@/types/logo";

export async function findMuhasebeByCode(
  firm: string,
  code: string
): Promise<LogoMuhasebe | null> {
  const pool = await getPool();

  const tableName = `LG_${firm}_EMUHACC`;

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
