"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Integrated emergency assistance page

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Reusable emergency components
import IncidentSelector from "../../components/emergency/IncidentSelector";
import EmergencyContacts from "../../components/emergency/EmergencyContacts";
import Questionnaire from "../../components/emergency/Questionnaire";
import RecoveryProgress from "../../components/emergency/RecoveryProgress";
import RecoveryChecklist from "../../components/emergency/RecoveryChecklist";

// Backend API functions
import {
  getIncidents,
  getEmergencyQuestions,
  getEmergencyContacts,
  generateActionPlan,
  getRecoveryPlan,
  updateRecoveryTask,
  getApiErrorMessage,
  isNotFoundError,
  isAbortError,
} from "../../lib/emergency/api";

// TypeScript interfaces
import type {
  Incident,
  IncidentCategory,
  EmergencyContact,
  EmergencyQuestionnaire,
  EmergencyAnswers,
  AnswerValue,
  RecoveryPlan,
} from "../../lib/emergency/types";

interface EmergencyGuide {
  id: IncidentCategory;
  title: string;
  urgency: string;
  steps: string[];
}

// Immediate guidance remains available even
// when the backend server is unavailable.
const EMERGENCY_GUIDES: EmergencyGuide[] = [
  {
    id: "financial_fraud",
    title: "Online Payment / Financial Fraud",
    urgency: "Act immediately",
    steps: [
      "Contact your bank or payment provider immediately using official support channels.",
      "In India, call 1930 to report financial cyber fraud.",
      "Report the incident at cybercrime.gov.in.",
      "Preserve transaction IDs, payment receipts and relevant screenshots.",
      "Secure affected accounts from a trusted device.",
    ],
  },

  {
    id: "phishing",
    title: "Phishing Attack",
    urgency: "Stop interacting immediately",
    steps: [
      "Do not click additional links or reply to the suspicious sender.",
      "Close suspicious websites without entering further information.",
      "If you entered a password, change it from a trusted device.",
      "Contact your bank immediately if financial information was exposed.",
      "Preserve the suspicious message safely for reporting.",
    ],
  },

  {
    id: "social_media_hacking",
    title: "Social Media Account Hacking",
    urgency: "Secure your account",
    steps: [
      "Use the platform's official account recovery process.",
      "Change your password from a trusted device if you still have access.",
      "Secure the email account linked to your social media account.",
      "Review active sessions and remove unfamiliar devices.",
      "Enable two-factor authentication and warn contacts about suspicious messages.",
    ],
  },

  {
    id: "email_compromise",
    title: "Email Account Compromise",
    urgency: "Protect your email immediately",
    steps: [
      "Recover your email account through the official provider.",
      "Change the password from a trusted device.",
      "Review recovery email addresses and telephone numbers.",
      "Check for unfamiliar forwarding rules and active sessions.",
      "Secure other accounts that use the same password.",
    ],
  },

  {
    id: "identity_theft",
    title: "Identity Theft",
    urgency: "Prevent further misuse",
    steps: [
      "Identify which personal information may have been exposed.",
      "Contact affected financial institutions and service providers.",
      "Report impersonation through official platform channels.",
      "Preserve relevant evidence securely.",
      "Monitor accounts for unauthorized activity.",
    ],
  },

  {
    id: "online_harassment",
    title: "Online Harassment",
    urgency: "Prioritize your personal safety",
    steps: [
      "If there is immediate physical danger in India, call 112.",
      "Preserve threatening messages and relevant screenshots safely.",
      "Avoid responding to threats or sharing additional personal information.",
      "Use official reporting and blocking features where safe.",
      "Seek support from someone you trust.",
    ],
  },

  {
    id: "lost_stolen_devices",
    title: "Lost or Stolen Device",
    urgency: "Protect your information",
    steps: [
      "Use the device manufacturer's official find-device service.",
      "Remotely lock the device if the feature is available.",
      "Contact your mobile operator to suspend the SIM when necessary.",
      "Secure important accounts accessible from the device.",
      "Report theft to the appropriate authorities.",
    ],
  },

  {
    id: "unknown",
    title: "Other / Unidentified Incident",
    urgency: "Prevent further exposure",
    steps: [
      "Stop interacting with suspicious messages, websites or callers.",
      "Do not share passwords, OTPs, PINs or personal information.",
      "Preserve relevant information securely.",
      "Contact your bank immediately if financial loss is suspected.",
      "Seek assistance through appropriate official reporting channels.",
    ],
  },
];

