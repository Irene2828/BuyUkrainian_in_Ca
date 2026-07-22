export type BrandedMapPinVariant = "default" | "hover" | "selected" | "cluster";

interface BrandedMapPinOptions {
  variant: BrandedMapPinVariant;
  count?: number;
  dimmed?: boolean;
  hovered?: boolean;
}

interface BrandedMapPinSize {
  width: number;
  height: number;
}

const PIN_BLUE = "#0057B7";
const PIN_YELLOW = "#FFD700";
const WHITE = "#FFFFFF";

// Standard canvas size is 42x42 to allow elegant shadows and hover liftoff space
const PIN_SIZES: Record<BrandedMapPinVariant, BrandedMapPinSize> = {
  default: { width: 42, height: 42 },
  hover: { width: 42, height: 42 },
  selected: { width: 42, height: 42 },
  cluster: { width: 42, height: 42 },
};

export const getBrandedMapPinSize = (variant: BrandedMapPinVariant) => PIN_SIZES[variant];

export function getBrandedMapPinSvg({ variant, count = 0, dimmed = false, hovered = false }: BrandedMapPinOptions) {
  const opacity = dimmed ? 0.45 : 1;
  const isHover = variant === "hover" || hovered;
  const isSelected = variant === "selected";
  const isCluster = variant === "cluster";
  
  // Center of canvas is 21. Standard anchor tip is 32.
  // Hover lift state shifts the pin up by exactly 2px (tip becomes 30, center becomes 12)
  const pinYOffset = isHover ? -2 : 0;
  
  const startY = 4.5 + pinYOffset;
  const tangentY = 19 + pinYOffset;
  const tipY = 32 + pinYOffset;
  const centerY = 14 + pinYOffset;
  
  // Classic map pin path: rounded top head (radius 9.5) tapering into a sharp coordinate pointer
  const pinPath = `M 21 ${startY} A 9.5 9.5 0 0 1 29.08 ${tangentY} L 21 ${tipY} L 12.92 ${tangentY} A 9.5 9.5 0 0 1 21 ${startY} Z`;

  // Dynamic colors & shadows based on selection
  const pinBg = isSelected ? PIN_BLUE : PIN_YELLOW;
  const strokeColor = WHITE;
  const strokeWidth = isHover ? (isCluster ? 2.5 : 2.25) : (isCluster ? 2 : 1.75);
  const shadowFilter = isHover ? "hover-shadow" : "premium-shadow";
  const hoverTransform = isHover ? `transform="translate(21 32) scale(1.1) translate(-21 -32)"` : "";
  
  let innerCore = "";
  
  if (isCluster) {
    const countLabel = count > 99 ? "99+" : String(count);
    innerCore = `
      <!-- Upright Cluster Count Typography -->
      <text 
        x="21" 
        y="${centerY + 0.5}" 
        dominant-baseline="central" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="9.5" 
        font-weight="700" 
        fill="${PIN_BLUE}"
      >${countLabel}</text>`;
  } else if (isSelected) {
    // Selected marker: White Core dot inside Blue pin, slightly larger core
    innerCore = `
      <circle cx="21" cy="${centerY}" r="4" fill="${WHITE}" />`;
  } else {
    // Default marker: Blue Core dot inside Yellow default pin
    innerCore = `
      <circle cx="21" cy="${centerY}" r="3" fill="${PIN_BLUE}" />`;
  }

  return `
<svg width="42" height="42" viewBox="0 0 42 42" fill="none" opacity="${opacity}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <defs>
    <!-- Soft, organic ambient shadows below the pin base for visual depth -->
    <filter id="premium-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#000000" flood-opacity="0.12" />
    </filter>
    <filter id="hover-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="5.5" flood-color="#000000" flood-opacity="0.18" />
    </filter>
    
    <!-- Premium glowing halo to ground the pin seamlessly onto the map -->
    <radialGradient id="halo-glow-${variant}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${pinBg}" stop-opacity="0.45" />
      <stop offset="55%" stop-color="${pinBg}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${pinBg}" stop-opacity="0" />
    </radialGradient>
  </defs>
  
  <g ${hoverTransform}>
    <!-- Soft Halo Glow Circle -->
    <circle cx="21" cy="20" r="18" fill="url(#halo-glow-${variant})" />
    
    <!-- Classic Map Pin Silhouette with crisp White Stroke Outline -->
    <path
      d="${pinPath}"
      fill="${pinBg}"
      stroke="${strokeColor}"
      stroke-width="${strokeWidth}"
      filter="url(#${shadowFilter})"
    />

    <!-- Centered Inner Core (Text or Dot) -->
    ${innerCore}
  </g>
</svg>`.trim();
}
