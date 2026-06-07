import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { apiError, created } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import {
  dedupeCreatorLeadInputs,
  excelRowToCreatorLead,
} from "@/lib/creator-leads";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_IMPORT_ROWS = 500;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new Error("Please upload an Excel or CSV file.");
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new Error("The file is too large. Please keep it under 8 MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = file.name.toLowerCase().endsWith(".csv")
      ? parseCsv(buffer.toString("utf8"))
      : await parseWorkbook(buffer);

    const candidates = rows.slice(0, MAX_IMPORT_ROWS).map(excelRowToCreatorLead);
    const validInputs = dedupeCreatorLeadInputs(candidates.filter(input => input !== null));

    if (!validInputs.length) {
      throw new Error("No importable creator links were found. Please include a link or profile URL column.");
    }

    const leads = await prisma.$transaction(
      validInputs.map(input =>
        prisma.creatorLead.upsert({
          where: {
            workspaceId_profileUrl: {
              workspaceId: workspace.id,
              profileUrl: input.profileUrl,
            },
          },
          update: {
            source: "EXCEL",
            status: "PENDING_ANALYSIS",
            platform: input.platform,
            displayName: input.displayName,
            handle: input.handle,
            city: input.city,
            categories: input.categories ?? [],
            followers: input.followers,
            avgViews: input.avgViews,
            contactEmail: input.contactEmail,
            contactPhone: input.contactPhone,
            contactNotes: input.contactNotes,
            priceMin: input.priceMin,
            priceMax: input.priceMax,
            notes: input.notes,
            rawInput: input.rawInput ?? {},
          },
          create: {
            workspaceId: workspace.id,
            createdById: user.id,
            source: "EXCEL",
            status: "PENDING_ANALYSIS",
            platform: input.platform!,
            profileUrl: input.profileUrl,
            displayName: input.displayName,
            handle: input.handle,
            city: input.city,
            categories: input.categories ?? [],
            followers: input.followers,
            avgViews: input.avgViews,
            contactEmail: input.contactEmail,
            contactPhone: input.contactPhone,
            contactNotes: input.contactNotes,
            priceMin: input.priceMin,
            priceMax: input.priceMax,
            notes: input.notes,
            rawInput: input.rawInput ?? {},
          },
        })
      )
    );

    return created({
      imported: leads.length,
      skipped: rows.length - validInputs.length,
      leads,
    });
  } catch (error) {
    return apiError(error, "Failed to import creator leads.");
  }
}

async function parseWorkbook(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No readable worksheet was found in the Excel file.");
  }

  const headerRow = worksheet.getRow(1);
  const headers = headerRow.values as ExcelJS.CellValue[];
  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      const key = normalizeCellValue(header);
      if (!key) return;
      record[key] = normalizeCellValue(row.getCell(index).value);
    });
    if (Object.values(record).some(value => String(value ?? "").trim())) {
      rows.push(record);
    }
  });

  return rows;
}

function parseCsv(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(line => line.trim());
  const headers = splitCsvLine(lines[0] ?? "").map(item => item.trim());
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    return headers.reduce<Record<string, unknown>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
}

function splitCsvLine(line: string) {
  const output: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }
    if (char === "\"") {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      output.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  output.push(current);
  return output;
}

function normalizeCellValue(value: ExcelJS.CellValue | undefined) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("text" in value && value.text) return String(value.text);
    if ("hyperlink" in value && value.hyperlink) return String(value.hyperlink);
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map(item => item.text).join("");
    }
    if ("result" in value) return normalizeCellValue(value.result as ExcelJS.CellValue);
  }
  return String(value);
}
