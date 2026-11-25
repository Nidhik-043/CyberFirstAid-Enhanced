"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Reusable incident selection component

import Link from "next/link";

import type {
  Incident,
} from "../../lib/emergency/types";

import {
  CATEGORY_LABELS,
} from "../../lib/emergency/types";

// Component properties
interface IncidentSelectorProps {
  incidents: Incident[];
  selectedIncidentId: number | null;
  onSelect: (incident: Incident) => void;
  loading?: boolean;
  disabled?: boolean;
}

// Risk level styling
const RISK_STYLES: Record<string, string> = {
  critical:
    "border-red-700 bg-red-950/60 text-red-300",

  high:
    "border-orange-700 bg-orange-950/60 text-orange-300",

  medium:
    "border-yellow-700 bg-yellow-950/60 text-yellow-300",

  low:
    "border-green-700 bg-green-950/60 text-green-300",

  unassessed:
    "border-slate-600 bg-slate-800 text-slate-300",
};

// Format incident creation date
function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function IncidentSelector({
  incidents,
  selectedIncidentId,
  onSelect,
  loading = false,
  disabled = false,
}: IncidentSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

      {/* Component heading */}
      <div className="mb-6 flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-800 bg-cyan-950/50">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-cyan-400"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>

        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Step 01
          </p>

          <h2 className="text-xl font-bold text-white">
            Select Your Incident
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Choose an existing cyber incident to receive
            personalized emergency and recovery guidance.
          </p>
        </div>

      </div>

      {/* Loading state */}
      {loading && (
        <div
          role="status"
          className="space-y-3"
        >
          <p className="text-sm text-slate-400">
            Loading saved incidents...
          </p>

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-800/60"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && incidents.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-7 text-center">

          <h3 className="font-semibold text-slate-200">
            No incidents available
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            A saved incident is required to generate
            a personalized recovery plan.
          </p>

        </div>
      )}

      {/* Incident selection list */}
      {!loading && incidents.length > 0 && (
        <div
          className="max-h-[480px] space-y-3 overflow-y-auto pr-1"
          aria-label="Available cyber incidents"
        >

          {incidents.map((incident) => {
            const isSelected =
              selectedIncidentId === incident.incident_id;

            const riskStyle =
              RISK_STYLES[incident.risk_level] ||
              RISK_STYLES.unassessed;

            const categoryLabel =
              CATEGORY_LABELS[incident.incident_category] ||
              incident.incident_category;

            const isResolved =
              incident.status === "resolved";

            return (
              <button
                key={incident.incident_id}
                type="button"
                disabled={disabled}
                aria-pressed={isSelected}
                onClick={() => onSelect(incident)}
                className={`w-full rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >

                {/* Incident ID and selection indicator */}
                <div className="mb-3 flex items-center justify-between gap-3">

                  <span className="font-mono text-xs font-semibold tracking-wider text-cyan-400">
                    INCIDENT #{incident.incident_id}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400"
                        : "border-slate-500"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 text-slate-950"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    )}
                  </span>

                </div>

                {/* Incident category */}
                <h3 className="text-base font-bold text-white">
                  {categoryLabel}
                </h3>

                {/* Risk and status */}
                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold uppercase ${riskStyle}`}
                  >
                    {incident.risk_level} risk
                  </span>

                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                      isResolved
                        ? "border-green-800 bg-green-950/40 text-green-400"
                        : "border-slate-600 bg-slate-800 text-slate-300"
                    }`}
                  >
                    {incident.status}
                  </span>

                </div>

                {/* Incident creation date */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-700/70 pt-3">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="16"
                      rx="2"
                    />
                    <path d="M16 3v4M8 3v4M3 10h18" />
                  </svg>

                  <span className="text-xs text-slate-400">
                    {formatDate(incident.created_at)}
                  </span>

                </div>

              </button>
            );
          })}

        </div>
      )}

      {/* Report new incident */}
      <Link
        href="/report"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-cyan-400 transition hover:border-cyan-600 hover:bg-cyan-950/30"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        Report a New Incident
      </Link>

      {/* Privacy reminder */}
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Select only the incident relevant to your recovery.
        This prototype is intended for simulated incident
        testing.
      </p>

    </section>
  );
}