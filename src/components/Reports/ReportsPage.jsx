import React, { useMemo, useRef, useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  Send,
  Eye,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import FilterBar from "./FilterBar.jsx";
import ParetoChart from "../Dashboard/ParetoChart.jsx";
import DecisionPieChart from "../Dashboard/DecisionPieChart.jsx";
import { exportInspectionsToExcel } from "../../utils/excelExport.js";
import {
  buildInspectionPdf,
  buildNonconformityPdf,
  buildScrapPdf,
  buildShiftIssuesPdf,
  buildSummaryPdf,
} from "../../utils/pdfExport.js";
import { shareShiftSummaryOnWhatsApp } from "../../utils/whatsapp.js";
import { DECISIONS, INSPECTOR_NAME, SHIFT_LIST } from "../../data/constants";

const emptyFilters = {
  dateFrom: "",
  dateTo: "",
  shift: "",
  machineNumber: "",
  decision: "",
  search: "",
};

export default function ReportsPage() {
  const { inspections, shiftIssues, settings } = useApp();
  const [filters, setFilters] = useState(emptyFilters);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const paretoRef = useRef(null);
  const pieRef = useRef(null);

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      if (filters.dateFrom && i.date < filters.dateFrom) return false;
      if (filters.dateTo && i.date > filters.dateTo) return false;
      if (filters.shift && i.shift !== filters.shift) return false;
      if (
        filters.machineNumber &&
        String(i.machineNumber) !== String(filters.machineNumber)
      )
        return false;
      if (filters.decision && i.decision !== filters.decision) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay =
          `${i.productName} ${i.inspectorName} ${i.operatorName || ""} ${i.shift || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [inspections, filters]);

  const filteredKpis = useMemo(() => {
    const total = filtered.length;
    const rejected = filtered.filter(
      (i) => i.decision === DECISIONS.REJECTED,
    ).length;
    const conditional = filtered.filter(
      (i) => i.decision === DECISIONS.CONDITIONAL,
    ).length;
    const accepted = filtered.filter(
      (i) => i.decision === DECISIONS.ACCEPTED,
    ).length;
    const scrapRate = total > 0 ? (rejected / total) * 100 : 0;
    const openCasesCount = filtered.filter(
      (i) =>
        (i.decision === DECISIONS.REJECTED ||
          i.decision === DECISIONS.CONDITIONAL) &&
        (!i.capaStatus || i.capaStatus === "مفتوح"),
    ).length;

    const defectCounts = {};
    filtered.forEach((i) =>
      (i.defects || []).forEach(
        (d) => (defectCounts[d.type] = (defectCounts[d.type] || 0) + 1),
      ),
    );
    const paretoData = Object.entries(defectCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      rejected,
      conditional,
      accepted,
      scrapRate,
      openCasesCount,
      paretoData,
    };
  }, [filtered]);

  const handleExportExcel = () => exportInspectionsToExcel(filtered);

  const handleExportPdf = async () => {
    setExportError("");
    setExportingPdf(true);
    try {
      const chartImages = {};
      try {
        if (paretoRef.current?.toBase64Image) {
          chartImages.pareto = paretoRef.current.toBase64Image();
        }
        if (pieRef.current?.toBase64Image) {
          chartImages.decisions = pieRef.current.toBase64Image();
        }
      } catch (chartError) {
        console.warn("تعذر تضمين الرسوم البيانية في PDF:", chartError);
      }
      const pdf = await buildSummaryPdf(filtered, filteredKpis, chartImages, {
        qualityManagerName: settings.qualityManagerName || INSPECTOR_NAME,
        productionManagerName: settings.productionManagerName,
      });
      pdf.download();
    } catch (error) {
      console.error("فشل تصدير PDF:", error);
      setExportError(
        "تعذر تصدير ملف PDF. تأكد من تحميل الصفحة ثم حاول مرة أخرى.",
      );
    } finally {
      setExportingPdf(false);
    }
  };

  const handleWhatsapp = () =>
    shareShiftSummaryOnWhatsApp(
      filteredKpis,
      settings.whatsappNumber,
      "التقرير المفلتر",
    );

  const exportReport = async (builder, records, filename) => {
    setExportError("");
    try {
      const pdf = await builder(records, {
        qualityManagerName: settings.qualityManagerName || INSPECTOR_NAME,
        productionManagerName: settings.productionManagerName,
      });
      pdf.download(filename);
    } catch (error) {
      console.error(`فشل تصدير ${filename}:`, error);
      setExportError("تعذر تصدير التقرير. حاول مرة أخرى.");
    }
  };

  const scrapRecords = filtered.filter(
    (inspection) =>
      inspection.decision === DECISIONS.REJECTED ||
      Number(inspection.scrapQuantity) > 0,
  );
  const nonconformityRecords = filtered.filter(
    (inspection) => inspection.decision !== DECISIONS.ACCEPTED,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-steel-50">التقارير والتصدير</h2>
        <p className="text-steel-400 text-sm">
          فلتر البيانات ثم صدّرها كـ PDF احترافي أو Excel أو أرسلها عبر واتساب.
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {exportError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {exportError}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          <FileDown className="w-4 h-4" />{" "}
          {exportingPdf ? "جاري التصدير..." : "تصدير PDF"}
        </button>
        <button
          onClick={handleExportExcel}
          className="btn-secondary flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" /> تصدير Excel
        </button>
        <button
          onClick={handleWhatsapp}
          className="btn-secondary flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> إرسال ملخص واتساب
        </button>
        {SHIFT_LIST.map((shift) => {
          const shiftRecords = shiftIssues.filter(
            (issue) => issue.shift === shift,
          );
          return (
            <button
              key={shift}
              onClick={() =>
                exportReport(
                  buildShiftIssuesPdf,
                  shiftRecords,
                  `Shift_${shift}_Report`,
                )
              }
              className="btn-secondary flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" /> تقرير {shift} (
              {shiftRecords.length})
            </button>
          );
        })}
        <button
          onClick={() =>
            exportReport(buildScrapPdf, scrapRecords, "Scrap_Report")
          }
          className="btn-secondary flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" /> تقرير الهالك ({scrapRecords.length})
        </button>
        <button
          onClick={() =>
            exportReport(
              buildNonconformityPdf,
              nonconformityRecords,
              "Nonconformity_Report",
            )
          }
          className="btn-secondary flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" /> تقرير عدم المطابقة (
          {nonconformityRecords.length})
        </button>
        <span className="flex items-center gap-2 text-steel-400 text-sm">
          <Eye className="w-4 h-4" /> {filtered.length} نتيجة من أصل{" "}
          {inspections.length}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-bold text-steel-100 mb-3">
            تحليل باريتو (حسب الفلترة)
          </h3>
          <ParetoChart ref={paretoRef} data={filteredKpis.paretoData} />
        </div>
        <div className="card p-4">
          <h3 className="font-bold text-steel-100 mb-3">
            توزيع القرارات (حسب الفلترة)
          </h3>
          <DecisionPieChart ref={pieRef} kpis={filteredKpis} />
        </div>
      </div>

      <div className="card p-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-steel-400 border-b border-steel-800">
                <th className="py-2 text-right font-semibold">التاريخ</th>
                <th className="py-2 text-right font-semibold">الماكينة</th>
                <th className="py-2 text-right font-semibold">المنتج</th>
                <th className="py-2 text-right font-semibold">القرار</th>
                <th className="py-2 text-right font-semibold">المفتش</th>
                <th className="py-2 text-right font-semibold">حالة CAPA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => setSelectedInspection(i)}
                  className="border-b border-steel-800/60 hover:bg-steel-800/40 cursor-pointer"
                  title="فتح تفاصيل الفحص"
                >
                  <td className="py-2">{i.date}</td>
                  <td className="py-2">#{i.machineNumber}</td>
                  <td className="py-2">{i.productName}</td>
                  <td className="py-2">{i.decision}</td>
                  <td className="py-2">{i.inspectorName}</td>
                  <td className="py-2">{i.capaStatus || "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-steel-500">
                    لا توجد نتائج مطابقة للفلترة الحالية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInspection && (
        <div className="card p-5 space-y-4 border-warning-500/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="text-steel-400 hover:text-steel-100 flex items-center gap-1 text-sm mb-2"
              >
                <ArrowRight className="w-4 h-4" /> رجوع إلى سجل التقارير
              </button>
              <h3 className="text-lg font-black text-steel-50">
                تفاصيل الفحص {selectedInspection.id}
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                exportReport(
                  buildInspectionPdf,
                  selectedInspection,
                  `Inspection_${selectedInspection.id}`,
                )
              }
              className="btn-primary flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" /> تصدير تفاصيل الفحص PDF
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-steel-400">التاريخ:</span>{" "}
              {selectedInspection.date}
            </div>
            <div>
              <span className="text-steel-400">الوردية:</span>{" "}
              {selectedInspection.shift || "-"}
            </div>
            <div>
              <span className="text-steel-400">الماكينة:</span>{" "}
              {selectedInspection.machineNumber}
            </div>
            <div>
              <span className="text-steel-400">المفتش:</span>{" "}
              {selectedInspection.inspectorName}
            </div>
            <div>
              <span className="text-steel-400">المنتج:</span>{" "}
              {selectedInspection.productName}
            </div>
            <div>
              <span className="text-steel-400">القرار:</span>{" "}
              {selectedInspection.decision}
            </div>
            <div>
              <span className="text-steel-400">كمية الهالك:</span>{" "}
              {selectedInspection.scrapQuantity || 0}
            </div>
            <div>
              <span className="text-steel-400">سبب الهالك:</span>{" "}
              {selectedInspection.scrapReason ||
                selectedInspection.decisionReason ||
                "-"}
            </div>
          </div>
          <div className="border-t border-steel-800 pt-3 text-sm whitespace-pre-wrap">
            <span className="text-steel-400">الملاحظات:</span>{" "}
            {selectedInspection.notes || "لا توجد ملاحظات"}
          </div>
        </div>
      )}
    </div>
  );
}
