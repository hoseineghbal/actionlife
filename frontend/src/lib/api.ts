const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getArticles(params?: {
  section?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.section) searchParams.set('section', params.section);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
  const query = searchParams.toString();
  return fetchAPI<{ articles: import('@/types').Article[]; total: number }>(
    `/articles${query ? `?${query}` : ''}`,
  );
}

export async function getArticleBySlug(slug: string) {
  return fetchAPI<import('@/types').Article>(`/articles/${slug}`);
}

export async function getLatestArticles(limit = 6) {
  return fetchAPI<import('@/types').Article[]>(`/articles/latest?limit=${limit}`);
}

export async function getFeaturedArticles(limit = 4) {
  return fetchAPI<import('@/types').Article[]>(`/articles/featured?limit=${limit}`);
}

export async function getPopularArticles(limit = 6) {
  return fetchAPI<import('@/types').Article[]>(`/articles/popular?limit=${limit}`);
}

export async function getCategories() {
  return fetchAPI<import('@/types').Category[]>('/categories');
}

export async function submitContact(data: import('@/types').ContactForm) {
  return fetchAPI<{ message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(email: string, password: string) {
  return fetchAPI<import('@/types').AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(fullName: string, email: string, password: string) {
  return fetchAPI<import('@/types').AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
}

export async function getProfile(token: string) {
  return fetchAPI<import('@/types').User>('/users/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProfile(token: string, data: Partial<import('@/types').User>) {
  return fetchAPI<import('@/types').User>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getUserArticles(token: string, userId: string, page = 1, limit = 20) {
  return fetchAPI<{ articles: import('@/types').Article[]; total: number }>(`/articles/user/${userId}?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteArticle(token: string, id: string) {
  return fetchAPI<void>(`/articles/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateArticle(token: string, id: string, data: any) {
  return fetchAPI<import('@/types').Article>(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}
