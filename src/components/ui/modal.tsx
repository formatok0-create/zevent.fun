"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, eyebrow, children, className }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-5">
          <motion.button
            aria-label="Fermer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 cursor-default bg-noir/35 backdrop-blur-[3px]"
          />
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.985, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(4px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full max-w-md rounded-sm border border-line bg-surface p-8 outline-none sm:p-10",
              className,
            )}
          >
            <span aria-hidden className="absolute inset-x-8 top-0 h-px bg-gold/60" />
            {eyebrow && <p className="eyebrow-sm mb-4 text-gold">{eyebrow}</p>}
            <h2 className="font-display text-[1.75rem] leading-tight">{title}</h2>
            <div className="mt-5 text-sm font-light leading-relaxed text-ink-soft">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Confirmation de suppression : irréversible, donc explicite. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Supprimer",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} eyebrow="Action irréversible">
      <p>{description}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} type="button">
          Annuler
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={loading} type="button">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
