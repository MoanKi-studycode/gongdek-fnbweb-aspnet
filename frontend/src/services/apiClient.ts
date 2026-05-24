const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5256/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
}

function getAuthToken(): string | null {
  return localStorage.getItem('gongdek_token');
}

async function parseErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const text = await response.text().catch(() => response.statusText);
    try {
      const json = JSON.parse(text) as { message?: string };
      return json.message ?? text;
    } catch {
      return text || `HTTP ${response.status}`;
    }
  }
  return `HTTP ${response.status}`;
}

async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

/** Tải file binary từ API (Excel, PDF...) */
export async function downloadFile(path: string, fallbackFilename: string): Promise<void> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { headers });
  if (!response.ok) throw new Error(await parseErrorMessage(response));

  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = match?.[1]?.replace(/['"]/g, '') ?? fallbackFilename;

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('gongdek_token', token);
  } else {
    localStorage.removeItem('gongdek_token');
  }
}
