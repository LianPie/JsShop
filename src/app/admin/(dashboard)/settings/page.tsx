"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faMagnifyingGlass,
  faSpinner,
  faTriangleExclamation,
  faCircleCheck,
  faImage,
  faUpload,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Path = (string | number)[];
type Notice = { type: "success" | "error"; text: string } | null;

function setAt(node: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(node)) {
    const copy = [...node];
    copy[head as number] = setAt(node[head as number], rest, value);
    return copy;
  }
  const obj = node as { [key: string]: Json };
  return { ...obj, [head as string]: setAt(obj[head as string], rest, value) };
}

// A node is shown if its path or any value inside it contains the search text
function matches(node: Json, pathStr: string, q: string): boolean {
  if (!q) return true;
  if (pathStr.toLowerCase().includes(q)) return true;
  if (Array.isArray(node)) return node.some((v, i) => matches(v, `${pathStr}.${i}`, q));
  if (node !== null && typeof node === "object") {
    return Object.entries(node).some(([k, v]) => matches(v, `${pathStr}.${k}`, q));
  }
  return String(node).toLowerCase().includes(q);
}

function Field({
  node,
  path,
  query,
  onChange,
}: {
  node: Json;
  path: Path;
  query: string;
  onChange: (path: Path, value: Json) => void;
}) {
  const pathStr = path.join(".");
  const label = String(path[path.length - 1]);

  if (!matches(node, pathStr, query)) return null;

  // Objects and arrays: render children
  if (node !== null && typeof node === "object") {
    const entries: [string | number, Json][] = Array.isArray(node)
      ? node.map((v, i) => [i, v])
      : Object.entries(node);

    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <div className="space-y-4 border-l-2 border-gray-100 pl-4">
          {entries.map(([k, v]) => (
            <Field
              key={k}
              node={v}
              path={[...path, k]}
              query={query}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    );
  }

  // Booleans
  if (typeof node === "boolean") {
    return (
      <label className="flex items-center gap-3 text-sm text-gray-700" title={pathStr}>
        <input
          type="checkbox"
          checked={node}
          onChange={(e) => onChange(path, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        {label}
      </label>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  // Numbers
  if (typeof node === "number") {
    return (
      <div title={pathStr}>
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="number"
          value={node}
          onChange={(e) => onChange(path, e.target.value === "" ? 0 : Number(e.target.value))}
          className={inputClass}
        />
      </div>
    );
  }

  // null can't be edited here
  if (node === null) {
    return (
      <div title={pathStr}>
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
        <p className="text-xs text-gray-400">null (edit in the file)</p>
      </div>
    );
  }

  // Strings
  const long = node.length > 80 || node.includes("\n");
  return (
    <div title={pathStr}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {long ? (
        <textarea
          value={node}
          rows={Math.min(8, Math.max(3, node.split("\n").length + 1))}
          onChange={(e) => onChange(path, e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          value={node}
          onChange={(e) => onChange(path, e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  // Content
  const [original, setOriginal] = useState<Json | null>(null);
  const [content, setContent] = useState<Json | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [contentNotice, setContentNotice] = useState<Notice>(null);
  const [query, setQuery] = useState("");

  // Favicon
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [faviconNotice, setFaviconNotice] = useState<Notice>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/content");
        if (!res.ok) throw new Error();
        const data: Json = await res.json();
        setOriginal(data);
        setContent(data);
      } catch {
        setLoadError("Could not load site content.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(original) !== JSON.stringify(content),
    [original, content]
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Preview for the chosen favicon file
  useEffect(() => {
    if (!faviconFile) {
      setFaviconPreview(null);
      return;
    }
    const url = URL.createObjectURL(faviconFile);
    setFaviconPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [faviconFile]);

  const handleChange = (path: Path, value: Json) => {
    setContentNotice(null);
    setContent((prev) => (prev === null ? prev : setAt(prev, path, value)));
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setContentNotice(null);
    try {
      const res = await fetch("/api/settings/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setContentNotice({ type: "error", text: data.message || "Failed to save" });
        return;
      }
      setOriginal(content);
      setContentNotice({
        type: "success",
        text: "Saved. On a production build, rebuild and restart to see it on the site.",
      });
    } catch {
      setContentNotice({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFavicon = async () => {
    if (!faviconFile) return;
    setUploading(true);
    setFaviconNotice(null);
    try {
      const formData = new FormData();
      formData.append("favicon", faviconFile);
      const res = await fetch("/api/settings/favicon", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFaviconNotice({ type: "error", text: data.message || "Upload failed" });
        return;
      }
      setFaviconFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setFaviconNotice({
        type: "success",
        text: "Favicon replaced. Rebuild on production, then hard-refresh (browsers cache favicons heavily).",
      });
    } catch {
      setFaviconNotice({ type: "error", text: "An error occurred while uploading." });
    } finally {
      setUploading(false);
    }
  };

  const rootEntries =
    content !== null && typeof content === "object" && !Array.isArray(content)
      ? Object.entries(content)
      : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Edit the site content and the favicon.</p>
      </div>

      {/* Favicon */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Favicon
        </h2>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.ico" alt="Current favicon" className="h-8 w-8" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Current</p>
            </div>
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-300">
                {faviconPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={faviconPreview} alt="New favicon" className="h-8 w-8" />
                ) : (
                  <FontAwesomeIcon icon={faImage} />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">New</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept=".ico,image/x-icon,image/vnd.microsoft.icon"
              onChange={(e) => {
                setFaviconNotice(null);
                setFaviconFile(e.target.files?.[0] ?? null);
              }}
              className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
            />
            <button
              onClick={handleUploadFavicon}
              disabled={!faviconFile || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={uploading ? faSpinner : faUpload} spin={uploading} />
              {uploading ? "Uploading..." : "Replace favicon"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Must be a real .ico file (max 1 MB). A renamed PNG will be rejected.
        </p>

        {faviconNotice && <NoticeBox notice={faviconNotice} />}
      </section>

      {/* Content */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border-b border-gray-200 bg-white px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Site content
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value.toLowerCase())}
                placeholder="Filter fields..."
                className="w-56 rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setContent(original);
                setContentNotice(null);
              }}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={saving ? faSpinner : faFloppyDisk} spin={saving} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          {contentNotice && <NoticeBox notice={contentNotice} />}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
              <FontAwesomeIcon icon={faSpinner} spin />
              Loading content...
            </div>
          )}

          {loadError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {loadError}
            </div>
          )}

          {content !== null && (
            <div className="space-y-8">
              {rootEntries.map(([key, value]) => (
                <Field
                  key={key}
                  node={value}
                  path={[key]}
                  query={query}
                  onChange={handleChange}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NoticeBox({ notice }: { notice: NonNullable<Notice> }) {
  const success = notice.type === "success";
  return (
    <div
      className={`mb-4 mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
        success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
      }`}
    >
      <FontAwesomeIcon
        icon={success ? faCircleCheck : faTriangleExclamation}
        className="mt-0.5"
      />
      <p>{notice.text}</p>
    </div>
  );
}