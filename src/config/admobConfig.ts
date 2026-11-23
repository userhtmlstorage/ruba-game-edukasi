/**
 * ============================================================================
 * KONFIGURASI GOOGLE ADMOB — RuBa (Ruang Belajar Anak Usia 3–6 Tahun)
 * ============================================================================
 *
 * File ini sengaja dipisahkan agar mudah diganti apabila akun Google AdMob
 * dikelola menggunakan email Google yang BERBEDA dari email pengembangan
 * atau akun Google Play Console / App Store.
 *
 * CARA MENGAMBIL NILAI DARI DASHBOARD ADMOB (EMAIL AKUN ADMOB TERKAIT):
 * 1. Login ke https://admob.google.com menggunakan email pemilik akun AdMob.
 * 2. Buka menu: Apps -> pilih aplikasi RuBa -> App settings -> salin "App ID"
 *    untuk mengisi `PRODUCTION_CREDENTIALS.appId`.
 * 3. Buka menu: Apps -> Ad units -> salin "Ad unit ID" untuk masing-masing
 *    unit iklan Banner dan Interstitial ke `PRODUCTION_CREDENTIALS.adUnits`.
 * 4. Catatan: Untuk build Android (AndroidManifest.xml) & iOS (Info.plist),
 *    masukkan juga `ADMOB_APP_ID` milik akun AdMob tersebut (lihat ADMOB_INTEGRATION.md).
 */

export type AdPlatform = 'android' | 'ios' | 'web';

export interface AdMobCredentials {
  appId: {
    android: string;
    ios: string;
  };
  adUnits: {
    banner: {
      android: string;
      ios: string;
    };
    interstitial: {
      android: string;
      ios: string;
    };
  };
}

/**
 * MODE PENGUJIAN (DEFAULT: TRUE)
 * ----------------------------------------------------------------------------
 * WAJIB dibiarkan `true` selama masa pengembangan, QA, dan pengujian internal!
 * Saat `TEST_MODE = true`, sistem otomatis memakai ID Uji Resmi dari Google
 * AdMob sehingga aman dan TIDAK memicu "invalid clicks / invalid traffic"
 * yang berisiko membekukan akun AdMob baru.
 *
 * Ubah ke `false` (atau set VITE_ADMOB_TEST_MODE="false") HANYA ketika aplikasi
 * siap dirilis ke toko aplikasi (Google Play / App Store).
 */
export const ADMOB_TEST_MODE: boolean =
  import.meta.env.VITE_ADMOB_TEST_MODE !== undefined
    ? import.meta.env.VITE_ADMOB_TEST_MODE !== 'false'
    : true;

/**
 * ID UJI RESMI GOOGLE ADMOB (Official Google Test IDs)
 * Sumber: https://developers.google.com/admob/android/test-ads
 */
export const GOOGLE_TEST_ADMOB_IDS: AdMobCredentials = {
  appId: {
    android: 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458002511',
  },
  adUnits: {
    banner: {
      android: 'ca-app-pub-3940256099942544/6300978111',
      ios: 'ca-app-pub-3940256099942544/2934735716',
    },
    interstitial: {
      android: 'ca-app-pub-3940256099942544/1033173712',
      ios: 'ca-app-pub-3940256099942544/4411468910',
    },
  },
};

/**
 * KREDENSIAL PRODUKSI AKUN ADMOB (EMAIL PENGELOLA ADMOB BERBEDA)
 * ----------------------------------------------------------------------------
 * Ganti placeholder di bawah (atau atur lewat environment variable VITE_ADMOB_*)
 * dengan nilai asli dari dashboard AdMob akun email terkait.
 */
export const PRODUCTION_ADMOB_CREDENTIALS: AdMobCredentials = {
  appId: {
    // Diambil dari Dashboard AdMob (email akun AdMob) -> Apps -> App settings (Android)
    android:
      import.meta.env.VITE_ADMOB_APP_ID_ANDROID ||
      'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
    // Diambil dari Dashboard AdMob (email akun AdMob) -> Apps -> App settings (iOS)
    ios:
      import.meta.env.VITE_ADMOB_APP_ID_IOS ||
      'ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ',
  },
  adUnits: {
    banner: {
      // Diambil dari Dashboard AdMob -> Apps -> Ad units -> Banner Android
      android:
        import.meta.env.VITE_ADMOB_BANNER_ID_ANDROID ||
        'ca-app-pub-XXXXXXXXXXXXXXXX/1111111111',
      // Diambil dari Dashboard AdMob -> Apps -> Ad units -> Banner iOS
      ios:
        import.meta.env.VITE_ADMOB_BANNER_ID_IOS ||
        'ca-app-pub-XXXXXXXXXXXXXXXX/2222222222',
    },
    interstitial: {
      // Diambil dari Dashboard AdMob -> Apps -> Ad units -> Interstitial Android
      android:
        import.meta.env.VITE_ADMOB_INTERSTITIAL_ID_ANDROID ||
        'ca-app-pub-XXXXXXXXXXXXXXXX/3333333333',
      // Diambil dari Dashboard AdMob -> Apps -> Ad units -> Interstitial iOS
      ios:
        import.meta.env.VITE_ADMOB_INTERSTITIAL_ID_IOS ||
        'ca-app-pub-XXXXXXXXXXXXXXXX/4444444444',
    },
  },
};

/**
 * KEBIJAKAN IKLAN RAMAH ANAK & KELUARGA (USIA 3–6 TAHUN)
 * ----------------------------------------------------------------------------
 * Mengacu pada kebijakan Google Play Families & COPPA:
 * - tagForChildDirectedTreatment: true -> menandai permintaan iklan khusus anak.
 * - tagForUnderAgeOfConsent: true -> kepatuhan usia di bawah batas persetujuan.
 * - maxAdContentRating: 'G' -> hanya iklan rating General Audiences (semua umur).
 * - nonPersonalizedAdsOnly (npa): true -> iklan non-personalisasi tanpa pelacakan perilaku.
 */
export const CHILD_SAFE_AD_POLICY = {
  tagForChildDirectedTreatment: true,
  tagForUnderAgeOfConsent: true,
  maxAdContentRating: 'G' as const,
  nonPersonalizedAdsOnly: true,
  /** Jeda minimal antar iklan interstitial agar anak tidak terganggu (ms) */
  interstitialCooldownMs: 180_000, // 3 menit
  /** Jumlah modul selesai minimal sebelum interstitial pertama boleh muncul */
  minModulesCompletedBeforeInterstitial: 2,
  /** Tinggi zona aman banner di bagian bawah halaman Pintu Masuk (px) */
  bannerSafeHeightPx: 56,
};

export function getActiveAdMobConfig(platform: AdPlatform = 'android') {
  const source = ADMOB_TEST_MODE ? GOOGLE_TEST_ADMOB_IDS : PRODUCTION_ADMOB_CREDENTIALS;
  const target = platform === 'ios' ? 'ios' : 'android';

  return {
    testMode: ADMOB_TEST_MODE,
    appId: source.appId[target],
    bannerUnitId: source.adUnits.banner[target],
    interstitialUnitId: source.adUnits.interstitial[target],
    policy: CHILD_SAFE_AD_POLICY,
  };
}
