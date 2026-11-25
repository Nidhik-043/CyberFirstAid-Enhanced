"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Interactive personalized recovery checklist

import { useState } from "react";

import ActionCard from "./ActionCard";

import type {
  RecoveryPlan,
  ActionPriority,
} from "../../lib/emergency/types";

type ChecklistFilter =
  | "all"
  | "pending"
  | "completed";

interface RecoveryChecklistProps {
  plan: RecoveryPlan;
  onToggle?: (
    taskId: string,
    completed: boolean
  ) => void;
  updatingTaskId?: string | null;
  disabled?: boolean;
  showCheckbox?: boolean;
  error?: string | null;
}

const PRIORITY_GROUPS: {
  priority: ActionPriority;
  title: string;
  description: string;
  textColor: string;
  borderColor: string;
  background: string;
}[] = [
  {
    priority: "immediate",
    title: "Act Immediately",
    description:
      "Prioritize these actions to reduce possible ongoing harm.",
    textColor: "text-red-400",
    borderColor: "border-red-800",
    background: "bg-red-950/20",
  },

  {
    priority: "high",
    title: "Important Actions",
    description:
      "Complete these actions to support incident response and recovery.",
    textColor: "text-amber-400",
    borderColor: "border-amber-800",
    background: "bg-amber-950/20",
  },

  {
    priority: "follow_up",
    title: "Follow-up Actions",
    description:
      "Continue monitoring and strengthening your digital security.",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-800",
    background: "bg-cyan-950/20",
  },
];

