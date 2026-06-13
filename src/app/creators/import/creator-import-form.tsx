"use client";

import { FormEvent, useState } from "react";

type ApiErrorResponse = {
  error?: string | Array<{ message?: string }>;
};

type LinkImportResponse = {
  count?: number;
};

type FileImportResponse = {
  imported?: number;
  skipped?: number;
};

export function CreatorImportForm({ databaseConfigured }: { databaseConfigured: boolean }) {
  const [links, setLinks] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [linkStatus, setLinkStatus] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [linkError, setLinkError] = useState("");
  const [fileError, setFileError] = useState("");
  const [isSubmittingLinks, setIsSubmittingLinks] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  async function submitLinks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!databaseConfigured) {
      setLinkStatus("");
      setLinkError("Connect a database before saving creator links.");
      return;
    }

    const contacts = parseCreatorContacts(links);
    setLinkStatus("");
    setLinkError("");

    if (!contacts.urls.length && !contacts.emails.length) {
      setLinkError("Add at least one creator email or profile link.");
      return;
    }

    setIsSubmittingLinks(true);
    try {
      const res = await fetch("/api/creator-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: contacts.urls, emails: contacts.emails, notes: notes || undefined }),
      });
      const data = (await res.json()) as LinkImportResponse & ApiErrorResponse;
      if (!res.ok) throw new Error(formatApiError(data.error) || "Creator contacts could not be imported.");

      const importedCount = data.count ?? contacts.urls.length + contacts.emails.length;
      setLinkStatus(`${importedCount} creator contact${importedCount === 1 ? "" : "s"} saved for outreach review.`);
      setLinks("");
      setNotes("");
    } catch (caught) {
      setLinkError(caught instanceof Error ? caught.message : "Creator contacts could not be imported.");
    } finally {
      setIsSubmittingLinks(false);
    }
  }

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFileStatus("");
    setFileError("");

    if (!databaseConfigured) {
      setFileError("Connect a database before importing creator files.");
      return;
    }

    if (!file) {
      setFileError("Choose a CSV or Excel file.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    setIsUploadingFile(true);

    try {
      const res = await fetch("/api/creator-leads/import", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as FileImportResponse & ApiErrorResponse;
      if (!res.ok) throw new Error(formatApiError(data.error) || "Creator file could not be imported.");

      setFileStatus(`${data.imported ?? 0} creator lead${(data.imported ?? 0) === 1 ? "" : "s"} imported${data.skipped ? `, ${data.skipped} skipped` : ""}.`);
      setFile(null);
      event.currentTarget.reset();
    } catch (caught) {
      setFileError(caught instanceof Error ? caught.message : "Creator file could not be imported.");
    } finally {
      setIsUploadingFile(false);
    }
  }

  return (
    <div className="creator-import-stack">
      {!databaseConfigured ? (
        <section className="creator-import-notice" aria-label="Preview import mode">
          <strong>Preview mode</strong>
          <p>Creator imports need a configured database before they can be saved. You can still review the form, file requirements, and local workflow here.</p>
        </section>
      ) : null}

      <div className="creator-import-grid">
        <form className="creator-import-panel" onSubmit={submitLinks}>
          <div>
            <span className="section-eyebrow">Direct contacts</span>
            <h2>Paste creator emails or profile links</h2>
            <p>Email is best for the MVP. Profile links can still be saved as leads while the team finds contact details.</p>
          </div>

          <label>
            <span>Creator emails or links</span>
            <textarea
              rows={9}
              placeholder="creator@example.com&#10;https://www.tiktok.com/@example&#10;https://www.instagram.com/example creator@example.com"
              value={links}
              onChange={event => setLinks(event.target.value)}
            />
          </label>

          <label>
            <span>Notes</span>
            <input
              placeholder="Optional campaign, category, offer, or outreach context"
              value={notes}
              onChange={event => setNotes(event.target.value)}
            />
          </label>

          <button className="generate-button" type="submit" disabled={isSubmittingLinks || !databaseConfigured}>
            {isSubmittingLinks ? "Saving..." : databaseConfigured ? "Save Contacts" : "Database Required"}
          </button>
          {linkStatus ? (
            <p className="form-message">
              {linkStatus} <a href="/ops">Open Ops</a>
            </p>
          ) : null}
          {linkError ? <p className="form-error">{linkError}</p> : null}
        </form>

        <form className="creator-import-panel" onSubmit={uploadFile}>
          <div>
            <span className="section-eyebrow">Spreadsheet</span>
            <h2>Upload a creator sheet</h2>
            <p>CSV, XLS, and XLSX imports should include creator emails when available. Links, names, categories, contact notes, pricing, and notes are also supported.</p>
          </div>

          <label className="file-import-box">
            <span>Creator file</span>
            <input
              accept=".csv,.xls,.xlsx"
              type="file"
              disabled={!databaseConfigured}
              onChange={event => setFile(event.target.files?.[0] ?? null)}
            />
            <small>{file ? file.name : "No file selected"}</small>
          </label>

          <button className="generate-button" type="submit" disabled={isUploadingFile || !databaseConfigured}>
            {isUploadingFile ? "Uploading..." : databaseConfigured ? "Upload File" : "Database Required"}
          </button>
          {fileStatus ? (
            <p className="form-message">
              {fileStatus} <a href="/ops">Open Ops</a>
            </p>
          ) : null}
          {fileError ? <p className="form-error">{fileError}</p> : null}
        </form>
      </div>
    </div>
  );
}

// [Claude 2026-06-13] Parse by line so spaces inside a line (e.g. "Name email@x.com")
// don't create extra records. Each line can contain a URL and/or an email in any order;
// plain words (names, notes) are silently ignored instead of being saved as bogus URLs.
function parseCreatorContacts(value: string) {
  const EMAIL_RE = /[^\s@,]+@[^\s@,]+\.[^\s@,]+/gi;
  const URL_RE = /https?:\/\/[^\s,]+/gi;

  const allEmails = new Set<string>();
  const allUrls = new Set<string>();

  const lines = value.split(/[\n,]+/).map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const emailMatches = line.match(EMAIL_RE);
    const urlMatches = line.match(URL_RE);
    for (const e of emailMatches ?? []) allEmails.add(e.toLowerCase());
    for (const u of urlMatches ?? []) allUrls.add(u);
  }

  // Remove URLs that are also emails (e.g. mailto: edge case).
  const emails = Array.from(allEmails);
  const urls = Array.from(allUrls).filter(u => !allEmails.has(u.toLowerCase()));
  return { emails, urls };
}

function formatApiError(error: ApiErrorResponse["error"]) {
  if (Array.isArray(error)) {
    return error.map(issue => issue.message).filter(Boolean).join(" ");
  }

  return error || "";
}
