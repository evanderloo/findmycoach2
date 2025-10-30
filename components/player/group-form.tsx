'use client';

import { useFormState } from 'react-dom';
import { createGroup } from '@/app/actions/group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function GroupForm() {
  const [state, action] = useFormState(createGroup, { success: false });
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Group name
        </label>
        <Input id="name" name="name" placeholder="Sunset Smashers" required className="mt-1" />
      </div>
      <div>
        <label htmlFor="emails" className="text-sm font-medium text-slate-700">
          Invite teammates (emails, comma separated)
        </label>
        <Input id="emails" name="emails" placeholder="pat@example.com, lee@example.com" className="mt-1" />
      </div>
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      <Button type="submit" className="w-full">
        Create group
      </Button>
    </form>
  );
}
