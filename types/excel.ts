export type RawExcelRow = Record<string, unknown>;

export type CheckExcelRow = {
  vade: string;
  sehir: string;
  seriNo: string;
  borclu: string;
  tutar: number;
  banka: string;
  vergiNo: string;
  tarih: string;
  cariKod: string;
  muhasebeKodu: string;
};
