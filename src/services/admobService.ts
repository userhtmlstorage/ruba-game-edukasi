import {
  AdPlatform,
  CHILD_SAFE_AD_POLICY,
  getActiveAdMobConfig,
} from '../config/admobConfig';

/**
 * Antarmuka Bridge untuk pembungkus mobile:
 * 1. Capacitor (@capacitor-community/admob) -> window.Capacitor.Plugins.AdMob
 * 2. Custom WebView Android/iOS (@JavascriptInterface) -> window.RuBaAdMobBridge
 */
interface CapacitorAdMobPlugin {
  initialize: (options: Record<string, unknown>) => Promise<void>;
  setRequestConfiguration?: (options: Record<string, unknown>) => Promise<void>;
  showBanner: (options: Record<string, unknown>) => Promise<void>;
  hideBanner: () => Promise<void>;
  removeBanner?: () => Promise<void>;
  prepareInterstitial: (options: Record<string, unknown>) => Promise<void>;
  showInterstitial: () => Promise<void>;
}

interface NativeWebViewAdBridge {
  initialize?: (configJson: string) => void;
  showBanner?: (adUnitId: string, npaOnly: boolean) => void;
  hideBanner?: () => void;
  showInterstitial?: (adUnitId: string, npaOnly: boolean) => void;
}

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      Plugins?: {
        AdMob?: CapacitorAdMobPlugin;
      };
    };
    RuBaAdMobBridge?: NativeWebViewAdBridge;
  }
}

export type AdPlacementContext = 'TITLE' | 'HUB' | 'MODULE' | 'MODAL';

class RuBaAdMobService {
  private initialized = false;
  private bannerVisible = false;
  private lastInterstitialAt = 0;
  private completedSessionsCount = 0;
  private testInterstitialListener: ((visible: boolean) => void) | null = null;

  public detectPlatform(): AdPlatform {
    if (typeof window === 'undefined') return 'web';
    const capPlatform = window.Capacitor?.getPlatform?.();
    if (capPlatform === 'ios') return 'ios';
    if (capPlatform === 'android') return 'android';
    if (window.RuBaAdMobBridge) return 'android';
    return 'web';
  }

  public isNativeWrapper(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.Capacitor?.isNativePlatform?.() ||
        window.Capacitor?.Plugins?.AdMob ||
        window.RuBaAdMobBridge
    );
  }

  private getCapacitorPlugin(): CapacitorAdMobPlugin | null {
    return window.Capacitor?.Plugins?.AdMob ?? null;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const platform = this.detectPlatform();
    const config = getActiveAdMobConfig(platform);

    const capAdMob = this.getCapacitorPlugin();
    if (capAdMob) {
      try {
        await capAdMob.initialize({
          initializeForTesting: config.testMode,
          tagForChildDirectedTreatment: config.policy.tagForChildDirectedTreatment,
          tagForUnderAgeOfConsent: config.policy.tagForUnderAgeOfConsent,
          maxAdContentRating: config.policy.maxAdContentRating,
        });
        if (capAdMob.setRequestConfiguration) {
          await capAdMob.setRequestConfiguration({
            maxAdContentRating: config.policy.maxAdContentRating,
            tagForChildDirectedTreatment: config.policy.tagForChildDirectedTreatment,
            tagForUnderAgeOfConsent: config.policy.tagForUnderAgeOfConsent,
          });
        }
      } catch (err) {
        console.warn('[RuBa AdMob] Gagal inisialisasi Capacitor AdMob:', err);
      }
      return;
    }

    if (window.RuBaAdMobBridge?.initialize) {
      window.RuBaAdMobBridge.initialize(
        JSON.stringify({
          appId: config.appId,
          testMode: config.testMode,
          ...config.policy,
        })
      );
    }
  }

  /**
   * Penempatan Banner Ramah Anak:
   * - HANYA diizinkan pada halaman HUB ("Pintu Masuk") saat tidak ada modal terbuka.
   * - DILARANG keras muncul saat layar MODULE (soal pilihan ganda / gerak aktif)
   *   agar tidak bertumpuk atau berdekatan dengan kartu jawaban anak.
   */
  public async syncBannerForContext(context: AdPlacementContext): Promise<void> {
    await this.initialize();
    const shouldShow = context === 'HUB';

    if (shouldShow === this.bannerVisible) return;
    this.bannerVisible = shouldShow;

    const platform = this.detectPlatform();
    const config = getActiveAdMobConfig(platform);
    const capAdMob = this.getCapacitorPlugin();

    if (capAdMob) {
      try {
        if (shouldShow) {
          await capAdMob.showBanner({
            adId: config.bannerUnitId,
            adSize: 'ADAPTIVE_BANNER',
            position: 'BOTTOM_CENTER',
            margin: 0,
            isTesting: config.testMode,
            npa: config.policy.nonPersonalizedAdsOnly,
          });
        } else {
          await capAdMob.hideBanner();
        }
      } catch (err) {
        console.warn('[RuBa AdMob] Error banner:', err);
      }
      return;
    }

    if (window.RuBaAdMobBridge) {
      if (shouldShow) {
        window.RuBaAdMobBridge.showBanner?.(
          config.bannerUnitId,
          config.policy.nonPersonalizedAdsOnly
        );
      } else {
        window.RuBaAdMobBridge.hideBanner?.();
      }
    }
  }

  public subscribeTestInterstitial(listener: (visible: boolean) => void): () => void {
    this.testInterstitialListener = listener;
    return () => {
      if (this.testInterstitialListener === listener) {
        this.testInterstitialListener = null;
      }
    };
  }

  /**
   * Interstitial Ramah Anak:
   * - Hanya dipanggil setelah anak menyelesaikan satu modul penuh (transisi pulang ke Hub).
   * - Tidak pernah memotong saat anak sedang menjawab soal.
   * - Dilindungi cooldown 3 menit & minimal 2 modul selesai agar tidak mengganggu.
   */
  public async tryShowInterstitialAfterModule(): Promise<boolean> {
    await this.initialize();
    this.completedSessionsCount += 1;

    if (
      this.completedSessionsCount <
      CHILD_SAFE_AD_POLICY.minModulesCompletedBeforeInterstitial
    ) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastInterstitialAt < CHILD_SAFE_AD_POLICY.interstitialCooldownMs) {
      return false;
    }

    this.lastInterstitialAt = now;
    const platform = this.detectPlatform();
    const config = getActiveAdMobConfig(platform);
    const capAdMob = this.getCapacitorPlugin();

    if (capAdMob) {
      try {
        await capAdMob.prepareInterstitial({
          adId: config.interstitialUnitId,
          isTesting: config.testMode,
          npa: config.policy.nonPersonalizedAdsOnly,
        });
        await capAdMob.showInterstitial();
        return true;
      } catch (err) {
        console.warn('[RuBa AdMob] Gagal menampilkan interstitial:', err);
        return false;
      }
    }

    if (window.RuBaAdMobBridge?.showInterstitial) {
      window.RuBaAdMobBridge.showInterstitial(
        config.interstitialUnitId,
        config.policy.nonPersonalizedAdsOnly
      );
      return true;
    }

    // Di browser web dalam TEST_MODE: tampilkan pratinjau interstitial aman yang jelas
    if (config.testMode && this.testInterstitialListener) {
      this.testInterstitialListener(true);
      return true;
    }

    return false;
  }
}

export const admobService = new RuBaAdMobService();
