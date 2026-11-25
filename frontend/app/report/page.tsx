
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

  const [questions, setQuestions] = useState<IncidentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleIncidentTypeChange(category: string) {
    setIncidentType(category);
    setQuestions([]);
    setAnswers({});
    setError("");

    if (!category || category === "unknown") {
      return;
    }

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
        err instanceof Error
          ? err.message
          : "Unable to load incident questions."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  function handleAnswerChange(questionId: string, answer: string) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
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

    const unanswered = questions.some(
      (question) => !answers[question.id]
    );

    if (unanswered) {
      setError("Please answer all the incident-specific questions.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Assessment could not be completed."
        );
      }

      sessionStorage.setItem(
        "cyberfirstaid_assessment",
        JSON.stringify({
          ...data,
          form_details: {
            incidentType,
            incidentDate,
            isOngoing,
          },
        })
      );

      router.push("/assessment");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend. Please try again."
      );
    } finally {
      setLoading(false);
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
              maxLength={5000}
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened in simple words. Do not include passwords, OTPs, PINs or other sensitive details."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder:text-slate-400"
            />

            <p className="mt-2 text-sm text-slate-400">
              {description.length}/5000 characters
            </p>
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

          <div className="rounded-lg border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-200">
            Never share passwords, OTPs, banking PINs or recovery codes.
            Your description and questionnaire answers will be sent to
            the CyberFirstAid backend for preliminary automated assessment.
          </div>

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
            disabled={loading || loadingQuestions}
            className="w-full rounded-xl bg-cyan-500 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analysing Incident..." : "Submit for Assessment"}
          </button>
        </form>
      </section>
    </main>
  );
}
