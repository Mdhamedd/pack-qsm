import React, { useRef, useState } from "react";
import { Download, Upload, Save, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import * as db from "../../utils/dataAdapter.js";

export default function BackupPage({ readOnly = false }) {
  const { settings, updateSettings, refresh, inspections, shiftIssues } =
    useApp();
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [localSettings, setLocalSettings] = useState(settings);

  const handleExport = async () => {
    const backup = await db.exportBackupObject();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pack_to_pack_qms_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      await db.importBackupObject(backup);
      await refresh();
      setMessage(
        `تم استرجاع النسخة الاحتياطية بنجاح (${backup.inspections.length} فحص)`,
      );
    } catch (e) {
      setMessage(
        "فشل استرجاع الملف: تأكد أنه ملف نسخة احتياطية صالح لنظام Pack to Pack QMS",
      );
    }
  };

  const handleClear = async () => {
    if (
      !window.confirm(
        "سيتم حذف جميع بيانات الفحوصات نهائياً من هذا الجهاز. هل أنت متأكد؟",
      )
    )
      return;
    await db.clearAllData();
    await refresh();
    setMessage("تم مسح جميع البيانات");
  };

  const saveSettings = async () => {
    await updateSettings(localSettings);
    setMessage("تم حفظ الإعدادات بنجاح");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-black text-steel-50">
          النسخ الاحتياطي والإعدادات
        </h2>
        <p className="text-steel-400 text-sm">
          إجمالي السجلات المخزّنة محلياً: {inspections.length} فحص و
          {shiftIssues.length} مشكلة وردية
        </p>
      </div>

      {message && (
        <div className="bg-steel-800 border border-steel-700 text-steel-100 rounded-xl px-4 py-2 text-sm">
          {message}
        </div>
      )}

      <div className="card p-5 space-y-3">
        <h3 className="font-bold text-steel-100">النسخ الاحتياطي (JSON)</h3>
        <p className="text-steel-400 text-sm">
          يمكنك تصدير كل بيانات الفحوصات كملف JSON للاحتفاظ به أو نقله لجهاز
          آخر، واسترجاعه لاحقاً بنفس الطريقة.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> تصدير نسخة احتياطية
          </button>
          {!readOnly && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> استرجاع من ملف
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
        </div>
      </div>

      {!readOnly && (
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-steel-100">
            إعدادات التقارير والتنبيهات
          </h3>
          <div>
            <label className="label-field">
              رقم واتساب منسق الإنتاج / مدير الجودة (مع كود الدولة)
            </label>
            <input
              className="input-field"
              placeholder="مثال: 201001234567"
              value={localSettings.whatsappNumber}
              onChange={(e) =>
                setLocalSettings((s) => ({
                  ...s,
                  whatsappNumber: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">
                اسم مهندس الجودة (للتوقيع في PDF)
              </label>
              <input
                className="input-field"
                value={localSettings.qualityManagerName}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    qualityManagerName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="label-field">
                اسم مدير الإنتاج (للتوقيع في PDF)
              </label>
              <input
                className="input-field"
                value={localSettings.productionManagerName}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    productionManagerName: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <button
            onClick={saveSettings}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> حفظ الإعدادات
          </button>
        </div>
      )}

      {!readOnly && (
        <div className="card p-5 space-y-3 border-danger-600/40">
          <h3 className="font-bold text-danger-400">منطقة الخطر</h3>
          <p className="text-steel-400 text-sm">
            حذف جميع البيانات المخزنة على هذا الجهاز نهائياً. تأكد من أخذ نسخة
            احتياطية أولاً.
          </p>
          <button
            onClick={handleClear}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> مسح كل البيانات
          </button>
        </div>
      )}
    </div>
  );
}
