import Link from 'next/link';
import { useFormState } from 'react-dom';
import { registerCoach } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CoachSignUpPage() {
  const [state, formAction] = useFormState(registerCoach, { success: false });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900">Grow your Beach Volleyball coaching business</h1>
        <p className="mt-2 text-slate-600">
          Tap into FindMyCoach player demand, showcase your expertise, and let us handle bookings and payments.
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
              Work email
            </label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="headline" className="text-sm font-medium text-slate-700">
              Coaching headline
            </label>
            <Input
              id="headline"
              name="headline"
              placeholder="ex: Olympic qualifier coach helping serious duos win more rallies"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="pricePerHour" className="text-sm font-medium text-slate-700">
              Price per hour (USD)
            </label>
            <Input id="pricePerHour" name="pricePerHour" type="number" min="0" step="0.01" required className="mt-1" />
          </div>
          <div>
            <label htmlFor="radiusKm" className="text-sm font-medium text-slate-700">
              Travel radius (km)
            </label>
            <Input id="radiusKm" name="radiusKm" type="number" min="0" step="1" required className="mt-1" />
          </div>
          <div>
            <label htmlFor="baseLat" className="text-sm font-medium text-slate-700">
              Base latitude
            </label>
            <Input id="baseLat" name="baseLat" type="number" step="any" required className="mt-1" />
          </div>
          <div>
            <label htmlFor="baseLng" className="text-sm font-medium text-slate-700">
              Base longitude
            </label>
            <Input id="baseLng" name="baseLng" type="number" step="any" required className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="languages" className="text-sm font-medium text-slate-700">
              Languages (comma separated)
            </label>
            <Input id="languages" name="languages" placeholder="English, Spanish" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium text-slate-700">
              Coaching bio
            </label>
            <Textarea id="bio" name="bio" placeholder="Share credentials, philosophy, wins." className="mt-1" />
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
            <Button type="submit">Create coach account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
