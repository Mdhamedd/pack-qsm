import pdfMake, {
  PDF_FONT,
  ensurePdfFonts,
  getPdfFontMap,
  getPdfVfs,
} from "./pdfFonts";
import { COMPANY, DECISIONS } from "../data/constants";
import * as ArabicPersianReshaper from "arabic-persian-reshaper";

// pdfmake لا يقوم تلقائياً بإعادة تشكيل الحروف العربية (Glyph Shaping)، لذلك
// نستخدم مكتبة arabic-persian-reshaper التي تعيد الحروف المشكلة بترتيب العرض
// المناسب للنص العربي داخل PDF.
const reshaper = ArabicPersianReshaper.ArabicShaper
  ? ArabicPersianReshaper
  : ArabicPersianReshaper.default || null;

function containsArabic(text) {
  return /[\u0600-\u06FF]/.test(text || "");
}

export function ar(text) {
  if (!text) return "";
  const str = String(text);
  if (!reshaper || !containsArabic(str)) return str;
  try {
    return reshaper.ArabicShaper.convertArabic(str);
  } catch (e) {
    return str;
  }
}

function arCell(text, extra = {}) {
  return { text: ar(text), alignment: "right", font: PDF_FONT, ...extra };
}

const DECISION_BG = {
  [DECISIONS.ACCEPTED]: "#dcfce7",
  [DECISIONS.REJECTED]: "#fee2e2",
  [DECISIONS.CONDITIONAL]: "#fef3c7",
};

// ---------------------------------------------------------------------
// تقرير فحص فردي (Single Inspection Report)
// ---------------------------------------------------------------------
export function buildInspectionPdf(
  inspection,
  { qualityManagerName = "", productionManagerName = "" } = {},
) {
  const defectsRows = (inspection.defects || []).map((d) => [
    arCell(d.severity),
    arCell(d.type),
  ]);

  const content = [
    headerBlock(),
    {
      text: ar("تقرير فحص جودة فردي"),
      font: PDF_FONT,
      alignment: "center",
      fontSize: 14,
      bold: true,
      margin: [0, 10, 0, 10],
    },

    infoTable([
      [
        "رقم الفحص",
        inspection.id,
        "التاريخ",
        `${inspection.date} ${inspection.time || ""}`,
      ],
      [
        "رقم الماكينة",
        String(inspection.machineNumber),
        "نوع الخامة",
        inspection.materialType,
      ],
      [
        "اسم المنتج",
        inspection.productName,
        "وزن العينة",
        `${inspection.sampleWeight} جرام`,
      ],
      [
        "اسم المفتش",
        inspection.inspectorName,
        "الفني المشغل",
        inspection.operatorName || "-",
      ],
    ]),

    { text: "", margin: [0, 6] },
    {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            body: [
              [
                {
                  text: ar(`القرار: ${inspection.decision}`),
                  font: PDF_FONT,
                  bold: true,
                  fontSize: 13,
                  fillColor: DECISION_BG[inspection.decision] || "#e5e7eb",
                  color: "#111827",
                  margin: [10, 6, 10, 6],
                },
              ],
            ],
          },
          layout: "noBorders",
        },
      ],
    },

    { text: "", margin: [0, 10] },
    defectsRows.length
      ? {
          table: {
            widths: ["*", "*"],
            body: [
              [
                arCell("نوع العيب", {
                  bold: true,
                  fillColor: "#1f2c3a",
                  color: "white",
                }),
                arCell("درجة الخطورة", {
                  bold: true,
                  fillColor: "#1f2c3a",
                  color: "white",
                }),
              ],
              ...defectsRows.map((r) => r.reverse()),
            ],
          },
          layout: tableLayout(),
        }
      : {
          text: ar("لا توجد عيوب مسجلة في هذا الفحص"),
          font: PDF_FONT,
          alignment: "right",
          italics: true,
          color: "#64748b",
        },

    { text: "", margin: [0, 10] },
    {
      text: ar("ملاحظات المفتش:"),
      font: PDF_FONT,
      bold: true,
      alignment: "right",
    },
    {
      text: ar(inspection.notes || "لا توجد ملاحظات"),
      font: PDF_FONT,
      alignment: "right",
      margin: [0, 4, 0, 0],
    },

    ...(inspection.managerOverride
      ? [
          {
            text: ar(
              `استثناء إداري - تم التمرير بتوجيه مدير: ${inspection.managerName || "-"}\nالتوجيه: ${inspection.managerInstruction || "-"}`,
            ),
            font: PDF_FONT,
            alignment: "right",
            color: "#b91c1c",
            margin: [0, 10, 0, 0],
          },
        ]
      : []),

    ...(inspection.imageBase64
      ? [
          { text: "", margin: [0, 10] },
          { image: inspection.imageBase64, width: 260, alignment: "center" },
        ]
      : []),

    signatureBlock(qualityManagerName, productionManagerName),
  ];

  return generatePdf(content, `Inspection_${inspection.id}`);
}

