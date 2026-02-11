import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, path } = body;

    if (!tenantId || !path) {
      return NextResponse.json(
        { error: 'Missing tenantId or path' },
        { status: 400 }
      );
    }

    await prisma.pageView.create({
      data: {
        tenantId,
        path,
        userAgent: req.headers.get('user-agent') || null,
        referer: req.headers.get('referer') || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Fire and forget - don't fail the page load
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
