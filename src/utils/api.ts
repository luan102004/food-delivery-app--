export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => fetcher<T>(url, { method: 'GET' }),
  
  post: <T>(url: string, data: any) =>
    fetcher<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(url: string, data: any) =>
    fetcher<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(url: string) => fetcher<T>(url, { method: 'DELETE' }),
};