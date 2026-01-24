import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, options = {}) {
  const { method = "GET", token, body, headers = {} } = options;
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch (_) {
      errorDetails = await response.text();
    }
    throw new ApiError(`Request failed with status ${response.status}`, response.status, errorDetails);
  }

  if (response.status === 204) {
    return undefined;
  }

  return await response.json();
}
