export const LOGO_PERIOD = "01";

export const LOGO_FIRMS = [
  { code: "760", label: "AS Çimento" },
  { code: "766", label: "Aşçim" },
] as const;

export type LogoFirmCode = (typeof LOGO_FIRMS)[number]["code"];

export function logoTableName(
  firm: string,
  table: "CSCARD" | "CSROLL" | "CSTRANS",
  period: string = LOGO_PERIOD
) {
  return `LG_${firm}_${period}_${table}`;
}
