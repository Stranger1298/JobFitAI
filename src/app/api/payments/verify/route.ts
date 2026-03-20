import { NextRequest, NextResponse } from 'next/server';
import { getDodoCheckoutStatus, getCheckoutEmail, isSuccessfulCheckout } from '@/lib/dodo-payments';
import {
  PRO_ACCESS_COOKIE,
  createProAccessToken,
  getCookieMaxAgeSeconds,
  hasProAccess
} from '@/lib/payment-access';

export async function GET(request: NextRequest) {
  return NextResponse.json({ hasAccess: hasProAccess(request) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = String(body?.sessionId || '').trim();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
    }

    const checkout = await getDodoCheckoutStatus(sessionId);

    if (!isSuccessfulCheckout(checkout)) {
      return NextResponse.json({ success: false, status: checkout.status || checkout.payment_status || 'pending' });
    }

    const email = getCheckoutEmail(checkout);
    const token = createProAccessToken(sessionId, email);

    const response = NextResponse.json({ success: true, email });
    response.cookies.set({
      name: PRO_ACCESS_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: getCookieMaxAgeSeconds()
    });

    return response;
  } catch (error) {
    console.error('Verify checkout failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment.' },
      { status: 500 }
    );
  }
}