// ---------------------------------------------------------------------
// تقرير شامل (Filtered Report) مع رسوم بيانية اختيارية (Base64 images)
// ---------------------------------------------------------------------
export function buildSummaryPdf(
  inspections,
  kpis,
  chartImages = {},
  { qualityManagerName = "", productionManagerName = "" } = {},
) {
  const rows = inspections.map((i) => [
    arCell(i.date),
    arCell(String(i.machineNumber)),
    arCell(i.productName),
    arCell(i.decision, { bold: true }),
    arCell((i.defects || []).map((d) => d.type).join("، ") || "-"),
  ]);

  const content = [
    headerBlock(),
    {
      text: ar("تقرير مجمّع لفحوصات الجودة"),
      font: PDF_FONT,
      alignment: "center",
      fontSize: 14,
      bold: true,
      margin: [0, 10, 0, 10],
    },

    kpiRow(kpis),

    ...(chartImages.pareto
      ? [
          {
            text: ar("تحليل باريتو للعيوب"),
            font: PDF_FONT,
            bold: true,
            alignment: "right",
            margin: [0, 14, 0, 6],
          },
          { image: chartImages.pareto, width: 480, alignment: "center" },
        ]
      : []),
    ...(chartImages.decisions
      ? [
          {
            text: ar("توزيع قرارات الجودة"),
            font: PDF_FONT,
            bold: true,
            alignment: "right",
            margin: [0, 14, 0, 6],
          },
          { image: chartImages.decisions, width: 320, alignment: "center" },
        ]
      : []),

    {
      text: ar("سجل الفحوصات"),
      font: PDF_FONT,
      bold: true,
      alignment: "right",
      margin: [0, 16, 0, 6],
    },
    {
      table: {
        headerRows: 1,
        widths: ["*", "*", "*", "*", "*"],
        body: [
          [
            arCell("العيوب", {
              bold: true,
              fillColor: "#1f2c3a",
              color: "white",
            }),
            arCell("القرار", {
              bold: true,
              fillColor: "#1f2c3a",
              color: "white",
            }),
            arCell("المنتج", {
              bold: true,
              fillColor: "#1f2c3a",
              color: "white",
            }),
            arCell("الماكينة", {
              bold: true,
              fillColor: "#1f2c3a",
              color: "white",
            }),
            arCell("التاريخ", {
              bold: true,
              fillColor: "#1f2c3a",
              color: "white",
            }),
          ],
          ...rows.map((r) => r.reverse()),
        ],
      },
      layout: tableLayout(),
    },

    signatureBlock(qualityManagerName, productionManagerName),
  ];

  return generatePdf(content, `Summary_Report`);
}

