'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const npsSchema = z.object({
  score: z.coerce.number().min(0).max(10),
  feedback: z.string().optional(),
  context: z.string().optional(),
});

export async function submitNps(_: unknown, formData: FormData) {
  const session = await auth();
  const parsed = npsSchema.safeParse({
    score: formData.get('score'),
    feedback: formData.get('feedback'),
    context: formData.get('context'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Invalid response' };
  }
  await prisma.auditEvent.create({
    data: {
      type: 'feedback.nps',
      actorId: session?.user.id,
      entity: 'NPS',
      entityId: session?.user.id ?? 'anonymous',
      payload: parsed.data,
    },
  });
  return { success: true };
}

const searchFeedbackSchema = z.object({
  query: z.string().optional(),
  reason: z.string().min(3),
});

export async function submitSearchFeedback(_: unknown, formData: FormData) {
  const session = await auth();
  const parsed = searchFeedbackSchema.safeParse({
    query: formData.get('query'),
    reason: formData.get('reason'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Please provide feedback' };
  }
  await prisma.auditEvent.create({
    data: {
      type: 'feedback.search',
      actorId: session?.user.id,
      entity: 'Search',
      entityId: session?.user.id ?? 'anonymous',
      payload: parsed.data,
    },
  });
  return { success: true };
}
