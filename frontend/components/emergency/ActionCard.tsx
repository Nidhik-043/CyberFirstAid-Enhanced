"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Personalized recovery action card

import type {
  RecoveryAction,
  ActionPriority,
} from "../../lib/emergency/types";

interface ActionCardProps {
  action: RecoveryAction;
  onToggle?: (
    taskId: string,
    completed: boolean
  ) => void;
  updating?: boolean;
  disabled?: boolean;
  showCheckbox?: boolean;
}

const PRIORITY_STYLES: Record<
  ActionPriority,
  {
    border: string;
    background: string;
    badge: string;
    number: string;
    label: string;
    icon: string;
  }
> = {
  immediate: {
    border: "border-red-800",
    background: "bg-red-950/20",
    badge:
      "border-red-800 bg-red-950/50 text-red-300",
    number:
      "border-red-800 bg-red-950/50 text-red-400",
    label: "Act Immediately",
    icon: "!",
  },

  high: {
    border: "border-amber-800",
    background: "bg-amber-950/10",
    badge:
      "border-amber-800 bg-amber-950/40 text-amber-300",
    number:
      "border-amber-800 bg-amber-950/40 text-amber-400",
    label: "Important Action",
    icon: "!",
  },

  follow_up: {
    border: "border-cyan-800",
    background: "bg-cyan-950/10",
    badge:
      "border-cyan-800 bg-cyan-950/40 text-cyan-300",
    number:
      "border-cyan-800 bg-cyan-950/40 text-cyan-400",
    label: "Follow-up Action",
    icon: "i",
  },
};

// Validate official external website links.
function getSafeUrl(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    const allowedHosts = [
      "cybercrime.gov.in",
      "www.cybercrime.gov.in",
      "112.gov.in",
      "www.112.gov.in",
      "sancharsaathi.gov.in",
      "www.sancharsaathi.gov.in",
    ];

    if (
      url.protocol === "https:" &&
      allowedHosts.includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port
    ) {
      return url.href;
    }

    return null;
  } catch {
    return null;
  }
}

// Validate emergency telephone numbers.
function getSafePhone(
  value: string | null
): string | null {
  if (value === "1930" || value === "112") {
    return value;
  }

  return null;
}

// Format completion timestamps.
function formatCompletionDate(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActionCard({
  action,
  onToggle,
  updating = false,
  disabled = false,
  showCheckbox = true,
}: ActionCardProps) {
  const priorityStyle =
    PRIORITY_STYLES[action.priority] ||
    PRIORITY_STYLES.follow_up;

  const safeUrl = getSafeUrl(action.url);

  const safePhone = getSafePhone(action.phone);

  const completionDate = formatCompletionDate(
    action.completed_at
  );

  const isDisabled =
    disabled || updating || !onToggle;

  function handleToggle() {
    if (isDisabled || !onToggle) {
      return;
    }

    onToggle(action.id, !action.completed);
  }

  return (
    <article
      className={`rounded-2xl border p-5 transition-all duration-200 md:p-6 ${
        action.completed
          ? "border-green-800 bg-green-950/15"
          : `${priorityStyle.border} ${priorityStyle.background}`
      }`}
    >

      {/* Action header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <span
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${priorityStyle.badge}`}
        >
          <span
            aria-hidden="true"
            className="font-bold"
          >
            {priorityStyle.icon}
          </span>

          {priorityStyle.label}
        </span>

        <span className="font-mono text-xs text-slate-400">
          ACTION {String(action.order).padStart(2, "0")}
        </span>

      </div>

      {/* Action title and number */}
      <div className="flex items-start gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-lg font-bold ${
            action.completed
              ? "border-green-800 bg-green-950/50 text-green-400"
              : priorityStyle.number
          }`}
        >

          {action.completed ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            String(action.order).padStart(2, "0")
          )}

        </div>

        <div className="min-w-0 flex-1">

          <h3
            className={`text-lg font-bold leading-relaxed ${
              action.completed
                ? "text-green-300"
                : "text-white"
            }`}
          >
            {action.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {action.description}
          </p>

        </div>

      </div>

      {/* Explainable recommendation */}
      {action.reason && (
        <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4">

          <div className="flex items-start gap-3">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>

            <div>

              <h4 className="text-sm font-semibold text-cyan-300">
                Why this action?
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {action.reason}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Official contact and website links */}
      {(safeUrl || safePhone) && (
        <div className="mt-5 flex flex-wrap gap-3">

          {safePhone && (
            <a
              href={`tel:${safePhone}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-800 bg-red-950/40 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-900/40"
            >

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.26a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.69A2 2 0 0 1 22 16.92z" />
              </svg>

              Call {safePhone}

            </a>
          )}

          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:border-cyan-500 hover:bg-cyan-950/30"
            >

              Official Website

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M13 5h6v6M19 5l-9 9" />
                <path d="M19 13v6H5V5h6" />
              </svg>

            </a>
          )}

        </div>
      )}

      {/* Display verified website hostname */}
      {safeUrl && (
        <p className="mt-3 break-all text-xs text-slate-500">
          {new URL(safeUrl).hostname}
        </p>
      )}

      {/* Recovery task completion */}
      <div className="mt-6 border-t border-slate-700 pt-4">

        <div className="flex flex-wrap items-center justify-between gap-4">

          {showCheckbox && (
            <label
              className={`flex items-center gap-3 ${
                isDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >

              <input
                type="checkbox"
                checked={action.completed}
                disabled={isDisabled}
                onChange={handleToggle}
                aria-label={`Mark ${action.title} as ${
                  action.completed
                    ? "incomplete"
                    : "completed"
                }`}
                className="h-5 w-5 shrink-0 accent-cyan-500"
              />

              <span className="text-sm font-medium text-slate-300">

                {updating
                  ? "Saving progress..."
                  : action.completed
                    ? "Mark as incomplete"
                    : "Mark as completed"}

              </span>

            </label>
          )}

          {/* Task status */}
          <div
            role="status"
            className="flex items-center gap-2"
          >

            {updating ? (
              <>

                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-900 border-t-cyan-400"
                />

                <span className="text-xs font-semibold text-cyan-400">
                  Updating
                </span>

              </>
            ) : action.completed ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-green-800 bg-green-950/40 px-3 py-1 text-xs font-semibold text-green-300">

                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-green-400"
                />

                Completed

              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">

                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-slate-400"
                />

                Pending

              </span>
            )}

          </div>

        </div>

        {/* Completion timestamp */}
        {action.completed && completionDate && (
          <p className="mt-3 text-xs text-slate-500">
            Marked as completed on {completionDate}
          </p>
        )}

        {/* Completion disclaimer */}
        {action.completed && (
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Completion is self-reported and does not
            independently verify that the security
            issue has been resolved.
          </p>
        )}

      </div>

    </article>
  );
}