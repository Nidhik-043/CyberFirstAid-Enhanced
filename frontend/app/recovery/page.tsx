"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Integrated persistent recovery tracker

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Reusable frontend components
import IncidentSelector from "../../components/emergency/IncidentSelector";
import EmergencyContacts from "../../components/emergency/EmergencyContacts";
import RecoveryProgress from "../../components/emergency/RecoveryProgress";
import RecoveryChecklist from "../../components/emergency/RecoveryChecklist";

// Backend API functions
import {
  getIncidents,
  getEmergencyContacts,
  getRecoveryPlan,
  updateRecoveryTask,
  getApiErrorMessage,
  isNotFoundError,
  isAbortError,
} from "../../lib/emergency/api";

// TypeScript interfaces
import type {
  Incident,
  EmergencyContact,
  RecoveryPlan,
} from "../../lib/emergency/types";

import {
  CATEGORY_LABELS,
} from "../../lib/emergency/types";

export default function RecoveryPage() {
  // Existing incident records
  const [incidents, setIncidents] =
    useState<Incident[]>([]);

  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);

  const [incidentsLoading, setIncidentsLoading] =
    useState(true);

  const [incidentsError, setIncidentsError] =
    useState<string | null>(null);

  // Official emergency contacts
  const [contacts, setContacts] =
    useState<EmergencyContact[]>([]);

  const [contactsLoading, setContactsLoading] =
    useState(true);

  // Saved recovery plan
  const [plan, setPlan] =
    useState<RecoveryPlan | null>(null);

  const [planLoading, setPlanLoading] =
    useState(false);

  const [planError, setPlanError] =
    useState<string | null>(null);

  const [noPlanFound, setNoPlanFound] =
    useState(false);

  // Recovery task updates
  const [updatingTaskId, setUpdatingTaskId] =
    useState<string | null>(null);

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  // Retry controls
  const [incidentRetry, setIncidentRetry] =
    useState(0);

  const [planRetry, setPlanRetry] =
    useState(0);

  // Prevent overlapping write requests
  const writeInProgress = useRef(false);

  // Track currently selected incident
  const activeIncidentId =
    useRef<number | null>(null);

  const selectedIncidentId =
    selectedIncident?.incident_id ?? null;

  const isUpdating =
    updatingTaskId !== null;

  // Load emergency contacts independently
  useEffect(() => {
    const controller = new AbortController();

    getEmergencyContacts(controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setContacts(response.contacts);
        }
      })
      .catch(() => {
        // EmergencyContacts provides offline fallback.
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setContactsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Retrieve existing incidents
  useEffect(() => {
    const controller = new AbortController();

    getIncidents(controller.signal)
      .then((records) => {
        if (controller.signal.aborted) {
          return;
        }

        setIncidents(records);
        setIncidentsError(null);

        // Read incident ID from the page URL.
        // Example: /recovery?incident_id=13
        const params = new URLSearchParams(
          window.location.search
        );

        const requestedId = Number(
          params.get("incident_id")
        );

        if (
          Number.isSafeInteger(requestedId) &&
          requestedId > 0
        ) {
          const matchingIncident = records.find(
            (incident) =>
              incident.incident_id === requestedId
          );

          if (matchingIncident) {
            if (
              activeIncidentId.current !== requestedId
            ) {
              setPlan(null);
              setPlanError(null);
              setNoPlanFound(false);
              setPlanLoading(true);
              setUpdateError(null);
              setSuccessMessage(null);
            }

            activeIncidentId.current =
              matchingIncident.incident_id;

            setSelectedIncident(matchingIncident);
          } else {
            activeIncidentId.current = null;

            setSelectedIncident(null);
            setPlan(null);
            setPlanLoading(false);

            setIncidentsError(
              "The requested incident was not found. Please select another incident."
            );
          }
        }
      })
      .catch((error: unknown) => {
        if (
          !controller.signal.aborted &&
          !isAbortError(error)
        ) {
          setIncidentsError(
            getApiErrorMessage(error)
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIncidentsLoading(false);
        }
      });

    return () => controller.abort();
  }, [incidentRetry]);

  // Retrieve the selected incident's saved recovery plan
  useEffect(() => {
    if (selectedIncidentId === null) {
      return;
    }

    const controller = new AbortController();

    const isCurrentRequest = () =>
      !controller.signal.aborted &&
      activeIncidentId.current === selectedIncidentId;

    getRecoveryPlan(
      selectedIncidentId,
      controller.signal
    )
      .then((savedPlan) => {
        if (isCurrentRequest()) {
          setPlan(savedPlan);
          setPlanError(null);
          setNoPlanFound(false);
        }
      })
      .catch((error: unknown) => {
        if (
          !isCurrentRequest() ||
          isAbortError(error)
        ) {
          return;
        }

        setPlan(null);

        if (isNotFoundError(error)) {
          setNoPlanFound(true);
          setPlanError(null);
        } else {
          setNoPlanFound(false);

          setPlanError(
            getApiErrorMessage(error)
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest()) {
          setPlanLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedIncidentId, planRetry]);

  // Select an existing incident
  function handleIncidentSelect(
    incident: Incident
  ) {
    if (
      writeInProgress.current ||
      selectedIncidentId === incident.incident_id
    ) {
      return;
    }

    activeIncidentId.current =
      incident.incident_id;

    setSelectedIncident(incident);

    // Clear previous incident information
    setPlan(null);
    setPlanLoading(true);
    setPlanError(null);
    setNoPlanFound(false);
    setUpdateError(null);
    setSuccessMessage(null);

    // Keep the selected incident in the URL
    const url = new URL(window.location.href);

    url.searchParams.set(
      "incident_id",
      String(incident.incident_id)
    );

    window.history.replaceState(
      null,
      "",
      url.toString()
    );
  }

  // Retry incident retrieval
  function handleIncidentRetry() {
    if (writeInProgress.current) {
      return;
    }

    setIncidentsLoading(true);
    setIncidentsError(null);

    setIncidentRetry(
      (previous) => previous + 1
    );
  }

  // Refresh saved recovery information
  function handlePlanRefresh() {
    if (
      selectedIncidentId === null ||
      writeInProgress.current
    ) {
      return;
    }

    setPlanLoading(true);
    setPlanError(null);
    setNoPlanFound(false);
    setUpdateError(null);
    setSuccessMessage(null);

    setPlanRetry(
      (previous) => previous + 1
    );
  }

  // Save task completion to the database
  async function handleTaskToggle(
    taskId: string,
    completed: boolean
  ) {
    if (
      !plan ||
      selectedIncidentId === null ||
      writeInProgress.current ||
      planLoading ||
      planError
    ) {
      return;
    }

    const incidentId = selectedIncidentId;

    writeInProgress.current = true;

    setUpdatingTaskId(taskId);
    setUpdateError(null);
    setSuccessMessage(null);

    try {
      const updatedPlan =
        await updateRecoveryTask(
          incidentId,
          taskId,
          completed
        );

      if (
        activeIncidentId.current === incidentId
      ) {
        // Use the actual backend response
        setPlan(updatedPlan);

        setSuccessMessage(
          completed
            ? "Recovery action marked as completed and saved successfully."
            : "Recovery action marked as incomplete and saved successfully."
        );
      }
    } catch (error: unknown) {
      if (
        activeIncidentId.current === incidentId
      ) {
        setUpdateError(
          getApiErrorMessage(error)
        );
      }
    } finally {
      writeInProgress.current = false;
      setUpdatingTaskId(null);
    }
  }

  const emergencyPageUrl =
    selectedIncidentId !== null
      ? `/emergency?incident_id=${selectedIncidentId}`
      : "/emergency";

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-5 md:px-16">

        <Link
          href="/"
          className="text-2xl font-bold text-cyan-400"
        >
          CyberFirstAid
        </Link>

        <div className="flex flex-wrap items-center gap-5">

          <Link
            href={emergencyPageUrl}
            className="text-sm text-slate-300 transition hover:text-cyan-400"
          >
            Emergency Assistant
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-300 transition hover:text-cyan-400"
          >
            Back to Home
          </Link>

        </div>

      </nav>

      <div className="mx-auto max-w-6xl space-y-9 px-5 py-12 md:px-8">

        {/* Page heading */}
        <header className="mx-auto max-w-4xl text-center">

          <span className="inline-block rounded-full border border-cyan-800 bg-cyan-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Personalized Incident Recovery
          </span>

          <h1 className="mt-6 text-4xl font-bold md:text-5xl">
            Recovery{" "}
            <span className="text-cyan-400">
              Tracker
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            Track your personalized cybersecurity
            recovery actions, monitor checklist
            completion and continue your recovery
            process with saved incident information.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">

            {[
              "Incident-Specific Actions",
              "Persistent Progress",
              "Prioritized Recovery",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300"
              >
                {feature}
              </span>
            ))}

          </div>

        </header>

        {/* Prototype privacy notice */}
        <section className="rounded-xl border border-amber-800 bg-amber-950/20 p-4">

          <h2 className="text-sm font-bold text-amber-300">
            Prototype and Privacy Notice
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            This demonstration does not yet provide
            authenticated access to individual incident
            records. Use simulated incidents only.
            Never enter confidential personal information,
            passwords, OTPs, PINs or financial credentials.
          </p>

        </section>

        {/* Recovery workflow explanation */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

          <h2 className="text-xl font-bold">
            How Recovery Tracking Works
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            {[
              {
                number: "01",
                title: "Select Incident",
                description:
                  "Choose an existing assessed cyber incident.",
              },
              {
                number: "02",
                title: "Retrieve Saved Plan",
                description:
                  "Load your personalized recovery recommendations.",
              },
              {
                number: "03",
                title: "Track Your Progress",
                description:
                  "Complete actions and save your progress to the database.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-slate-700 bg-slate-950/40 p-4"
              >

                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-800 bg-cyan-950/40 text-sm font-bold text-cyan-400">
                  {step.number}
                </span>

                <h3 className="mt-4 font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* Incident loading errors */}
        {incidentsError && (
          <div
            role="alert"
            className="rounded-xl border border-red-800 bg-red-950/20 p-5"
          >

            <h3 className="font-bold text-red-300">
              Incident Records Notice
            </h3>

            <p className="mt-2 text-sm text-red-200">
              {incidentsError}
            </p>

            <button
              type="button"
              onClick={handleIncidentRetry}
              disabled={
                incidentsLoading || isUpdating
              }
              className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
            >
              Retry Loading Incidents
            </button>

          </div>
        )}

        {/* Existing incident selector */}
        <IncidentSelector
          incidents={incidents}
          selectedIncidentId={selectedIncidentId}
          onSelect={handleIncidentSelect}
          loading={incidentsLoading}
          disabled={
            isUpdating || incidentsLoading
          }
        />

        {/* No incident selected */}
        {!selectedIncident && !incidentsLoading && (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">

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

                <path d="M8 10h8M8 15h8" />
              </svg>

            </div>

            <h2 className="text-xl font-bold">
              Select an Incident
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
              Choose an incident above to retrieve
              its personalized recovery checklist
              and saved completion progress.
            </p>

            <Link
              href="/emergency"
              className="mt-5 inline-block rounded-xl border border-cyan-800 bg-cyan-950/30 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-950"
            >
              Open Emergency Assistant
            </Link>

          </section>
        )}

        {/* Selected incident workflow */}
        {selectedIncident && (
          <>

            {/* Selected incident information */}
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 md:p-7">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                    Selected Incident
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Incident #{selectedIncident.incident_id}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {plan?.category_label ||
                      CATEGORY_LABELS[
                        selectedIncident.incident_category
                      ] ||
                      selectedIncident.incident_category}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handlePlanRefresh}
                  disabled={
                    planLoading || isUpdating
                  }
                  className="rounded-lg border border-cyan-800 bg-cyan-950/30 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {planLoading
                    ? "Refreshing..."
                    : "Refresh Recovery Plan"}
                </button>

              </div>

              <div className="mt-5 flex flex-wrap gap-3">

                <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold capitalize text-slate-300">
                  Risk: {selectedIncident.risk_level}
                </span>

                <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold capitalize text-slate-300">
                  Incident status: {selectedIncident.status}
                </span>

                {plan && !planLoading && (
                  <span className="rounded-lg border border-green-800 bg-green-950/30 px-3 py-2 text-xs font-semibold text-green-300">
                    Saved Recovery Plan
                  </span>
                )}

              </div>

              {selectedIncident.needs_review && (
                <p className="mt-4 text-sm text-amber-300">
                  This incident classification may
                  require additional review.
                </p>
              )}

            </section>

            {/* Recovery plan loading */}
            {planLoading && (
              <div
                role="status"
                className="flex items-center gap-4 rounded-xl border border-cyan-900 bg-cyan-950/20 p-5"
              >

                <span
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-cyan-900 border-t-cyan-400"
                />

                <p className="text-sm text-cyan-300">
                  Retrieving your saved recovery plan...
                </p>

              </div>
            )}

            {/* Recovery plan error */}
            {planError && (
              <section
                role="alert"
                className="rounded-xl border border-red-800 bg-red-950/20 p-5"
              >

                <h3 className="font-bold text-red-300">
                  Unable to Load Recovery Plan
                </h3>

                <p className="mt-2 text-sm text-red-200">
                  {planError}
                </p>

                <button
                  type="button"
                  onClick={handlePlanRefresh}
                  disabled={
                    planLoading || isUpdating
                  }
                  className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  Retry
                </button>

              </section>
            )}

            {/* No saved plan exists */}
            {noPlanFound && !planLoading && (
              <section className="rounded-2xl border border-amber-800 bg-amber-950/15 p-7 text-center">

                <h2 className="text-xl font-bold text-amber-300">
                  No Saved Recovery Plan Found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                  A personalized recovery plan has not
                  yet been found for this incident.
                  Open the Emergency Assistant and
                  complete the incident-specific
                  questionnaire to generate one.
                </p>

                <Link
                  href={emergencyPageUrl}
                  className="mt-6 inline-block rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Generate Personalized Recovery Plan
                </Link>

              </section>
            )}

            {/* Saved update notification */}
            {successMessage && (
              <div
                role="status"
                className="rounded-xl border border-green-800 bg-green-950/20 p-4"
              >

                <p className="text-sm font-semibold text-green-300">
                  {successMessage}
                </p>

              </div>
            )}

            {/* Actual saved recovery plan */}
            {plan && !planLoading && !planError && (
              <section className="space-y-7">

                {/* Saved recovery statistics */}
                <RecoveryProgress
                  plan={plan}
                  updating={isUpdating}
                />

                {/* Personalized recovery checklist */}
                <RecoveryChecklist
                  key={plan.incident_id}
                  plan={plan}
                  onToggle={handleTaskToggle}
                  updatingTaskId={updatingTaskId}
                  disabled={
                    isUpdating || planLoading
                  }
                  showCheckbox={true}
                  error={updateError}
                />

                {/* Plan information */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

                  <h2 className="text-lg font-bold">
                    Recovery Plan Information
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">

                      <p className="text-xs text-slate-500">
                        Recovery Plan ID
                      </p>

                      <p className="mt-2 font-mono font-semibold text-cyan-300">
                        #{plan.plan_id}
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">

                      <p className="text-xs text-slate-500">
                        Associated Incident
                      </p>

                      <p className="mt-2 font-mono font-semibold text-cyan-300">
                        #{plan.incident_id}
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">

                      <p className="text-xs text-slate-500">
                        Recommendation Engine
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-200">
                        Rule-Based Expert System
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">

                      <p className="text-xs text-slate-500">
                        Engine Version
                      </p>

                      <p className="mt-2 font-mono font-semibold text-slate-200">
                        {plan.engine_version}
                      </p>

                    </div>

                  </div>

                  <p className="mt-5 text-xs leading-relaxed text-slate-400">
                    Recovery task completion is saved
                    through the backend API. Refreshing
                    this page retrieves the saved
                    checklist instead of resetting it.
                  </p>

                </section>

              </section>
            )}

          </>
        )}

        {/* Official emergency contacts */}
        <EmergencyContacts
          contacts={contacts}
          loading={contactsLoading}
        />

        {/* Additional navigation */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

          <h2 className="text-xl font-bold">
            Continue Your Recovery
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Access emergency guidance, review incident
            assessment information or preserve relevant
            digital evidence.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <Link
              href={emergencyPageUrl}
              className="rounded-xl border border-red-800 bg-red-950/30 px-5 py-4 text-center text-sm font-semibold text-red-300 hover:bg-red-950/60"
            >
              Emergency Help
            </Link>

            <Link
              href="/assessment"
              className="rounded-xl border border-cyan-800 bg-cyan-950/30 px-5 py-4 text-center text-sm font-semibold text-cyan-300 hover:bg-cyan-950"
            >
              View Assessment
            </Link>

            <Link
              href="/evidence"
              className="rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-4 text-center text-sm font-semibold text-slate-300 hover:border-cyan-600"
            >
              Open Evidence Vault
            </Link>

          </div>

        </section>

        {/* Safety disclaimer */}
        <footer className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

          <h2 className="text-sm font-bold text-slate-300">
            Important Recovery Information
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            CyberFirstAid is an educational cyber
            incident response and recovery assistance
            prototype. Completing the recovery checklist
            does not independently verify that an
            incident has been resolved or guarantee
            financial recovery. Continue monitoring
            affected accounts and following official
            guidance when necessary.
          </p>

          <p className="mt-4 text-xs text-slate-500">
            CyberFirstAid â€” Personalized Recovery Tracker
          </p>

        </footer>

      </div>

    </main>
  );
}