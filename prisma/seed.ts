import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.sessionRequest.deleteMany();
  await prisma.group.deleteMany();
  await prisma.demandPing.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.coachMedia.deleteMany();
  await prisma.coachProfile.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.user.deleteMany();

  const player = await prisma.user.create({
    data: {
      name: 'Jordan Player',
      email: 'player@example.com',
      passwordHash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p9g8p5P0xTkbZVqhlVg3I8I4JVXu',
      role: 'PLAYER',
      languages: ['English'],
      playerProfile: {
        create: {
          level: 'INTERMEDIATE',
          homeLocation: { set: 'SRID=4326;POINT(-118.491 33.985)' },
          bio: 'Intermediate blocker looking to sharpen defense.',
        },
      },
    },
  });

  const coach = await prisma.user.create({
    data: {
      name: 'Coach Maya',
      email: 'coach@example.com',
      passwordHash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p9g8p5P0xTkbZVqhlVg3I8I4JVXu',
      role: 'COACH',
      languages: ['English', 'Spanish'],
      coachProfile: {
        create: {
          headline: 'AVP mentor for up-and-coming beach duos',
          bio: 'Former AVP player coaching competitive teams with data-driven drills.',
          baseLocation: { set: 'SRID=4326;POINT(-118.493 33.99)' },
          pricePerHour: 120,
          radiusKm: 20,
          certifications: ['USAV Beach CAP I'],
          sports: ['Beach Volleyball'],
          levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
          languages: ['English', 'Spanish'],
          availabilities: {
            createMany: {
              data: [
                { weekday: 1, startTime: '06:00', endTime: '10:00' },
                { weekday: 3, startTime: '14:00', endTime: '18:00' },
              ],
            },
          },
        },
      },
    },
  });

  await prisma.demandPing.createMany({
    data: [
      {
        playerId: player.id,
        sport: 'Beach Volleyball',
        level: 'INTERMEDIATE',
        location: { set: 'SRID=4326;POINT(-118.48 33.99)' },
      },
      {
        playerId: player.id,
        sport: 'Beach Volleyball',
        level: 'INTERMEDIATE',
        location: { set: 'SRID=4326;POINT(-118.5 34.0)' },
      },
    ],
  });

  await prisma.sessionRequest.create({
    data: {
      createdByPlayerId: player.id,
      coachId: coach.id,
      sport: 'Beach Volleyball',
      skillLevel: 'INTERMEDIATE',
      location: { set: 'SRID=4326;POINT(-118.49 33.99)' },
      preferredTimes: { set: ['2024-08-20T14:00:00Z'] },
      durationMinutes: 90,
      notes: 'Looking for serve receive drills.',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
