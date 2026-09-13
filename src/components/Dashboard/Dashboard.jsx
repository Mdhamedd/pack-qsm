import React, { useRef } from "react";
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
import ParetoChart from "./ParetoChart.jsx";
import DecisionPieChart from "./DecisionPieChart.jsx";
import { shareShiftSummaryOnWhatsApp } from "../../utils/whatsapp.js";

export default function Dashboard({ onNewInspection, readOnly = false }) {
  const { kpis, settings, inspections } = useApp();
  const paretoRef = useRef(null);
  const pieRef = useRef(null);

  const recent = inspections.slice(0, 6);

  return (
    <div className="space-y-5">
      <AlertBar kpis={kpis} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          accent={kpis.scrapRate > 3 ? "bg-danger-600/20" : "bg-success-500/20"}
          colorClass={
            kpis.scrapRate > 3 ? "text-danger-400" : "text-success-400"
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
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-4">
          <h3 className="font-bold text-steel-100 mb-3">
            تحليل باريتو للعيوب الأكثر تكرارًا
          </h3>
          <ParetoChart ref={paretoRef} data={kpis.paretoData} />
        </div>
        <div className="card p-4">
          <h3 className="font-bold text-steel-100 mb-3">توزيع قرارات الجودة</h3>
          <DecisionPieChart ref={pieRef} kpis={kpis} />
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
