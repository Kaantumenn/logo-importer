import * as XLSX from "xlsx";
import { CheckExcelRow, RawExcelRow } from "@/types/excel";

function normalizeKey(key: string) {
  return key
    .toString()
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/\s+/g, "");
}

function getValue(row: RawExcelRow, keys: string[]) {
  const normalizedMap = Object.keys(row).reduce<Record<string, unknown>>(
    (acc, key) => {
      acc[normalizeKey(key)] = row[key];
      return acc;
    },
    {}
  );

  for (const key of keys) {
    const value = normalizedMap[normalizeKey(key)];
    if (value !== undefined && value !== null) return value;
  }

  return "";
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  const text = String(value ?? "")
    .replace("₺", "")
    .replace(/\s/g, "")
    .trim();

  if (!text) return 0;

  const hasDot = text.includes(".");
  const hasComma = text.includes(",");

  if (hasDot && hasComma) {
    const lastDot = text.lastIndexOf(".");
    const lastComma = text.lastIndexOf(",");

    // Türk formatı: 340.000,00
    if (lastComma > lastDot) {
      return Number(text.replace(/\./g, "").replace(",", "."));
    }

    // İngiliz formatı: 340,000.00
    return Number(text.replace(/,/g, ""));
  }

  // Sadece nokta varsa: 340.000 => 340000
  if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(text)) {
    return Number(text.replace(/\./g, ""));
  }

  // Sadece virgül varsa: 340,50 => 340.50
  if (hasComma) {
    return Number(text.replace(",", "."));
  }

  return Number(text);
}
function toText(value: unknown) {
  return String(value ?? "").trim();
}

export async function parseCheckExcel(file: File): Promise<CheckExcelRow[]> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rawRows = XLSX.utils.sheet_to_json<RawExcelRow>(sheet, {
    defval: "",
    raw: false,
  });

  return rawRows.map((row) => ({
    vade: toText(getValue(row, ["Vade"])),
    sehir: toText(getValue(row, ["Sehir", "Şehir"])),
    seriNo: toText(getValue(row, ["SeriNo", "Seri No"])),
    borclu: toText(getValue(row, ["Borclu", "Borçlu"])),
    tutar: toNumber(getValue(row, ["Tutar"])),
    banka: toText(getValue(row, ["Banka"])),
    vergiNo: toText(getValue(row, ["VergiNo", "Vergi No"])),
    tarih: toText(getValue(row, ["Tarih"])),
    cariKod: toText(getValue(row, ["CariKod", "Cari Kod"])),
    muhasebeKodu: toText(getValue(row, ["MuhasebeKodu", "Muhasebe Kodu"])),
  }));
}
