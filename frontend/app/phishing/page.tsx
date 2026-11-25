"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Indicator = {
  indicator: string;
  points: number;
  explanation: string;
};

type AnalysisResult = {
  original_url: string;
  normalized_url: string;
  hostname: string;
  classification: string;
  risk_score: number;
  rule_based_score: number;
  ml_phishing_score?: number;
  indicators: Indicator[];
  recommendations: string[];
  decision_reasons?: string[];
  disclaimer: string;
  evidence_level?: string;
  engine_version?: string;
  detection_layers?: number;
  organization?: string | null;

  threat_intelligence?: {
    source: string;
    matched: boolean;
    status: string;
    feed_available: boolean;
    database_size: number;
    local_feed_updated_at?: string;
  };

  machine_learning?: {
    model?: string;
    prediction?: string;
    classification?: string;
    model_available: boolean;
    phishing_score?: number;
    legitimate_score?: number;
    features_analyzed?: number;
  };

  domain_reputation?: {
    domain?: string;
    hostname?: string;
    official_domain: boolean;
    organization?: string | null;
    tranco_rank?: number | null;
    reputation: string;
    database_available?: boolean;
    database_size?: number;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/70 p-6";

function getTheme(classification: string) {
  switch (classification) {
    case "Known Phishing Threat":
    case "High Risk":
      return {
        text: "text-red-400",
        border: "border-red-500/40",
        bg: "bg-red-500/10",
        color: "#ef4444",
      };

    case "Suspicious":
      return {
        text: "text-amber-400",
        border: "border-amber-500/40",
        bg: "bg-amber-500/10",
        color: "#f59e0b",
      };

    case "Recognized Official Domain":
    case "Genuine":
      return {
        text: "text-emerald-400",
        border: "border-emerald-500/40",
        bg: "bg-emerald-500/10",
        color: "#10b981",
      };

    case "Low Risk":
      return {
        text: "text-cyan-400",
        border: "border-cyan-500/40",
        bg: "bg-cyan-500/10",
        color: "#06b6d4",
      };

    default:
      return {
        text: "text-slate-300",
        border: "border-slate-600",
        bg: "bg-slate-800/50",
        color: "#94a3b8",
      };
  }
}

function LayerCard({
  number,
  title,
  value,
  description,
}: {
  number: string;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className={panel}>
      <span className="text-xs font-semibold tracking-widest text-cyan-400">
        LAYER {number}
      </span>

      <h3 className="mt-3 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 break-words text-xl font-bold text-cyan-300">
        {value}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function PhishingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  async function analyzeUrl(event: FormEvent) {
    event.preventDefault();

    if (loading) return;

    const submittedUrl = url.trim();

    if (!submittedUrl) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      30000
    );

    try {
      const response = await fetch(
        `${API_URL}/api/phishing/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: submittedUrl,
          }),
          signal: controller.signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid URL or analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "AbortError"
      ) {
        setError("Analysis timed out. Please try again.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the backend."
        );
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  const theme = getTheme(
    result?.classification || "Unverified"
  );

  const score = Math.min(
    100,
    Math.max(0, result?.risk_score ?? 0)
  );

  const circumference = 2 * Math.PI * 52;

  const threat = result?.threat_intelligence;
  const ml = result?.machine_learning;
  const reputation = result?.domain_reputation;

  const mlScore =
    result?.ml_phishing_score ??
    ml?.phishing_score;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">

        {/* Navigation */}

        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <Link
            href="/"
            className="text-xl font-bold text-cyan-400"
          >
            CyberFirstAid
          </Link>

          <div className="flex gap-4 text-sm text-slate-300">
            <Link
              href="/dashboard"
              className="hover:text-cyan-400"
            >
              Dashboard
            </Link>

            <Link
              href="/emergency"
              className="hover:text-cyan-400"
            >
              Emergency
            </Link>
          </div>
        </nav>

        {/* Page heading */}

        <header className="py-10">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-cyan-400">
            FOUR-LAYER SECURITY ENGINE
          </span>

          <h1 className="mt-6 text-3xl font-bold md:text-5xl">
            Suspicious Link Analysis
          </h1>

          <p className="mt-4 max-w-3xl leading-relaxed text-slate-400">
            Analyze potentially dangerous links using
            security rules, threat intelligence,
            machine learning and domain reputation.
          </p>
        </header>

        {/* URL input */}

        <section className={panel}>
          <form onSubmit={analyzeUrl}>
            <label
              htmlFor="url"
              className="mb-3 block font-semibold"
            >
              Enter a suspicious URL
            </label>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                id="url"
                type="text"
                value={url}
                onChange={(event) =>
                  setUrl(event.target.value)
                }
                placeholder="https://example.com"
                maxLength={8192}
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-500 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze URL"}
              </button>
            </div>
          </form>

          <p className="mt-3 text-xs text-slate-400">
            The scanner does not open or visit the
            submitted website.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"
            >
              {error}
            </div>
          )}
        </section>

        {/* Loading state */}

        {loading && (
          <div
            role="status"
            className="mt-8 flex flex-col items-center rounded-2xl border border-slate-800 p-10"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

            <h2 className="mt-5 text-lg font-semibold">
              Running security analysis
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Evaluating the available detection layers...
            </p>
          </div>
        )}

        {/* Analysis results */}

        {result && (
          <div
            aria-live="polite"
            className="mt-8 space-y-6"
          >

            {/* Final verdict */}

            <section
              className={`rounded-2xl border p-6 ${theme.border} ${theme.bg}`}
            >
              <div className="flex flex-col items-center gap-8 md:flex-row">

                <div className="relative h-40 w-40 shrink-0">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="8"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={theme.color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={
                        circumference *
                        (1 - score / 100)
                      }
                      transform="rotate(-90 60 60)"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${theme.text}`}
                    >
                      {score}
                    </span>

                    <span className="text-sm text-slate-400">
                      Risk / 100
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm uppercase tracking-widest text-slate-400">
                    Final security verdict
                  </p>

                  <h2
                    className={`mt-3 text-3xl font-bold ${theme.text}`}
                  >
                    {result.classification}
                  </h2>

                  <p className="mt-3 break-all text-slate-300">
                    {result.normalized_url}
                  </p>

                  <p className="mt-3 text-sm text-slate-400">
                    {result.indicators.length} security
                    indicator(s) detected
                  </p>

                  {result.evidence_level && (
                    <p className="mt-2 text-sm text-slate-400">
                      {result.evidence_level}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Website information */}

            <section className={panel}>
              <h2 className="text-xl font-semibold">
                Website Information
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">
                    Hostname
                  </p>

                  <p className="mt-1 break-all font-medium">
                    {result.hostname}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Recognized organization
                  </p>

                  <p className="mt-1 font-medium">
                    {reputation?.organization ||
                      result.organization ||
                      "Not recognized"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Domain reputation
                  </p>

                  <p className="mt-1 font-medium">
                    {reputation?.reputation ||
                      "Unavailable"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Tranco global rank
                  </p>

                  <p className="mt-1 font-medium">
                    {reputation?.tranco_rank != null
                      ? `#${reputation.tranco_rank.toLocaleString()}`
                      : "Not available"}
                  </p>
                </div>
              </div>
            </section>

            {/* Four detection layers */}

            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Four-Layer Security Analysis
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <LayerCard
                  number="01"
                  title="Rule-Based Detection"
                  value={`${result.rule_based_score ?? 0}/100`}
                  description="URL structure, suspicious keywords and possible brand impersonation."
                />

                <LayerCard
                  number="02"
                  title="Threat Intelligence"
                  value={
                    threat?.feed_available
                      ? threat.matched
                        ? "Threat matched"
                        : threat.status
                      : "Unavailable"
                  }
                  description={
                    threat?.feed_available
                      ? `${threat.database_size.toLocaleString()} local OpenPhish records.`
                      : "Threat database is unavailable."
                  }
                />

                <LayerCard
                  number="03"
                  title="Machine Learning"
                  value={
                    ml?.model_available &&
                    mlScore != null
                      ? `${mlScore.toFixed(2)}%`
                      : "Unavailable"
                  }
                  description="Random Forest phishing-class score based on URL features."
                />

                <LayerCard
                  number="04"
                  title="Domain Reputation"
                  value={
                    reputation?.reputation ||
                    "Unavailable"
                  }
                  description={
                    reputation?.database_available
                      ? `${reputation.database_size?.toLocaleString() ?? "Available"} ranked domains in local database.`
                      : "Local ranking database unavailable."
                  }
                />
              </div>

              {threat?.local_feed_updated_at && (
                <p className="mt-3 text-xs text-slate-400">
                  Local threat feed updated:{" "}
                  {new Date(
                    threat.local_feed_updated_at
                  ).toLocaleString()}
                </p>
              )}
            </section>

            {/* Security indicators */}

            <section className={panel}>
              <h2 className="text-xl font-semibold">
                Detected Security Indicators
              </h2>

              {result.indicators.length === 0 ? (
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-slate-300">
                  No rule-based warning indicators
                  were detected.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {result.indicators.map(
                    (indicator, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                      >
                        <div className="min-w-0">
                          <h3 className="font-semibold text-red-300">
                            {indicator.indicator}
                          </h3>

                          <p className="mt-2 break-words text-sm leading-relaxed text-slate-400">
                            {indicator.explanation}
                          </p>
                        </div>

                        <span className="shrink-0 font-bold text-red-400">
                          +{indicator.points}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Explainable decisions */}

            {result.decision_reasons &&
              result.decision_reasons.length > 0 && (
                <section className={panel}>
                  <h2 className="text-xl font-semibold">
                    Why This Verdict?
                  </h2>

                  <div className="mt-5 space-y-3">
                    {result.decision_reasons.map(
                      (reason, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-1 text-cyan-400">
                            ◆
                          </span>

                          <p className="text-sm leading-relaxed text-slate-300">
                            {reason}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

            {/* Recommended actions */}

            <section className={panel}>
              <h2 className="text-xl font-semibold">
                Recommended Security Actions
              </h2>

              <div className="mt-5 space-y-3">
                {result.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-4"
                    >
                      <span className="font-bold text-cyan-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p className="text-sm leading-relaxed text-slate-300">
                        {recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/emergency"
                  className="rounded-xl bg-red-600 px-6 py-3 text-center font-semibold hover:bg-red-500"
                >
                  Emergency Response
                </Link>

                <Link
                  href="/report"
                  className="rounded-xl border border-cyan-500/40 px-6 py-3 text-center font-semibold text-cyan-400 hover:bg-cyan-500/10"
                >
                  Report Incident
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setUrl("");
                    setError("");
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  New Scan
                </button>
              </div>
            </section>

            {/* Disclaimer */}

            <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="font-semibold text-amber-400">
                Important Security Notice
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {result.disclaimer}
              </p>
            </section>
          </div>
        )}

        {/* Initial information cards */}

        {!result && !loading && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LayerCard
              number="01"
              title="Rule-Based Detection"
              value="URL Patterns"
              description="Identify suspicious structural characteristics."
            />

            <LayerCard
              number="02"
              title="Threat Intelligence"
              value="OpenPhish"
              description="Compare URLs against local known phishing records."
            />

            <LayerCard
              number="03"
              title="Machine Learning"
              value="Random Forest"
              description="Analyze 16 numerical hostname features."
            />

            <LayerCard
              number="04"
              title="Domain Reputation"
              value="Tranco"
              description="Evaluate domain popularity and maintained organization references."
            />
          </section>
        )}

        <footer className="mt-12 border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          CyberFirstAid · Hybrid URL Security Analysis
          · Engine {result?.engine_version || "4.0"}
        </footer>
      </div>
    </main>
  );
}