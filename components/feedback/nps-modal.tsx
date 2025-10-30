'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitNps } from '@/app/actions/feedback';
import { useFormState } from 'react-dom';

export function NpsModal({ context }: { context?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);
  const [state, action] = useFormState(submitNps, { success: false });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed inset-0 m-auto flex max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-slate-900">How was your session?</Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500">
            Rate FindMyCoach from 0 (not likely) to 10 (extremely likely) to help us improve.
          </Dialog.Description>
          <form action={action} className="space-y-4">
            <input type="hidden" name="context" value={context ?? 'post-session'} />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 11 }).map((_, index) => (
                <label key={index} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-sm font-medium">
                  <input type="radio" name="score" value={index} className="sr-only" />
                  {index}
                </label>
              ))}
            </div>
            <textarea
              name="feedback"
              placeholder="What should we improve?"
              className="h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Maybe later
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
