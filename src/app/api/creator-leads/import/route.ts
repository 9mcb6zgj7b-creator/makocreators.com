import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { apiError, created } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { attachLeadToCreatorDirectory } from "@/lib/creator-directory";
import {
  dedupeCreatorLeadInputs,
  excelRowToCreatorLead,
  getCreatorLeadDedupeKeys,
  mergeCreatorLeadInputs,
  normalizeCreatorLeadInput,
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
    const isCsv = file.name.toLowerCase().endsWith(".csv");
    const csvText = isCsv ? buffer.toString("utf8") : "";
    const rows = isCsv ? parseCsv(csvText) : await parseWorkbook(buffer);

    const candidates = rows.slice(0, MAX_IMPORT_ROWS).map(excelRowToCreatorLead).filter(input => input !== null);
    const looseInputs = isCsv ? extractLooseContactsFromText(csvText) : extractLooseContactsFromRows(rows);
    const importInputs = candidates.length ? mergeCreatorLeadInputs(candidates) : dedupeCreatorLeadInputs(looseInputs);
    const validInputs = dedupeCreatorLeadInputs(importInputs);

    if (!validInputs.length) {
      throw new Error("No importable creator contacts were found. Please include creator emails or profile URLs.");
    }

    const existingLeadByKey = await getExistingLeadByDedupeKey(workspace.id, validInputs);
    const leads = await prisma.$transaction(
      validInputs.map(input => {
        const existingId = getCreatorLeadDedupeKeys(input)
          .map(key => existingLeadByKey.get(key))
          .find(Boolean);
        const data = {
          source: "EXCEL" as const,
          status: "PENDING_ANALYSIS" as const,
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
        };

        if (existingId) {
          return prisma.creatorLead.update({
            where: { id: existingId },
            data,
          });
        }

        return prisma.creatorLead.upsert({
          where: {
            workspaceId_profileUrl: {
              workspaceId: workspace.id,
              profileUrl: input.profileUrl,
            },
          },
          update: data,
          create: {
            workspaceId: workspace.id,
            createdById: user.id,
            ...data,
            profileUrl: input.profileUrl,
          },
        });
      })
    );

    await attachLeadsToCreatorDirectorySafely(leads, validInputs);

    return created({
      imported: leads.length,
      skipped: Math.max(0, rows.length - leads.length),
      leads,
    });
  } catch (error) {
    return apiError(error, "Failed to import creator leads.");
  }
}

async function attachLeadsToCreatorDirectorySafely(
  leads: Array<{ id: string }>,
  inputs: ReturnType<typeof dedupeCreatorLeadInputs>
) {
  const results = await Promise.allSettled(
    leads.map((lead, index) => attachLeadToCreatorDirectory(inputs[index], lead.id))
  );

  const failedCount = results.filter(result => result.status === "rejected").length;
  if (failedCount) {
    console.warn(`Creator import succeeded, but ${failedCount} creator directory sync(s) failed.`);
  }
}

async function getExistingLeadByDedupeKey(workspaceId: string, inputs: ReturnType<typeof dedupeCreatorLeadInputs>) {
  const profileUrls = unique(inputs.map(input => input.profileUrl).filter(Boolean));
  const emails = unique(inputs.map(input => input.contactEmail).filter((email): email is string => Boolean(email)));
  const names = unique(inputs.map(input => input.displayName).filter((name): name is string => Boolean(name)));
  const handles = unique(inputs.map(input => input.handle).filter((handle): handle is string => Boolean(handle)));
  const existingLeads = await prisma.creatorLead.findMany({
    where: {
      workspaceId,
      OR: [
        profileUrls.length ? { profileUrl: { in: profileUrls } } : null,
        emails.length ? { contactEmail: { in: emails } } : null,
        names.length ? { displayName: { in: names } } : null,
        handles.length ? { handle: { in: handles } } : null,
      ].filter((item): item is NonNullable<typeof item> => Boolean(item)),
    },
    select: {
      id: true,
      profileUrl: true,
      contactEmail: true,
      displayName: true,
      handle: true,
    },
  });

  const existingLeadByKey = new Map<string, string>();
  for (const lead of existingLeads) {
    getCreatorLeadDedupeKeys(lead).forEach(key => existingLeadByKey.set(key, lead.id));
  }
  return existingLeadByKey;
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function extractLooseContactsFromRows(rows: Record<string, unknown>[]) {
  return extractLooseContactsFromText(
    rows
      .flatMap(row => Object.values(row).map(value => String(value ?? "")))
      .join("\n")
  );
}

function extractLooseContactsFromText(text: string) {
  const emails = new Set<string>();
  const urls = new Set<string>();
  const emailMatches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  for (const email of emailMatches) {
    emails.add(email.trim().toLowerCase());
  }

  const urlMatches = text.match(/https?:\/\/[^\s,"'<>]+|(?:www\.)?(?:instagram\.com|tiktok\.com|youtube\.com|youtu\.be|xiaohongshu\.com|xhslink\.com)\/[^\s,"'<>]+/gi) ?? [];
  for (const url of urlMatches) {
    urls.add(url.trim());
  }

  return [
    ...Array.from(emails).map(email =>
      normalizeCreatorLeadInput({
        profileUrl: `mailto:${email}`,
        source: "EXCEL",
        displayName: email.split("@")[0],
        handle: email.split("@")[0],
        contactEmail: email,
        rawInput: { source: "loose-contact-scan", email },
      })
    ),
    ...Array.from(urls).map(url =>
      normalizeCreatorLeadInput({
        profileUrl: url,
        source: "EXCEL",
        rawInput: { source: "loose-contact-scan", url },
      })
    ),
  ];
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
