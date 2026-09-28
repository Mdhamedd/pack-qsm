import React, { lazy, Suspense, useRef } from "react";
import {
  ClipboardCheck,
  PercentCircle,
  ShieldAlert,
  FolderOpen,
  Plus,
  Send,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import KpiCard from "./KpiCard.jsx";
import AlertBar from "./AlertBar.jsx";
import { shareShiftSummaryOnWhatsApp } from "../../utils/whatsapp.js";
import { SCRAP_RATE_ALERT_THRESHOLD } from "../../data/constants.js";

const ParetoChart = lazy(() => import("./ParetoChart.jsx"));
const DecisionPieChart = lazy(() => import("./DecisionPieChart.jsx"));

export default function Dashboard({ onNewInspection, readOnly = false }) {
  const { kpis, settings, inspections } = useApp();
  const paretoRef = useRef(null);
  const pieRef = useRef(null);

  const recent = inspections.slice(0, 6);
  const today = new Date();
  const welcomeMessage =
    kpis.total === 0
      ? "ابدأ بتسجيل أول فحص لتظهر مؤشرات الجودة وحالة خط الإنتاج هنا."
      : kpis.openCasesCount > 0 || kpis.scrapRate > SCRAP_RATE_ALERT_THRESHOLD
        ? "توجد مؤشرات تحتاج إلى مراجعة — راجع نسبة الرفض وحالات المتابعة لتحديد الأولويات."
        : "المؤشرات الحالية ضمن الحدود — لا توجد حالات مفتوحة أو ارتفاع في نسبة الرفض.";

  return (
    <div className="space-y-5">
      <div className="card dashboard-hero p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-warning-300 uppercase">
              Pack to Pack QMS
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-steel-50">
              مرحباً بك في لوحة مراقبة الجودة
            </h2>
            <p className="mt-2 text-sm text-steel-300 max-w-2xl">
              {welcomeMessage}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-[220px]">
            <div className="rounded-xl bg-steel-800/80 px-3 py-2 text-center">
              <div className="text-[11px] text-steel-400">اليوم</div>
              <div className="mt-1 text-lg font-black text-steel-50">
                {today.toLocaleDateString("ar-EG", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            </div>
            <div className="rounded-xl bg-steel-800/80 px-3 py-2 text-center">
              <div className="text-[11px] text-steel-400">الفحوصات</div>
              <div className="mt-1 text-lg font-black text-steel-50">
                {kpis.total}
              </div>
            </div>
            <div className="rounded-xl bg-danger-600/15 px-3 py-2 text-center">
              <div className="text-[11px] text-danger-300">متابعة</div>
              <div className="mt-1 text-lg font-black text-danger-400">
                {kpis.openCasesCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertBar kpis={kpis} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={ClipboardCheck}
          label="إجمالي الفحوصات"
          value={kpis.total}
          accent="bg-steel-800"
          colorClass="text-steel-50"
        />
        <KpiCard
          icon={PercentCircle}
          label="معدل الرفض (Scrap Rate)"
          value={`${kpis.scrapRate.toFixed(1)}%`}
          accent={
            kpis.scrapRate > SCRAP_RATE_ALERT_THRESHOLD
              ? "bg-danger-600/20"
              : "bg-success-500/20"
          }
          colorClass={
            kpis.scrapRate > SCRAP_RATE_ALERT_THRESHOLD
              ? "text-danger-400"
              : "text-success-400"
          }
        />
        <KpiCard
          icon={ShieldAlert}
          label="مقبول بشرط"
          value={kpis.conditional}
          accent="bg-warning-500/20"
          colorClass="text-warning-400"
        />
        <KpiCard
          icon={FolderOpen}
          label="حالات مفتوحة للمتابعة"
          value={kpis.openCasesCount}
          accent="bg-danger-600/20"
          colorClass="text-danger-400"
        />
        <KpiCard
          icon={FolderOpen}
          label="إجمالي الهالك"
          value={kpis.scrapQuantity}
          accent="bg-danger-600/20"
          colorClass="text-danger-300"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-4">
          <h3 className="font-bold text-steel-100 mb-3">
            تحليل باريتو للعيوب الأكثر تكرارًا
          </h3>
          <Suspense fallback={<ChartLoading />}>
            <ParetoChart ref={paretoRef} data={kpis.paretoData} />
          </Suspense>
        </div>
        <div className="card p-4">
          <h3 className="font-bold text-steel-100 mb-3">توزيع قرارات الجودة</h3>
          <Suspense fallback={<ChartLoading />}>
            <DecisionPieChart ref={pieRef} kpis={kpis} />
          </Suspense>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!readOnly && (
          <button
            onClick={onNewInspection}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> تسجيل فحص جديد
          </button>
        )}
        <button
          onClick={() =>
            shareShiftSummaryOnWhatsApp(kpis, settings.whatsappNumber)
          }
          className="btn-secondary flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> إرسال ملخص الوردية عبر واتساب
        </button>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-steel-100 mb-3">أحدث الفحوصات</h3>
        {recent.length === 0 ? (
          <p className="text-steel-500 text-sm text-center py-6">
            لا توجد فحوصات بعد. ابدأ بتسجيل أول فحص جودة.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-steel-400 border-b border-steel-800">
                  <th className="py-2 text-right font-semibold">التاريخ</th>
                  <th className="py-2 text-right font-semibold">الماكينة</th>
                  <th className="py-2 text-right font-semibold">المنتج</th>
                  <th className="py-2 text-right font-semibold">القرار</th>
                  <th className="py-2 text-right font-semibold">المفتش</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-steel-800/60 hover:bg-steel-800/40"
                  >
                    <td className="py-2">{i.date}</td>
                    <td className="py-2">#{i.machineNumber}</td>
                    <td className="py-2">{i.productName}</td>
                    <td className="py-2">
                      <DecisionBadge decision={i.decision} />
                    </td>
                    <td className="py-2">{i.inspectorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }) {
  const map = {
    مقبول: "bg-success-500/20 text-success-400",
    مرفوض: "bg-danger-500/20 text-danger-400",
    "مقبول بشرط": "bg-warning-500/20 text-warning-400",
  };
  return (
    <span className={`badge ${map[decision] || "bg-steel-700 text-steel-200"}`}>
      {decision}
    </span>
  );
}

function ChartLoading() {
  return (
    <div
      className="flex h-64 items-center justify-center text-sm text-steel-400"
      role="status"
    >
      جاري تحميل الرسم...
    </div>
  );
}
