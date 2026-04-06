export type BrandedMapPinVariant = "default" | "active" | "cluster";

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
  active: { width: 34, height: 43 },
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
  const isActive = variant === "active";
  const isCluster = variant === "cluster";
  const countLabel = getCountLabel(count);
  const countFontSize = getCountFontSize(countLabel);
  const shadowOpacity = isActive ? 0.18 : isCluster ? 0.16 : 0.14;
  const shadowRx = isActive ? 7.6 : isCluster ? 7.2 : 6.8;
  const shadowRy = isActive ? 2.5 : 2.3;

  const activeHalo = isActive
    ? `<path d="${PIN_PATH}" fill="none" stroke="${WHITE}" stroke-width="6.4" stroke-linejoin="round" />`
    : "";

  const contactRing = isActive
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
  </defs>
  <ellipse cx="22" cy="52.9" rx="${shadowRx}" ry="${shadowRy}" fill="${SHADOW_COLOR}" fill-opacity="${shadowOpacity}" filter="url(#pinShadowBlur)" />
  ${contactRing}
  ${activeHalo}
  <path
    d="${PIN_PATH}"
    fill="${WHITE}"
    stroke="${OUTLINE_BLUE}"
    stroke-width="${isActive ? 3.4 : 3}"
    stroke-linejoin="round"
  />
  <circle
    cx="21.3"
    cy="18.9"
    r="7.6"
    fill="${WHITE}"
    stroke="${RING_YELLOW}"
    stroke-width="${isActive ? 3.2 : 3}"
  />
  ${badge}
</svg>`;
}
