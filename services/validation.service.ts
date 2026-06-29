import { CheckExcelRow } from "@/types/excel";
import { ValidatedCheckRow, ValidationSummary } from "@/types/validation";
import { findCariByCode } from "@/repositories/cari.repository";
import { findMuhasebeByCode } from "@/repositories/muhasebe.repository";

export async function validateCheckRows(firm: string, rows: CheckExcelRow[]) {
  const validatedRows: ValidatedCheckRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors = [];

    const cari = row.cariKod ? await findCariByCode(firm, row.cariKod) : null;

    const muhasebe = row.muhasebeKodu
      ? await findMuhasebeByCode(firm, row.muhasebeKodu)
      : null;

    if (!row.seriNo) {
      errors.push({ field: "seriNo", message: "Seri no boş olamaz" });
    }

    if (!row.vade) {
      errors.push({ field: "vade", message: "Vade boş olamaz" });
    }

    if (!row.tutar || row.tutar <= 0) {
      errors.push({ field: "tutar", message: "Tutar 0'dan büyük olmalı" });
    }

    if (!row.cariKod) {
      errors.push({ field: "cariKod", message: "Cari kod boş olamaz" });
    }

    if (row.cariKod && !cari) {
      errors.push({ field: "cariKod", message: "Cari kod Logo'da bulunamadı" });
    }

    if (!row.muhasebeKodu) {
      errors.push({
        field: "muhasebeKodu",
        message: "Muhasebe kodu boş olamaz",
      });
    }

    if (row.muhasebeKodu && !muhasebe) {
      errors.push({
        field: "muhasebeKodu",
        message: "Muhasebe kodu Logo'da bulunamadı",
      });
    }

    validatedRows.push({
      ...row,
      rowIndex: i + 1,
      cari,
      muhasebe,
      errors,
      isValid: errors.length === 0,
    });
  }

  const summary: ValidationSummary = {
    totalRows: validatedRows.length,
    validRows: validatedRows.filter((r) => r.isValid).length,
    invalidRows: validatedRows.filter((r) => !r.isValid).length,
    totalAmount: validatedRows.reduce((sum, row) => sum + row.tutar, 0),
  };

  return {
    summary,
    rows: validatedRows,
  };
}
