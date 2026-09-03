"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "success" | "danger";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastApi {
  toast: (input: { title: string; description?: string; tone?: Tone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast doit être utilisé dans ToastProvider");
  return context;
}

const TONES: Record<Tone, string> = {
  neutral: "border-t-gold",
  success: "border-t-success",
  danger: "border-t-danger",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback<ToastApi["toast"]>(({ title, description, tone = "neutral" }) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => setItems((current) => current.filter((t) => t.id !== id)), 4200);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-5 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto w-full max-w-sm rounded-sm border border-line border-t-2 bg-surface px-5 py-4",
                TONES[item.tone],
              )}
            >
              <p className="eyebrow-sm text-ink">{item.title}</p>
              {item.description && (
                <p className="mt-1.5 text-sm font-light leading-relaxed text-ink-soft">
                  {item.description}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
