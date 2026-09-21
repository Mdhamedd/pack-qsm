import React, { useEffect, useState } from "react";
import { Download, LockKeyhole, Menu, Plus } from "lucide-react";

export default function Header({
  onMenuClick,
  onNewInspection,
  onLock,
  readOnly,
}) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

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

  return (
    <header className="sticky top-0 z-30 bg-steel-900/90 backdrop-blur border-b border-steel-800 px-4 md:px-6 py-3 flex items-center justify-between safe-top">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-steel-300 hover:text-steel-50"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-steel-100 font-bold text-base md:text-lg">
          Pack to Pack QMS v2
        </h2>
      </div>
      <div className="flex items-center gap-2">
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
