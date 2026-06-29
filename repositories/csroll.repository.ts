import { sql } from "@/lib/db";
import { ValidatedCheckRow } from "@/types/validation";

export async function createCsRoll(
  transaction: sql.Transaction,
  firm: string,
  period: string,
  rows: ValidatedCheckRow[]
) {
  const table = `LG_${firm}_${period}_CSROLL`;
  const now = new Date();

  const firstRow = rows[0];
  const total = rows.reduce((sum, row) => sum + Number(row.tutar || 0), 0);
  const docCount = rows.length;

  const rollNo = String(Date.now()).slice(-4);
  const description = `${firstRow.cari!.definition} ÇEK GİRİŞİ`.slice(0, 50);

  const result = await transaction
    .request()
    .input("cardRef", sql.Int, firstRow.cari!.logicalRef)
    .input("rollNo", sql.VarChar(17), rollNo)
    .input("date", sql.DateTime, new Date(firstRow.tarih))
    .input("total", sql.Float, total)
    .input("docCnt", sql.Int, docCount)
    .input("reportRate", sql.Float, 1)
    .input("reportNet", sql.Float, total)
    .input("genExp1", sql.VarChar(51), description)
    .input("accRef", sql.Int, firstRow.muhasebe!.logicalRef)
    .input("now", sql.DateTime, now)
    .query(`
      INSERT INTO ${table} (
        CARDREF, CENTERREF, ROLLNO, DATE_, TRCODE,
        BRANCH, DEPARTMENT, DESTBRANCH, DESTDEPARTMENT,
        CARDMD, PROCTYPE, ONEPAYLINE, FROMCASH, ACCOUNTED,
        AVERAGEAGE, DOCCNT, PRINTCNT, TOTAL,
        TRCURR, TRRATE, TRNET, REPORTRATE, REPORTNET,
        GENEXP1, ACCFICHEREF, CASHTRANSREF, ACCREF,
        CAPIBLOCK_CREATEDBY, CAPIBLOCK_CREADEDDATE,
        CAPIBLOCK_CREATEDHOUR, CAPIBLOCK_CREATEDMIN, CAPIBLOCK_CREATEDSEC,
        CANCELLED, CANCELLEDACC, GENEXCTYP, LINEEXCTYP, TEXTINC,
        SITEID, RECSTATUS, ORGLOGICREF, WFSTATUS, OPSTAT,
        INFIDX, PROJECTREF, AFFECTCOLLATRL, COLLATROLLREF,
        GRPFIRMTRANS, AFFECTRISK, BNCREREF, FROMBANK,
        DEGACTIVE, DEGCURR, DEGCURRRATE, APPROVE,
        DEGACTIVE2, DEGCURR2, DEGCURRRATE2, SALESMANREF,
        GUID, STATUS, FROMPARTIALCSPAY
      )
      OUTPUT INSERTED.LOGICALREF
      VALUES (
        @cardRef, 0, @rollNo, @date, 1,
        0, 0, 0, 0,
        5, 0, 0, 0, 1,
        0, @docCnt, 0, @total,
        0, 1, @total, @reportRate, @reportNet,
        @genExp1, 0, 0, @accRef,
        1, @now,
        DATEPART(HOUR, @now), DATEPART(MINUTE, @now), DATEPART(SECOND, @now),
        0, 0, 1, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        NEWID(), 0, 0
      )
    `);

  return result.recordset[0].LOGICALREF as number;
}