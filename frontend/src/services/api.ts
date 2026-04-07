const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getHeaders(conBody = false): HeadersInit {
  const headers: Record<string, string> = {};

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (conBody) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  const data: unknown = await res.json();

  if (!res.ok) {
    const error = data as { message?: string };
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  return data as T;
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
  });
  return manejarRespuesta<T>(res);
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });
  return manejarRespuesta<T>(res);
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });
  return manejarRespuesta<T>(res);
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return manejarRespuesta<T>(res);
}
