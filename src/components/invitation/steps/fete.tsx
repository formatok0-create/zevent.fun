"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { uploadImage, UploadError } from "@/lib/services/storage";
import { useToast } from "@/components/ui/toast";
import { buildAlbumSkeleton, defaultAlbumRange } from "@/lib/utils/birthday";
import { birthdayInfoSchema, type BirthdayInfoValues } from "@/lib/validation/schemas";
import type { AlbumEntry, ProgramEntry } from "@/types/database";
import { listTemplatesForProduct } from "@/templates/registry";
import type { TemplateAudience } from "@/templates/types";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════════
   LES DEUX ÉTAPES PROPRES À LA FÊTE
   Le mariage demande deux prénoms, deux familles et trois
   cérémonies. Un anniversaire demande un prénom, un âge, une
   adresse — puis les années qui ont précédé.
   ═══════════════════════════════════════════════════════════════ */

export interface BirthdayStepHandle {
  submit: () => Promise<BirthdayInfoValues | null>;
  values: () => BirthdayInfoValues;
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
          <h3 className="font-fete text-[1.6rem] font-bold leading-none">{title}</h3>
          <p className="mt-2 text-sm font-light text-ink-soft">{hint}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export const BirthdayDetailsStep = forwardRef<
  BirthdayStepHandle,
  {
    defaultValues: BirthdayInfoValues;
    /** Les bornes de la tranche : 11 – 14, 15 – 17, 18 et plus… */
    bounds: { min: number; max: number; range: string };
    onChange?: (values: BirthdayInfoValues) => void;
  }
>(function BirthdayDetailsStep({ defaultValues, bounds, onChange }, ref) {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<BirthdayInfoValues>({
    resolver: zodResolver(birthdayInfoSchema),
    defaultValues,
    mode: "onBlur",
  });

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (values) => {
            /* La tranche a ete choisie avant : on refuse un age qui
               n'y entre pas plutot que de proposer les mauvaises
               collections. */
            if (values.celebrant_age < bounds.min || values.celebrant_age > bounds.max) {
              setError("celebrant_age", {
                message: `Cette section couvre ${bounds.range}. Revenez au choix de la tranche pour un autre âge.`,
              });
              resolve(null);
              return;
            }
            onChange?.(values);
            resolve(values);
          },
          () => resolve(null),
        )();
      }),
    values: () => getValues(),
  }));

  return (
    <form className="space-y-12" onBlur={() => onChange?.(getValues())}>
      <Block index="01" title="Qui fête" hint="Le prénom et l’âge : c’est ce que verront vos invités en premier.">
        <div className="grid gap-8 sm:grid-cols-[1fr_10rem]">
          <Field label="Prénom" error={errors.celebrant_name?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="Adrian"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("celebrant_name")}
              />
            )}
          </Field>

          <Field label="Âge fêté" hint={bounds.range} error={errors.celebrant_age?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                min={bounds.min}
                max={bounds.max}
                inputMode="numeric"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("celebrant_age")}
              />
            )}
          </Field>
        </div>
      </Block>

      <Block index="02" title="Quand et où" hint="La date de la fête, pas celle de la naissance.">
        <div className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Date" error={errors.party_date?.message}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="date" aria-invalid={invalid} aria-describedby={describedBy} {...register("party_date")} />
              )}
            </Field>
            <Field label="Heure" error={errors.party_time?.message}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="time" aria-invalid={invalid} aria-describedby={describedBy} {...register("party_time")} />
              )}
            </Field>
          </div>

          <Field label="Lieu" error={errors.venue?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="Jardin de la Riviera"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("venue")}
              />
            )}
          </Field>

          <Field label="Adresse" optional error={errors.address?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="Cocody, Abidjan"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("address")}
              />
            )}
          </Field>
        </div>
      </Block>

      <Block index="03" title="Le mot d’accueil" hint="Une ligne en haut de l’invitation, et un mot plus long si vous voulez.">
        <div className="space-y-8">
          <Field label="Petite phrase d’entrée" optional error={errors.description?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="Vous êtes invité"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("description")}
              />
            )}
          </Field>

          <Field label="Le mot des parents" optional error={errors.story?.message}>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                rows={5}
                placeholder="Sept ans déjà. Venez souffler les bougies avec nous."
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("story")}
              />
            )}
          </Field>
        </div>
      </Block>
    </form>
  );
});

