import React, { createContext, useContext, useEffect, useState } from 'react';
import { computeViewportMetrics, ViewportMetrics } from '../config/viewportConfig';

function readLiveViewport(): ViewportMetrics {
  if (typeof window === 'undefined') {
    return computeViewportMetrics(1280, 720, 1);
  }
  const vv = window.visualViewport;
  const width = vv ? vv.width : window.innerWidth;
  const height = vv ? vv.height : window.innerHeight;
  return computeViewportMetrics(width, height, window.devicePixelRatio || 1);
}

function applyViewportCssVars(metrics: ViewportMetrics) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.fontSize = `${metrics.rootFontSizePx}px`;
  root.style.setProperty('--ruba-ui-scale', String(metrics.uiScale));
  root.style.setProperty('--ruba-vw', `${metrics.width}px`);
  root.style.setProperty('--ruba-vh', `${metrics.height}px`);
  root.dataset.deviceTier = metrics.deviceTier;
  root.dataset.orientation = metrics.orientation;
}

const ViewportContext = createContext<ViewportMetrics>(computeViewportMetrics(1280, 720, 1));

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<ViewportMetrics>(() => {
    const initial = readLiveViewport();
    applyViewportCssVars(initial);
    return initial;
  });

  useEffect(() => {
    let rafId: number | null = null;

    const sync = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const next = readLiveViewport();
        applyViewportCssVars(next);
        setMetrics((prev) =>
          prev.width === next.width &&
          prev.height === next.height &&
          prev.rootFontSizePx === next.rootFontSizePx
            ? prev
            : next
        );
      });
    };

    sync();
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    window.visualViewport?.addEventListener('resize', sync, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.visualViewport?.removeEventListener('resize', sync);
    };
  }, []);

  return <ViewportContext.Provider value={metrics}>{children}</ViewportContext.Provider>;
};

export function useViewportSize(): ViewportMetrics {
  return useContext(ViewportContext);
}
