const RESERVED = new Set(["admin", "api", "dashboard", "login", "register", "mariage", "anniversaire", "new", "settings"]);

/** "Aïcha & Yassine" -> "aicha-et-yassine" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function buildCoupleSlug(groom: string, bride: string): string {
  const base = slugify(`${groom} et ${bride}`);
  return base || "notre-mariage";
}

/** "Adrian", 7 -> "adrian-7-ans" */
export function buildBirthdaySlug(name: string, age?: number | null): string {
  const base = slugify(age != null ? `${name} ${age} ans` : name);
  return base || "mon-anniversaire";
}

/** Gestion des collisions : -2, -3, … puis suffixe aléatoire. */
export function resolveSlugCollision(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const safe = RESERVED.has(base) ? `${base}-mariage` : base;
  if (!used.has(safe)) return safe;
  for (let i = 2; i <= 40; i++) {
    const candidate = `${safe}-${i}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${safe}-${Math.random().toString(36).slice(2, 6)}`;
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 3 && value.length <= 64;
}
