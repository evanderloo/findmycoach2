'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const groupSchema = z.object({
  name: z.string().min(2),
  emails: z.string().array().optional(),
});

export async function createGroup(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PLAYER') {
    throw new Error('Unauthorized');
  }
  const parsed = groupSchema.safeParse({
    name: formData.get('name'),
    emails: (formData.get('emails')?.toString() ?? '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean),
  });
  if (!parsed.success) {
    return { success: false, message: 'Please provide a name.' };
  }

  const members = await prisma.user.findMany({
    where: {
      email: { in: parsed.data.emails ?? [] },
    },
    select: { id: true },
  });

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      ownerPlayerId: session.user.id,
      members: {
        connect: [{ id: session.user.id }, ...members.map((member) => ({ id: member.id }))],
      },
    },
  });
  await prisma.auditEvent.create({
    data: {
      type: 'group.created',
      actorId: session.user.id,
      entity: 'Group',
      entityId: group.id,
      payload: {
        name: parsed.data.name,
        invited: parsed.data.emails,
      },
    },
  });
  revalidatePath('/groups');
  return { success: true };
}
