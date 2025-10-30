'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const bookingSchema = z.object({
  coachId: z.string().cuid(),
  start: z.string(),
  end: z.string(),
  price: z.coerce.number().positive(),
  currency: z.string().default('usd'),
  groupId: z.string().cuid().optional(),
  notes: z.string().optional(),
});

export async function createBooking(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PLAYER') {
    throw new Error('Unauthorized');
  }
  const parsed = bookingSchema.safeParse({
    coachId: formData.get('coachId'),
    start: formData.get('start'),
    end: formData.get('end'),
    price: formData.get('price'),
    currency: formData.get('currency'),
    groupId: formData.get('groupId') ?? undefined,
    notes: formData.get('notes'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Invalid booking details' };
  }

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: parsed.data.coachId },
    select: {
      stripeAccountId: true,
      pricePerHour: true,
    },
  });
  if (!coach?.stripeAccountId) {
    return { success: false, message: 'Coach is not ready to accept payments yet.' };
  }

  const booking = await prisma.booking.create({
    data: {
      playerId: session.user.id,
      coachId: parsed.data.coachId,
      groupId: parsed.data.groupId,
      start: new Date(parsed.data.start),
      end: new Date(parsed.data.end),
      price: new Prisma.Decimal(parsed.data.price),
      currency: parsed.data.currency,
      status: 'PENDING',
    },
  });

  const applicationFee = Math.round(parsed.data.price * PLATFORM_FEE_PERCENT * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(parsed.data.price * 100),
    currency: parsed.data.currency,
    application_fee_amount: applicationFee,
    capture_method: 'manual',
    payment_method_types: ['card'],
    metadata: {
      bookingId: booking.id,
    },
    transfer_data: {
      destination: coach.stripeAccountId,
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentIntentId: paymentIntent.id,
      status: 'CONFIRMED',
    },
  });
  await prisma.auditEvent.create({
    data: {
      type: 'booking.created',
      actorId: session.user.id,
      entity: 'Booking',
      entityId: booking.id,
      payload: {
        coachId: parsed.data.coachId,
        start: parsed.data.start,
        end: parsed.data.end,
        price: parsed.data.price,
      },
    },
  });

  revalidatePath('/bookings');
  return { success: true, bookingId: booking.id, clientSecret: paymentIntent.client_secret };
}

export async function captureBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking?.paymentIntentId) {
    throw new Error('Missing payment intent');
  }
  await stripe.paymentIntents.capture(booking.paymentIntentId);
  await prisma.booking.update({ where: { id: bookingId }, data: { status: 'COMPLETED' } });
}

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking?.paymentIntentId) {
    throw new Error('Missing payment intent');
  }
  await stripe.paymentIntents.cancel(booking.paymentIntentId);
  await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELED' } });
}
