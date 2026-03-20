import { NextRequest, NextResponse } from 'next/server';
import { createDodoCheckoutSession } from '@/lib/dodo-payments';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const checkout = await createDodoCheckoutSession(email);
    return NextResponse.json({ success: true, ...checkout });
  } catch (error) {
    console.error('Create checkout failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
