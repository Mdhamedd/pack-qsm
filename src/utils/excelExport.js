import * as XLSX from "xlsx";

// تصدير قائمة الفحوصات (بعد الفلترة الحالية) إلى ملف Excel منظم
export function exportInspectionsToExcel(
  inspections,
  filenamePrefix = "Pack_to_Pack_QMS_Report",
) {
  const rows = inspections.map((i) => ({
    "رقم الفحص": i.id,
    التاريخ: i.date,
    الوقت: i.time || "",
    "رقم الماكينة": i.machineNumber,
    المنتج: i.productName,
    "نوع الخامة": i.materialType,
    "وزن العينة (جم)": i.sampleWeight,
    "اسم المفتش": i.inspectorName,
    "الفني المشغل": i.operatorName || "",
    القرار: i.decision,
    العيوب: (i.defects || [])
      .map((d) => `${d.type} (${d.severity})`)
      .join(" | "),
    "سبب الرفض": i.decisionReason || "",
    "سبب/شروط القبول المشروط": i.acceptanceConditions || "",
    "تمرير بتوجيه مدير": i.managerOverride ? "نعم" : "لا",
    "اسم المدير صاحب التوجيه": i.managerName || "",
    "توجيه المدير": i.managerInstruction || "",
    ملاحظات: i.notes || "",
    "حالة المتابعة (CAPA)": i.capaStatus || "-",
    "الإجراء المتخذ": i.capaAction || "",
    "فني المتابعة": i.capaTechnician || "",
    "رد الفني": i.capaTechnicianResponse || "",
    "قيد متعلق بالأسطمبة": i.capaMoldLimitation ? "نعم" : "لا",
    "إجراء التصعيد": i.capaEscalation || "",
    "تاريخ الإغلاق": i.capaClosedDate || "",
  }));

  const summaryRows = [
    { العنصر: "إجمالي الفحوصات", القيمة: inspections.length },
    {
      العنصر: "المرفوضة",
      القيمة: inspections.filter((i) => i.decision === "مرفوض").length,
    },
    {
      العنصر: "المقبولة بشرط",
      القيمة: inspections.filter((i) => i.decision === "مقبول بشرط").length,
    },
    {
      العنصر: "المقبولة",
      القيمة: inspections.filter((i) => i.decision === "مقبول").length,
    },
    {
      العنصر: "السجل الذي تم تصديره",
      القيمة: new Date().toLocaleDateString("ar-EG"),
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      "رقم الفحص",
      "التاريخ",
      "الوقت",
      "رقم الماكينة",
      "المنتج",
      "نوع الخامة",
      "وزن العينة (جم)",
      "اسم المفتش",
      "الفني المشغل",
      "القرار",
      "العيوب",
      "سبب الرفض",
      "سبب/شروط القبول المشروط",
      "تمرير بتوجيه مدير",
      "اسم المدير صاحب التوجيه",
      "توجيه المدير",
      "ملاحظات",
      "حالة المتابعة (CAPA)",
      "الإجراء المتخذ",
      "فني المتابعة",
      "رد الفني",
      "قيد متعلق بالأسطمبة",
      "إجراء التصعيد",
      "تاريخ الإغلاق",
    ],
  });

  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 24 },
    { wch: 10 },
    { wch: 14 },
    { wch: 30 },
    { wch: 20 },
    { wch: 30 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 18 },
    { wch: 24 },
    { wch: 30 },
    { wch: 24 },
    { wch: 22 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
  ];
  const dataRange = `A1:${XLSX.utils.encode_col(23)}${rows.length + 1}`;
  worksheet["!ref"] = dataRange;
  if (rows.length > 0) worksheet["!autofilter"] = { ref: dataRange };

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows, {
    header: ["العنصر", "القيمة"],
  });
  summarySheet["!cols"] = [{ wch: 28 }, { wch: 22 }];

  const workbook = XLSX.utils.book_new();
  workbook.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(workbook, summarySheet, "ملخص التقرير");
  XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الفحوصات");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}
