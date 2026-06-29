import { sql } from "@/lib/db";
import { ValidatedCheckRow } from "@/types/validation";

export async function createCsCard(
  transaction: sql.Transaction,
  firm: string,
  period: string,
  row: ValidatedCheckRow
) {
  const table = `LG_${firm}_${period}_CSCARD`;
  const now = new Date();

  const result = await transaction
    .request()
    .input("portfoyNo", sql.NVarChar, row.seriNo)
    .input("bankName", sql.NVarChar, row.banka)
    .input("city", sql.NVarChar, row.sehir)
    .input("owing", sql.NVarChar, row.borclu)
    .input("dueDate", sql.DateTime, new Date(row.vade))
    .input("setDate", sql.DateTime, new Date(row.tarih))
    .input("amount", sql.Float, row.tutar)
    .input("taxNr", sql.NVarChar, row.vergiNo)
    .input("now", sql.DateTime, now)
    .query(`
      INSERT INTO ${table} (
        DOC, CURRSTAT, OURBANKREF, PORTFOYNO, SERINO,
        BANKNAME, CITY, OWING, BRANCH, DUEDATE, SETDATE,
        STAMP, AMOUNT, TRCURR, TRRATE, TRNET, REPORTRATE, REPORTNET,
        RISKUPDATE, DEVIR, INUSE, EXTENREF,
        CAPIBLOCK_CREATEDBY, CAPIBLOCK_CREADEDDATE,
        CAPIBLOCK_CREATEDHOUR, CAPIBLOCK_CREATEDMIN, CAPIBLOCK_CREATEDSEC,
        COLLREPRATE, COLLTRRATE, CANCELLED, LINEEXCTYP, TEXTINC,
        SITEID, RECSTATUS, ORGLOGICREF, WFSTATUS, OPSTAT,
        PRINTCNT, NEWSERINO, PROJECTREF,
        AFFECTCOLLATRL, COLLATROLLREF, COLLATCARDREF, AFFECTRISK,
        GIROREPRATE, GIROTRRATE, GIROAMOUNT, GIROREPNET, USEGIRORATE,
        TAXNR, USERAISEDVAL, RAISEDVALAMOUNT, RAISEDVALREPNET,
        SALESMANREF, SUBDURATION, DEGACTIVE, DEGCURR, DEGCURRRATE,
        CIRO, GUID, OFFERREF, BNCREREF, STATUS, PARTIAL_
      )
      OUTPUT INSERTED.LOGICALREF
      VALUES (
        1, 1, 0, @portfoyNo, '',
        @bankName, @city, @owing, 0, @dueDate, @setDate,
        0, @amount, 0, 1, @amount, 1, @amount,
        0, 0, 1, 0,
        1, @now,
        DATEPART(HOUR, @now), DATEPART(MINUTE, @now), DATEPART(SECOND, @now),
        0, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, @portfoyNo, 0,
        0, 0, 0, 1,
        0, 0, 0, 0, 0,
        @taxNr, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, NEWID(), 0, 0, 0, 0
      )
    `);

  return result.recordset[0].LOGICALREF as number;
}