// ---------------------------------------------------------------------
// أجزاء مشتركة (Header / Signatures / KPI row / Layouts)
// ---------------------------------------------------------------------
function headerBlock() {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              {
                text: COMPANY.reportTitle,
                fontSize: 16,
                bold: true,
                color: "white",
                alignment: "center",
              },
              {
                text: ar(COMPANY.fullName),
                font: PDF_FONT,
                fontSize: 11,
                color: "#e2e9ee",
                alignment: "center",
                margin: [0, 4, 0, 0],
              },
              {
                text: ar(
                  `تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`,
                ),
                font: PDF_FONT,
                fontSize: 9,
                color: "#c3d2dc",
                alignment: "center",
                margin: [0, 2, 0, 0],
              },
            ],
            fillColor: "#0f172a",
            margin: [10, 12, 10, 12],
          },
        ],
      ],
    },
    layout: "noBorders",
  };
}

function infoTable(rows) {
  return {
    table: {
      widths: ["auto", "*", "auto", "*"],
      body: rows.map(([l1, v1, l2, v2]) => [
        arCell(l1, { bold: true, fillColor: "#f1f5f9", color: "#0f172a" }),
        arCell(v1),
        arCell(l2, { bold: true, fillColor: "#f1f5f9", color: "#0f172a" }),
        arCell(v2),
      ]),
    },
    layout: tableLayout(),
  };
}

function kpiRow(kpis) {
  const cell = (label, value, color) => ({
    table: {
      body: [
        [
          {
            text: String(value),
            fontSize: 16,
            bold: true,
            color: color || "#0f172a",
            alignment: "center",
          },
        ],
        [
          {
            text: ar(label),
            font: PDF_FONT,
            fontSize: 9,
            alignment: "center",
            color: "#475569",
          },
        ],
      ],
    },
    layout: "noBorders",
  });
  return {
    columns: [
      cell("إجمالي الفحوصات", kpis.total),
      cell(
        "معدل الرفض %",
        `${kpis.scrapRate.toFixed(1)}%`,
        kpis.scrapRate > 3 ? "#dc2626" : "#16a34a",
      ),
      cell("مقبول بشرط", kpis.conditional, "#d97706"),
      cell("حالات مفتوحة", kpis.openCasesCount, "#dc2626"),
    ],
    columnGap: 10,
    margin: [0, 6, 0, 0],
  };
}

function signatureBlock(qualityManagerName, productionManagerName) {
  return {
    margin: [0, 30, 0, 0],
    columns: [
      {
        text: [
          { text: ar("توقيع مهندس الجودة"), font: PDF_FONT, bold: true },
          "\n\n____________________\n",
          { text: ar(qualityManagerName || ""), font: PDF_FONT },
        ],
        alignment: "center",
      },
      {
        text: [
          { text: ar("توقيع مدير الإنتاج"), font: PDF_FONT, bold: true },
          "\n\n____________________\n",
          { text: ar(productionManagerName || ""), font: PDF_FONT },
        ],
        alignment: "center",
      },
    ],
  };
}

function tableLayout() {
  return {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => "#cbd5e1",
    vLineColor: () => "#cbd5e1",
    paddingTop: () => 5,
    paddingBottom: () => 5,
  };
}

async function generatePdf(content, filename) {
  const vfs = await ensurePdfFonts();
  const docDefinition = {
    pageSize: "A4",
    pageMargins: [30, 30, 30, 40],
    defaultStyle: { font: PDF_FONT, fontSize: 10 },
    content,
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}  —  Pack to Pack QMS`,
      alignment: "center",
      fontSize: 8,
      color: "#94a3b8",
      margin: [0, 10, 0, 0],
    }),
  };

  const doc = pdfMake.createPdf(
    docDefinition,
    null,
    getPdfFontMap(),
    getPdfVfs() || vfs,
  );
  return {
    download: () => doc.download(`${filename}.pdf`),
    open: () => doc.open(),
    getDataUrl: (cb) => doc.getDataUrl(cb),
  };
}
