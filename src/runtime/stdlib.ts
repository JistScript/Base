export type Row = Record<string, unknown>;

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
export const pluck = (rows: Row[], key: string) => rows.map(r => r[key]);
export const where = (rows: Row[], pred: (r: Row) => boolean) => rows.filter(pred);

export function sortBy(rows: Row[], key: string, dir: "asc" | "desc" = "asc"): Row[] {
  const s = dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) =>
    (a[key] as any) > (b[key] as any) ? s : (a[key] as any) < (b[key] as any) ? -s : 0
  );
}

export function groupBy(rows: Row[], key: string): Record<string, Row[]> {
  const out: Record<string, Row[]> = {};
  for (const r of rows) (out[String(r[key])] ??= []).push(r);
  return out;
}

export function summarize(
  groups: Record<string, Row[]>,
  fn: (rows: Row[]) => number
): Record<string, number> {
  return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, fn(v)]));
}

const cell = (v: unknown) => (v == null ? "" : String(v));

export function table(rows: Row[], columns?: string[]): string {
  if (rows.length === 0) return "(no rows)";
  const cols = columns ?? Object.keys(rows[0]);
  const widths = cols.map(c => rows.reduce((m, r) => Math.max(m, cell(r[c]).length), c.length));
  const numeric = cols.map(c => rows.every(r => typeof r[c] === "number"));
  const rule = (l: string, m: string, r: string) =>
    l + widths.map(w => "─".repeat(w + 2)).join(m) + r;
  const line = (vals: string[], header = false) =>
    "│" +
    vals
      .map(
        (v, i) => " " + (numeric[i] && !header ? v.padStart(widths[i]) : v.padEnd(widths[i])) + " "
      )
      .join("│") +
    "│";
  return [
    rule("┌", "┬", "┐"),
    line(cols, true),
    rule("├", "┼", "┤"),
    ...rows.map(r => line(cols.map(c => cell(r[c])))),
    rule("└", "┴", "┘"),
  ].join("\n");
}

export function barChart(data: Record<string, number>, width = 30): string {
  const entries = Object.entries(data);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);
  const labelW = entries.reduce((m, [k]) => Math.max(m, k.length), 0);
  return entries
    .map(
      ([k, v]) => `${k.padEnd(labelW)} │${"█".repeat(max ? Math.round((v / max) * width) : 0)} ${v}`
    )
    .join("\n");
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
export function toHTML(rows: Row[], columns?: string[]): string {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : []);
  const head = cols.map(c => `<th>${esc(c)}</th>`).join("");
  const body = rows
    .map(r => `<tr>${cols.map(c => `<td>${esc(cell(r[c]))}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

// Prints in Node, injects into the DOM if given a selector/element in the browser //
export function render(data: Row[] | Record<string, number>, target?: string | HTMLElement) {
  const isRows = Array.isArray(data);
  if (typeof document !== "undefined" && target) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) el.innerHTML = isRows ? toHTML(data) : `<pre>${esc(barChart(data))}</pre>`;
    return data;
  }
  console.log(isRows ? table(data) : barChart(data));
  return data;
}

export function parseCSV(text: string): Row[] {
  const [head, ...lines] = text
    .trim()
    .split(/\r?\n/)
    .map(l => l.split(","));
  return lines.map(cols =>
    Object.fromEntries(
      head.map((h, i) => [
        h.trim(),
        isNaN(Number(cols[i])) || cols[i] === "" ? cols[i] : Number(cols[i]),
      ])
    )
  );
}
