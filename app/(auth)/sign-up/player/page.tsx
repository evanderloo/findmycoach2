import Link from 'next/link';
import { useFormState } from 'react-dom';
import { registerPlayer } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PlayerSignUpPage() {
  const [state, formAction] = useFormState(registerPlayer, { success: false });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900">Join FindMyCoach as a player</h1>
        <p className="mt-2 text-slate-600">
          Discover Beach Volleyball coaches in Your city, build squads, and get better faster.
        </p>
        <form action={formAction} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <Input id="name" name="name" required autoComplete="name" className="mt-1" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" className="mt-1" />
          </div>
          <div>
            <label htmlFor="level" className="text-sm font-medium text-slate-700">
              Skill level
            </label>
            <select
              id="level"
              name="level"
              required
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="PRO">Pro</option>
            </select>
          </div>
          <div>
            <label htmlFor="homeLat" className="text-sm font-medium text-slate-700">
              Home latitude
            </label>
            <Input id="homeLat" name="homeLat" type="number" step="any" required className="mt-1" />
          </div>
          <div>
            <label htmlFor="homeLng" className="text-sm font-medium text-slate-700">
              Home longitude
            </label>
            <Input id="homeLng" name="homeLng" type="number" step="any" required className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium text-slate-700">
              What do you want to work on?
            </label>
            <Textarea id="bio" name="bio" placeholder="Serve receive, setting, teamwork..." className="mt-1" />
          </div>
          {state?.message && (
            <p className="md:col-span-2 text-sm text-red-500" role="alert">
              {state.message}
            </p>
          )}
          <div className="md:col-span-2 flex items-center justify-between">
            <Link href="/sign-in" className="text-sm text-slate-500 hover:text-slate-700">
              Already have an account? Sign in
            </Link>
            <Button type="submit">Create player account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
