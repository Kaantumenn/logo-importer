import { getPool, sql } from "@/lib/db";
import { ValidatedCheckRow } from "@/types/validation";
import { createCsRoll } from "@/repositories/csroll.repository";
import { createCsCard } from "@/repositories/cscard.repository";
import { createCsTrans } from "@/repositories/cstrans.repository";

export async function importChecks(
  firm: string,
  period: string,
  rows: ValidatedCheckRow[]
) {
  const validRows = rows.filter((row) => row.isValid && row.cari && row.muhasebe);

  if (validRows.length === 0) {
    throw new Error("Aktarılacak geçerli satır bulunamadı.");
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  const imported: {
    rowIndex: number;
    seriNo: string;
    rollRef: number;
    csRef: number;
  }[] = [];

  try {
    await transaction.begin();

    // 1 adet bordro oluştur
    const rollRef = await createCsRoll(transaction, firm, period, validRows);

    // Tüm çekleri aynı bordroya bağla
    for (const row of validRows) {
      const csRef = await createCsCard(transaction, firm, period, row);

      await createCsTrans(transaction, firm, period, row, csRef, rollRef);

      imported.push({
        rowIndex: row.rowIndex,
        seriNo: row.seriNo,
        rollRef,
        csRef,
      });
    }

    await transaction.commit();

    return {
      total: validRows.length,
      rollRef,
      imported,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}