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

    const urls = parseLinks(links);
    setLinkStatus("");
    setLinkError("");

    if (!urls.length) {
      setLinkError("Add at least one creator profile link.");
      return;
    }

    setIsSubmittingLinks(true);
    try {
      const res = await fetch("/api/creator-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, notes: notes || undefined }),
      });
      const data = (await res.json()) as LinkImportResponse & ApiErrorResponse;
      if (!res.ok) throw new Error(formatApiError(data.error) || "Creator links could not be imported.");

      setLinkStatus(`${data.count ?? urls.length} creator link${(data.count ?? urls.length) === 1 ? "" : "s"} queued for review.`);
      setLinks("");
      setNotes("");
    } catch (caught) {
      setLinkError(caught instanceof Error ? caught.message : "Creator links could not be imported.");
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
            <span className="section-eyebrow">Direct links</span>
            <h2>Paste creator profile links</h2>
            <p>Instagram, TikTok, YouTube, Xiaohongshu, website, or creator profile URLs can be queued as creator leads.</p>
          </div>

          <label>
            <span>Profile links</span>
            <textarea
              rows={9}
              placeholder="https://www.instagram.com/example&#10;https://www.tiktok.com/@example"
              value={links}
              onChange={event => setLinks(event.target.value)}
            />
          </label>

          <label>
            <span>Notes</span>
            <input
              placeholder="Optional campaign, city, category, or review context"
              value={notes}
              onChange={event => setNotes(event.target.value)}
            />
          </label>

          <button className="generate-button" type="submit" disabled={isSubmittingLinks || !databaseConfigured}>
            {isSubmittingLinks ? "Queueing..." : databaseConfigured ? "Queue Links" : "Database Required"}
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
            <p>CSV, XLS, and XLSX imports can include links, platform, name, city, category, followers, views, contact, pricing, and notes.</p>
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

function parseLinks(value: string) {
  return value
    .split(/[\n,\s]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function formatApiError(error: ApiErrorResponse["error"]) {
  if (Array.isArray(error)) {
    return error.map(issue => issue.message).filter(Boolean).join(" ");
  }

  return error || "";
}
