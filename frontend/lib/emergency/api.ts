// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// Frontend connection to the FastAPI backend

import type {
  Incident,
  IncidentCategory,
  CategoriesResponse,
  EmergencyQuestionnaire,
  EmergencyContactsResponse,
  EmergencyPlanRequest,
  RecoveryPlan,
  RecoveryTaskUpdate,
} from "./types";

// Backend base URL
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// Custom API error
export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Convert backend validation errors into readable messages
function getErrorMessage(
  data: unknown,
  fallback: string
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const detail = data.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail.map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "msg" in item
        ) {
          return String(item.msg);
        }

        return "Invalid request data.";
      });

      return messages.join(" ");
    }
  }

  return fallback;
}

// Common function for all backend requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
        cache: "no-store",
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new ApiError(
      "Unable to connect to the backend. Please make sure the CyberFirstAid backend is running.",
      0,
      error
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "The backend returned an invalid response.",
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        data,
        `Request failed with status ${response.status}.`
      ),
      response.status,
      data
    );
  }

  return data as T;
}

// Validate incident ID
function validateIncidentId(incidentId: number): void {
  if (
    !Number.isSafeInteger(incidentId) ||
    incidentId <= 0
  ) {
    throw new ApiError(
      "Please select a valid incident.",
      400
    );
  }
}

// --------------------------------------------------
// 1. EXISTING INCIDENT APIs
// --------------------------------------------------

// Retrieve all saved incidents
export async function getIncidents(
  signal?: AbortSignal
): Promise<Incident[]> {
  return apiRequest<Incident[]>("/api/incidents", {
    method: "GET",
    signal,
  });
}

// Retrieve one specific incident
export async function getIncident(
  incidentId: number,
  signal?: AbortSignal
): Promise<Incident> {
  validateIncidentId(incidentId);

  return apiRequest<Incident>(
    `/api/incidents/${incidentId}`,
    {
      method: "GET",
      signal,
    }
  );
}

// --------------------------------------------------
// 2. PERSONALIZED EMERGENCY ASSISTANT APIs
// --------------------------------------------------

// Retrieve supported emergency categories
export async function getEmergencyCategories(
  signal?: AbortSignal
): Promise<CategoriesResponse> {
  return apiRequest<CategoriesResponse>(
    "/api/emergency/categories",
    {
      method: "GET",
      signal,
    }
  );
}

// Retrieve category-specific questionnaire
export async function getEmergencyQuestions(
  category: IncidentCategory,
  signal?: AbortSignal
): Promise<EmergencyQuestionnaire> {
  return apiRequest<EmergencyQuestionnaire>(
    `/api/emergency/questions/${encodeURIComponent(category)}`,
    {
      method: "GET",
      signal,
    }
  );
}

// Retrieve official emergency contacts
export async function getEmergencyContacts(
  signal?: AbortSignal
): Promise<EmergencyContactsResponse> {
  return apiRequest<EmergencyContactsResponse>(
    "/api/emergency/contacts",
    {
      method: "GET",
      signal,
    }
  );
}

// Generate and save personalized recovery plan
export async function generateActionPlan(
  request: EmergencyPlanRequest
): Promise<RecoveryPlan> {
  validateIncidentId(request.incident_id);

  return apiRequest<RecoveryPlan>(
    "/api/emergency/action-plan",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

// --------------------------------------------------
// 3. RECOVERY TRACKER APIs
// --------------------------------------------------

// Retrieve existing recovery plan
export async function getRecoveryPlan(
  incidentId: number,
  signal?: AbortSignal
): Promise<RecoveryPlan> {
  validateIncidentId(incidentId);

  return apiRequest<RecoveryPlan>(
    `/api/recovery/${incidentId}`,
    {
      method: "GET",
      signal,
    }
  );
}

// Update recovery task completion
export async function updateRecoveryTask(
  incidentId: number,
  taskId: string,
  completed: boolean
): Promise<RecoveryPlan> {
  validateIncidentId(incidentId);

  if (!taskId.trim()) {
    throw new ApiError(
      "A valid recovery task is required.",
      400
    );
  }

  const request: RecoveryTaskUpdate = {
    completed,
  };

  return apiRequest<RecoveryPlan>(
    `/api/recovery/${incidentId}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    }
  );
}

// --------------------------------------------------
// 4. ERROR HANDLING UTILITIES
// --------------------------------------------------

// Check whether a resource does not exist
export function isNotFoundError(
  error: unknown
): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404
  );
}

// Check whether a request was cancelled
export function isAbortError(
  error: unknown
): boolean {
  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

// Return a user-friendly error message
export function getApiErrorMessage(
  error: unknown
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}