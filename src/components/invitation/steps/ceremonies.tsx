"use client";

import { forwardRef, useImperativeHandle } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/field";
import { ceremonyInfoSchema, type CeremonyInfoValues } from "@/lib/validation/schemas";
import { suggestFamilyMessage, CEREMONIES_BY_TYPE, EVENT_LABELS, wordingFor } from "@/lib/utils/events";
import type { EventKind, WeddingType } from "@/types/database";

export interface CeremonyStepHandle {
  submit: () => Promise<CeremonyInfoValues | null>;
  values: () => CeremonyInfoValues;
}





/** Les quatre champs d’une cérémonie. Même bloc pour les trois. */
function EventFields({
  name,
  register,
  errors,
  placeholder,
}: {
  name: EventKind;
  register: UseFormRegister<CeremonyInfoValues>;
  errors: FieldErrors<CeremonyInfoValues>;
  placeholder: { venue: string; address: string };
}) {
  const fieldErrors = errors[name] as
    | Partial<Record<"date" | "time" | "venue" | "address", { message?: string }>>
    | undefined;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Date" error={fieldErrors?.date?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-invalid={invalid} aria-describedby={describedBy} {...register(`${name}.date`)} />
          )}
        </Field>
        <Field label="Heure" error={fieldErrors?.time?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="time" aria-invalid={invalid} aria-describedby={describedBy} {...register(`${name}.time`)} />
          )}
        </Field>
      </div>

      <Field label="Lieu" error={fieldErrors?.venue?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder={placeholder.venue} aria-invalid={invalid} aria-describedby={describedBy} {...register(`${name}.venue`)} />
        )}
      </Field>

      <Field label="Adresse" optional error={fieldErrors?.address?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder={placeholder.address} aria-invalid={invalid} aria-describedby={describedBy} {...register(`${name}.address`)} />
        )}
      </Field>
    </div>
  );
}

function Block({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-9">
      <header className="mb-8 flex items-baseline gap-4">
        <span className="numeral text-sm text-gold">{index}</span>
        <div>
          <h3 className="font-display text-[1.5rem] leading-none">{title}</h3>
          <p className="mt-2 text-sm font-light text-ink-soft">{hint}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export const CeremonyDetailsStep = forwardRef<
  CeremonyStepHandle,
  { defaultValues: CeremonyInfoValues; onChange?: (values: CeremonyInfoValues) => void }
>(function CeremonyDetailsStep({ defaultValues, onChange }, ref) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CeremonyInfoValues>({
    resolver: zodResolver(ceremonyInfoSchema),
    defaultValues,
    mode: "onBlur",
  });

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (values) => resolve(values),
          () => resolve(null),
        )();
      }),
    values: () => getValues(),
  }));

  const weddingType = watch("weddingType") as WeddingType;
  const plan = CEREMONIES_BY_TYPE[weddingType ?? "chretien"];
  const hasCivil = watch("hasCivil");
  const hasCoutumier = watch("hasCoutumier");
  const [brideName, groomName, brideFamily, groomFamily] = watch([
    "bride_name",
    "groom_name",
    "bride_family",
    "groom_family",
  ]);

  const suggestion = suggestFamilyMessage(brideFamily ?? "", groomFamily ?? "", brideName ?? "", groomName ?? "");

  return (
    <form className="max-w-2xl space-y-14" onBlur={() => onChange?.(getValues())} noValidate>
      {/* ── Les mariés ─────────────────────────────────────── */}
      <section>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Prénom de la mariée" error={errors.bride_name?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} placeholder="Aïcha" aria-invalid={invalid} aria-describedby={describedBy} {...register("bride_name")} />
            )}
          </Field>
          <Field label="Famille de la mariée" error={errors.bride_family?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} placeholder="Koné" aria-invalid={invalid} aria-describedby={describedBy} {...register("bride_family")} />
            )}
          </Field>
          <Field label="Prénom du marié" error={errors.groom_name?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} placeholder="Yassine" aria-invalid={invalid} aria-describedby={describedBy} {...register("groom_name")} />
            )}
          </Field>
          <Field label="Famille du marié" error={errors.groom_family?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} placeholder="Diallo" aria-invalid={invalid} aria-describedby={describedBy} {...register("groom_family")} />
            )}
          </Field>
        </div>
      </section>

      {/* ── Le message des familles ────────────────────────── */}
      <Block index="—" title="Le message des familles" hint="Composé à partir des deux noms. Vous pouvez le réécrire.">
        {suggestion && (
          <p className="mb-6 border-l-2 border-gold bg-champagne-soft/40 px-5 py-4 font-script text-[1.0625rem] italic leading-relaxed text-brown">
            {suggestion}
          </p>
        )}
        <Field
          label="Votre propre formulation"
          optional
          hint="Laissez vide pour garder la phrase ci-dessus."
          error={errors.description?.message}
        >
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} rows={3} aria-invalid={invalid} aria-describedby={describedBy} {...register("description")} />
          )}
        </Field>
      </Block>

      {/* ── Les cérémonies ─────────────────────────────────── */}
      {plan.required.map((kind, index) => (
        <Block
          key={kind}
          index={String(index + 1).padStart(2, "0")}
          title={EVENT_LABELS[kind].title}
          hint={wordingFor(weddingType ?? "chretien", kind).hint}
        >
          <EventFields name={kind} register={register} errors={errors} placeholder={wordingFor(weddingType ?? "chretien", kind)} />
        </Block>
      ))}

      {plan.optional.map((kind) => {
        const flag = kind === "civil" ? "hasCivil" : "hasCoutumier";
        const shown = kind === "civil" ? hasCivil : hasCoutumier;
        return (
          <section key={kind} className="border-t border-line pt-9">
            <Checkbox label={`Nous avons aussi un ${EVENT_LABELS[kind].title.toLowerCase()}`} {...register(flag)} />

            <AnimatePresence initial={false}>
              {shown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-9">
                    <p className="mb-8 text-sm font-light leading-relaxed text-ink-soft">
                      Indiquez sa date et son heure : l’invitation replacera automatiquement cette
                      cérémonie au bon endroit dans le déroulé.
                    </p>
                    <EventFields name={kind} register={register} errors={errors} placeholder={wordingFor(weddingType ?? "chretien", kind)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}

      {/* ── L’histoire ─────────────────────────────────────── */}
      <Block index="—" title="Votre histoire" hint="Facultative. Laissez une ligne vide entre deux paragraphes.">
        <Field label="Comment vous vous êtes rencontrés" optional error={errors.story?.message}>
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              rows={7}
              placeholder="Nous nous sommes croisés un mardi de juillet…"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register("story")}
            />
          )}
        </Field>
      </Block>
    </form>
  );
});
