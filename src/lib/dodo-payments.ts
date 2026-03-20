const DODO_API_BASE_URL = process.env.DODO_PAYMENTS_API_BASE_URL || 'https://api.dodopayments.com';

type JsonRecord = Record<string, unknown>;

interface DodoCheckoutCreateResponse {
  id?: string;
  checkout_id?: string;
  checkout_session_id?: string;
  session_id?: string;
  url?: string;
  checkout_url?: string;
  payment_link?: string;
}

interface DodoCheckoutStatusResponse {
  id?: string;
  status?: string;
  payment_status?: string;
  state?: string;
  customer?: { email?: string };
  metadata?: Record<string, string>;
}

function getDodoApiKey(): string {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('DODO_PAYMENTS_API_KEY is not configured.');
  }
  return apiKey;
}

async function dodoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${DODO_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getDodoApiKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Dodo API request failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as T;
}

export function getCheckoutReturnUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured.');
  }

  return `${baseUrl.replace(/\/$/, '')}/?payment=return`;
}

export async function createDodoCheckoutSession(email: string): Promise<{ sessionId: string; checkoutUrl: string }> {
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  if (!productId) {
    throw new Error('DODO_PAYMENTS_PRODUCT_ID is not configured.');
  }

  const payload: JsonRecord = {
    product_cart: [
      {
        product_id: productId,
        quantity: 1
      }
    ],
    return_url: getCheckoutReturnUrl(),
    metadata: {
      feature: 'resume-improvement-pro',
      user_email: email
    },
    customer: {
      email
    }
  };

  const data = await dodoRequest<DodoCheckoutCreateResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const sessionId = data.id || data.checkout_id || data.checkout_session_id || data.session_id;
  const checkoutUrl = data.url || data.checkout_url || data.payment_link;

  if (!sessionId || !checkoutUrl) {
    throw new Error('Unexpected Dodo create checkout response.');
  }

  return { sessionId, checkoutUrl };
}

export async function getDodoCheckoutStatus(sessionId: string): Promise<DodoCheckoutStatusResponse> {
  return await dodoRequest<DodoCheckoutStatusResponse>(`/checkouts/${encodeURIComponent(sessionId)}`);
}

export function isSuccessfulCheckout(checkout: DodoCheckoutStatusResponse): boolean {
  const status = [checkout.status, checkout.payment_status, checkout.state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return ['paid', 'succeeded', 'success', 'completed'].some((value) => status.includes(value));
}

export function getCheckoutEmail(checkout: DodoCheckoutStatusResponse): string {
  if (checkout.customer?.email) {
    return checkout.customer.email;
  }

  return checkout.metadata?.user_email || 'paid-user@jobfit.local';
}
