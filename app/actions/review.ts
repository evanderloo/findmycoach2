'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const reviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.coerce.number().min(1).max(5),
  text: z.string().optional(),
});

export async function submitReview(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const parsed = reviewSchema.safeParse({
    bookingId: formData.get('bookingId'),
    rating: formData.get('rating'),
    text: formData.get('text'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Invalid review' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { coach: true },
  });
  if (!booking || booking.playerId !== session.user.id) {
    throw new Error('Not allowed');
  }

  await prisma.review.upsert({
    where: { bookingId: parsed.data.bookingId },
    create: {
      bookingId: parsed.data.bookingId,
      rating: parsed.data.rating,
      text: parsed.data.text,
    },
    update: {
      rating: parsed.data.rating,
      text: parsed.data.text,
    },
  });

  const reviews = await prisma.review.aggregate({
    where: { booking: { coachId: booking.coachId } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.coachProfile.update({
    where: { userId: booking.coachId },
    data: {
      ratingAvg: reviews._avg.rating ?? 0,
      ratingCount: reviews._count.rating ?? 0,
    },
  });

  await prisma.auditEvent.create({
    data: {
      type: 'review.submitted',
      actorId: session.user.id,
      entity: 'Booking',
      entityId: booking.id,
      payload: {
        rating: parsed.data.rating,
      },
    },
  });

  revalidatePath('/bookings');
  return { success: true };
}
