"use client";

import { useRef, useState } from "react";

const REQUIRED_COLUMNS = ["title", "price"];
const ALL_COLUMNS = [
  "title",
  "brand",
  "category",
  "price",
  "originalPrice",
  "description",
  "imageUrl",
  "sizeSystem",
  "sizes",
  "stock",
  "productType",
  "active",
];

type ParsedRow = {
  raw: Record<string, string>;
  normalized: {
    title: string;
    brand: string | null;
    category: string | null;
    price: number | null;
    originalPrice: number | null;
    description: string | null;
    imageUrl: string | null;
    sizeSystem: string | null;
    sizes: string[] | null;
    stock: number | null;
    productType: string | null;
    active: boolean | null;
  };
  errors: string[];
};

type FailedRow = {
  rowNumber: number;
  reason: string;
};

type ImportResult = {
  successCount: number;
  failureCount: number;
  failures: FailedRow[];
};

type CsvUploadProps = {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
};

function parseCsv(text: string): string[][] {
  // Strip UTF-8 BOM if present
  let content = text;
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    current.push(field);
    field = "";
  };

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      pushField();
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      pushField();
      if (current.length > 1 || current[0]?.trim()) {
        rows.push(current);
      }
      current = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || current.length > 0) {
    pushField();
    if (current.length > 1 || current[0]?.trim()) {
      rows.push(current);
    }
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.trim();
}

function parseBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function parseRows(text: string) {
  const rows = parseCsv(text);
  if (rows.length === 0)
    return { headerError: "CSV is empty.", parsed: [] as ParsedRow[] };

  const headers = rows[0].map((h) => normalizeHeader(h));
  const headerIndex = new Map<string, number>();
  headers.forEach((h, idx) => {
    if (h) headerIndex.set(h, idx);
  });

  const missing = ALL_COLUMNS.filter((col) => !headerIndex.has(col));
  if (missing.length > 0) {
    return {
      headerError: `Missing columns: ${missing.join(", ")}`,
      parsed: [] as ParsedRow[],
    };
  }

  const parsed: ParsedRow[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const raw: Record<string, string> = {};
    for (const col of ALL_COLUMNS) {
      const idx = headerIndex.get(col);
      raw[col] = idx !== undefined ? (row[idx] ?? "").trim() : "";
    }

    const errors: string[] = [];
    const price = raw.price ? Number(raw.price) : null;
    if (price !== null && !Number.isFinite(price)) {
      errors.push("Price must be a number");
    }

    const originalPrice = raw.originalPrice ? Number(raw.originalPrice) : null;
    if (originalPrice !== null && !Number.isFinite(originalPrice)) {
      errors.push("originalPrice must be a number");
    }

    const stock = raw.stock ? Number(raw.stock) : null;
    if (
      stock !== null &&
      (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock))
    ) {
      errors.push("stock must be a non-negative integer");
    }

    for (const required of REQUIRED_COLUMNS) {
      if (!raw[required]) errors.push(`${required} is required`);
    }

    const active = raw.active ? parseBoolean(raw.active) : null;
    if (raw.active && active === null) {
      errors.push("Active must be true or false");
    }

    const sizeSystem = raw.sizeSystem || null;
    const sizes = raw.sizes
      ? raw.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
    if ((sizeSystem && !sizes) || (!sizeSystem && sizes)) {
      errors.push("sizeSystem and sizes must both be provided");
    }

    parsed.push({
      raw,
      normalized: {
        title: raw.title,
        brand: raw.brand || null,
        category: raw.category || null,
        price: price === null || Number.isNaN(price) ? null : price,
        originalPrice:
          originalPrice === null || Number.isNaN(originalPrice)
            ? null
            : originalPrice,
        description: raw.description || null,
        imageUrl: raw.imageUrl || null,
        sizeSystem,
        sizes,
        stock: stock === null || Number.isNaN(stock) ? null : stock,
        productType: raw.productType || null,
        active,
      },
      errors,
    });
  }

  return { headerError: "", parsed };
}

