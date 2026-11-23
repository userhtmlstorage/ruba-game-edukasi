/**
 * Konfigurasi deteksi ukuran layar HP / Tablet / Desktop & penskalaan adaptif RuBa.
 * Nilai `rootFontSizePx` mengatur skala dasar `rem` seluruh antarmuka agar ukuran tombol,
 * teks, dan kartu tidak terlihat terlalu besar di layar HP (WebView / Browser Mobile).
 */

export type DeviceTier = 'phone-sm' | 'phone' | 'tablet' | 'desktop';
export type ScreenOrientation = 'landscape' | 'portrait';

export interface ViewportMetrics {
  width: number;
  height: number;
  shortSide: number;
  longSide: number;
  devicePixelRatio: number;
  orientation: ScreenOrientation;
  deviceTier: DeviceTier;
  isPhone: boolean;
  isTablet: boolean;
  isCompactHeight: boolean;
  rootFontSizePx: number;
  uiScale: number;
}

export const VIEWPORT_SCALING_CONFIG = {
  /** Batas sisi terpendek (px) untuk dikategorikan sebagai layar HP */
  phoneMaxShortSidePx: 540,
  /** Batas sisi terpendek (px) untuk HP layar kecil */
  smallPhoneMaxShortSidePx: 365,
  /** Ukuran font dasar minimum pada HP sangat kecil (px) */
  minPhoneRootFontPx: 11.75,
  /** Ukuran font dasar maksimum pada HP besar (px) */
  maxPhoneRootFontPx: 13.75,
  /** Ukuran font dasar pada Tablet (px) */
  tabletRootFontPx: 14.75,
  /** Ukuran font dasar standar pada Desktop (px) */
  desktopRootFontPx: 16,
} as const;

function clampNumber(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function computeViewportMetrics(
  rawWidth: number,
  rawHeight: number,
  dpr = 1
): ViewportMetrics {
  const width = Math.max(240, Math.round(rawWidth));
  const height = Math.max(240, Math.round(rawHeight));
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const orientation: ScreenOrientation = width >= height ? 'landscape' : 'portrait';
  const isCompactHeight = height <= 430;

  let deviceTier: DeviceTier = 'desktop';
  let rootFontSizePx: number = VIEWPORT_SCALING_CONFIG.desktopRootFontPx;

  if (shortSide <= VIEWPORT_SCALING_CONFIG.phoneMaxShortSidePx) {
    deviceTier =
      shortSide <= VIEWPORT_SCALING_CONFIG.smallPhoneMaxShortSidePx ? 'phone-sm' : 'phone';

    // Interpolasi halus antara 320px -> 540px agar pas di setiap model HP
    const ratio = clampNumber((shortSide - 320) / (540 - 320), 0, 1);
    rootFontSizePx =
      VIEWPORT_SCALING_CONFIG.minPhoneRootFontPx +
      ratio *
        (VIEWPORT_SCALING_CONFIG.maxPhoneRootFontPx -
          VIEWPORT_SCALING_CONFIG.minPhoneRootFontPx);

    // Tambahan penyesuaian jika layar landscape sangat pendek (misal <= 360px)
    if (orientation === 'landscape' && height <= 365) {
      rootFontSizePx = Math.min(rootFontSizePx, 12.25);
    }
  } else if (shortSide < 700 || longSide < 1180) {
    deviceTier = 'tablet';
    const ratio = clampNumber((shortSide - 540) / (768 - 540), 0, 1);
    rootFontSizePx = 14 + ratio * (VIEWPORT_SCALING_CONFIG.tabletRootFontPx - 14);
  } else {
    deviceTier = 'desktop';
    rootFontSizePx = VIEWPORT_SCALING_CONFIG.desktopRootFontPx;
  }

  rootFontSizePx = Number(rootFontSizePx.toFixed(2));
  const uiScale = Number((rootFontSizePx / 16).toFixed(3));

  return {
    width,
    height,
    shortSide,
    longSide,
    devicePixelRatio: dpr,
    orientation,
    deviceTier,
    isPhone: deviceTier === 'phone-sm' || deviceTier === 'phone',
    isTablet: deviceTier === 'tablet',
    isCompactHeight,
    rootFontSizePx,
    uiScale,
  };
}
