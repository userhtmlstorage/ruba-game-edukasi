import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { getActiveAdMobConfig } from '../config/admobConfig';
import { admobService } from '../services/admobService';

/**
 * Zona Aman Banner Ramah Anak (Hanya dirender di halaman HUB / Pintu Masuk).
 * - Dipisahkan tegas dengan jarak aman di bagian paling bawah layar.
 * - Tidak pernah dirender di layar Modul Pembelajaran (pilihan ganda / gerak),
 *   sehingga jari anak usia 3-6 tahun tidak akan salah menekan iklan.
 */
export const ChildSafeAdBannerSlot: React.FC = () => {
  const isNative = admobService.isNativeWrapper();
  const config = getActiveAdMobConfig(admobService.detectPlatform());

  if (isNative) {
    // Saat dibungkus Capacitor/WebView, ruang 56px ini menjaga agar banner native
    // di posisi BOTTOM_CENTER tidak menutupi kartu modul di bagian bawah.
    return (
      <div
        aria-hidden="true"
        style={{ height: `${config.policy.bannerSafeHeightPx}px` }}
        className="w-full shrink-0"
      />
    );
  }

  // Di mode uji coba browser (TEST_MODE), tampilkan area reservasi pasif non-interaktif
  if (!config.testMode) return null;

  return (
    <aside
      aria-label="Ruang Iklan Ramah Anak"
      className="flex h-12 w-full shrink-0 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 text-xs font-bold text-slate-500 shadow-xs pointer-events-none"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Zona Aman Banner AdMob (Hanya di Pintu Masuk · Jauh dari Tombol Belajar)</span>
      </div>
      <span className="hidden sm:inline text-[11px] font-semibold text-slate-400">
        TEST_MODE Aktif · Rating G · Non-Personalisasi
      </span>
    </aside>
  );
};

interface TestInterstitialModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Pratinjau Interstitial khusus Web TEST_MODE agar pengembang dapat menguji alur
 * jeda antar-modul tanpa mengecoh anak dan dengan tombol tutup yang sangat jelas.
 */
export const TestInterstitialModal: React.FC<TestInterstitialModalProps> = ({
  visible,
  onClose,
}) => {
  if (!visible) return null;
  const config = getActiveAdMobConfig('android');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Iklan Uji Coba Ramah Anak"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-6 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-4 border-sky-200 bg-white p-6 text-center shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          <span>IKLAN UJI COBA · RAMAH KELUARGA (RATING G)</span>
        </div>

        <h3 className="font-display text-2xl font-bold text-slate-800">
          Jeda Sebentar Setelah Belajar
        </h3>

        <p className="text-sm font-semibold text-slate-600 leading-relaxed">
          Ini adalah simulasi iklan Interstitial aman (Non-Personalisasi) dalam mode{' '}
          <strong>TEST_MODE</strong>. Saat dirilis di mobile, iklan dari AdMob muncul
          hanya di jeda selesai modul.
        </p>

        <div className="w-full rounded-2xl bg-slate-50 p-3 text-left text-[11px] font-mono text-slate-500">
          <div>Unit ID: {config.interstitialUnitId}</div>
          <div>NPA (Non-Personalized): {String(config.policy.nonPersonalizedAdsOnly)}</div>
          <div>Child Directed: {String(config.policy.tagForChildDirectedTreatment)}</div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-sky-600 bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white hover:bg-sky-600 active:translate-y-0.5"
        >
          <X className="h-5 w-5" />
          <span>Tutup & Lanjutkan</span>
        </button>
      </div>
    </div>
  );
};
