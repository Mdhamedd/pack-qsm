import React from "react";
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardPlus,
  ClipboardList,
  FileBarChart,
  DatabaseBackup,
  X,
  Factory,
} from "lucide-react";
import { VIEWS } from "../../data/views.js";
import { useApp } from "../../context/AppContext.jsx";

const NAV_ITEMS = [
  { key: VIEWS.DASHBOARD, label: "لوحة التحكم", icon: LayoutDashboard },
  { key: VIEWS.NEW_INSPECTION, label: "فحص جديد", icon: FilePlus2 },
  { key: VIEWS.SHIFT_ISSUES, label: "متابعة الوردية", icon: ClipboardPlus },
  { key: VIEWS.CAPA, label: "متابعة الحالات (CAPA)", icon: ClipboardList },
  { key: VIEWS.REPORTS, label: "التقارير والتصدير", icon: FileBarChart },
  { key: VIEWS.BACKUP, label: "النسخ الاحتياطي", icon: DatabaseBackup },
];

export default function Sidebar({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  readOnly,
}) {
  const { kpis, shiftIssues, isOnline } = useApp();
  const openShiftIssues = shiftIssues.filter(
    (issue) => issue.status !== "مغلقة",
  ).length;

  const content = (
    <div className="h-full flex flex-col bg-steel-900 border-l border-steel-800 w-72">
      <div className="p-5 border-b border-steel-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-warning-500 rounded-xl p-2">
            <Factory className="w-6 h-6 text-steel-950" />
          </div>
          <div>
            <h1 className="font-black text-lg text-steel-50 leading-tight">
              Pack to Pack
            </h1>
            <p className="text-xs text-steel-400">نظام إدارة الجودة QMS</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-steel-400 hover:text-steel-100"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(
          ({ key }) => !readOnly || key !== VIEWS.NEW_INSPECTION,
        ).map(({ key, label, icon: Icon }) => {
          const active = currentView === key;
          const showBadge =
            (key === VIEWS.CAPA && kpis.openCasesCount > 0) ||
            (key === VIEWS.SHIFT_ISSUES && openShiftIssues > 0);
          const badgeCount =
            key === VIEWS.CAPA ? kpis.openCasesCount : openShiftIssues;
          return (
            <button
              key={key}
              onClick={() => {
                onNavigate(key);
                onClose();
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-semibold ${
                active
                  ? "bg-warning-500 text-steel-950"
                  : "text-steel-300 hover:bg-steel-800 hover:text-steel-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                {label}
              </span>
              {showBadge && (
                <span className="bg-danger-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-steel-800">
        <div
          className={`flex items-center gap-2 text-xs font-semibold ${isOnline ? "text-success-400" : "text-warning-500"}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-success-400" : "bg-warning-500"} animate-pulse`}
          />
          {isOnline
            ? "متصل بالإنترنت"
            : "وضع عدم الاتصال (Offline) — يعمل بشكل طبيعي"}
        </div>
        <div className="mt-4 pt-3 border-t border-steel-800/80 text-center">
          <p className="text-[10px] text-steel-500">
            © 2026 Pack to Pack QMS - جميع الحقوق محفوظة
          </p>
          <a
            href="https://www.linkedin.com/in/mohamedhamed22"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1 text-[11px] text-warning-400 hover:text-warning-300 transition-colors"
          >
            تم التطوير بواسطة Mohamed Hamed
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block">{content}</aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute top-0 right-0 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
