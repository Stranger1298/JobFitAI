import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // This endpoint is intentionally minimal because this project currently has no database.
    // In production, verify signatures and persist entitlements against a real user record.
    console.log('Dodo webhook received:', payload?.type || payload?.event_type || 'unknown');

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}
