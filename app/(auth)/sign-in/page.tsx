import { Metadata } from 'next';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormState } from 'react-dom';

export const metadata: Metadata = {
  title: 'Sign in • FindMyCoach',
};

async function authenticate(_: unknown, formData: FormData) {
  try {
    await signIn('credentials', {
      redirect: false,
      email: formData.get('email'),
      password: formData.get('password'),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Invalid credentials' };
  }
}

export default function SignInPage() {
  const [state, formAction] = useFormState(authenticate, { success: false });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage your coaching journey.</p>
        <form action={formAction} className="mt-6 space-y-4">
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
            <Input id="password" name="password" type="password" required autoComplete="current-password" className="mt-1" />
          </div>
          {state?.message && <p className="text-sm text-red-500" role="alert">{state.message}</p>}
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            New here?{' '}
            <Link href="/sign-up/player" className="font-semibold text-brand">
              Create a player account
            </Link>{' '}
            or{' '}
            <Link href="/sign-up/coach" className="font-semibold text-brand">
              coach account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
