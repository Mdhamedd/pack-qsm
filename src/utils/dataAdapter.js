// ==========================================================================
// طبقة الوصول للبيانات (Data Adapter)
// حالياً تعمل عبر LocalStorage، ومصممة بحيث يمكن استبدالها لاحقاً
// بـ Supabase أو Firebase دون تغيير أي مكوّن (Component) في الواجهة.
// كل الدوال هنا "async" عمداً حتى تتوافق مع أي مصدر بيانات حقيقي مستقبلاً.
// ==========================================================================

import {
  DEFAULT_TECHNICIANS,
  INSPECTOR_NAME,
  PRODUCTS,
} from "../data/constants.js";

const KEYS = {
  INSPECTIONS: "p2p_qms_inspections_v1",
  SHIFT_ISSUES: "p2p_qms_shift_issues_v1",
  SETTINGS: "p2p_qms_settings_v1",
  PRODUCTS: "p2p_qms_products_v1",
  TECHNICIANS: "p2p_qms_technicians_v1",
  SCRAP: "p2p_qms_scrap_v1",
};

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("Storage read error:", e);
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Storage write error:", e);
    throw new Error(
      "تعذر حفظ البيانات على هذا الجهاز. صدّر نسخة احتياطية أو حرر مساحة ثم حاول مرة أخرى.",
      { cause: e },
    );
  }
}

