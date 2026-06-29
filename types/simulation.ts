export type SimulatedField = {
  field: string;
  value: string | number | null;
  note?: string;
};

export type SimulatedCheckRecord = {
  rowIndex: number;
  seriNo: string;
  borclu: string;
  cscard: SimulatedField[];
  csroll: SimulatedField[];
  cstrans: SimulatedField[];
};

export type LogoSequences = {
  maxCscard: number;
  maxCsroll: number;
  maxCstrans: number;
  lastRollno: string;
  lastPortfoyno: string;
};

export type SimulationResult = {
  firm: string;
  period: string;
  sequences: LogoSequences;
  rows: SimulatedCheckRecord[];
};