export default function RecoveryChecklist({
  plan,
  onToggle,
  updatingTaskId = null,
  disabled = false,
  showCheckbox = true,
  error = null,
}: RecoveryChecklistProps) {
  const [filter, setFilter] =
    useState<ChecklistFilter>("all");

  const actions = plan.actions;

  const totalActions = actions.length;

  const completedActions = actions.filter(
    (action) => action.completed
  ).length;

  const pendingActions =
    totalActions - completedActions;

  const pendingImmediateActions = actions.filter(
    (action) =>
      action.priority === "immediate" &&
      !action.completed
  ).length;

  const isUpdating = updatingTaskId !== null;

  const filters: {
    id: ChecklistFilter;
    label: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "All Actions",
      count: totalActions,
    },
    {
      id: "pending",
      label: "Pending",
      count: pendingActions,
    },
    {
      id: "completed",
      label: "Completed",
      count: completedActions,
    },
  ];

  // Filter recovery actions according to completion.
  const filteredActions = actions
    .filter((action) => {
      if (filter === "pending") {
        return !action.completed;
      }

      if (filter === "completed") {
        return action.completed;
      }

      return true;
    })
    .sort((first, second) => {
      return first.order - second.order;
    });

  // Organize actions into priority groups.
  const groupedActions = PRIORITY_GROUPS.map(
    (group) => {
      const allGroupActions = actions.filter(
        (action) =>
          action.priority === group.priority
      );

      const visibleActions = filteredActions.filter(
        (action) =>
          action.priority === group.priority
      );

      const completed = allGroupActions.filter(
        (action) => action.completed
      ).length;

      return {
        ...group,
        actions: visibleActions,
        total: allGroupActions.length,
        completed,
      };
    }
  );

  function handleToggle(
    taskId: string,
    completed: boolean
  ) {
    if (
      disabled ||
      isUpdating ||
      !onToggle
    ) {
      return;
    }

    onToggle(taskId, completed);
  }

  return (
    <section
      aria-busy={isUpdating}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-8"
    >

      {/* Component heading */}
      <div className="mb-7 flex items-start gap-4">

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
            <rect
              x="5"
              y="4"
              width="14"
              height="17"
              rx="2"
            />

            <path d="M9 4V2h6v2" />

            <path d="m8 10 2 2 4-4" />

            <path d="M8 16h8" />
          </svg>

        </div>

        <div>

          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Step 03
          </p>

          <h2 className="text-xl font-bold text-white md:text-2xl">
            Your Personalized Recovery Checklist
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Follow the recommended actions in priority
            order and track your recovery checklist
            completion.
          </p>

        </div>

      </div>

      {/* Incident information */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-4">

        <span className="font-mono text-xs font-semibold text-cyan-400">
          INCIDENT #{plan.incident_id}
        </span>

        <span className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
          {plan.category_label}
        </span>

        <span className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-400">
          Plan #{plan.plan_id}
        </span>

      </div>

      {/* Personalized recommendation message */}
      {plan.message && (
        <div className="mb-6 rounded-xl border border-cyan-800 bg-cyan-950/20 p-4">

          <h3 className="text-sm font-bold text-cyan-300">
            Personalized Recommendation
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {plan.message}
          </p>

        </div>
      )}

      {/* Urgent actions warning */}
      {pendingImmediateActions > 0 && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4"
        >

          <div className="flex items-start gap-3">

            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-700 bg-red-950 text-sm font-bold text-red-400"
            >
              !
            </span>

            <div>

              <h3 className="font-bold text-red-300">
                Immediate Actions Pending
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-red-200">

                {pendingImmediateActions === 1
                  ? "You have 1 immediate action pending."
                  : `You have ${pendingImmediateActions} immediate actions pending.`}

              </p>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Do not delay urgent safety measures or
                official reporting.
              </p>

              {filter === "completed" && (
                <button
                  type="button"
                  onClick={() => setFilter("pending")}
                  className="mt-3 rounded-lg border border-red-700 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950"
                >
                  View Pending Actions
                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {/* Checklist filters */}
      <div className="mb-7">

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

          <h3 className="text-sm font-semibold text-slate-300">
            Filter Recovery Actions
          </h3>

          <span className="text-xs text-slate-500">
            {filteredActions.length} of {totalActions}
            {" actions"}
          </span>

        </div>

        <div
          role="group"
          aria-label="Filter recovery actions"
          className="grid grid-cols-3 gap-2"
        >

          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-xl border px-2 py-3 text-xs font-semibold transition md:px-4 md:text-sm ${
                filter === item.id
                  ? "border-cyan-500 bg-cyan-950/50 text-cyan-300"
                  : "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500"
              }`}
            >

              <span className="block">
                {item.label}
              </span>

              <span className="mt-1 block text-lg font-bold">
                {item.count}
              </span>

            </button>
          ))}

        </div>

      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4"
        >

          <h3 className="text-sm font-bold text-red-300">
            Recovery Update Failed
          </h3>

          <p className="mt-2 text-sm text-red-200">
            {error}
          </p>

        </div>
      )}

      {/* Updating indicator */}
      {isUpdating && (
        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-cyan-800 bg-cyan-950/20 p-4"
        >

          <span
            aria-hidden="true"
            className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-cyan-900 border-t-cyan-400"
          />

          <p className="text-sm font-medium text-cyan-300">
            Saving your recovery progress...
          </p>

        </div>
      )}

      {/* Priority-wise recovery actions */}
      <div className="space-y-9">

        {groupedActions.map((group) => {
          if (group.actions.length === 0) {
            return null;
          }

          return (
            <div key={group.priority}>

              {/* Priority group heading */}
              <div
                className={`mb-4 rounded-xl border p-4 ${group.borderColor} ${group.background}`}
              >

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <h3
                    className={`text-lg font-bold ${group.textColor}`}
                  >
                    {group.title}
                  </h3>

                  <span
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold ${group.borderColor} ${group.textColor}`}
                  >
                    {group.completed} / {group.total}
                    {" completed"}
                  </span>

                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {group.description}
                </p>

              </div>

              {/* Individual recovery action cards */}
              <div className="space-y-4">

                {group.actions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onToggle={
                      onToggle
                        ? handleToggle
                        : undefined
                    }
                    updating={
                      updatingTaskId === action.id
                    }
                    disabled={
                      disabled || isUpdating
                    }
                    showCheckbox={showCheckbox}
                  />
                ))}

              </div>

            </div>
          );
        })}

      </div>

      {/* Empty filter results */}
      {filteredActions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-5 py-12 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-slate-400"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="4"
                width="14"
                height="17"
                rx="2"
              />

              <path d="M9 4V2h6v2" />

              <path d="m8 12 3 3 5-6" />
            </svg>

          </div>

          <h3 className="text-lg font-bold text-white">

            {filter === "completed"
              ? "No Completed Actions Yet"
              : filter === "pending"
                ? "No Pending Actions"
                : "No Recovery Actions Available"}

          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">

            {filter === "completed"
              ? "Actions will appear here after you mark them as completed."
              : filter === "pending"
                ? "There are no remaining actions in your current checklist."
                : "Generate or review your personalized recovery plan to receive recommended actions."}

          </p>

          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-5 rounded-xl border border-cyan-800 bg-cyan-950/30 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-950/60"
            >
              View All Actions
            </button>
          )}

        </div>
      )}

      {/* Completed checklist message */}
      {totalActions > 0 &&
        pendingActions === 0 && (
          <div className="mt-7 rounded-xl border border-green-800 bg-green-950/30 p-5">

            <h3 className="font-bold text-green-300">
              All Recovery Actions Completed
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              You have marked every action in your
              personalized checklist as completed.
              Continue monitoring your accounts and
              following official guidance.
            </p>

          </div>
        )}

      {/* Additional review notice */}
      {plan.needs_review && (
        <div className="mt-6 rounded-xl border border-amber-800 bg-amber-950/20 p-4">

          <h3 className="font-semibold text-amber-300">
            Additional Review Recommended
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Some incident details remain uncertain.
            The recommended actions should be reviewed
            with appropriate official assistance when
            necessary.
          </p>

        </div>
      )}

      {/* Checklist guidance */}
      <div className="mt-7 rounded-xl border border-slate-700 bg-slate-950/40 p-4">

        <h3 className="text-sm font-semibold text-slate-300">
          Recovery Checklist Guidance
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Only mark an action as completed after you
          have actually performed it. You can mark an
          action as incomplete again if further work
          is required.
        </p>

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          {plan.disclaimer}
        </p>

      </div>

    </section>
  );
}