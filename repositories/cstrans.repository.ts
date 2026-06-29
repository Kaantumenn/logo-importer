import { sql } from "@/lib/db";
import { ValidatedCheckRow } from "@/types/validation";

export async function createCsTrans(
  transaction: sql.Transaction,
  firm: string,
  period: string,
  row: ValidatedCheckRow,
  csRef: number,
  rollRef: number
) {
  const table = `LG_${firm}_${period}_CSTRANS`;

  await transaction
    .request()
    .input("date", sql.DateTime, new Date(row.tarih))
    .input("csRef", sql.Int, csRef)
    .input("rollRef", sql.Int, rollRef)
    .input("cardRef", sql.Int, row.cari!.logicalRef)
    .input("accRef", sql.Int, row.muhasebe!.logicalRef)
    .query(`
      INSERT INTO ${table} (
        DATE_, CSREF, ROLLREF, TRCODE, ACCOUNTED, DEVIR,
        STATUS, CARDMD, CARDREF, STATNO, LINENO_,
        ACCREF, COSTREF, CRSACCREF, CRSCOSTREF,
        FROMCASH, CANCELLED, LINEEXCTYP, OPSTAT,
        SITEID, RECSTATUS, ORGLOGICREF,
        PROVLNACCREF, PROVLNCOSTREF,
        AFFECTCOLLATRL, AFFECTRISK, USEGIRORATE,
        FROMBANK, USERAISEDVAL, CLACCREF, CLCOSTREF,
        GUID, BNCREREF
      )
      VALUES (
        @date, @csRef, @rollRef, 1, 0, 0,
        1, 5, @cardRef, 2, 1,
        @accRef, 0, 0, 0,
        0, 0, 0, 0,
        0, 1, 0,
        0, 0,
        0, 1, 0,
        0, 0, @accRef, 0,
        NEWID(), 0
      )
    `);
}
