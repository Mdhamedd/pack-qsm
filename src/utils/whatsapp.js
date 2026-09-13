import { COMPANY } from "../data/constants";

function openWhatsApp(text, phone = "") {
  const encoded = encodeURIComponent(text);
  const base = phone
    ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}`
    : "https://wa.me/";
  window.open(`${base}?text=${encoded}`, "_blank");
}

export function shareInspectionOnWhatsApp(inspection, phone = "") {
  const defectsText =
    (inspection.defects || [])
      .map((d) => `• ${d.type} (${d.severity})`)
      .join("\n") || "لا توجد عيوب مسجلة";

  const text = `*${COMPANY.reportTitle}*
--------------------------------
🗓️ التاريخ: ${inspection.date} ${inspection.time || ""}
⚙️ ماكينة رقم: ${inspection.machineNumber}
📦 المنتج: ${inspection.productName}
🧪 الخامة: ${inspection.materialType}
⚖️ وزن العينة: ${inspection.sampleWeight} جم
👨‍🔬 المفتش: ${inspection.inspectorName}
🔧 الفني المشغل: ${inspection.operatorName || "-"}
✅ القرار: *${inspection.decision}*

${
  inspection.decision === "مرفوض"
    ? `*سبب الرفض:*
${inspection.decisionReason || "-"}`
    : ""
}${
    inspection.decision === "مقبول بشرط"
      ? `*سبب/شروط القبول المشروط:*
${inspection.acceptanceConditions || "-"}`
      : ""
  }

  ${
    inspection.managerOverride
      ? `*استثناء إداري - تم التمرير بتوجيه مدير:*
  المدير: ${inspection.managerName || "-"}
  التوجيه: ${inspection.managerInstruction || "-"}`
      : ""
  }

*العيوب المسجلة:*
${defectsText}

📝 ملاحظات: ${inspection.notes || "-"}
--------------------------------
تم الإرسال آلياً من نظام Pack to Pack QMS`;

  openWhatsApp(text, phone);
}

export function shareShiftSummaryOnWhatsApp(
  kpis,
  phone = "",
  shiftLabel = "الوردية الحالية",
) {
  const text = `*ملخص ${shiftLabel} - ${COMPANY.reportTitle}*
--------------------------------
📊 إجمالي الفحوصات: ${kpis.total}
✅ مقبول: ${kpis.accepted}
⚠️ مقبول بشرط: ${kpis.conditional}
❌ مرفوض: ${kpis.rejected}
📉 معدل الرفض: ${kpis.scrapRate.toFixed(2)}%
🔴 حالات مفتوحة للمتابعة: ${kpis.openCasesCount}
🚨 حالات حرجة مفتوحة: ${kpis.criticalOpenCasesCount}
--------------------------------
تم الإرسال آلياً من نظام Pack to Pack QMS`;

  openWhatsApp(text, phone);
}
