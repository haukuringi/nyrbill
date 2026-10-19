// 'Škoda Enyaq Þór' -> 'skoda-enyaq-thor' (sama regla og í xlsx_i_json.py)
export function slug(texti: string): string {
  let t = texti.toLowerCase();
  for (const [a, b] of Object.entries({ þ: "th", ð: "d", æ: "ae", ö: "o" })) t = t.replaceAll(a, b);
  return t
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
