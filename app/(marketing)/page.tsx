import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const heroImage =
  'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1000&q=80';

const valueProps = [
  {
    title: 'Players level up fast',
    body: 'Book vetted coaches in Your city, track progress, and keep your crew accountable with group sessions.',
    cta: {
      label: 'Find a coach',
      href: '/sign-up/player',
    },
  },
  {
    title: 'Coaches fill calendars',
    body: 'Demand insights, automated payments, and marketing done for you. You coach—we handle the rest.',
    cta: {
      label: 'Join as coach',
      href: '/sign-up/coach',
    },
  },
];

const faqs = [
  {
    q: 'Which sports are supported?',
    a: 'We start with Beach Volleyball, and new sports unlock as local demand hits waitlist thresholds.',
  },
  {
    q: 'How do payments work?',
    a: 'FindMyCoach securely pre-authorizes the session cost and captures only after completion. Coaches get paid via Stripe Connect.',
  },
  {
    q: 'Can I bring friends?',
    a: 'Absolutely. Create a player group, invite teammates, and request group sessions with transparent pricing.',
  },
];

export default function LandingPage() {
  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-20 text-center md:flex-row md:text-left">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
              Beach Volleyball • Your city
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Find great coaches. Train smarter. Win more rallies.
            </h1>
            <p className="text-lg text-slate-600">
              FindMyCoach connects motivated athletes with elite Beach Volleyball coaches. Discover availability, book sessions, and grow together with full transparency.
            </p>
            <div className="flex flex-col gap-3 md:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up/player">Start as player</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-up/coach">Become a coach</Link>
              </Button>
            </div>
            <p className="text-sm text-slate-500">
              Join the waitlist and invite friends—earn $30 credit for every coach or player who books.
            </p>
            <form className="flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-slate-100/60 p-4 md:flex-row md:items-center">
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                className="h-11 flex-1 rounded-md border border-slate-200 bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Email for waitlist"
                required
              />
              <Button type="submit" className="h-11 px-8">
                Join waitlist
              </Button>
            </form>
          </div>
          <div className="relative h-80 w-full max-w-md">
            <Image src={heroImage} alt="Players training on the beach" fill className="rounded-3xl object-cover shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {valueProps.map((prop) => (
            <Card key={prop.title} className="h-full border-none bg-slate-900 text-white">
              <CardHeader>
                <h2 className="text-2xl font-semibold">{prop.title}</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                <p>{prop.body}</p>
                <Button asChild variant="secondary">
                  <Link href={prop.cta.href}>{prop.cta.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900">Trusted by early Beach Volleyball coaches</h2>
            <p className="text-slate-600">
              Showcase highlight clips, manage calendars, and understand local demand. Players read ratings, view pricing, and book instantly.
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
              <li className="rounded-xl border border-slate-200 bg-white p-4 text-left">
                <p className="font-medium">“I filled my mornings within 2 weeks.”</p>
                <p className="text-sm text-slate-500">— Coach Maria, AVP Qualifier</p>
              </li>
              <li className="rounded-xl border border-slate-200 bg-white p-4 text-left">
                <p className="font-medium">“Group sessions + payments handled. Bliss.”</p>
                <p className="text-sm text-slate-500">— Coach Devin, NCAA Champion</p>
              </li>
              <li className="rounded-xl border border-slate-200 bg-white p-4 text-left">
                <p className="font-medium">“Demand map tells me where to host clinics.”</p>
                <p className="text-sm text-slate-500">— Coach Leah, National Team Scout</p>
              </li>
            </ul>
          </div>
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-100/80 p-6">
            <h3 className="text-xl font-semibold text-slate-900">Why FindMyCoach works</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li>• Verified coaches with certifications & reviews.</li>
              <li>• Demand heatmaps to match prime time slots.</li>
              <li>• Pre-authorized payments for zero no-shows.</li>
              <li>• Messaging, policies, and analytics built-in.</li>
            </ul>
            <Button asChild>
              <Link href="/sign-up/coach">Claim your profile</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-center text-slate-900">Frequently asked questions</h2>
        <div className="mt-10 space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-medium text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} FindMyCoach. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-700">
              Privacy
            </Link>
            <Link href="#" className="hover:text-slate-700">
              Terms
            </Link>
            <Link href="#" className="hover:text-slate-700">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
