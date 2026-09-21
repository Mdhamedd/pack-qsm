// ثوابت النظام - يمكن تعديلها حسب خط الإنتاج الفعلي

export const COMPANY = {
  name: "Pack to Pack",
  fullName: "باك تو باك لتصنيع العبوات البلاستيكية",
  reportTitle: "Pack to Pack Quality Control Report",
};

export const MACHINES = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `ماكينة رقم ${i + 1}`,
}));

export const MATERIAL_TYPES = [
  { value: "PP_COMPLIER", label: "PP - خامة كومبلير" },
  { value: "PP_RANDOM", label: "PP - خامة روندوم" },
  { value: "POLYSTYRENE", label: "بوليسترين" },
];

export const PRODUCTS = [
  "علبة 3 ك",
  "غطاء 3 ك",
  "علبة 4 ك",
  "غطاء 4 ك",
  "علبة 5 ك",
  "غطاء 5 ك",
  "علبة 6 ك",
  "غطاء 6 ك",
  "علبة 1 ك مربع شفاف",
  "غطاء 1 ك مربع شفاف",
  "علبة بولي وسط",
  "غطاء بولي وسط",
  "علبة بولي مستطيل",
  "غطاء بولي مستطيل",
  "علبة ربع دي",
  "علبة نص دي",
  "علبة ربع سي",
  "غطاء ربع سي",
  "غطاء ربع ونص دي",
];

export const DECISIONS = {
  ACCEPTED: "مقبول",
  REJECTED: "مرفوض",
  CONDITIONAL: "مقبول بشرط",
};

export const INSPECTOR_NAME = "محمد حامد";
export const SHIFT_LIST = ["صباحية", "مسائية", "ليلية"];

export const DECISION_LIST = [
  DECISIONS.ACCEPTED,
  DECISIONS.REJECTED,
  DECISIONS.CONDITIONAL,
];

export const DECISION_COLORS = {
  [DECISIONS.ACCEPTED]: "#22c55e",
  [DECISIONS.REJECTED]: "#ef4444",
  [DECISIONS.CONDITIONAL]: "#f59e0b",
};

export const DEFECT_TYPES = [
  "راش (Flash)",
  "نقص حقن (Short Shot)",
  "حرق (Burn Mark)",
  "انكماش (Shrinkage)",
  "تشوه (Deformation)",
  "تسريب (Leakage)",
];

export const SEVERITY_LEVELS = {
  CRITICAL: "حرج",
  MAJOR: "رئيسي",
  MINOR: "فرعي",
};

export const SEVERITY_LIST = [
  SEVERITY_LEVELS.CRITICAL,
  SEVERITY_LEVELS.MAJOR,
  SEVERITY_LEVELS.MINOR,
];

export const SEVERITY_COLORS = {
  [SEVERITY_LEVELS.CRITICAL]: "#ef4444",
  [SEVERITY_LEVELS.MAJOR]: "#f59e0b",
  [SEVERITY_LEVELS.MINOR]: "#94a3b8",
};

export const CAPA_STATUS = {
  OPEN: "مفتوح",
  IN_PROGRESS: "جاري الإصلاح",
  CLOSED_MOLD: "مغلق بعد تعديل الأسطمبة",
  CLOSED_TEMP: "مغلق بعد تعديل حرارة الماكينة",
  CLOSED_OTHER: "مغلق - إجراء آخر",
};

export const CAPA_STATUS_LIST = Object.values(CAPA_STATUS);

export const CAPA_STATUS_COLORS = {
  [CAPA_STATUS.OPEN]: "#ef4444",
  [CAPA_STATUS.IN_PROGRESS]: "#f59e0b",
  [CAPA_STATUS.CLOSED_MOLD]: "#22c55e",
  [CAPA_STATUS.CLOSED_TEMP]: "#22c55e",
  [CAPA_STATUS.CLOSED_OTHER]: "#22c55e",
};

export const SCRAP_RATE_ALERT_THRESHOLD = 3; // %
