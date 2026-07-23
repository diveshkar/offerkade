'use client';

import { useState, type ComponentProps } from 'react';
import { EyeIcon, EyeOffIcon } from '@/app/components/Icons';

const FOCUS = 'outline-none focus:border-flame focus:ring-2 focus:ring-flame/25';
const CONTROL = `h-11 w-full rounded-xl border border-coal/15 bg-paper-soft pl-3.5 pr-11 text-[15px] text-coal-deep transition placeholder:text-coal/35 ${FOCUS}`;
const INVALID = 'border-ember/60 focus:border-ember focus:ring-ember/25';

/** Password field with a show/hide eye toggle. Drop-in for <Input type="password">. */
export default function PasswordInput({
  invalid,
  className = '',
  ...props
}: Omit<ComponentProps<'input'>, 'type'> & { invalid?: boolean }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        aria-invalid={invalid || undefined}
        className={`${CONTROL} ${invalid ? INVALID : ''} ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-coal/45 transition hover:text-coal-deep"
      >
        {show ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}
