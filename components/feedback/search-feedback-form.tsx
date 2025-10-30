'use client';

import { useFormState } from 'react-dom';
import { submitSearchFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function SearchFeedbackForm({ query }: { query?: string }) {
  const [state, action] = useFormState(submitSearchFeedback, { success: false });
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="query" value={query} />
      <Textarea name="reason" placeholder="Tell us what you were looking for" required />
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      <Button type="submit" className="w-full">
        Send feedback
      </Button>
    </form>
  );
}
