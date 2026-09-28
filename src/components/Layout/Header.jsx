import React, { useEffect, useState } from "react";
import {
  Download,
  LockKeyhole,
  Menu,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";

export default function Header({
  onMenuClick,
  onNewInspection,
  onLock,
  readOnly,
}) {
  const { refresh, isOnline } = useApp();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    setIsInstalled(Boolean(standalone));

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
      return;
    }

    window.alert(
      "التثبيت التلقائي غير متاح من هذا المتصفح أو الوضع الحالي. على اللاب استخدم Chrome أو Edge ثم افتح قائمة المتصفح واختر Install app / تثبيت التطبيق. يجب فتح النظام من localhost أو HTTPS، وليس من ملف HTML مباشر.",
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-steel-900/90 backdrop-blur border-b border-steel-800 px-4 md:px-6 py-3 flex items-center justify-between safe-top">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-steel-300 hover:text-steel-50"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-steel-100 font-bold text-base md:text-lg">
            Pack to Pack QMS v2
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-steel-400">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                isOnline
                  ? "bg-success-500/15 text-success-300"
                  : "bg-danger-500/15 text-danger-300"
              }`}
            >
              {isOnline ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isOnline ? "متصل" : "غير متصل"}
            </span>
            <span>
              آخر تحديث:{" "}
              {lastUpdated.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-60"
          title="تحديث البيانات"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">
            {refreshing ? "جاري التحديث..." : "تحديث"}
          </span>
        </button>
        {!isInstalled && (
          <button
            onClick={installApp}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="تثبيت التطبيق على الجهاز"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">تثبيت التطبيق</span>
          </button>
        )}
        <button
          onClick={onLock}
          className="btn-secondary p-2.5"
          title="قفل النظام"
          aria-label="قفل النظام"
        >
          <LockKeyhole className="w-4 h-4" />
        </button>
        {!readOnly && (
          <button
            onClick={onNewInspection}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">فحص جديد</span>
          </button>
        )}
      </div>
    </header>
  );
}
