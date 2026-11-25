"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type EvidenceFile = {
  id: string;
  file: File;
  status: "pending" | "uploaded" | "verified" | "modified";
  serverId?: string;
  hash?: string;
  currentHash?: string;
};

type IncidentOption = {
  id: string;
  incidentType: string;
  incidentDate: string;
  status: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf", ".txt"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EvidencePage() {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [history, setHistory] = useState<any[]>([]);
const [historyLoading, setHistoryLoading] = useState(true);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [incidents, setIncidents] = useState<IncidentOption[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState("");

useEffect(() => {
  async function loadEvidenceHistory() {
    try {
      const response = await fetch("/api/evidence");

      if (!response.ok) {
        throw new Error("Unable to load evidence history");
      }

      const result = await response.json();
      setHistory(result.evidence || []);
    } catch (error) {
      console.error("Evidence history error:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  loadEvidenceHistory();
}, []);
useEffect(() => {
  async function loadAuditTrail() {
    try {
      const response = await fetch("/api/evidence/audit");
      if (!response.ok) throw new Error("Unable to load audit trail");
      const result = await response.json();
      setAuditEvents(result.events || []);
    } catch (error) {
      console.error("Audit trail error:", error);
    } finally {
      setAuditLoading(false);
    }
  }

  loadAuditTrail();
}, []);
  useEffect(() => {
    async function loadIncidents() {
      try {
        const response = await fetch("/api/incidents");
        if (!response.ok) throw new Error("Unable to load incidents");
        const result = await response.json();
        setIncidents(result.incidents || []);
      } catch (loadError) {
        console.error("Incident loading error:", loadError);
        setError("Unable to load incident list. Please refresh the page.");
      }
    }

    loadIncidents();
  }, []);

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    setError("");

    const validFiles: EvidenceFile[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        errors.push(`${file.name}: unsupported file type`);
        continue;
      }

      if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: file must be between 1 byte and 10 MB`);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        status: "pending",
      });
    }

    setFiles((previous) => [...previous, ...validFiles]);

    if (errors.length > 0) setError(errors.join(". "));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadEvidence() {
    if (processing) return;
    if (!selectedIncidentId) {
      setError("Please select an incident before uploading evidence.");
      return;
    }

    const pendingFiles = files.filter((item) => !item.serverId);
    if (pendingFiles.length === 0) return;

    setProcessing(true);
    setError("");

    const errors: string[] = [];

    try {
      for (const item of pendingFiles) {
        try {
          const formData = new FormData();
          formData.append("file", item.file);
          formData.append("incidentId", selectedIncidentId);

          const response = await fetch("/api/evidence", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Upload failed");
          }

          setFiles((previous) =>
            previous.map((current) =>
              current.id === item.id
                ? {
                    ...current,
                    serverId: result.id,
                    hash: result.sha256,
                    status: "uploaded",
                  }
                : current
            )
          );
        } catch (uploadError) {
          errors.push(
            `${item.file.name}: ${
              uploadError instanceof Error ? uploadError.message : "Upload failed"
            }`
          );
        }
      }

      if (errors.length > 0) setError(errors.join(". "));
    } finally {
      setProcessing(false);
    }
  }

  async function verifyEvidence() {
    if (processing) return;

    const uploadedFiles = files.filter((item) => item.serverId);
    if (uploadedFiles.length === 0) return;

    setProcessing(true);
    setError("");

    const errors: string[] = [];

    try {
      for (const item of uploadedFiles) {
        try {
          const response = await fetch("/api/evidence/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.serverId }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Verification failed");
          }

          setFiles((previous) =>
            previous.map((current) =>
              current.id === item.id
                ? {
                    ...current,
                    status: result.integrity === "VERIFIED" ? "verified" : "modified",
                    currentHash: result.currentHash,
                  }
                : current
            )
          );
        } catch (verificationError) {
          errors.push(
            `${item.file.name}: ${
              verificationError instanceof Error
                ? verificationError.message
                : "Verification failed"
            }`
          );
        }
      }

      if (errors.length > 0) setError(errors.join(". "));
    } finally {
      setProcessing(false);
    }
  }

  function removeFile(id: string) {
    setFiles((previous) => previous.filter((item) => item.id !== id));
  }

  const pendingCount = files.filter((item) => !item.serverId).length;
  const uploadedCount = files.filter((item) => item.serverId).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-5 md:px-16">
        <Link href="/" className="text-2xl font-bold text-cyan-400">
          CyberFirstAid
        </Link>
        <Link href="/" className="text-slate-300 hover:text-cyan-400">
          Back to Home
        </Link>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Digital Evidence Preservation
          </h1>
          <p className="mx-auto max-w-2xl text-slate-400">
            Upload digital evidence related to your cyber incident.
            Generate SHA-256 fingerprints and verify stored file integrity.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-cyan-800 bg-slate-900 p-6">
          <label htmlFor="incident-select" className="mb-3 block font-semibold text-cyan-300">
            Select Related Incident
          </label>
          <select
            id="incident-select"
            value={selectedIncidentId}
            onChange={(event) => setSelectedIncidentId(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
          >
            <option value="">Choose an incident</option>
            {incidents.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.id} — {incident.incidentType.replaceAll("_", " ")} ({incident.status})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-slate-400">
            Evidence will be linked to the selected incident.
          </p>
          {incidents.length === 0 && (
            <p className="mt-2 text-sm text-amber-300">
              No saved incidents found. Submit an incident report first.
            </p>
          )}
        </div>

        <div className="mb-8 rounded-2xl border-2 border-dashed border-cyan-800 bg-slate-900 p-10 text-center">
          <div className="mb-4 flex justify-center text-cyan-400">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="56"
    height="56"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="16" />
  </svg>
</div>
          <h2 className="mb-3 text-2xl font-bold">Select Evidence Files</h2>
          <p className="mb-6 text-slate-400">
            Supported: PNG, JPG, JPEG, PDF, TXT
            <br />
            Maximum file size: 10 MB per file
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.pdf,.txt"
            onChange={handleFileSelection}
            className="hidden"
            id="evidence-upload"
          />

          <label
            htmlFor="evidence-upload"
            className="inline-block cursor-pointer rounded-xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Choose Files
          </label>
        </div>

        <div className="mb-8 rounded-xl border border-amber-800 bg-amber-950/30 p-5 text-sm text-amber-200">
          Selected evidence files are uploaded to the application's server
          and stored in its private evidence directory. Do not upload
          sensitive files unless you are authorized to do so. This prototype
          does not yet implement user authentication or access control.
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Selected Evidence</h2>
            <span className="text-sm text-slate-400">
              {files.length} file(s) selected
            </span>
          </div>

          {files.length === 0 ? (
            <div className="rounded-xl bg-slate-800 p-8 text-center text-slate-400">
              No evidence files selected yet.
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="break-all font-semibold">{item.file.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Size: {formatFileSize(item.file.size)}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Status:{" "}
                        <span
                          className={
                            item.status === "verified"
                              ? "text-green-400"
                              : item.status === "modified"
                                ? "text-red-400"
                                : item.status === "uploaded"
                                  ? "text-cyan-400"
                                  : "text-amber-400"
                          }
                        >
                          {item.status === "pending"
                            ? "Pending upload"
                            : item.status === "uploaded"
                              ? "Uploaded"
                              : item.status === "verified"
                                ? "Integrity verified"
                                : "File modified"}
                        </span>
                      </p>
                      {item.serverId && (
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Evidence ID: {item.serverId}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFile(item.id)}
                      disabled={processing}
                      className="rounded-lg border border-red-700 px-4 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>

                  {item.hash && (
                    <div className="mt-5 rounded-lg bg-slate-950 p-4">
                      <p className="mb-2 text-sm font-semibold text-cyan-400">
                        Original SHA-256 Fingerprint
                      </p>
                      <p className="break-all font-mono text-xs text-slate-300">
                        {item.hash}
                      </p>
                    </div>
                  )}

                  {item.currentHash && (
                    <div className="mt-3 rounded-lg bg-slate-950 p-4">
                      <p className="mb-2 text-sm font-semibold text-cyan-400">
                        Current SHA-256 Fingerprint
                      </p>
                      <p className="break-all font-mono text-xs text-slate-300">
                        {item.currentHash}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={uploadEvidence}
            disabled={pendingCount === 0 || processing}
            className="mt-7 w-full rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Processing..." : `Upload Evidence (${pendingCount})`}
          </button>

          <button
            onClick={verifyEvidence}
            disabled={uploadedCount === 0 || processing}
            className="mt-3 w-full rounded-xl border border-cyan-500 px-6 py-4 font-bold text-cyan-300 hover:bg-cyan-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Processing..." : `Verify Integrity (${uploadedCount})`}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-800 bg-slate-900 p-6">
  <h2 className="mb-5 text-2xl font-bold text-cyan-400">
    Evidence History
  </h2>

  {historyLoading ? (
    <p className="text-slate-400">Loading evidence history...</p>
  ) : history.length === 0 ? (
    <p className="text-slate-400">No previous evidence records found.</p>
  ) : (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <h3 className="font-bold text-white">{item.originalName}</h3>
          <p className="mt-2 text-sm text-slate-400">Evidence ID: {item.id}</p>
          <p className="text-sm text-slate-400">Size: {(item.fileSize / 1024).toFixed(2)} KB</p>
          <p className="text-sm text-slate-400">Uploaded: {new Date(item.uploadedAt).toLocaleString()}</p>
          <p className="mt-3 text-xs font-semibold text-cyan-400">SHA-256 Fingerprint</p>
          <p className="break-all font-mono text-xs text-slate-300">{item.sha256}</p>
        </div>
      ))}
    </div>
  )}
</div>
<div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-white">Audit Trail</h2>
      <p className="mt-1 text-sm text-slate-400">Evidence activity and verification history</p>
    </div>
    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
      {auditEvents.length} Events
    </span>
  </div>

  {auditLoading ? (
    <p className="text-sm text-slate-400">Loading audit history...</p>
  ) : auditEvents.length === 0 ? (
    <p className="text-sm text-slate-400">No audit events recorded yet.</p>
  ) : (
    <div className="space-y-3">
      {auditEvents.map((event, index) => (
        <div key={`${event.evidenceId}-${event.event}-${event.timestamp}-${index}`}
          className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-white">{event.event}</span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              {event.result}
            </span>
          </div>
          <p className="mt-2 break-all text-xs text-slate-400">
            Evidence ID: {event.evidenceId}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
<div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-3 text-xl font-bold">What Is SHA-256?</h2>
          <p className="text-slate-300">
            SHA-256 generates a digital fingerprint of a file. If the file
            content changes, its fingerprint will usually change. CyberShieldAid
            stores the original hash and compares it with a newly calculated
            hash during verification. This helps identify changes, but does
            not by itself prove authenticity or establish a complete chain
            of custody.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/recovery"
            className="rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Go to Recovery Tracker
          </Link>
          <Link
            href="/report"
            className="rounded-xl border border-slate-600 px-6 py-4 font-semibold hover:bg-slate-800"
          >
            Report Incident
          </Link>
        </div>
      </section>
    </main>
  );
}




