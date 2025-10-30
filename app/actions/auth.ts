'use server';

import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

const playerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']),
  bio: z.string().optional(),
  homeLat: z.coerce.number(),
  homeLng: z.coerce.number(),
});

const coachSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  headline: z.string().min(10),
  pricePerHour: z.coerce.number().positive(),
  radiusKm: z.coerce.number().positive(),
  bio: z.string().optional(),
  languages: z.string().array().optional(),
  baseLat: z.coerce.number(),
  baseLng: z.coerce.number(),
});

export async function registerPlayer(prevState: unknown, formData: FormData) {
  const parsed = playerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    level: formData.get('level'),
    bio: formData.get('bio'),
    homeLat: formData.get('homeLat'),
    homeLng: formData.get('homeLng'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Please fix the highlighted errors.' };
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, message: 'Email already registered.' };
  }
  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: 'PLAYER',
      playerProfile: {
        create: {
          level: parsed.data.level,
          homeLocation: {
            // WKT format for PostGIS geography
            set: `SRID=4326;POINT(${parsed.data.homeLng} ${parsed.data.homeLat})`,
          },
          bio: parsed.data.bio,
        },
      },
    },
  });
  revalidatePath('/');
  return { success: true };
}

export async function registerCoach(prevState: unknown, formData: FormData) {
  const parsed = coachSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    headline: formData.get('headline'),
    pricePerHour: formData.get('pricePerHour'),
    radiusKm: formData.get('radiusKm'),
    bio: formData.get('bio'),
    languages: (formData.get('languages')?.toString() ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    baseLat: formData.get('baseLat'),
    baseLng: formData.get('baseLng'),
  });
  if (!parsed.success) {
    return { success: false, message: 'Please fix the highlighted errors.' };
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, message: 'Email already registered.' };
  }
  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: 'COACH',
      coachProfile: {
        create: {
          headline: parsed.data.headline,
          bio: parsed.data.bio,
          baseLocation: {
            set: `SRID=4326;POINT(${parsed.data.baseLng} ${parsed.data.baseLat})`,
          },
          pricePerHour: new Prisma.Decimal(parsed.data.pricePerHour),
          radiusKm: parsed.data.radiusKm,
          levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'],
          languages: parsed.data.languages ?? [],
          sports: ['Beach Volleyball'],
        },
      },
    },
  });
  revalidatePath('/');
  return { success: true };
}
