import { incrementPortfoyno, incrementRollno } from "@/lib/logo-ids";
import { LOGO_PERIOD } from "@/lib/logo-constants";
import { getLogoSequences } from "@/repositories/sequence.repository";
import {
  SimulatedCheckRecord,
  SimulatedField,
  SimulationResult,
} from "@/types/simulation";
import { ValidatedCheckRow } from "@/types/validation";

const CUSTOMER_CHECK_TRCODE = 1;

function field(
  name: string,
  value: string | number | null,
  note?: string
): SimulatedField {
  return { field: name, value, note };
}

export async function simulateCheckImport(
  firm: string,
  rows: ValidatedCheckRow[]
): Promise<SimulationResult> {
  const validRows = rows.filter((row) => row.isValid);
  const sequences = await getLogoSequences(firm, LOGO_PERIOD);

  let nextCscardRef = sequences.maxCscard + 1;
  let nextCsrollRef = sequences.maxCsroll + 1;
  let nextCstransRef = sequences.maxCstrans + 1;
  let nextRollno = sequences.lastRollno;
  let nextPortfoyno = sequences.lastPortfoyno;

  const simulatedRows: SimulatedCheckRecord[] = validRows.map((row) => {
    nextRollno = incrementRollno(nextRollno);
    nextPortfoyno = incrementPortfoyno(nextPortfoyno);

    const cscardRef = nextCscardRef++;
    const csrollRef = nextCsrollRef++;
    const cstransRef = nextCstransRef++;

    const cariRef = row.cari?.logicalRef ?? null;
    const muhasebeRef = row.muhasebe?.logicalRef ?? null;

    const cscard: SimulatedField[] = [
      field("LOGICALREF", cscardRef, "Yeni oluşacak"),
      field("PORTFOYNO", nextPortfoyno),
      field("OWING", row.borclu),
      field("BANKNAME", row.banka),
      field("CITY", row.sehir),
      field("NEWSERINO", row.seriNo),
      field("TAXNR", row.vergiNo),
      field("AMOUNT", row.tutar),
      field("DUEDATE", row.vade),
      field("SETDATE", row.tarih),
      field("DOC", 1),
      field("CURRSTAT", 1),
      field("INUSE", 1),
    ];

    const csroll: SimulatedField[] = [
      field("LOGICALREF", csrollRef, "Yeni oluşacak"),
      field("ROLLNO", nextRollno),
      field("TRCODE", CUSTOMER_CHECK_TRCODE),
      field("DOCCNT", 1),
      field("TOTAL", row.tutar),
      field("DATE_", row.tarih),
    ];

    const cstrans: SimulatedField[] = [
      field("LOGICALREF", cstransRef, "Yeni oluşacak"),
      field("CSREF", cscardRef, "CSCARD referansı"),
      field("ROLLREF", csrollRef, "CSROLL referansı"),
      field("TRCODE", CUSTOMER_CHECK_TRCODE),
      field("CARDREF", cariRef, "Cari ref"),
      field("ACCREF", muhasebeRef, "Muhasebe ref"),
      field("CLACCREF", cariRef, "Cari ref"),
      field("DATE_", row.tarih),
      field("STATNO", 1),
      field("LINENO_", 1),
      field("STATUS", 1),
      field("CARDMD", 5),
      field("AFFECTRISK", 1),
    ];

    return {
      rowIndex: row.rowIndex,
      seriNo: row.seriNo,
      borclu: row.borclu,
      cscard,
      csroll,
      cstrans,
    };
  });

  return {
    firm,
    period: LOGO_PERIOD,
    sequences,
    rows: simulatedRows,
  };
}
