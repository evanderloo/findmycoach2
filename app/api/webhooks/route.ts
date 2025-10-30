import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (!paymentIntent.metadata?.bookingId) break;
      await prisma.booking.update({
        where: { id: paymentIntent.metadata.bookingId },
        data: { status: 'COMPLETED', paymentIntentId: paymentIntent.id },
      });
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (!paymentIntent.metadata?.bookingId) break;
      await prisma.booking.update({
        where: { id: paymentIntent.metadata.bookingId },
        data: { status: 'CANCELED' },
      });
      break;
    }
    case 'charge.captured': {
      const charge = event.data.object as Stripe.Charge;
      if (!charge.metadata?.bookingId) break;
      await prisma.booking.update({
        where: { id: charge.metadata.bookingId },
        data: { status: 'COMPLETED' },
      });
      break;
    }
    case 'transfer.created': {
      const transfer = event.data.object as Stripe.Transfer;
      if (transfer.metadata?.bookingId) {
        await prisma.booking.update({
          where: { id: transfer.metadata.bookingId },
          data: { payoutId: transfer.id },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
