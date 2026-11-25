
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type IncidentQuestion = {
  id: string;
  question: string;
  answer_type: string;
  options: string[];
};

export default function ReportIncident() {
  const router = useRouter();

  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [isOngoing, setIsOngoing] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<IncidentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");

  async function handleIncidentTypeChange(category: string) {
    setIncidentType(category);
    setQuestions([]);
    setAnswers({});
    setError("");

    if (!category || category === "unknown") return;

    setLoadingQuestions(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/assessment/questions/${category}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Questions could not be loaded."
        );
      }

      setQuestions(data.questions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load incident questions."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  function handleAnswerChange(questionId: string, answer: string) {
    setAnswers((previous) => ({ ...previous, [questionId]: answer }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (description.trim().length < 10) {
      setError("Please describe the incident in at least 10 characters.");
      return;
    }

    if (loadingQuestions) {
      setError("Please wait until the incident questions finish loading.");
      return;
    }

    if (questions.some((question) => !answers[question.id])) {
      setError("Please answer all the incident-specific questions.");
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    setIncidentId("");

    try {
      const incidentResponse = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType,
          description: description.trim(),
          incidentDate,
          isOngoing: isOngoing === "not_sure" ? "unsure" : isOngoing,
        }),
      });

      const incidentResult = await incidentResponse.json();

      if (!incidentResponse.ok) {
        throw new Error(
          incidentResult.error || "Unable to save the incident report."
        );
      }

      setIncidentId(incidentResult.id);
      setSubmitted(true);

      const assessmentResponse = await fetch(
        "http://localhost:8000/api/assessment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: description.trim(),
            answers,
          }),
        }
      );

      const assessmentData = await assessmentResponse.json();

      if (!assessmentResponse.ok) {
        throw new Error(
          typeof assessmentData.detail === "string"
            ? assessmentData.detail
            : "Incident saved, but AI assessment could not be completed."
        );
      }

      sessionStorage.setItem(
        "cyberfirstaid_assessment",
        JSON.stringify({
          ...assessmentData,
          form_details: {
            incidentType,
            incidentDate,
            isOngoing,
            incidentId: incidentResult.id,
          },
        })
      );

      router.push("/assessment");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function downloadIncidentReport() {
    if (!incidentId) return;

    try {
      const [incidentResponse, evidenceResponse] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/evidence"),
      ]);

      if (!incidentResponse.ok || !evidenceResponse.ok) {
        throw new Error("Unable to retrieve incident or evidence details.");
      }

      const incidentData = await incidentResponse.json();
      const evidenceData = await evidenceResponse.json();

      const incident = (incidentData.incidents || []).find(
        (item: any) => item.id === incidentId
      );

      if (!incident) {
        throw new Error("Incident record not found.");
      }

      const linkedEvidence = (evidenceData.evidence || []).filter(
        (item: any) => item.incidentId === incidentId
      );

      const report = [
        "CYBERFIRSTAID - DIGITAL INCIDENT REPORT",
        "======================================",
        "",
        `Incident ID: ${incident.id}`,
        `Incident Type: ${String(incident.incidentType).replace(/_/g, " ")}`,
        `Incident Date: ${incident.incidentDate}`,
        `Status: ${incident.status}`,
        `Still Ongoing: ${incident.isOngoing}`,
        `Created At: ${incident.createdAt}`,
        "",
        "INCIDENT DESCRIPTION",
        "--------------------",
        incident.description,
        "",
        `LINKED DIGITAL EVIDENCE (${linkedEvidence.length})`,
        "------------------------",
        ...linkedEvidence.map((item: any, index: number) =>
          [
            `${index + 1}. ${item.originalName}`,
            `Evidence ID: ${item.id}`,
            `File Type: ${item.fileType}`,
            `File Size: ${item.fileSize} bytes`,
            `SHA-256: ${item.sha256}`,
            `Uploaded At: ${item.uploadedAt}`,
            `Verification status: ${item.status}`,
            "",
          ].join("\n")
        ),
        "",
        "Generated by CyberFirstAid.",
        "This report is an application-generated record.",
      ].join("\n");

      const blob = new Blob([report], {
        type: "text/plain;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CyberFirstAid-${incidentId}-report.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download incident report."
      );
    }
  }
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-5 md:px-16">
        <Link href="/" className="text-2xl font-bold text-cyan-400">
          CyberFirstAid
        </Link>

        <Link href="/" className="text-sm text-slate-300 hover:text-cyan-400">
          Back to Home
        </Link>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Report a Cyber Incident
          </h1>

          <p className="text-slate-400">
            Describe what happened so Core Intelligence can analyse
            your incident and recommend safety actions.
          </p>
        </div>

                <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-10"
        >
          <div>
            <label htmlFor="incidentType" className="mb-2 block font-semibold">
              Incident Type
            </label>
            <select
              id="incidentType"
              required
              value={incidentType}
              onChange={(e) => handleIncidentTypeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            >
              <option value="">Select incident type</option>
              <option value="financial_fraud">Financial Fraud</option>
              <option value="phishing">Phishing</option>
              <option value="social_media_hacking">Social Media Account Hacking</option>
              <option value="email_compromise">Email Account Compromise</option>
              <option value="identity_theft">Identity Theft</option>
              <option value="online_harassment">Online Harassment</option>
              <option value="lost_stolen_devices">Lost or Stolen Device</option>
              <option value="unknown">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="incidentDate" className="mb-2 block font-semibold">
              Incident Date
            </label>
            <input
              id="incidentDate"
              type="date"
              required
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />
          </div>

          <div>
            <label htmlFor="isOngoing" className="mb-2 block font-semibold">
              Is the incident still ongoing?
            </label>
            <select
              id="isOngoing"
              required
              value={isOngoing}
              onChange={(e) => setIsOngoing(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not_sure">Not sure</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block font-semibold">
              Describe What Happened
            </label>
            <textarea
              id="description"
              required
              minLength={10}
              maxLength={2000}
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened in simple words. Do not include passwords, OTPs, PINs or other sensitive details."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder:text-slate-400"
            />
            <p className="mt-2 text-sm text-slate-400">
              {description.length}/2000 characters
            </p>
          </div>

          <div className="rounded-lg border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-200">
            Never share passwords, OTPs, banking PINs or recovery codes.
            Reports are saved on the application server. This prototype does
            not yet implement user authentication or access control.
            Your description and questionnaire answers will be sent to the
            CyberFirstAid backend for preliminary automated assessment.
          </div>

          {loadingQuestions && (
            <p className="text-sm text-cyan-400">
              Loading incident-specific questions...
            </p>
          )}

          {questions.length > 0 && (
            <div className="space-y-6 rounded-xl border border-cyan-800 bg-slate-950/60 p-5">
              <div>
                <h2 className="text-xl font-bold text-cyan-400">
                  Incident-Specific Questions
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Answer these questions to help calculate your incident risk.
                </p>
              </div>

              {questions.map((question, index) => (
                <div key={question.id}>
                  <label
                    htmlFor={question.id}
                    className="mb-2 block font-medium"
                  >
                    {index + 1}. {question.question}
                  </label>
                  <select
                    id={question.id}
                    required
                    value={answers[question.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                  >
                    <option value="">Select your answer</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {incidentType === "unknown" && (
            <p className="rounded-lg border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-200">
              Your incident will be assessed using its description.
              Additional category-specific questions are not available
              for this selection.
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-700 bg-red-950 p-4 text-red-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loadingQuestions}
            className="w-full rounded-xl bg-cyan-500 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving and Analysing..." : "Submit for Assessment"}
          </button>

          {submitted && (
            <div
              role="status"
              className="rounded-lg border border-cyan-700 bg-cyan-950 p-4 text-center text-cyan-200"
            >
              <p className="font-bold">Incident report saved successfully!</p>
              <p className="mt-2 text-sm">Your Incident ID:</p>
              <p className="mt-1 font-mono text-lg font-bold">{incidentId}</p>
              <p className="mt-2 text-xs">Keep this ID for future reference.</p>
              <button
                type="button"
                onClick={downloadIncidentReport}
                className="mt-5 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
              >
                Download Incident Report
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}




