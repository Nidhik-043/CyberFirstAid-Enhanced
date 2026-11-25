
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Assessment = {
  incident_category: string;
  matched_keywords: string[];
  classification_needs_review: boolean;
  risk_level: string;
  immediate_actions: string[];
  follow_up_actions: string[];
  needs_review: boolean;
  incident_id?: number;
  risk_score?: number;
  risk_reasons?: string[];
  classification_source?: string;
  ml_suggestion?: string | null;
};

const categoryNames: Record<string, string> = {
  financial_fraud: "Financial Fraud",
  phishing: "Phishing Attack",
  social_media_hacking: "Social Media Account Hacking",
  email_compromise: "Email Account Compromise",
  identity_theft: "Identity Theft",
  online_harassment: "Online Harassment",
  lost_stolen_devices: "Lost or Stolen Device",
  unknown: "Unknown Incident",
};

export default function AssessmentPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("cyberfirstaid_assessment");

    if (stored) {
      try {
        // Intentional one-time hydration from sessionStorage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAssessment(JSON.parse(stored) as Assessment);
      } catch {
        setAssessment(null);
      }
    }
  }, []);

  if (!assessment) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <nav className="border-b border-slate-800 px-6 py-5 md:px-16">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            CyberFirstAid
          </Link>
        </nav>
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold">No Assessment Available</h1>
          <p className="mb-8 text-slate-400">
            Please submit an incident report to view your Core Intelligence assessment.
          </p>
          <Link href="/report" className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950">
            Report an Incident
          </Link>
        </section>
      </main>
    );
  }

  const riskColors: Record<string, string> = {
    critical: "border-red-600 bg-red-950 text-red-300",
    high: "border-orange-600 bg-orange-950 text-orange-300",
    medium: "border-yellow-600 bg-yellow-950 text-yellow-300",
    unassessed: "border-slate-600 bg-slate-800 text-slate-300",
  };

  const riskStyle =
    riskColors[assessment.risk_level] || riskColors.unassessed;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
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
            Cyber Incident Assessment
          </h1>

          <p className="text-slate-400">
            Preliminary automated assessment and recommended
            safety actions for your cyber incident.
          </p>

          <p className="mt-3 text-sm text-amber-300">
            Generated from your submitted incident by Core Intelligence.
          </p>
        </div>

        {/* Assessment Summary */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="mb-3 text-sm font-semibold text-slate-400">
              Detected Incident Category
            </h2>

            <p className="text-2xl font-bold text-cyan-400">
              {categoryNames[assessment.incident_category] ||
                assessment.incident_category}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="mb-3 text-sm font-semibold text-slate-400">
              Preliminary Risk Level
            </h2>

            <span
              className={`inline-block rounded-lg border px-5 py-2 font-bold uppercase ${riskStyle}`}
            >
              {assessment.risk_level}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="mb-3 text-sm font-semibold text-slate-400">
              Risk Score
            </h2>
            <p className="text-3xl font-bold text-cyan-400">
              {assessment.risk_score ?? "N/A"}
              {assessment.risk_score !== undefined ? "/100" : ""}
            </p>
          </div>        </div>

        {assessment.risk_reasons && assessment.risk_reasons.length > 0 && (
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="mb-4 text-xl font-bold text-cyan-400">
              Risk Assessment Reasons
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              {assessment.risk_reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Immediate Actions */}
        <div className="mb-8 rounded-2xl border border-red-900 bg-slate-900 p-7">
          <h2 className="mb-5 text-2xl font-bold text-red-400">
            Immediate Safety Actions
          </h2>

          <ol className="space-y-4">
            {assessment.immediate_actions.map((action, index) => (
              <li
                key={index}
                className="flex gap-4 rounded-xl bg-slate-800 p-4"
              >
                <span className="font-bold text-red-400">
                  {index + 1}.
                </span>
                <p className="text-slate-200">{action}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Follow-up Actions */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="mb-5 text-2xl font-bold text-cyan-400">
            Follow-up Recovery Actions
          </h2>

          <ol className="space-y-4">
            {assessment.follow_up_actions.map((action, index) => (
              <li
                key={index}
                className="flex gap-4 rounded-xl bg-slate-800 p-4"
              >
                <span className="font-bold text-cyan-400">
                  {index + 1}.
                </span>
                <p className="text-slate-200">{action}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Keywords */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="mb-4 text-xl font-bold">
            Matched Keywords
          </h2>

          <div className="flex flex-wrap gap-3">
            {assessment.matched_keywords.length > 0 ? (
              assessment.matched_keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-cyan-950 px-4 py-2 text-sm text-cyan-300"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-slate-400">
                No keywords matched.
              </p>
            )}
          </div>
        </div>

        {/* Review Status */}
        {(assessment.needs_review ||
          assessment.classification_needs_review) && (
          <div className="mb-8 rounded-xl border border-amber-700 bg-amber-950/40 p-5 text-amber-200">
            This assessment requires further review.
            Automated classification may be uncertain.
          </div>
        )}

        {/* Disclaimer */}
        <p className="mb-8 text-sm text-slate-400">
          This is a preliminary rule-based assessment, not a
          verified determination of incident severity. Use
          official reporting and support channels when needed.
        </p>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/emergency"
            className="rounded-xl bg-red-600 px-6 py-4 font-bold text-white hover:bg-red-500"
          >
            Emergency Guidance
          </Link>

          <Link
            href="/report"
            className="rounded-xl border border-slate-600 px-6 py-4 font-semibold hover:bg-slate-800"
          >
            Report Another Incident
          </Link>
        </div>
      </section>
    </main>
  );
}

