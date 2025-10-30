'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const messageSchema = z.object({
  threadId: z.string().cuid().optional(),
  coachId: z.string().cuid(),
  subject: z.string().min(3),
  text: z.string().min(1),
});

export async function sendMessage(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const parsed = messageSchema.safeParse({
    threadId: formData.get('threadId') ?? undefined,
    coachId: formData.get('coachId'),
    subject: formData.get('subject'),
    text: formData.get('text'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Please provide a message.' };
  }

  let threadId = parsed.data.threadId;
  if (!threadId) {
    const thread = await prisma.messageThread.create({
      data: {
        subject: parsed.data.subject,
        participantIds: [session.user.id, parsed.data.coachId],
      },
    });
    threadId = thread.id;
  }

  await prisma.message.create({
    data: {
      threadId,
      senderId: session.user.id,
      text: parsed.data.text,
    },
  });

  await prisma.auditEvent.create({
    data: {
      type: 'message.sent',
      actorId: session.user.id,
      entity: 'MessageThread',
      entityId: threadId,
      payload: {
        subject: parsed.data.subject,
      },
    },
  });

  revalidatePath(`/messages/${threadId}`);
  return { success: true, threadId };
}