export default function EmergencyPage() {
  // Immediate emergency guidance
  const [selectedGuideId, setSelectedGuideId] =
    useState<IncidentCategory>("financial_fraud");

  // Incident records
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

  // Questionnaire
  const [questionnaire, setQuestionnaire] =
    useState<EmergencyQuestionnaire | null>(null);

  const [answers, setAnswers] =
    useState<EmergencyAnswers>({});

  const [questionnaireLoading, setQuestionnaireLoading] =
    useState(false);

  const [questionnaireError, setQuestionnaireError] =
    useState<string | null>(null);

  // Recovery plan
  const [plan, setPlan] =
    useState<RecoveryPlan | null>(null);

  const [planLoading, setPlanLoading] =
    useState(false);

  const [planLoadError, setPlanLoadError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

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

  const [detailRetry, setDetailRetry] =
    useState(0);

  // Prevent overlapping write requests.
  const writeInProgress = useRef(false);

  // Prevent an old response from updating
  // a newly selected incident.
  const activeIncidentId = useRef<number | null>(null);

  const selectedGuide =
    EMERGENCY_GUIDES.find(
      (guide) => guide.id === selectedGuideId
    ) || EMERGENCY_GUIDES[0];

  const selectedIncidentId =
    selectedIncident?.incident_id ?? null;

  const selectedCategory =
    selectedIncident?.incident_category ?? null;

  const isBusy =
    submitting || updatingTaskId !== null;

  // Load official emergency contacts independently.
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

  // Load existing incident records.
  useEffect(() => {
    const controller = new AbortController();

    getIncidents(controller.signal)
      .then((records) => {
        if (controller.signal.aborted) {
          return;
        }

        setIncidents(records);
        setIncidentsError(null);

        // Support links such as:
        // /emergency?incident_id=13
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

          setQuestionnaire(null);
          setAnswers({});
          setPlan(null);
          setQuestionnaireError(null);
          setPlanLoadError(null);
          setGenerationError(null);
          setUpdateError(null);
          setSuccessMessage(null);

          if (matchingIncident) {
            activeIncidentId.current =
              matchingIncident.incident_id;

            setSelectedIncident(matchingIncident);

            setSelectedGuideId(
              matchingIncident.incident_category
            );

            setQuestionnaireLoading(true);
            setPlanLoading(true);
            setDetailRetry((previous) => previous + 1);
          } else {
            activeIncidentId.current = null;
            setSelectedIncident(null);
            setQuestionnaireLoading(false);
            setPlanLoading(false);
            setIncidentsError(
              "The requested incident was not found. Select another available incident."
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

  // Load category-specific questions and any
  // previously saved recovery plan.
  useEffect(() => {
    if (
      selectedIncidentId === null ||
      selectedCategory === null
    ) {
      return;
    }

    const controller = new AbortController();

    const isCurrentRequest = () =>
      !controller.signal.aborted &&
      activeIncidentId.current === selectedIncidentId;

    getEmergencyQuestions(
      selectedCategory,
      controller.signal
    )
      .then((response) => {
        if (isCurrentRequest()) {
          setQuestionnaire(response);
          setQuestionnaireError(null);
        }
      })
      .catch((error: unknown) => {
        if (
          isCurrentRequest() &&
          !isAbortError(error)
        ) {
          setQuestionnaire(null);
          setQuestionnaireError(
            getApiErrorMessage(error)
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest()) {
          setQuestionnaireLoading(false);
        }
      });

    getRecoveryPlan(
      selectedIncidentId,
      controller.signal
    )
      .then((savedPlan) => {
        if (isCurrentRequest()) {
          setPlan(savedPlan);

          // Restore previously submitted answers.
          setAnswers({ ...savedPlan.answers });

          setPlanLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (
          !isCurrentRequest() ||
          isAbortError(error)
        ) {
          return;
        }

        if (isNotFoundError(error)) {
          // No recovery plan has been created yet.
          setPlan(null);
          setPlanLoadError(null);
        } else {
          setPlanLoadError(
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
  }, [
    selectedIncidentId,
    selectedCategory,
    detailRetry,
  ]);

  // Select an incident from the database.
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

    setSelectedGuideId(
      incident.incident_category
    );

    // Clear the previous incident's information.
    setQuestionnaire(null);
    setAnswers({});
    setPlan(null);

    setQuestionnaireLoading(true);
    setPlanLoading(true);

    setQuestionnaireError(null);
    setPlanLoadError(null);
    setGenerationError(null);
    setUpdateError(null);
    setSuccessMessage(null);

    // Keep the selected incident in the URL.
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

  // Retry loading incident records.
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

  // Retry loading the questionnaire and saved plan.
  function handleDetailRetry() {
    if (writeInProgress.current) {
      return;
    }

    setQuestionnaireLoading(true);
    setPlanLoading(true);

    setQuestionnaireError(null);
    setPlanLoadError(null);
    setGenerationError(null);
    setSuccessMessage(null);

    setDetailRetry(
      (previous) => previous + 1
    );
  }

  // Store questionnaire answers.
  function handleAnswer(
    questionId: string,
    answer: AnswerValue
  ) {
    if (
      writeInProgress.current ||
      planLoading
    ) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));

    setGenerationError(null);
    setSuccessMessage(null);
  }

  // Generate a personalized action plan.
  async function handleGeneratePlan() {
    if (
      !selectedIncident ||
      !questionnaire ||
      writeInProgress.current ||
      planLoading ||
      planLoadError
    ) {
      return;
    }

    const allAnswered =
      questionnaire.questions.every(
        (question) =>
          answers[question.id] === "yes" ||
          answers[question.id] === "no" ||
          answers[question.id] === "unsure"
      );

    if (!allAnswered) {
      setGenerationError(
        "Please answer all questions before generating your action plan."
      );

      return;
    }

    const incidentId =
      selectedIncident.incident_id;

    // Send only answers belonging to this questionnaire.
    const submittedAnswers: EmergencyAnswers = {};

    for (const question of questionnaire.questions) {
      submittedAnswers[question.id] =
        answers[question.id];
    }

    // Protect previously saved recovery progress.
    if (plan) {
      const answersChanged =
        questionnaire.questions.some(
          (question) =>
            plan.answers[question.id] !==
            submittedAnswers[question.id]
        );

      if (answersChanged) {
        const confirmed = window.confirm(
          "Your answers have changed. Regenerating this plan will reset existing recovery checklist progress. Do you want to continue?"
        );

        if (!confirmed) {
          return;
        }
      }
    }

    writeInProgress.current = true;

    setSubmitting(true);
    setGenerationError(null);
    setUpdateError(null);
    setSuccessMessage(null);

    try {
      const response = await generateActionPlan({
        incident_id: incidentId,
        category:
          selectedIncident.incident_category,
        answers: submittedAnswers,
      });

      if (
        activeIncidentId.current === incidentId
      ) {
        setPlan(response);
        setAnswers({ ...response.answers });

        setSuccessMessage(
          "Your personalized action plan has been generated and saved successfully."
        );
      }
    } catch (error: unknown) {
      if (
        activeIncidentId.current === incidentId
      ) {
        setGenerationError(
          getApiErrorMessage(error)
        );
      }
    } finally {
      writeInProgress.current = false;
      setSubmitting(false);
    }
  }

  // Save recovery task completion to the database.
  async function handleTaskToggle(
    taskId: string,
    completed: boolean
  ) {
    if (
      !plan ||
      !selectedIncident ||
      writeInProgress.current ||
      planLoading ||
      planLoadError
    ) {
      return;
    }

    const incidentId =
      selectedIncident.incident_id;

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
        // Use the actual saved backend response.
        setPlan(updatedPlan);

        setSuccessMessage(
          "Recovery progress saved successfully."
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

  const answersChanged = Boolean(
    plan &&
      questionnaire &&
      questionnaire.questions.some(
        (question) =>
          plan.answers[question.id] !==
          answers[question.id]
      )
  );

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
            href="/recovery"
            className="text-sm text-slate-300 hover:text-cyan-400"
          >
            Recovery Tracker
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-300 hover:text-cyan-400"
          >
            Back to Home
          </Link>

        </div>

      </nav>

      <div className="mx-auto max-w-7xl space-y-10 px-5 py-12 md:px-8">

        {/* Page heading */}
        <header className="mx-auto max-w-4xl text-center">

          <span className="inline-block rounded-full border border-red-800 bg-red-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300">
            Emergency Cyber First Aid
          </span>

          <h1 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
            Personalized Cyber
            <span className="block text-cyan-400">
              Emergency Assistant
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
            Receive immediate cyber safety guidance,
            answer incident-specific questions and
            generate a personalized recovery plan
            with prioritized, explainable recommendations.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">

            {[
              "Personalized Guidance",
              "Explainable Recommendations",
              "Persistent Recovery Tracking",
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
        <div className="rounded-xl border border-amber-800 bg-amber-950/20 p-4">

          <h2 className="text-sm font-bold text-amber-300">
            Prototype and Privacy Notice
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            This demonstration does not yet provide
            authenticated access to individual incident
            records. Use simulated incidents only.
            Never enter actual passwords, OTPs, PINs,
            financial credentials or confidential
            personal information.
          </p>

        </div>

        {/* Official contacts remain available independently */}
        <EmergencyContacts
          contacts={contacts}
          loading={contactsLoading}
        />

        {/* Immediate emergency guidance */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-8">

          <div className="mb-7">

            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
              Immediate Safety Guidance
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              What You Should Do Now
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Choose the relevant incident type to view
              immediate safety instructions. You do not
              need a saved incident or completed
              questionnaire to use this guidance.
            </p>

          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Emergency guide category selector */}
            <div className="space-y-2">

              <h3 className="mb-4 text-sm font-semibold text-slate-300">
                Select Incident Type
              </h3>

              {EMERGENCY_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  aria-pressed={
                    selectedGuideId === guide.id
                  }
                  onClick={() =>
                    setSelectedGuideId(guide.id)
                  }
                  className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition ${
                    selectedGuideId === guide.id
                      ? "border-cyan-500 bg-cyan-950/50 text-cyan-300"
                      : "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {guide.title}
                </button>
              ))}

            </div>

            {/* Immediate guidance instructions */}
            <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5 md:p-6 lg:col-span-2">

              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {selectedGuide.urgency}
              </p>

              <h3 className="mt-3 text-xl font-bold text-cyan-300">
                {selectedGuide.title}
              </h3>

              <ol className="mt-6 space-y-3">

                {selectedGuide.steps.map(
                  (step, index) => (
                    <li
                      key={step}
                      className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4"
                    >

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-relaxed text-slate-200">
                        {step}
                      </p>

                    </li>
                  )
                )}

              </ol>

              <div className="mt-6 rounded-xl border border-amber-800 bg-amber-950/20 p-4">

                <h4 className="text-sm font-bold text-amber-300">
                  Important Safety Reminder
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Never share passwords, OTPs, PINs or
                  recovery codes with anyone claiming
                  to help you. Use official support
                  channels only.
                </p>

              </div>

              <Link
                href="/report"
                className="mt-6 block rounded-xl bg-cyan-500 px-5 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Continue to Incident Reporting
              </Link>

            </div>

          </div>

        </section>

        {/* Personalized assistant introduction */}
        <section className="rounded-2xl border border-cyan-900 bg-cyan-950/15 p-5 md:p-7">

          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Personalized Assistance
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Build Your Incident-Specific Recovery Plan
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Select an existing assessed incident below.
            Our rule-based expert system uses your
            answers to recommend relevant actions,
            explain their importance and organize
            your recovery checklist.
          </p>

        </section>

        {/* Incident loading error */}
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
              disabled={isBusy || incidentsLoading}
              className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
            >
              Retry Loading Incidents
            </button>

          </div>
        )}

        {/* Step 01 - Existing incident selection */}
        <IncidentSelector
          incidents={incidents}
          selectedIncidentId={selectedIncidentId}
          onSelect={handleIncidentSelect}
          loading={incidentsLoading}
          disabled={isBusy || incidentsLoading}
        />

        {/* No selected incident */}
        {!selectedIncident && !incidentsLoading && (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">

            <h2 className="text-lg font-bold">
              Select an Incident to Continue
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              Choose an existing incident to load
              personalized questions and recovery
              recommendations. Immediate safety
              guidance remains available above.
            </p>

          </section>
        )}

        {/* Selected incident workflow */}
        {selectedIncident && (
          <>

            {/* Selected incident information */}
            <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Selected Incident
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Incident #{selectedIncident.incident_id}
                  </h2>

                </div>

                <span className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold capitalize text-slate-300">
                  Risk: {selectedIncident.risk_level}
                </span>

              </div>

              <p className="mt-3 text-sm text-slate-400">
                Category:{" "}
                {questionnaire?.category_label ||
                  EMERGENCY_GUIDES.find(
                    (guide) =>
                      guide.id ===
                      selectedIncident.incident_category
                  )?.title ||
                  selectedIncident.incident_category}
              </p>

              <p className="mt-2 text-xs capitalize text-slate-500">
                Incident status: {selectedIncident.status}
              </p>

              {selectedIncident.needs_review && (
                <p className="mt-3 text-sm text-amber-300">
                  This incident classification may
                  require additional review.
                </p>
              )}

            </section>

            {/* Questionnaire and saved plan loading */}
            {(questionnaireLoading || planLoading) && (
              <div
                role="status"
                className="flex items-center gap-4 rounded-xl border border-cyan-900 bg-cyan-950/20 p-5"
              >

                <span
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-cyan-900 border-t-cyan-400"
                />

                <p className="text-sm text-cyan-300">
                  Loading personalized questions and
                  saved recovery information...
                </p>

              </div>
            )}

            {/* Questionnaire loading error */}
            {questionnaireError && (
              <div
                role="alert"
                className="rounded-xl border border-red-800 bg-red-950/20 p-5"
              >

                <h3 className="font-bold text-red-300">
                  Unable to Load Questionnaire
                </h3>

                <p className="mt-2 text-sm text-red-200">
                  {questionnaireError}
                </p>

                <button
                  type="button"
                  onClick={handleDetailRetry}
                  disabled={
                    isBusy ||
                    questionnaireLoading ||
                    planLoading
                  }
                  className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  Retry
                </button>

              </div>
            )}

            {/* Saved recovery plan loading error */}
            {planLoadError && (
              <div
                role="alert"
                className="rounded-xl border border-red-800 bg-red-950/20 p-5"
              >

                <h3 className="font-bold text-red-300">
                  Unable to Check Saved Recovery Plan
                </h3>

                <p className="mt-2 text-sm text-red-200">
                  {planLoadError}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Plan generation is temporarily disabled
                  to protect previously saved progress.
                </p>

                <button
                  type="button"
                  onClick={handleDetailRetry}
                  disabled={
                    isBusy ||
                    questionnaireLoading ||
                    planLoading
                  }
                  className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  Retry Loading Recovery Plan
                </button>

              </div>
            )}

            {/* Existing plan notification */}
            {plan && !planLoading && !planLoadError && (
              <div className="rounded-xl border border-cyan-800 bg-cyan-950/20 p-5">

                <h3 className="font-bold text-cyan-300">
                  Existing Recovery Plan Found
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Your saved recovery plan and previous
                  questionnaire answers have been restored.
                  You can continue tracking recovery
                  without generating a new plan.
                </p>

                <a
                  href="#personalized-recovery"
                  className="mt-4 inline-block rounded-lg border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-950"
                >
                  View Saved Recovery Plan
                </a>

              </div>
            )}

            {/* Step 02 - Personalized questionnaire */}
            {questionnaire &&
              !questionnaireLoading &&
              !planLoading && (
                <Questionnaire
                  key={`${selectedIncidentId}-${selectedCategory}`}
                  questionnaire={questionnaire}
                  incidentId={selectedIncident.incident_id}
                  answers={answers}
                  onAnswer={handleAnswer}
                  onSubmit={handleGeneratePlan}
                  submitting={submitting}
                  disabled={
                    updatingTaskId !== null ||
                    Boolean(planLoadError)
                  }
                  error={generationError}
                />
              )}

            {/* Changed answers notice */}
            {answersChanged && (
              <div className="rounded-xl border border-amber-800 bg-amber-950/20 p-5">

                <h3 className="font-bold text-amber-300">
                  Questionnaire Answers Changed
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Your current saved recovery plan is
                  based on your previous answers.
                  Generate an updated plan to reflect
                  your new answers. Existing checklist
                  progress will be reset when the
                  changed answers are submitted.
                </p>

                <button
                  type="button"
                  disabled={isBusy || planLoading}
                  onClick={() => {
                    if (plan) {
                      setAnswers({ ...plan.answers });
                      setGenerationError(null);
                    }
                  }}
                  className="mt-4 rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-950 disabled:opacity-50"
                >
                  Restore Saved Answers
                </button>

              </div>
            )}

            {/* Success notification */}
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

            {/* Step 03 - Personalized recovery plan */}
            {plan && !planLoading && !planLoadError && (
              <section
                id="personalized-recovery"
                className="scroll-mt-8 space-y-7"
              >

                <div className="rounded-2xl border border-cyan-800 bg-cyan-950/20 p-5 md:p-7">

                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                    Personalized Action Plan
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    Your Emergency Response Plan
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    Recommendations are generated using
                    the incident category and your
                    questionnaire answers.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">

                    <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                      Rule-Based Expert System
                    </span>

                    <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                      Engine v{plan.engine_version}
                    </span>

                    <span className="rounded-lg border border-green-800 bg-green-950/30 px-3 py-2 text-xs text-green-300">
                      Plan Saved
                    </span>

                  </div>

                </div>

                {/* Recovery statistics */}
                <RecoveryProgress
                  plan={plan}
                  updating={updatingTaskId !== null}
                />

                {/* Recovery checklist and action cards */}
                <RecoveryChecklist
                  key={plan.incident_id}
                  plan={plan}
                  onToggle={handleTaskToggle}
                  updatingTaskId={updatingTaskId}
                  disabled={
                    submitting ||
                    answersChanged ||
                    planLoading
                  }
                  showCheckbox={true}
                  error={updateError}
                />

                {/* Navigation to recovery page */}
                <div className="flex flex-wrap gap-4">

                  <Link
                    href={`/recovery?incident_id=${plan.incident_id}`}
                    className="rounded-xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Open Recovery Tracker
                  </Link>

                  <Link
                    href="/evidence"
                    className="rounded-xl border border-slate-600 px-6 py-4 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                  >
                    Open Evidence Vault
                  </Link>

                </div>

              </section>
            )}

          </>
        )}

        {/* Final safety disclaimer */}
        <footer className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

          <h2 className="text-sm font-bold text-slate-300">
            Important Information
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            CyberFirstAid is an educational cyber incident
            response and recovery assistance prototype.
            Recommendations are generated using predefined
            rules and user-provided answers. The system
            does not independently verify incidents,
            guarantee financial recovery or replace
            official authorities and professional
            cybersecurity assistance.
          </p>

          <p className="mt-4 text-xs text-slate-500">
            CyberFirstAid â€” Personalized Cyber Emergency
            Assistant
          </p>

        </footer>

      </div>

    </main>
  );
}