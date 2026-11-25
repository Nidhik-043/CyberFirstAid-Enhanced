"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Dynamic recovery progress component

import type {
  RecoveryPlan,
  ActionPriority,
} from "../../lib/emergency/types";

interface RecoveryProgressProps {
  plan: RecoveryPlan;
  updating?: boolean;
}

const PRIORITY_CONFIG: {
  priority: ActionPriority;
  label: string;
  textColor: string;
  barColor: string;
}[] = [
  {
    priority: "immediate",
    label: "Immediate Actions",
    textColor: "text-red-400",
    barColor: "bg-red-500",
  },
  {
    priority: "high",
    label: "Important Actions",
    textColor: "text-amber-400",
    barColor: "bg-amber-500",
  },
  {
    priority: "follow_up",
    label: "Follow-up Actions",
    textColor: "text-cyan-400",
    barColor: "bg-cyan-500",
  },
];

// Format the last saved timestamp.
function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Prevent invalid progress bar values.
function normalizePercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export default function RecoveryProgress({
  plan,
  updating = false,
}: RecoveryProgressProps) {
  const summary = plan.summary;

  const progress = normalizePercentage(
    summary.progress_percentage
  );

  const totalActions = summary.total_actions;

  const completedActions = summary.completed_actions;

  const pendingActions = summary.pending_actions;

  const pendingImmediateActions = plan.actions.filter(
    (action) =>
      action.priority === "immediate" &&
      !action.completed
  ).length;

  const allCompleted =
    totalActions > 0 && pendingActions === 0;

  const priorityBreakdown = PRIORITY_CONFIG.map(
    (config) => {
      const actions = plan.actions.filter(
        (action) =>
          action.priority === config.priority
      );

      const completed = actions.filter(
        (action) => action.completed
      ).length;

      const total = actions.length;

      const percentage =
        total > 0
          ? normalizePercentage(
              (completed / total) * 100
            )
          : 0;

      return {
        ...config,
        total,
        completed,
        percentage,
      };
    }
  );

  return (
    <section
      aria-busy={updating}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-8"
    >

      {/* Component heading */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-800 bg-cyan-950/50">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-cyan-400"
              aria-hidden="true"
            >
              <path d="M3 3v18h18" />
              <path d="m7 14 4-4 4 4 6-7" />
            </svg>

          </div>

          <div>

            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Personalized Recovery Tracker
            </p>

            <h2 className="text-xl font-bold text-white md:text-2xl">
              Your Recovery Progress
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Incident #{plan.incident_id}
              {" · "}
              {plan.category_label}
            </p>

          </div>

        </div>

        {/* Overall percentage */}
        <div className="text-right">

          <p
            className={`text-3xl font-bold md:text-4xl ${
              allCompleted
                ? "text-green-400"
                : "text-cyan-400"
            }`}
          >
            {progress}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Checklist completion
          </p>

        </div>

      </div>

      {/* Overall progress bar */}
      <div className="mb-7">

        <div
          role="progressbar"
          aria-label="Overall recovery checklist completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-3 overflow-hidden rounded-full bg-slate-700"
        >

          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allCompleted
                ? "bg-green-500"
                : "bg-cyan-500"
            }`}
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

          <p className="text-sm text-slate-400">
            {completedActions} of {totalActions} recovery
            actions completed
          </p>

          {updating && (
            <span
              role="status"
              className="flex items-center gap-2 text-xs font-medium text-cyan-400"
            >

              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-900 border-t-cyan-400"
              />

              Saving progress...

            </span>
          )}

        </div>

      </div>

      {/* Recovery statistics */}
      <div className="mb-8 grid grid-cols-3 gap-2 md:gap-4">

        {/* Total actions */}
        <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3 md:p-5">

          <p className="text-xs font-medium text-slate-400 md:text-sm">
            Total Actions
          </p>

          <p className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {totalActions}
          </p>

        </div>

        {/* Completed actions */}
        <div className="rounded-xl border border-green-800 bg-green-950/30 p-3 md:p-5">

          <p className="text-xs font-medium text-green-300 md:text-sm">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-green-400 md:text-3xl">
            {completedActions}
          </p>

        </div>

        {/* Pending actions */}
        <div className="rounded-xl border border-amber-800 bg-amber-950/20 p-3 md:p-5">

          <p className="text-xs font-medium text-amber-300 md:text-sm">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400 md:text-3xl">
            {pendingActions}
          </p>

        </div>

      </div>

      {/* Priority-wise recovery progress */}
      <div className="border-t border-slate-700 pt-6">

        <h3 className="mb-5 text-lg font-bold text-white">
          Priority Breakdown
        </h3>

        <div className="space-y-5">

          {priorityBreakdown.map((item) => (
            <div key={item.priority}>

              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

                <span
                  className={`text-sm font-semibold ${item.textColor}`}
                >
                  {item.label}
                </span>

                <span className="text-xs text-slate-400">

                  {item.total === 0
                    ? "No actions required"
                    : `${item.completed} / ${item.total} completed`}

                </span>

              </div>

              {item.total > 0 ? (
                <div
                  role="progressbar"
                  aria-label={`${item.label} completion`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.percentage}
                  className="h-2 overflow-hidden rounded-full bg-slate-700"
                >

                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />

                </div>
              ) : (
                <div className="h-2 rounded-full bg-slate-800" />
              )}

            </div>
          ))}

        </div>

      </div>

      {/* Immediate action warning */}
      {pendingImmediateActions > 0 && (
        <div
          role="status"
          className="mt-7 rounded-xl border border-red-800 bg-red-950/30 p-4"
        >

          <div className="flex items-start gap-3">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
              aria-hidden="true"
            >
              <path d="m10.29 3.86-8.42 14.6A2 2 0 0 0 3.6 21h16.8a2 2 0 0 0 1.73-2.54l-8.42-14.6a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>

            <div>

              <h4 className="font-bold text-red-300">
                Immediate Attention Required
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-red-200">

                {pendingImmediateActions === 1
                  ? "1 immediate action still requires your attention."
                  : `${pendingImmediateActions} immediate actions still require your attention.`}

              </p>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Prioritize urgent safety actions before
                completing less urgent recovery tasks.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* All immediate tasks completed */}
      {pendingImmediateActions === 0 &&
        !allCompleted &&
        totalActions > 0 && (
          <div className="mt-7 rounded-xl border border-cyan-800 bg-cyan-950/20 p-4">

            <h4 className="font-bold text-cyan-300">
              No Immediate Tasks Pending
            </h4>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              All listed immediate actions have been marked
              as completed. Continue with the remaining
              important and follow-up actions.
            </p>

          </div>
        )}

      {/* Completed recovery checklist */}
      {allCompleted && (
        <div
          role="status"
          className="mt-7 rounded-xl border border-green-800 bg-green-950/30 p-5"
        >

          <div className="flex items-start gap-3">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 shrink-0 text-green-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m8 12 3 3 5-6" />
            </svg>

            <div>

              <h4 className="text-lg font-bold text-green-300">
                Recovery Checklist Completed
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                You have marked all recommended recovery
                actions as completed.
              </p>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Continue monitoring your accounts and follow
                any instructions provided by official
                authorities or service providers.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Uncertainty warning */}
      {plan.needs_review && (
        <div className="mt-5 rounded-xl border border-amber-800 bg-amber-950/20 p-4">

          <h4 className="font-semibold text-amber-300">
            Additional Review Recommended
          </h4>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Some incident details may be uncertain or
            require additional review. Seek appropriate
            assistance through official channels.
          </p>

        </div>
      )}

      {/* Database persistence information */}
      <div className="mt-7 border-t border-slate-700 pt-5">

        <div className="flex items-start gap-3">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-5 w-5 shrink-0 text-green-400"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v14a8 3 0 0 0 16 0V5" />
            <path d="M4 12a8 3 0 0 0 16 0" />
          </svg>

          <div>

            <p className="text-sm font-semibold text-slate-300">
              Saved Recovery Progress
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Last saved: {formatDate(plan.updated_at)}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Progress is retrieved from your saved
              recovery records.
            </p>

          </div>

        </div>

      </div>

      {/* Safety disclaimer */}
      <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950/40 p-4">

        <p className="text-xs leading-relaxed text-slate-400">
          Recovery progress represents self-reported
          checklist completion. It does not independently
          verify account security, financial recovery or
          resolution of the cyber incident.
        </p>

      </div>

    </section>
  );
}