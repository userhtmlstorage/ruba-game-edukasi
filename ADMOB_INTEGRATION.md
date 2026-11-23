# Panduan Integrasi Google AdMob pada RuBa (Akun AdMob Berbeda)

Dokumen ini menjelaskan cara menghubungkan konfigurasi AdMob pada aplikasi **RuBa** ketika akun **Google AdMob** dikelola dengan email yang **berbeda** dari akun email pengembangan atau akun toko aplikasi (Google Play Console / App Store).

---

## 1. Mengisi ID Akun AdMob yang Berbeda

1. Login ke [Google AdMob](https://admob.google.com) menggunakan **email akun AdMob Anda**.
2. Daftarkan aplikasi **RuBa** (Android dan/atau iOS).
3. Salin nilai berikut dari dashboard AdMob tersebut:
   - **ADMOB_APP_ID**: menu *Apps → App settings → App ID* (`ca-app-pub-XXXX~YYYY`).
   - **AD_UNIT_ID (Banner & Interstitial)**: menu *Apps → Ad units → Ad unit ID* (`ca-app-pub-XXXX/ZZZZ`).
4. Tempelkan ke **`src/config/admobConfig.ts`** pada bagian `PRODUCTION_ADMOB_CREDENTIALS`, atau melalui file `.env` (`VITE_ADMOB_APP_ID_ANDROID`, `VITE_ADMOB_BANNER_ID_ANDROID`, dst.).

> **Penting tentang `TEST_MODE`:**  
> `ADMOB_TEST_MODE` aktif (`true`) secara default. Biarkan `true` selama pengujian agar sistem memakai ID Uji Resmi Google dan **tidak memicu invalid click** pada akun AdMob baru. Ubah ke `false` hanya saat build rilis produksi.

---

## 2. Kebijakan Iklan Ramah Anak (Usia 3–6 Tahun)

Aplikasi RuBa sudah menerapkan konfigurasi wajib Google Play Families & COPPA pada `CHILD_SAFE_AD_POLICY`:
- `tagForChildDirectedTreatment: true`
- `tagForUnderAgeOfConsent: true`
- `maxAdContentRating: 'G'` (khusus semua umur)
- `nonPersonalizedAdsOnly: true` (tanpa pelacakan iklan personal)
- **Zona Penempatan Aman**:
  - **Banner** hanya muncul di **Pintu Masuk (Hub)** pada zona bawah terpisah (`ChildSafeAdBannerSlot`) dan otomatis disembunyikan saat anak masuk ke layar soal/modul belajar agar tidak berdekatan dengan tombol pilihan ganda.
  - **Interstitial** hanya boleh muncul setelah modul selesai penuh, dengan jeda minimal 3 menit (`interstitialCooldownMs: 180000`) dan minimal 2 modul selesai.

---

## 3. Cara Menghubungkan saat Dibungkus ke Mobile

### Opsi A: Menggunakan Capacitor (`@capacitor-community/admob`) — Direkomendasikan
1. Build aplikasi web RuBa:
   ```bash
   npm run build
   ```
2. Inisialisasi Capacitor & pasang plugin AdMob:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor-community/admob
   npx cap init "RuBa" "id.ruba.belajar" --web-dir=dist
   npx cap add android
   ```
3. Tambahkan **ADMOB_APP_ID milik email akun AdMob Anda** ke `android/app/src/main/AndroidManifest.xml` di dalam `<application>`:
   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" />
   ```
4. Untuk iOS, tambahkan `GADApplicationIdentifier` pada `ios/App/App/Info.plist`.
5. Jalankan `npx cap sync` lalu buka di Android Studio / Xcode. `src/services/admobService.ts` otomatis mendeteksi `window.Capacitor.Plugins.AdMob` dan menerapkan seluruh aturan ramah anak.

### Opsi B: Menggunakan Android WebView Native (`@JavascriptInterface`)
Jika membungkus `dist/` atau URL RuBa langsung ke Android WebView (Kotlin/Java):
1. Daftarkan `com.google.android.gms.ads.APPLICATION_ID` milik email akun AdMob Anda di `AndroidManifest.xml`.
2. Ekspos objek JavaScript bernama **`RuBaAdMobBridge`** ke WebView:
   ```kotlin
   webView.addJavascriptInterface(AdMobJsBridge(this), "RuBaAdMobBridge")
   ```
3. Implementasikan 4 metode pada `AdMobJsBridge`:
   - `initialize(configJson: String)` → panggil `MobileAds.setRequestConfiguration(...)` dengan `TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE` dan `MAX_AD_CONTENT_RATING_G`.
   - `showBanner(adUnitId: String, npaOnly: Boolean)` → tampilkan `AdView` di bawah layar dengan `Bundle().apply { putString("npa", "1") }` jika `npaOnly == true`.
   - `hideBanner()` → sembunyikan `AdView` saat anak masuk modul belajar.
   - `showInterstitial(adUnitId: String, npaOnly: Boolean)` → muat dan tampilkan `InterstitialAd` dengan parameter `npa = "1"`.
