import { NextRequest, NextResponse } from 'next/server';
import { hasProAccess } from '@/lib/payment-access';

export async function GET(request: NextRequest) {
  return NextResponse.json({ hasAccess: hasProAccess(request) });
}
