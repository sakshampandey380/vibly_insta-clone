const apiUrl = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!apiUrl) {
    throw new Error("API URL is not configured.");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? "Something went wrong.");
  }

  return payload as T;
}

