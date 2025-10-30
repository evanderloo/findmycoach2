import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const payload = await request.json();
  await prisma.auditEvent.create({
    data: {
      type: 'posthog-proxy',
      entity: payload.event ?? 'unknown',
      entityId: payload.distinct_id ?? 'anonymous',
      payload,
    },
  });
  return NextResponse.json({ ok: true });
}
