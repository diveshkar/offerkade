'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui';

/**
 * A trigger button that asks for confirmation in a modal before running a
 * server action. Renders the action inside a real <form> so it works without
 * JavaScript-heavy plumbing and keeps progressive-enhancement semantics.
 */
export default function ConfirmButton({
  action,
  fields = {},
  triggerLabel,
  triggerClassName,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  triggerLabel: string;
  triggerClassName?: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-coal-deep/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-coal/12 bg-paper-soft p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold text-coal-deep">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-coal/65">{message}</p>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                {cancelLabel}
              </Button>
              <form action={action} onSubmit={() => setOpen(false)}>
                {Object.entries(fields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <Button type="submit" variant={tone} className="w-full sm:w-auto">
                  {confirmLabel}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