export default function CsvUpload({
  open,
  onClose,
  onImported,
}: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headerError, setHeaderError] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const validRows = rows.filter((row) => row.errors.length === 0);
  const errorRows = rows.filter((row) => row.errors.length > 0);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { headerError: headerErr, parsed } = parseRows(text);
    setHeaderError(headerErr);
    setRows(parsed);
    setFileName(file.name);
    setResult(null);
    setError(null);
  };

  const handleSelectFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void handleFile(files[0]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: validRows.length });

    try {
      const payload = validRows.map((row) => ({
        title: row.normalized.title,
        brand: row.normalized.brand,
        category: row.normalized.category,
        price: row.normalized.price,
        originalPrice: row.normalized.originalPrice,
        description: row.normalized.description,
        imageUrl: row.normalized.imageUrl,
        sizeSystem: row.normalized.sizeSystem,
        sizes: row.normalized.sizes,
        stock: row.normalized.stock,
        productType: row.normalized.productType,
        active: row.normalized.active ?? true,
      }));

      // Show importing state
      setProgress({ current: validRows.length, total: validRows.length });

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError("Import failed. Please try again.");
      } else {
        setResult(json.data as ImportResult);
        if (onImported) onImported();
      }
    } catch {
      setError("Import failed. Please try again.");
    } finally {
      setImporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleReset = () => {
    setFileName("");
    setRows([]);
    setHeaderError("");
    setResult(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Import CSV</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Upload a CSV file to batch create products.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div>
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center text-sm text-zinc-500 hover:border-olive-500 hover:text-olive-700"
            >
              <div className="text-base font-semibold text-zinc-700">
                Upload CSV
              </div>
              <div className="mt-2">Drag & drop or click to select</div>
              {fileName && (
                <div className="mt-3 text-xs text-zinc-500">{fileName}</div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleSelectFile(e.target.files)}
              className="hidden"
            />

            <div className="mt-4 space-y-2 text-xs text-zinc-500">
              <div>Required: title, price.</div>
              <div>Ensure sizeSystem matches sizes if provided.</div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={importing || rows.length === 0}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || validRows.length === 0 || !!headerError}
                className="flex-1 rounded-xl bg-olive-600 px-3 py-2 text-xs font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
              >
                {importing
                  ? `Importing ${progress.current}/${progress.total}...`
                  : "Confirm Import"}
              </button>
            </div>
          </div>

          <div>
            {headerError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {headerError}
              </div>
            )}

            {rows.length > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <div>
                    {validRows.length} valid, {errorRows.length} errors
                  </div>
                </div>

                {importing && progress.total > 0 && (
                  <div className="mt-3 rounded-2xl border border-olive-200 bg-olive-50 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-olive-700 mb-2">
                      <span className="font-semibold">
                        Importing products...
                      </span>
                      <span>
                        {progress.current} / {progress.total}
                      </span>
                    </div>
                    <div className="h-2 bg-olive-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-olive-600 transition-all duration-300"
                        style={{
                          width: `${(progress.current / progress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {result && (
                  <div className="mt-3 rounded-2xl border border-olive-200 bg-olive-50 px-4 py-3">
                    <div className="text-sm font-semibold text-olive-900 mb-2">
                      Import Summary
                    </div>
                    <div className="text-xs text-olive-700 space-y-1">
                      <div>
                        ✓ Success: {result.successCount} products imported
                      </div>
                      <div>✗ Failed: {result.failureCount} rows</div>
                    </div>
                    {result.failures && result.failures.length > 0 && (
                      <div className="mt-3 max-h-32 overflow-auto rounded-lg border border-red-200 bg-red-50">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-red-100 text-red-700">
                            <tr>
                              <th className="px-2 py-1 text-left font-medium">
                                Row
                              </th>
                              <th className="px-2 py-1 text-left font-medium">
                                Reason
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-red-600">
                            {result.failures.map((failure, idx) => (
                              <tr key={idx} className="border-t border-red-200">
                                <td className="px-2 py-1">
                                  {failure.rowNumber}
                                </td>
                                <td className="px-2 py-1">{failure.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-4 max-h-[360px] overflow-auto rounded-2xl border border-zinc-200">
                  <table className="min-w-[900px] w-full text-xs">
                    <thead className="sticky top-0 bg-zinc-50 text-zinc-500">
                      <tr>
                        {ALL_COLUMNS.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-medium"
                          >
                            {col}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left font-medium">
                          errors
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr
                          key={`${row.raw.title}-${idx}`}
                          className={row.errors.length ? "bg-red-50" : ""}
                        >
                          {ALL_COLUMNS.map((col) => (
                            <td key={col} className="px-3 py-2 text-zinc-700">
                              {row.raw[col] || "—"}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-red-600">
                            {row.errors.length ? row.errors.join("; ") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
