"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Interactive category-specific questionnaire

import { useState } from "react";

import type {
  EmergencyQuestionnaire,
  EmergencyAnswers,
  AnswerValue,
} from "../../lib/emergency/types";

interface QuestionnaireProps {
  questionnaire: EmergencyQuestionnaire;
  incidentId: number;
  answers: EmergencyAnswers;
  onAnswer: (
    questionId: string,
    answer: AnswerValue
  ) => void;
  onSubmit: () => void;
  submitting?: boolean;
  disabled?: boolean;
  error?: string | null;
}

const ANSWER_STYLES: Record<
  AnswerValue,
  {
    selected: string;
    icon: string;
  }
> = {
  yes: {
    selected:
      "border-cyan-500 bg-cyan-950/50 text-cyan-300",
    icon: "✓",
  },

  no: {
    selected:
      "border-cyan-500 bg-cyan-950/50 text-cyan-300",
    icon: "×",
  },

  unsure: {
    selected:
      "border-amber-500 bg-amber-950/40 text-amber-300",
    icon: "?",
  },
};

export default function Questionnaire({
  questionnaire,
  incidentId,
  answers,
  onAnswer,
  onSubmit,
  submitting = false,
  disabled = false,
  error = null,
}: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = questionnaire.questions;

  const totalQuestions = questions.length;

  const safeIndex = Math.min(
    currentIndex,
    Math.max(0, totalQuestions - 1)
  );

  const currentQuestion = questions[safeIndex];

  const answeredCount = questions.filter(
    (question) =>
      answers[question.id] === "yes" ||
      answers[question.id] === "no" ||
      answers[question.id] === "unsure"
  ).length;

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answeredCount / totalQuestions) * 100
        )
      : 0;

  const allAnswered =
    totalQuestions > 0 &&
    answeredCount === totalQuestions;

  const isLastQuestion =
    safeIndex === totalQuestions - 1;

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const hasCurrentAnswer =
    currentAnswer === "yes" ||
    currentAnswer === "no" ||
    currentAnswer === "unsure";

  const isDisabled = disabled || submitting;

  function handlePrevious() {
    setCurrentIndex((previous) =>
      Math.max(0, previous - 1)
    );
  }

  function handleNext() {
    if (!hasCurrentAnswer || isDisabled) {
      return;
    }

    setCurrentIndex((previous) =>
      Math.min(totalQuestions - 1, previous + 1)
    );
  }

  function handleSubmit() {
    if (!allAnswered || isDisabled) {
      return;
    }

    onSubmit();
  }

  // Handle an empty questionnaire safely.
  if (!currentQuestion) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h2 className="text-xl font-bold text-white">
          Questionnaire Unavailable
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          No questions are currently available for
          this incident. Please try again or use the
          official emergency resources.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-8">

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
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" />
            <path d="m9 12 2 2 4-4" />
          </svg>

        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Step 02
          </p>

          <h2 className="text-xl font-bold text-white md:text-2xl">
            Personalized Emergency Assessment
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Answer a few questions so we can recommend
            appropriate safety and recovery actions.
          </p>
        </div>

      </div>

      {/* Incident information */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-4">

        <span className="font-mono text-xs font-semibold text-cyan-400">
          INCIDENT #{incidentId}
        </span>

        <span className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
          {questionnaire.category_label}
        </span>

      </div>

      {/* Questionnaire progress */}
      <div className="mb-7">

        <div className="mb-3 flex items-center justify-between gap-3">

          <p className="text-sm font-medium text-slate-300">
            Question {safeIndex + 1} of {totalQuestions}
          </p>

          <span className="text-sm font-bold text-cyan-400">
            {progress}% answered
          </span>

        </div>

        <div
          role="progressbar"
          aria-label="Questionnaire completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2.5 overflow-hidden rounded-full bg-slate-700"
        >
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {answeredCount} of {totalQuestions} questions
          answered
        </p>

      </div>

      {/* Question navigation indicators */}
      <div className="mb-6 flex flex-wrap gap-2">

        {questions.map((question, index) => {
          const isCurrent = index === safeIndex;

          const isAnswered =
            answers[question.id] !== undefined;

          return (
            <button
              key={question.id}
              type="button"
              disabled={isDisabled}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Question ${index + 1}${
                isAnswered ? ", answered" : ", unanswered"
              }`}
              aria-current={
                isCurrent ? "step" : undefined
              }
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition disabled:opacity-50 ${
                isCurrent
                  ? "border-cyan-400 bg-cyan-500 text-slate-950"
                  : isAnswered
                    ? "border-cyan-800 bg-cyan-950/40 text-cyan-300"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
              }`}
            >
              {index + 1}
            </button>
          );
        })}

      </div>

      {/* Current question */}
      <fieldset
        key={currentQuestion.id}
        disabled={isDisabled}
        className="min-w-0 rounded-2xl border border-slate-700 bg-slate-950/50 p-5 md:p-6"
      >

        <legend className="sr-only">
          {currentQuestion.question}
        </legend>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Question {safeIndex + 1}
        </p>

        <h3 className="mb-6 text-lg font-bold leading-relaxed text-white md:text-xl">
          {currentQuestion.question}
        </h3>

        {/* Answer options */}
        <div className="space-y-3">

          {currentQuestion.options.map((option) => {
            const isSelected =
              currentAnswer === option.value;

            const style =
              ANSWER_STYLES[option.value];

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-cyan-400 ${
                  isSelected
                    ? style.selected
                    : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                } ${
                  isDisabled
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() =>
                    onAnswer(
                      currentQuestion.id,
                      option.value
                    )
                  }
                  className="sr-only"
                />

                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-lg font-bold ${
                    isSelected
                      ? "border-current bg-slate-950/40"
                      : "border-slate-600 bg-slate-900"
                  }`}
                >
                  {style.icon}
                </span>

                <span className="flex-1 font-semibold">
                  {option.label}
                </span>

                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                )}

              </label>
            );
          })}

        </div>

        {/* Uncertainty explanation */}
        {currentAnswer === "unsure" && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-amber-800 bg-amber-950/30 p-3 text-sm leading-relaxed text-amber-200"
          >
            It is okay if you are not sure. The assistant
            will consider this uncertainty when preparing
            your recommendations.
          </div>
        )}

      </fieldset>

      {/* Previous and next navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">

        <button
          type="button"
          onClick={handlePrevious}
          disabled={safeIndex === 0 || isDisabled}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>

        {!isLastQuestion && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!hasCurrentAnswer || isDisabled}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Question
            <span aria-hidden="true">→</span>
          </button>
        )}

      </div>

      {/* Completion and generation */}
      {allAnswered && (
        <div className="mt-7 rounded-xl border border-cyan-800 bg-cyan-950/30 p-5">

          <h3 className="font-bold text-cyan-300">
            Questionnaire Completed
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Your answers are ready. Generate a personalized
            action plan with prioritized emergency steps
            and recovery recommendations.
          </p>

          <p className="mt-3 text-xs leading-relaxed text-amber-300">
            Changing answers and regenerating an existing
            plan may reset saved recovery progress.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-500 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {submitting && (
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"
              />
            )}

            {submitting
              ? "Generating Your Action Plan..."
              : "Generate Personalized Action Plan"}

          </button>

        </div>
      )}

      {/* Incomplete questionnaire reminder */}
      {isLastQuestion && !allAnswered && (
        <p className="mt-5 rounded-lg border border-amber-800 bg-amber-950/20 p-4 text-sm text-amber-200">
          Please answer all questions before generating
          your personalized action plan. You can select
          Not Sure if you do not know an answer.
        </p>
      )}

      {/* API error message */}
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* Privacy notice */}
      <div className="mt-7 rounded-xl border border-amber-800 bg-amber-950/20 p-4">

        <h3 className="font-semibold text-amber-300">
          Privacy and Safety
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {questionnaire.privacy_notice}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Do not delay urgent safety actions or official
          reporting while completing this questionnaire.
        </p>

      </div>

    </section>
  );
}