/* ── L’album des années ─────────────────────────────────────── */

export function AlbumStep({
  userId,
  age,
  partyDate,
  entries,
  onChange,
}: {
  userId: string;
  age: number;
  partyDate: string;
  entries: AlbumEntry[];
  onChange: (entries: AlbumEntry[]) => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<number | null>(null);

  /* La plage : à trente ans, personne ne cherche une photo de sa
     deuxième année. On propose les dix dernières, modifiables. */
  const suggested = defaultAlbumRange(age);
  const [range, setRange] = useState(() =>
    entries.length > 0
      ? { from: entries[0]!.age, to: entries[entries.length - 1]!.age }
      : suggested,
  );

  const generate = () =>
    onChange(buildAlbumSkeleton(range.from, range.to, age, partyDate, entries));

  const patch = (index: number, values: Partial<AlbumEntry>) =>
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...values } : entry)));

  const upload = async (index: number, file: File) => {
    setBusy(index);
    try {
      const { url } = await uploadImage(file, "album", userId);
      patch(index, { url });
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof UploadError ? error.message : "Réessayez dans un instant.",
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="border border-line bg-surface p-10 text-center sm:p-14">
        <p className="eyebrow text-gold">L’album des années</p>
        <h3 className="mt-6 font-fete text-[clamp(1.7rem,4.5vw,2.4rem)] font-bold leading-tight tracking-[-0.02em]">
          Une photo par année,
          <br />
          <span className="italic">jusqu’à aujourd’hui.</span>
        </h3>
        <p className="mx-auto mt-6 max-w-md text-sm font-light leading-[1.85] text-ink-soft">
          Vos invités feront glisser le rail d’une année à l’autre. Choisissez la plage
          que vous voulez couvrir — seules les années où vous mettez une photo
          apparaîtront sur l’invitation.
        </p>

        <RangePicker age={age} range={range} onChange={setRange} />

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button voice="fete" type="button" onClick={generate}>
            Préparer {range.to - range.from + 1}{" "}
            {range.to - range.from + 1 <= 1 ? "année" : "années"}
          </Button>
          <span className="eyebrow-sm text-ink-faint">Cette étape est facultative</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
        <p className="text-sm font-light text-ink-soft">
          {entries.length} {entries.length <= 1 ? "année" : "années"}, de {entries[0]?.year} à{" "}
          {entries[entries.length - 1]?.year}.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <RangePicker age={age} range={range} onChange={setRange} compact />
          <Button voice="fete" variant="flamme" size="sm" type="button" onClick={generate}>
            Appliquer la plage
          </Button>
          <Button voice="fete" variant="danger" size="sm" type="button" onClick={() => onChange([])}>
            Tout retirer
          </Button>
        </div>
      </div>

      <ul className="space-y-4">
        {entries.map((entry, index) => (
          <li
            key={`${entry.year}-${entry.age}`}
            className="grid items-center gap-5 border-t border-line py-5 sm:grid-cols-[5.5rem_7rem_1fr_auto]"
          >
            <div>
              <p className="numeral text-lg leading-none text-ink">{entry.year}</p>
              <p className="eyebrow-sm mt-1.5 text-ink-faint">
                {entry.age} {entry.age <= 1 ? "an" : "ans"}
              </p>
            </div>

            <label
              className={cn(
                "relative grid aspect-[3/4] w-full max-w-[5.25rem] cursor-pointer place-items-center overflow-hidden rounded-md border border-line-strong bg-ivory-deep transition-colors hover:border-gold",
                busy === index && "opacity-50",
              )}
            >
              {entry.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={entry.url} alt="" className="size-full object-cover" />
              ) : (
                <span className="rounded-full bg-flamme px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-nuit-fete">
                  Ajouter
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(index, file);
                  event.target.value = "";
                }}
              />
            </label>

            <input
              type="text"
              value={entry.caption ?? ""}
              maxLength={60}
              placeholder="Une légende — « le vélo », « la plage »"
              onChange={(event) => patch(index, { caption: event.target.value })}
              className="w-full border-b border-line bg-transparent pb-2 text-sm font-light text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold"
            />

            {entry.url && (
              <Button
                voice="fete"
                variant="outline"
                size="sm"
                type="button"
                onClick={() => patch(index, { url: null })}
                className="justify-self-start"
              >
                Retirer
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Le choix de la collection ──────────────────────────────── */

export function BirthdayTemplateStep({
  value,
  audience,
  onChange,
}: {
  value: string;
  audience?: TemplateAudience;
  onChange: (id: string) => void;
}) {
  const templates = listTemplatesForProduct("anniversaire", audience);

  return (
    <fieldset>
      <legend className="sr-only">Collection</legend>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
        {templates.map((template) => {
          const selected = value === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              aria-pressed={selected}
              className="group text-left"
            >
              <div
                className={cn(
                  "quatrefoil relative grid aspect-square w-full place-items-center transition-transform duration-700 ease-silk",
                  selected ? "scale-[1.02]" : "group-hover:scale-[1.02]",
                )}
                style={{
                  background: `linear-gradient(158deg, ${template.preview.from}, ${template.preview.to})`,
                }}
              >
                <span
                  className="text-[clamp(1.6rem,5vw,2.4rem)] font-semibold leading-none"
                  style={{ color: template.preview.accent }}
                >
                  {selected ? "✓" : "7"}
                </span>
              </div>

              <div className={cn("mt-4 border-t pt-3", selected ? "border-gold" : "border-line")}>
                <h3 className={cn("font-fete text-[1.25rem] font-bold leading-tight", selected && "text-burgundy")}>
                  {template.name}
                </h3>
                <p className="eyebrow-sm mt-1.5 text-ink-faint">{template.ageRange}</p>
              </div>
              <p className="mt-2.5 text-xs font-light leading-relaxed text-ink-soft">{template.tagline}</p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}


/** De quel âge à quel âge. Les champs restent libres pendant la
 *  saisie — on ne borne qu'à la sortie, sinon impossible d'effacer
 *  le « 1 » pour taper « 9 ». */
function RangePicker({
  age,
  range,
  onChange,
  compact,
}: {
  age: number;
  range: { from: number; to: number };
  onChange: (range: { from: number; to: number }) => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState({ from: String(range.from), to: String(range.to) });

  useEffect(() => {
    setDraft({ from: String(range.from), to: String(range.to) });
  }, [range.from, range.to]);

  const commit = (key: "from" | "to", raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    const value = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 1), Math.max(age, 1))
      : range[key];
    setDraft((d) => ({ ...d, [key]: String(value) }));
    onChange({ ...range, [key]: value });
  };

  const field = (key: "from" | "to") => (
    <input
      type="text"
      inputMode="numeric"
      value={draft[key]}
      onChange={(event) => setDraft((d) => ({ ...d, [key]: event.target.value.replace(/\D/g, "") }))}
      onBlur={(event) => commit(key, event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") (event.target as HTMLInputElement).blur();
      }}
      className="w-14 border-b border-line bg-transparent pb-1 text-center text-sm text-ink outline-none transition-colors focus:border-flamme"
    />
  );

  return (
    <div className={cn("flex items-center gap-3", compact ? "text-ink-soft" : "mt-8 justify-center")}>
      <span className="eyebrow-sm text-ink-faint">De</span>
      {field("from")}
      <span className="eyebrow-sm text-ink-faint">à</span>
      {field("to")}
      <span className="eyebrow-sm text-ink-faint">ans</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LE PROGRAMME DE LA JOURNÉE
   Une heure, un intitulé, une note. Rien de plus : c'est un fil
   d'attente, pas un ordre du jour d'entreprise. Sans ligne, la
   section disparaît de l'invitation.
   ═══════════════════════════════════════════════════════════════ */

const MOMENTS_TYPES = [
  { time: "15:00", title: "Accueil", note: "" },
  { time: "16:30", title: "Le gâteau", note: "" },
  { time: "18:00", title: "Départ", note: "" },
];

export function ProgramStep({
  entries,
  onChange,
}: {
  entries: ProgramEntry[];
  onChange: (entries: ProgramEntry[]) => void;
}) {
  const patch = (index: number, values: Partial<ProgramEntry>) =>
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...values } : entry)));

  const add = () =>
    onChange([...entries, { time: "20:00", title: "", note: "" }]);

  const remove = (index: number) => onChange(entries.filter((_, i) => i !== index));

  if (entries.length === 0) {
    return (
      <div className="border border-line bg-surface p-10 text-center sm:p-14">
        <p className="eyebrow text-flamme">Le déroulé</p>
        <h3 className="mt-6 font-fete text-[clamp(1.7rem,4.5vw,2.4rem)] font-bold leading-tight tracking-[-0.02em]">
          À quelle heure,
          <br />
          quoi ?
        </h3>
        <p className="mx-auto mt-6 max-w-md text-sm font-light leading-[1.85] text-ink-soft">
          L’accueil, le gâteau, l’heure de fin. Vos invités saurent quand arriver et
          quand repartir. Les moments sont classés par heure automatiquement.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button voice="fete" variant="flamme" type="button" onClick={() => onChange(MOMENTS_TYPES)}>
            Partir d’un déroulé type
          </Button>
          <Button voice="fete" variant="outline" type="button" onClick={add}>
            Ajouter un moment
          </Button>
        </div>
        <p className="eyebrow-sm mt-6 text-ink-faint">Cette étape est facultative</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
        <p className="text-sm font-light text-ink-soft">
          {entries.length} {entries.length <= 1 ? "moment" : "moments"}. L’ordre d’affichage
          suit les heures, pas la saisie.
        </p>
        <Button voice="fete" variant="danger" size="sm" type="button" onClick={() => onChange([])}>
          Tout retirer
        </Button>
      </div>

      <ul className="space-y-4">
        {entries.map((entry, index) => (
          <li
            key={index}
            className="grid items-center gap-4 border-t border-line py-5 sm:grid-cols-[6rem_1fr_1fr_auto]"
          >
            <input
              type="time"
              value={entry.time}
              onChange={(event) => patch(index, { time: event.target.value })}
              className="w-full border-b border-line bg-transparent pb-2 text-sm text-ink outline-none transition-colors focus:border-flamme"
            />
            <input
              type="text"
              value={entry.title}
              maxLength={60}
              placeholder="Accueil, gâteau, départ…"
              onChange={(event) => patch(index, { title: event.target.value })}
              className="w-full border-b border-line bg-transparent pb-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-flamme"
            />
            <input
              type="text"
              value={entry.note ?? ""}
              maxLength={120}
              placeholder="Une précision, si besoin"
              onChange={(event) => patch(index, { note: event.target.value })}
              className="w-full border-b border-line bg-transparent pb-2 text-sm font-light text-ink-soft outline-none transition-colors placeholder:text-ink-faint focus:border-flamme"
            />
            <Button
              voice="fete"
              variant="outline"
              size="sm"
              type="button"
              onClick={() => remove(index)}
              className="justify-self-start"
            >
              Retirer
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button voice="fete" variant="flamme" size="sm" type="button" onClick={add}>
          Ajouter un moment
        </Button>
      </div>
    </div>
  );
}
