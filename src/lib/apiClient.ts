const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  quietOnStatuses?: readonly number[];
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { quietOnStatuses = [], ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);

  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
    body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message ?? `API request failed with status ${response.status}`;

    if (!quietOnStatuses.includes(response.status)) {
      console.error(`API Error [${response.status}]:`, {
        url: `${API_BASE_URL}${path}`,
        message,
        errorBody,
      });
    }

    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};
