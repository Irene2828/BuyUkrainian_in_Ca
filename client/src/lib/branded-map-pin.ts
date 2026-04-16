export type BrandedMapPinVariant = "default" | "hover" | "selected" | "cluster";

interface BrandedMapPinOptions {
  variant: BrandedMapPinVariant;
  count?: number;
  dimmed?: boolean;
}

interface BrandedMapPinSize {
  width: number;
  height: number;
}

const PIN_PATH =
  "M22 3.5 C12.4 3.5 5 10.9 5 20.5 C5 26.8 8.1 32.3 12.2 37.7 L22 50 L31.8 37.7 C35.9 32.3 39 26.8 39 20.5 C39 10.9 31.6 3.5 22 3.5 Z";

const OUTLINE_BLUE = "#0057B7";
const RING_YELLOW = "#FFD700";
const BADGE_TEXT_BLUE = "#0057B7";
const WHITE = "#FFFFFF";
const SHADOW_COLOR = "#334155";

const PIN_SIZES: Record<BrandedMapPinVariant, BrandedMapPinSize> = {
  default: { width: 30, height: 38 },
  hover: { width: 34, height: 43 },
  selected: { width: 32, height: 40 },
  cluster: { width: 34, height: 43 },
};

const getCountLabel = (count: number) => {
  if (count > 99) return "99+";
  return String(count);
};

const getCountFontSize = (label: string) => {
  if (label.length >= 3) return 6.6;
  if (label.length === 2) return 8;
  return 9;
};

export const getBrandedMapPinSize = (variant: BrandedMapPinVariant) => PIN_SIZES[variant];

export function getBrandedMapPinSvg({ variant, count = 0, dimmed = false }: BrandedMapPinOptions) {
  const opacity = dimmed ? 0.4 : 1;
  const isHover = variant === "hover";
  const isSelected = variant === "selected";
  const isCluster = variant === "cluster";
  const countLabel = getCountLabel(count);
  const countFontSize = getCountFontSize(countLabel);
  const shadowOpacity = isHover ? 0.18 : isSelected ? 0.15 : isCluster ? 0.16 : 0.14;
  const shadowRx = isHover ? 7.6 : isSelected ? 7.1 : isCluster ? 7.2 : 6.8;
  const shadowRy = isHover ? 2.5 : isSelected ? 2.35 : 2.3;

  const activeGlow = isHover
    ? `
  <path d="${PIN_PATH}" fill="none" stroke="${RING_YELLOW}" stroke-opacity="0.22" stroke-width="5.8" stroke-linejoin="round" filter="url(#pinGlowBlur)" />
  <circle cx="21.3" cy="18.9" r="9.4" fill="none" stroke="${RING_YELLOW}" stroke-opacity="0.16" stroke-width="2.4" filter="url(#pinGlowBlur)" />`
    : "";

  const activeHalo = isHover
    ? `<path d="${PIN_PATH}" fill="none" stroke="${WHITE}" stroke-width="6.4" stroke-linejoin="round" />`
    : "";

  const selectedHalo = isSelected
    ? `<path d="${PIN_PATH}" fill="none" stroke="${WHITE}" stroke-opacity="0.92" stroke-width="4.4" stroke-linejoin="round" />`
    : "";

  const contactRing = isHover
    ? `<ellipse cx="22" cy="52.9" rx="4.6" ry="1.5" fill="none" stroke="${BADGE_TEXT_BLUE}" stroke-opacity="0.14" stroke-width="1.1" />`
    : "";

  const badge = isCluster
    ? `
  <circle cx="34.5" cy="11" r="7.5" fill="${WHITE}" stroke="${BADGE_TEXT_BLUE}" stroke-width="2" />
  <text x="34.5" y="11.3" dominant-baseline="central" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${countFontSize}" font-weight="700" fill="${BADGE_TEXT_BLUE}">${countLabel}</text>`
    : "";

  return `
<svg width="44" height="56" viewBox="0 0 44 56" fill="none" opacity="${opacity}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <defs>
    <filter id="pinShadowBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.25" />
    </filter>
    <filter id="pinGlowBlur" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="1.7" />
    </filter>
  </defs>
  <ellipse cx="22" cy="52.9" rx="${shadowRx}" ry="${shadowRy}" fill="${SHADOW_COLOR}" fill-opacity="${shadowOpacity}" filter="url(#pinShadowBlur)" />
  ${contactRing}
  ${activeGlow}
  ${selectedHalo}
  ${activeHalo}
  <path
    d="${PIN_PATH}"
    fill="${WHITE}"
    stroke="${OUTLINE_BLUE}"
    stroke-width="${isHover ? 3.4 : isSelected ? 3.15 : 3}"
    stroke-linejoin="round"
  />
  <circle
    cx="21.3"
    cy="18.9"
    r="7.6"
    fill="${WHITE}"
    stroke="${RING_YELLOW}"
    stroke-width="${isHover ? 3.2 : isSelected ? 3.1 : 3}"
  />
  ${badge}
</svg>`;
}
