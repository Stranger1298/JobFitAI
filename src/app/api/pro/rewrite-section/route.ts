import { NextRequest, NextResponse } from 'next/server';
import { hasProAccess } from '@/lib/payment-access';
import { rewriteResumeSectionWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    if (!hasProAccess(request)) {
      return NextResponse.json({ error: 'Pro access required.' }, { status: 403 });
    }

    const body = await request.json();
    const section = String(body?.section || '').trim();
    const content = String(body?.content || '').trim();
    const jobDescription = String(body?.jobDescription || '').trim();

    if (!section || !content || !jobDescription) {
      return NextResponse.json(
        { error: 'section, content and jobDescription are required.' },
        { status: 400 }
      );
    }

    const rewritten = await rewriteResumeSectionWithGemini(section, content, jobDescription);
    return NextResponse.json({ success: true, rewritten });
  } catch (error) {
    console.error('Rewrite section failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rewrite section.' },
      { status: 500 }
    );
  }
}
