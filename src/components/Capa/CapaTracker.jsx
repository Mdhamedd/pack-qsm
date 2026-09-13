import React, { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { DECISIONS, CAPA_STATUS } from "../../data/constants";
import CapaTable from "./CapaTable.jsx";

const TABS = [
  { key: "open", label: "مفتوحة" },
  { key: "in_progress", label: "جاري الإصلاح" },
  { key: "closed", label: "مغلقة" },
  { key: "all", label: "الكل" },
];

export default function CapaTracker({ readOnly = false }) {
  const { inspections } = useApp();
  const [tab, setTab] = useState("open");

  const followUpCases = useMemo(
    () =>
      inspections.filter(
        (i) =>
          i.decision === DECISIONS.REJECTED ||
          i.decision === DECISIONS.CONDITIONAL,
      ),
    [inspections],
  );

  const filtered = useMemo(() => {
    switch (tab) {
      case "open":
        return followUpCases.filter(
          (i) => !i.capaStatus || i.capaStatus === CAPA_STATUS.OPEN,
        );
      case "in_progress":
        return followUpCases.filter(
          (i) => i.capaStatus === CAPA_STATUS.IN_PROGRESS,
        );
      case "closed":
        return followUpCases.filter(
          (i) => i.capaStatus && i.capaStatus.startsWith("مغلق"),
        );
      case "all":
      default:
        return followUpCases;
    }
  }, [followUpCases, tab]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-steel-50">
          متابعة الحالات المفتوحة (CAPA)
        </h2>
        <p className="text-steel-400 text-sm">
          جميع الفحوصات المرفوضة أو المقبولة بشرط تحتاج إجراء تصحيحي ومتابعة.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-warning-500 text-steel-950"
                : "bg-steel-800 text-steel-300 hover:bg-steel-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-steel-500">
          لا توجد حالات في هذا القسم حالياً 🎉
        </div>
      ) : (
        <CapaTable cases={filtered} readOnly={readOnly} />
      )}
    </div>
  );
}
