import { CheckExcelRow } from "@/types/excel";
import { LogoCari, LogoMuhasebe } from "@/types/logo";

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidatedCheckRow = CheckExcelRow & {
  rowIndex: number;
  cari: LogoCari | null;
  muhasebe: LogoMuhasebe | null;
  errors: ValidationError[];
  isValid: boolean;
};

export type ValidationSummary = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
};