function uid() {
  return `insp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function issueUid() {
  return `shift_issue_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function scrapUid() {
  return `scrap_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// -------------------- عمليات الفحوصات (Inspections) --------------------

export async function getInspections() {
  return readLocal(KEYS.INSPECTIONS, []).map((inspection) => ({
    ...inspection,
    inspectorName: inspection.inspectorName || INSPECTOR_NAME,
  }));
}

export async function getInspectionById(id) {
  const all = readLocal(KEYS.INSPECTIONS, []);
  return all.find((i) => i.id === id) || null;
}

export async function saveInspection(inspection) {
  const all = readLocal(KEYS.INSPECTIONS, []);
  const safeInspection = inspection || {};
  const newRecord = {
    id: uid(),
    createdAt: new Date().toISOString(),
    capaStatus: null,
    capaAction: "",
    capaTechnician: "",
    capaTechnicianResponse: "",
    capaMoldLimitation: false,
    capaEscalation: "",
    capaClosedDate: null,
    capaHistory: [],
    ...safeInspection,
    inspectorName: safeInspection.inspectorName || INSPECTOR_NAME,
  };
  all.unshift(newRecord);
  writeLocal(KEYS.INSPECTIONS, all);
  return newRecord;
}

export async function updateInspection(id, patch) {
  const all = readLocal(KEYS.INSPECTIONS, []);
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLocal(KEYS.INSPECTIONS, all);
  return all[idx];
}

export async function deleteInspection(id) {
  const all = readLocal(KEYS.INSPECTIONS, []);
  const filtered = all.filter((i) => i.id !== id);
  writeLocal(KEYS.INSPECTIONS, filtered);
  return true;
}

// -------------------- مشاكل متابعة الوردية --------------------

export async function getShiftIssues() {
  return readLocal(KEYS.SHIFT_ISSUES, []);
}

export async function saveShiftIssue(issue) {
  const all = readLocal(KEYS.SHIFT_ISSUES, []);
  const newRecord = {
    id: issueUid(),
    createdAt: new Date().toISOString(),
    status: "مفتوحة",
    ...issue,
  };
  all.unshift(newRecord);
  writeLocal(KEYS.SHIFT_ISSUES, all);
  return newRecord;
}

export async function updateShiftIssue(id, patch) {
  const all = readLocal(KEYS.SHIFT_ISSUES, []);
  const idx = all.findIndex((issue) => issue.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLocal(KEYS.SHIFT_ISSUES, all);
  return all[idx];
}

export async function deleteShiftIssue(id) {
  const all = readLocal(KEYS.SHIFT_ISSUES, []);
  writeLocal(
    KEYS.SHIFT_ISSUES,
    all.filter((issue) => issue.id !== id),
  );
  return true;
}

// -------------------- سجلات الهالك المستقلة --------------------

export async function getScrapRecords() {
  return readLocal(KEYS.SCRAP, []);
}

export async function saveScrapRecord(record) {
  const all = readLocal(KEYS.SCRAP, []);
  const newRecord = {
    id: scrapUid(),
    createdAt: new Date().toISOString(),
    quantity: 0,
    ...record,
  };
  all.unshift(newRecord);
  writeLocal(KEYS.SCRAP, all);
  return newRecord;
}

export async function updateScrapRecord(id, patch) {
  const all = readLocal(KEYS.SCRAP, []);
  const idx = all.findIndex((record) => record.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLocal(KEYS.SCRAP, all);
  return all[idx];
}

export async function deleteScrapRecord(id) {
  const all = readLocal(KEYS.SCRAP, []);
  writeLocal(
    KEYS.SCRAP,
    all.filter((record) => record.id !== id),
  );
  return true;
}

// -------------------- المنتجات --------------------

export async function getProducts() {
  const saved = readLocal(KEYS.PRODUCTS, null);
  if (!Array.isArray(saved)) return PRODUCTS;
  return [...new Set([...PRODUCTS, ...saved])];
}

export async function saveProducts(products) {
  const uniqueProducts = [
    ...new Set(products.map((product) => product.trim()).filter(Boolean)),
  ];
  writeLocal(KEYS.PRODUCTS, uniqueProducts);
  return uniqueProducts;
}

export async function getTechnicians() {
  const saved = readLocal(KEYS.TECHNICIANS, null);
  if (!Array.isArray(saved)) return DEFAULT_TECHNICIANS;
  return [
    ...new Set(
      [...DEFAULT_TECHNICIANS, ...saved]
        .map((technician) => technician.trim())
        .filter(Boolean),
    ),
  ];
}

export async function saveTechnicians(technicians) {
  const uniqueTechnicians = [
    ...new Set(
      technicians.map((technician) => technician.trim()).filter(Boolean),
    ),
  ];
  writeLocal(KEYS.TECHNICIANS, uniqueTechnicians);
  return uniqueTechnicians;
}

// -------------------- النسخ الاحتياطي (Backup) --------------------

export async function exportBackupObject() {
  const inspections = readLocal(KEYS.INSPECTIONS, []);
  const shiftIssues = readLocal(KEYS.SHIFT_ISSUES, []);
  const scrap = readLocal(KEYS.SCRAP, []);
  const settings = readLocal(KEYS.SETTINGS, {});
  const products = readLocal(KEYS.PRODUCTS, PRODUCTS);
  const technicians = readLocal(KEYS.TECHNICIANS, DEFAULT_TECHNICIANS);
  return {
    app: "Pack to Pack QMS",
    version: 1,
    exportedAt: new Date().toISOString(),
    inspections,
    shiftIssues,
    scrap,
    settings,
    products,
    technicians,
  };
}

export async function importBackupObject(backup) {
  if (!backup || !Array.isArray(backup.inspections)) {
    throw new Error("ملف النسخة الاحتياطية غير صالح");
  }
  const entries = [[KEYS.INSPECTIONS, backup.inspections]];
  const optionalArrays = [
    ["shiftIssues", KEYS.SHIFT_ISSUES],
    ["scrap", KEYS.SCRAP],
    ["products", KEYS.PRODUCTS],
    ["technicians", KEYS.TECHNICIANS],
  ];
  for (const [property, key] of optionalArrays) {
    if (property in backup) {
      if (!Array.isArray(backup[property])) {
        throw new Error("ملف النسخة الاحتياطية غير صالح");
      }
      entries.push([key, backup[property]]);
    }
  }
  if ("settings" in backup) {
    if (
      !backup.settings ||
      typeof backup.settings !== "object" ||
      Array.isArray(backup.settings)
    ) {
      throw new Error("ملف النسخة الاحتياطية غير صالح");
    }
    entries.push([KEYS.SETTINGS, backup.settings]);
  }

  const previous = new Map(
    entries.map(([key]) => [key, localStorage.getItem(key)]),
  );
  try {
    entries.forEach(([key, value]) =>
      localStorage.setItem(key, JSON.stringify(value)),
    );
  } catch (e) {
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (rollbackError) {
        console.error("Backup rollback error:", rollbackError);
      }
    }
    console.error("Backup import error:", e);
    throw new Error(
      "تعذر استرجاع النسخة الاحتياطية بالكامل. تم الحفاظ على البيانات السابقة قدر الإمكان.",
      { cause: e },
    );
  }
  return true;
}

export async function clearAllData() {
  const keys = Object.values(KEYS);
  const previous = new Map(keys.map((key) => [key, localStorage.getItem(key)]));
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    for (const [key, value] of previous) {
      if (value === null) continue;
      try {
        localStorage.setItem(key, value);
      } catch (rollbackError) {
        console.error("Clear data rollback error:", rollbackError);
      }
    }
    throw new Error("تعذر مسح البيانات بالكامل.", { cause: e });
  }
  return true;
}

// -------------------- إعدادات عامة --------------------

export async function getSettings() {
  const saved = readLocal(KEYS.SETTINGS, {});
  return {
    whatsappNumber: "",
    qualityManagerName: INSPECTOR_NAME,
    productionManagerName: "",
    ...saved,
    qualityManagerName: saved.qualityManagerName || INSPECTOR_NAME,
  };
}

export async function saveSettings(settings) {
  writeLocal(KEYS.SETTINGS, settings);
  return settings;
}

// --------------------------------------------------------------------------
// ملاحظة للترحيل المستقبلي إلى Supabase / Firebase:
// استبدل تنفيذ الدوال أعلاه فقط (نفس التوقيعات/الأسماء) باستدعاءات:
//   supabase.from('inspections').select() / .insert() / .update() / .delete()
// أو
//   Firestore: collection('inspections').get() / add() / update() / delete()
// لن تحتاج لتعديل أي component يستخدم هذه الدوال.
// --------------------------------------------------------------------------
