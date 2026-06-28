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
    let msg = `خطای سرور (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.message === 'string') {
        msg = body.message;
      } else if (Array.isArray(body.message) && body.message.length > 0) {
        msg = body.message[0];
      }
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function getArticles(params?: {
  section?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  category?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.section) searchParams.set('section', params.section);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
  if (params?.category) searchParams.set('category', params.category);
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

export async function login(mobile: string, password: string, countryCode = '+98') {
  return fetchAPI<import('@/types').LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password, countryCode }),
  });
}

export async function register(fullName: string, mobile: string, password: string, countryCode = '+98') {
  return fetchAPI<import('@/types').RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, mobile, password, countryCode }),
  });
}

export async function sendOtp(mobile: string, countryCode = '+98') {
  return fetchAPI<{ message: string; mobile: string; countryCode: string; otp?: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile, countryCode }),
  });
}

export async function verifyOtp(mobile: string, code: string, countryCode = '+98') {
  return fetchAPI<import('@/types').AuthResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile, code, countryCode }),
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

// Wallet & Token APIs
export async function getWallet(token: string) {
  return fetchAPI<import('@/types').WalletInfo>('/wallet/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTransactions(token: string, page = 1, limit = 20) {
  return fetchAPI<{ transactions: import('@/types').WalletTransaction[]; total: number }>(
    `/wallet/transactions?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function purchaseTokens(token: string, tokenAmount: number) {
  return fetchAPI<{ transaction: any; wallet: import('@/types').WalletInfo }>('/wallet/purchase', {
    method: 'POST',
    body: JSON.stringify({ tokenAmount }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function transferTokens(
  token: string,
  targetMobile: string,
  targetUsername: string,
  amount: number,
  description?: string,
) {
  return fetchAPI<{ sentTx: any; wallet: import('@/types').WalletInfo }>('/wallet/transfer', {
    method: 'POST',
    body: JSON.stringify({
      targetMobile: targetMobile || undefined,
      targetUsername: targetUsername || undefined,
      amount,
      description,
    }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function requestSell(token: string, tokenAmount: number, cardNumber?: string, shebaNumber?: string) {
  return fetchAPI<any>('/wallet/sell-request', {
    method: 'POST',
    body: JSON.stringify({ tokenAmount, cardNumber, shebaNumber }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createGiftCard(token: string, amount: number, message?: string) {
  return fetchAPI<import('@/types').GiftCard>('/wallet/gift-card', {
    method: 'POST',
    body: JSON.stringify({ amount, message }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function redeemGiftCard(token: string, code: string) {
  return fetchAPI<import('@/types').GiftCard>('/wallet/gift-card/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyGiftCards(token: string) {
  return fetchAPI<import('@/types').GiftCard[]>('/wallet/gift-cards', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTokenConfig(token: string) {
  return fetchAPI<import('@/types').TokenConfig>('/wallet/config', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function subscribeNewsletter(email: string) {
  return fetchAPI<{ message: string }>('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Store APIs
export async function getStoreProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  seller?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString());
  if (params?.seller) searchParams.set('seller', params.seller);
  const q = searchParams.toString();
  return fetchAPI<{ products: import('@/types').StoreProduct[]; total: number }>(
    `/store/products${q ? `?${q}` : ''}`,
  );
}

export async function getStoreProductBySlug(slug: string, token?: string) {
  return fetchAPI<import('@/types').StoreProduct>(`/store/products/${slug}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function createStoreProduct(token: string, data: any) {
  return fetchAPI<import('@/types').StoreProduct>('/store/products', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateStoreProduct(token: string, id: string, data: any) {
  return fetchAPI<import('@/types').StoreProduct>(`/store/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteStoreProduct(token: string, id: string) {
  return fetchAPI<{ message: string }>(`/store/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function purchaseProduct(token: string, productId: string) {
  return fetchAPI<{ order: any; walletBalance: number }>('/store/purchase', {
    method: 'POST',
    body: JSON.stringify({ productId }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyPurchases(token: string, page = 1, limit = 20) {
  return fetchAPI<{ orders: import('@/types').StoreOrder[]; total: number }>(
    `/store/my-purchases?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function getMyStoreProducts(token: string, page = 1, limit = 20) {
  return fetchAPI<{ products: import('@/types').StoreProduct[]; total: number }>(
    `/store/my-products?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function checkPurchased(token: string, productId: string) {
  return fetchAPI<{ purchased: boolean }>(`/store/purchased/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSellerOrders(token: string, page = 1, limit = 20) {
  return fetchAPI<{ orders: import('@/types').StoreOrder[]; total: number }>(
    `/store/seller-orders?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}
