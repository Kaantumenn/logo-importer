import { getPool } from "@/lib/db";
import { logoTableName } from "@/lib/logo-constants";
import { LogoSequences } from "@/types/simulation";

export async function getLogoSequences(
  firm: string,
  period: string
): Promise<LogoSequences> {
  const pool = await getPool();

  const cscardTable = logoTableName(firm, "CSCARD", period);
  const csrollTable = logoTableName(firm, "CSROLL", period);
  const cstransTable = logoTableName(firm, "CSTRANS", period);

  const result = await pool.request().query(`
    SELECT
      (SELECT MAX(LOGICALREF) FROM ${cscardTable}) AS maxCscard,
      (SELECT MAX(LOGICALREF) FROM ${csrollTable}) AS maxCsroll,
      (SELECT MAX(LOGICALREF) FROM ${cstransTable}) AS maxCstrans,
      (
        SELECT TOP 1 ROLLNO
        FROM ${csrollTable}
        ORDER BY LOGICALREF DESC
      ) AS lastRollno,
      (
        SELECT TOP 1 PORTFOYNO
        FROM ${cscardTable}
        ORDER BY LOGICALREF DESC
      ) AS lastPortfoyno
  `);

  const row = result.recordset[0];

  return {
    maxCscard: row.maxCscard ?? 0,
    maxCsroll: row.maxCsroll ?? 0,
    maxCstrans: row.maxCstrans ?? 0,
    lastRollno: row.lastRollno ?? "00000000",
    lastPortfoyno: row.lastPortfoyno ?? "M0000001",
  };
}
