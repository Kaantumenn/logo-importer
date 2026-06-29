export function incrementRollno(current: string): string {
  const next = Number.parseInt(current, 10) + 1;
  return next.toString().padStart(8, "0");
}

export function incrementPortfoyno(current: string): string {
  const match = current.match(/^(.+?)(\d+)$/);
  if (!match) return `${current}1`;

  const [, prefix, numStr] = match;
  const next = (Number.parseInt(numStr, 10) + 1)
    .toString()
    .padStart(numStr.length, "0");

  return `${prefix}${next}`;
}
