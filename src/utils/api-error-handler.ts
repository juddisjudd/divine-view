/**
 * Centralized API error handling utilities
 */

export type ApiErrorType =
  | "AUTH_EXPIRED"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface ApiError {
  type: ApiErrorType;
  status: number;
  message: string;
  userMessage: string;
  requiresReAuth: boolean;
}

/**
 * Parse an API error response and return structured error information
 * @param response - Fetch Response object
 * @param error - Optional Error object from catch block
 * @returns Structured API error information
 */
export async function parseApiError(
  response?: Response,
  error?: any
): Promise<ApiError> {
  // Network errors (no response)
  if (!response) {
    return {
      type: "NETWORK_ERROR",
      status: 0,
      message: error?.message || "Network request failed",
      userMessage:
        "Unable to connect to the server. Please check your internet connection.",
      requiresReAuth: false,
    };
  }

  const status = response.status;
  let errorData: any = {};

  // Try to parse error response body
  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    }
  } catch {
    // Ignore JSON parse errors
  }

  // 401 Unauthorized - Token expired or invalid
  if (status === 401) {
    return {
      type: "AUTH_EXPIRED",
      status,
      message: errorData.error || "Authentication expired",
      userMessage:
        "Your session has expired. Please sign in again to continue.",
      requiresReAuth: true,
    };
  }

  // 403 Forbidden - Lacks required permissions
  if (status === 403) {
    return {
      type: "FORBIDDEN",
      status,
      message: errorData.error || "Access forbidden",
      userMessage:
        "You don't have permission to perform this action. Try signing out and back in.",
      requiresReAuth: false,
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      type: "NOT_FOUND",
      status,
      message: errorData.error || "Resource not found",
      userMessage: "The requested resource could not be found.",
      requiresReAuth: false,
    };
  }

  // 500+ Server errors
  if (status >= 500) {
    return {
      type: "SERVER_ERROR",
      status,
      message: errorData.error || "Server error",
      userMessage:
        "The server encountered an error. Please try again in a moment.",
      requiresReAuth: false,
    };
  }

  // Other errors
  return {
    type: "UNKNOWN",
    status,
    message: errorData.error || `HTTP ${status}`,
    userMessage: "An unexpected error occurred. Please try again.",
    requiresReAuth: false,
  };
}

/**
 * Get a user-friendly error message for display
 * @param error - ApiError object
 * @param context - Optional context string (e.g., "loading filters")
 * @returns Formatted user message
 */
export function getUserErrorMessage(
  error: ApiError,
  context?: string
): string {
  if (error.type === "AUTH_EXPIRED") {
    return error.userMessage;
  }

  if (context) {
    return `Failed ${context}: ${error.userMessage}`;
  }

  return error.userMessage;
}

/**
 * Check if an error requires re-authentication
 * @param error - ApiError object or Response object
 * @returns true if user needs to re-authenticate
 */
export function requiresReAuth(error: ApiError | Response): boolean {
  if (error instanceof Response) {
    return error.status === 401;
  }
  return error.requiresReAuth;
}
