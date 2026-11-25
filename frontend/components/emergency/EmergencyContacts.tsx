"use client";

// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Official emergency contacts component

import type {
  EmergencyContact,
} from "../../lib/emergency/types";

interface EmergencyContactsProps {
  contacts?: EmergencyContact[];
  loading?: boolean;
}

// Fallback contacts remain available even when
// the backend cannot be reached.
const FALLBACK_CONTACTS: EmergencyContact[] = [
  {
    id: "financial_fraud_helpline",
    name: "National Financial Cyber Fraud Helpline",
    phone: "1930",
    url: "https://cybercrime.gov.in/",
    description:
      "Report financial cyber fraud and unauthorized payment transactions immediately.",
  },
  {
    id: "cybercrime_portal",
    name: "National Cyber Crime Reporting Portal",
    phone: null,
    url: "https://cybercrime.gov.in/",
    description:
      "Report suspected cybercrime through the official Government of India portal.",
  },
  {
    id: "emergency_services",
    name: "Emergency Response Services",
    phone: "112",
    url: "https://112.gov.in/",
    description:
      "Contact emergency services if there is immediate physical danger.",
  },
];

// Allow only known official government websites.
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

// Allow only supported emergency telephone numbers.
function getSafePhone(
  phone: string | null
): string | null {
  if (phone === "1930" || phone === "112") {
    return phone;
  }

  return null;
}

export default function EmergencyContacts({
  contacts = [],
  loading = false,
}: EmergencyContactsProps) {
  // Keep all essential emergency contacts available.
  const displayedContacts = FALLBACK_CONTACTS.map(
    (fallback) =>
      contacts.find(
        (contact) => contact.id === fallback.id
      ) || fallback
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

      {/* Section heading */}
      <div className="mb-6 flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-800 bg-red-950/50">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-red-400"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.26a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.69A2 2 0 0 1 22 16.92z" />
          </svg>

        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-400">
            Immediate Assistance
          </p>

          <h2 className="text-xl font-bold text-white">
            Emergency Support
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Official emergency resources for users in India.
            Do not delay urgent reporting while completing
            the questionnaire.
          </p>
        </div>

      </div>

      {/* Loading information */}
      {loading && (
        <p
          role="status"
          className="mb-4 text-xs text-slate-400"
        >
          Loading contact information. Essential emergency
          contacts remain available below.
        </p>
      )}

      {/* Emergency contact cards */}
      <div className="space-y-4">

        {displayedContacts.map((contact) => {
          const isFinancial =
            contact.id === "financial_fraud_helpline";

          const isEmergency =
            contact.id === "emergency_services";

          const safeUrl = getSafeUrl(contact.url);
          const safePhone = getSafePhone(contact.phone);

          return (
            <article
              key={contact.id}
              className={`rounded-xl border p-5 ${
                isFinancial
                  ? "border-red-800 bg-red-950/20"
                  : "border-slate-700 bg-slate-800/50"
              }`}
            >

              {/* Contact category */}
              <p
                className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                  isFinancial
                    ? "text-red-400"
                    : "text-slate-400"
                }`}
              >
                {isFinancial
                  ? "Financial Cyber Fraud"
                  : isEmergency
                    ? "Immediate Physical Danger"
                    : "Official Online Reporting"}
              </p>

              {/* Contact name */}
              <h3 className="font-bold text-white">
                {contact.name}
              </h3>

              {/* Telephone number */}
              {safePhone && (
                <p
                  className={`mt-3 font-mono text-4xl font-bold ${
                    isFinancial
                      ? "text-red-400"
                      : "text-cyan-400"
                  }`}
                >
                  {safePhone}
                </p>
              )}

              {/* Contact description */}
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {contact.description}
              </p>

              {/* Contact actions */}
              <div className="mt-4 flex flex-wrap gap-3">

                {safePhone && (
                  <a
                    href={`tel:${safePhone}`}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition ${
                      isFinancial
                        ? "bg-red-600 text-white hover:bg-red-500"
                        : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    }`}
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
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-3 text-sm font-semibold text-cyan-400 transition hover:border-cyan-500 hover:bg-cyan-950/30"
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

              {safeUrl && (
                <p className="mt-3 break-all text-xs text-slate-500">
                  {new URL(safeUrl).hostname}
                </p>
              )}

            </article>
          );
        })}

      </div>

      {/* Safety reminder */}
      <div className="mt-6 rounded-xl border border-amber-800 bg-amber-950/30 p-4">

        <div className="flex items-start gap-3">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" />
            <path d="M12 8v4M12 16h.01" />
          </svg>

          <div>
            <h3 className="font-semibold text-amber-300">
              Important Safety Reminder
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Never share passwords, OTPs, banking PINs
              or recovery codes with anyone claiming to
              help you. Contact your bank and service
              providers through verified official channels.
            </p>
          </div>

        </div>

      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        CyberFirstAid is an assistance platform, not an
        emergency service or government reporting authority.
        Contact links open external services. Using this
        platform does not automatically file a complaint
        or guarantee financial recovery.
      </p>

    </section>
  );
}