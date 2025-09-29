export type PxParseResult = {
  values: number[];      // numeric series in DATA order
  categories: string[];  // years or time labels if present (may be empty)
  rawDataBlock?: string; // raw DATA block string
};

/**
 * Parse PX text (SCB .px format) and extract numeric DATA tokens and year/category labels.
 * - Extracts DATA= ... ; block and returns numeric tokens as numbers (handles comma decimals).
 * - Attempts to extract VALUES("år") or TIMEVAL("år") as category labels.
 */
export function parsePxToSeries(pxText: string): PxParseResult {
  if (!pxText) return { values: [], categories: [], rawDataBlock: "" };

  // DATA block (scan entire text)
  const dataMatch = /DATA\s*=\s*([\s\S]*?);/i.exec(pxText);
  const rawDataBlock = dataMatch ? dataMatch[1].replace(/[\r\n]+/g, " ").trim() : "";
  console.log("Extracted rawDataBlock:", rawDataBlock);
  // numeric tokens from DATA
  const values = rawDataBlock
    .split(/\s+/)
    .filter((t) => /^[-+]?\d+(?:[.,]\d+)?$/.test(t))
    .map((t) => Number(t.replace(",", ".")));

  // Find first matching pattern and extract labels
  const match = /VALUES\(\s*["']?(?:år|�r)["']?\s*\)\s*=\s*([^;]+);/iu.exec(pxText) ||
                /TIMEVAL\(\s*["']?(?:år|�r)["']?\s*\)\s*=\s*([^;]+);/iu.exec(pxText) ||
                /CODES\(\s*["']?(?:år|�r)["']?\s*\)\s*=\s*([^;]+);/iu.exec(pxText) ||
                /nCODES\(\s*["']?(?:år|�r)["']?\s*\)\s*=\s*([^;]+);/iu.exec(pxText);

  const rawLabels = match ? match[1].replace(/[\r\n]+/g, " ").trim() : "";
  const categories = rawLabels ? rawLabels.split(",").map(s => s.trim().replace(/^["']|["']$/g, "")) : [];

  return { values, categories, rawDataBlock };
}