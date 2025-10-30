import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'COACH') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const coach = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
  if (!coach) {
    return NextResponse.json({ error: 'Coach profile missing' }, { status: 400 });
  }

  let accountId = coach.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: session.user.email!,
      country: 'US',
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    await prisma.coachProfile.update({
      where: { userId: session.user.id },
      data: { stripeAccountId: accountId },
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/payouts?state=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/payouts?state=return`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: link.url });
}
