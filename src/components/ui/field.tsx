"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

/* Champs de saisie : pas de boîte, une ligne. On écrit sur du papier. */

const CONTROL =
  "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 font-sans text-[0.9375rem] font-light text-ink transition-colors duration-400 ease-silk placeholder:text-ink-faint hover:border-gold-soft focus:border-gold focus:outline-none focus:ring-0 disabled:opacity-50";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}

export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("group/field", className)}>
      <label htmlFor={id} className="eyebrow-sm mb-3 flex items-baseline gap-2 text-ink-soft">
        {label}
        {optional && <span className="text-ink-faint normal-case tracking-normal">— facultatif</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs font-light text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 flex items-center gap-2 text-xs font-light text-danger">
          <span aria-hidden className="inline-block h-px w-3 bg-danger" />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(CONTROL, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 5, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(CONTROL, "resize-none leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select ref={ref} className={cn(CONTROL, "appearance-none pr-8", className)} {...props}>
          {children}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink-faint">
          ↓
        </span>
      </div>
    );
  },
);

/** Case à cocher éditoriale — un carré, un trait. */
export const Checkbox = forwardRef<
  HTMLInputElement,
  { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>
>(function Checkbox({ label, className, ...props }, ref) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm font-light text-ink-soft", className)}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-xs border border-line-strong text-transparent transition-colors duration-300 peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
      >
        <svg viewBox="0 0 12 12" fill="none" className="size-2.5 text-ivory">
          <path
            d="M1.5 6.2 L4.4 9 L10.5 2.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  );
});
