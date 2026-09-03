import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";
import { isFutureDate } from "@/lib/utils/events";

const required = (label: string) => `${label} est obligatoire.`;

export const emailSchema = z
  .string()
  .min(1, required("L’adresse e-mail"))
  .email("Cette adresse e-mail n’est pas valide.");

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(72, "Le mot de passe est trop long.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, required("Le mot de passe")),
});

export const signUpSchema = z.object({
  firstName: z.string().min(2, required("Le prénom")).max(60),
  lastName: z.string().max(60).optional().or(z.literal("")),
  email: emailSchema,
  password: passwordSchema,
  /* L'acceptation est validée ici, pas seulement par l'attribut
     `required` du navigateur : celui-ci ne protège que le formulaire,
     pas l'action serveur qu'on peut appeler directement. */
  conditions: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions pour créer un compte." }),
  }),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirm"],
  });

export const weddingTypeSchema = z.enum(["chretien", "musulman"], {
  errorMap: () => ({ message: "Choisissez un type de cérémonie." }),
});

export const invitationInfoSchema = z.object({
  groom_name: z.string().min(2, required("Le prénom du marié")).max(40),
  bride_name: z.string().min(2, required("Le prénom de la mariée")).max(40),
  wedding_date: z.string().min(1, required("La date")),
  wedding_time: z.string().optional().or(z.literal("")),
  venue: z.string().min(2, required("Le lieu")).max(120),
  address: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(400, "400 caractères maximum.").optional().or(z.literal("")),
  story: z.string().max(1200, "1 200 caractères maximum.").optional().or(z.literal("")),
});

export const slugSchema = z
  .string()
  .refine(isValidSlug, "Le lien ne peut contenir que des lettres minuscules, des chiffres et des tirets.");

export const profileSchema = z.object({
  first_name: z.string().min(2, required("Le prénom")).max(60),
  last_name: z.string().max(60).optional().or(z.literal("")),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type InvitationInfoValues = z.infer<typeof invitationInfoSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;

/* ═══════════════════════════════════════════════════════════════
   MARIAGE MUSULMAN
   Deux familles, deux portraits, trois cérémonies. Le civil est
   facultatif : il n’est validé que si le couple l’a déplié.
   ═══════════════════════════════════════════════════════════════ */

const futureDate = z
  .string()
  .min(1, required("La date"))
  .refine(isFutureDate, "Cette date est déjà passée. Choisissez une date à venir.");

export const weddingEventSchema = z.object({
  date: futureDate,
  time: z.string().min(1, required("L’heure")),
  venue: z.string().min(2, required("Le lieu")).max(120),
  address: z.string().max(200).optional().or(z.literal("")),
});

const emptyEvent = z.object({
  date: z.string().optional().or(z.literal("")),
  time: z.string().optional().or(z.literal("")),
  venue: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const ceremonyInfoSchema = z
  .object({
    weddingType: z.enum(["chretien", "musulman"]),
    bride_name: z.string().min(2, required("Le prénom de la mariée")).max(40),
    groom_name: z.string().min(2, required("Le prénom du marié")).max(40),
    bride_family: z.string().min(2, required("La famille de la mariée")).max(60),
    groom_family: z.string().min(2, required("La famille du marié")).max(60),
    description: z.string().max(400, "400 caractères maximum.").optional().or(z.literal("")),
    story: z.string().max(1200, "1 200 caractères maximum.").optional().or(z.literal("")),

    religieux: emptyEvent,
    walima: emptyEvent,
    civil: emptyEvent,
    coutumier: emptyEvent,

    hasCivil: z.boolean(),
    hasCoutumier: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const plan = values.weddingType === "musulman"
      ? { required: ["religieux", "walima"], optional: [] as string[] }
      : { required: ["religieux"], optional: [] as string[] };

    if (values.hasCivil) plan.optional.push("civil");
    if (values.weddingType === "chretien" && values.hasCoutumier) plan.optional.push("coutumier");

    [...plan.required, ...plan.optional].forEach((key) => {
      const result = weddingEventSchema.safeParse(values[key as keyof typeof values]);
      if (result.success) return;
      result.error.issues.forEach((issue) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message, path: [key, ...issue.path] }),
      );
    });
  });

export type WeddingEventValues = z.infer<typeof weddingEventSchema>;
export type CeremonyInfoValues = z.infer<typeof ceremonyInfoSchema>;

/* ═══════════════════════════════════════════════════════════════
   ANNIVERSAIRE
   Un prénom, un âge, une date. Pas de confession, pas de familles,
   pas de cérémonies — mais un album qui remonte les années.
   ═══════════════════════════════════════════════════════════════ */

export const albumEntrySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2200),
  age: z.coerce.number().int().min(0, "L’âge ne peut pas être négatif.").max(120),
  /* Une année vide vaut null, pas undefined : le squelette de
     l'album pré-remplit toutes les lignes avant qu'on les touche. */
  url: z.string().nullable().optional(),
  caption: z.string().max(60, "60 caractères maximum.").nullable().optional(),
});

export const albumSchema = z.array(albumEntrySchema).max(30, "Trente années au maximum.");

export const birthdayInfoSchema = z.object({
  celebrant_name: z.string().min(2, required("Le prénom")).max(40),
  /* Les bornes fines dependent de la tranche choisie ; elles sont
     verifiees dans le parcours, qui la connait. */
  celebrant_age: z.coerce
    .number({ invalid_type_error: required("L’âge") })
    .int("L’âge doit être un nombre entier.")
    .min(1, "L’âge doit être d’au moins 1 an.")
    .max(120, "Cet âge n’est pas plausible."),
  party_date: futureDate,
  party_time: z.string().min(1, required("L’heure")),
  venue: z.string().min(2, required("Le lieu")).max(120),
  address: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(400, "400 caractères maximum.").optional().or(z.literal("")),
  story: z.string().max(1200, "1 200 caractères maximum.").optional().or(z.literal("")),
});

export type AlbumEntryValues = z.infer<typeof albumEntrySchema>;
export type BirthdayInfoValues = z.infer<typeof birthdayInfoSchema>;

/** Le programme de la journée : une heure, un intitulé, une note. */
export const programEntrySchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format attendu : 15:00."),
  title: z.string().min(2, required("L’intitulé")).max(60, "60 caractères maximum."),
  note: z.string().max(120, "120 caractères maximum.").optional().or(z.literal("")),
});

export const programSchema = z.array(programEntrySchema).max(12, "Douze moments au maximum.");

export type ProgramEntryValues = z.infer<typeof programEntrySchema>;
