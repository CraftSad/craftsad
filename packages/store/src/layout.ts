export function layoutText(value: string, lengthMm: number, heightMm: number) {
  const words = value.trim().split(/\s+/u);
  const maxChars = Math.max(8, Math.floor((lengthMm - 12) / 5.5));
  let lines = [value.trim()];
  if (value.length > maxChars && words.length > 1) {
    let best = 1;
    for (let i = 2; i < words.length; i++)
      if (Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length) < Math.abs(words.slice(0, best).join(" ").length - words.slice(best).join(" ").length)) best = i;
    lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const longest = Math.max(...lines.map((line) => [...line].length));
  const byWidth = (lengthMm - 12) / (longest * 0.62);
  const byHeight = (heightMm - 6) / (lines.length === 2 ? 2.5 : 1.3);
  if (Math.min(byWidth, byHeight) < 3) throw new Error(`Название сорта слишком длинное: ${value}`);
  return { lines, fontSize: Math.min(12, byWidth, byHeight) };
}
