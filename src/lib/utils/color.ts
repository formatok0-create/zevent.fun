/** #1A1A1C -> rgba(26, 26, 28, 0.72). Sert au voile pose entre
 *  l'image d'en-tete et le carton : sans lui, le texte disparait sur
 *  les images claires. */
export function rgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Une couleur claire demande un voile plus dense qu'une couleur
 *  sombre : on mesure la luminance perçue plutot que de fixer une
 *  valeur au hasard. */
export function luminance(hex: string): number {
  const clean = hex.replace("#", "").padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(clean, 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
