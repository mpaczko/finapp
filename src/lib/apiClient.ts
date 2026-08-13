import { supabase } from "../createClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
};

const getAccessToken = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.access_token;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    // When AUTH is disabled locally, backend expects x-user-id header
    const localUserId = import.meta.env.VITE_LOCAL_USER_ID;
    if (localUserId) {
      headers.set("x-user-id", localUserId);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message ?? `API request failed with status ${response.status}`;

    console.error(`API Error [${response.status}]:`, {
      url: `${API_BASE_URL}${path}`,
      message,
      errorBody,
    });

    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};
