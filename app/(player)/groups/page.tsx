import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GroupForm } from '@/components/player/group-form';

export default async function PlayerGroupsPage() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Please sign in');
  }

  const groups = await prisma.group.findMany({
    where: { ownerPlayerId: session.user.id },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.2fr,0.8fr]">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Your player groups</h1>
        {groups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="space-y-4 py-10 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Build your squad</h2>
              <p className="text-sm text-slate-600">
                Create a group to split sessions, share progress, and schedule clinics together.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
                      <p className="text-sm text-slate-500">{group.members.length} members</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/coaches?groupId=${group.id}`}>Find coach for group</Link>
                    </Button>
                  </div>
                  <ul className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    {group.members.map((member) => (
                      <li key={member.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <aside>
        <GroupForm />
        <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Tips</h2>
          <p>Groups unlock discounted packages. Coaches love seeing ready-to-train squads.</p>
          <p>Share your referral code once a teammate signs up—everyone gets $30 credit.</p>
        </div>
      </aside>
    </div>
  );
}
