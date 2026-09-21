import React, { useState } from "react";
import { Save, Send, ArrowRight, Plus } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import {
  MACHINES,
  MATERIAL_TYPES,
  PRODUCTS,
  DECISION_LIST,
  DECISIONS,
  INSPECTOR_NAME,
  SHIFT_LIST,
} from "../../data/constants";
import DefectSelector from "./DefectSelector.jsx";
import VoiceNoteButton from "./VoiceNoteButton.jsx";
import ImageUpload from "./ImageUpload.jsx";
import { shareInspectionOnWhatsApp } from "../../utils/whatsapp.js";

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  shift: SHIFT_LIST[0],
  machineNumber: MACHINES[0].value,
  productName: PRODUCTS[0],
  materialType: MATERIAL_TYPES[0].value,
  sampleWeight: "",
  inspectorName: INSPECTOR_NAME,
  operatorName: "",
  decision: DECISIONS.ACCEPTED,
  decisionReason: "",
  acceptanceConditions: "",
  managerOverride: false,
  managerName: "",
  managerInstruction: "",
  defects: [],
  notes: "",
  imageBase64: null,
  scrapQuantity: "",
  scrapReason: "",
});

export default function InspectionForm({ onDone }) {
  const {
    addInspection,
    settings,
    products,
    addProduct,
    technicians,
    addTechnician,
  } = useApp();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [productError, setProductError] = useState("");
  const [newTechnician, setNewTechnician] = useState("");
  const [technicianError, setTechnicianError] = useState("");

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleAddProduct = async () => {
    try {
      const product = await addProduct(newProduct);
      update({ productName: product });
      setNewProduct("");
      setProductError("");
    } catch (err) {
      setProductError(err.message);
    }
  };

  const handleAddTechnician = async () => {
    try {
      const technician = await addTechnician(newTechnician);
      update({ operatorName: technician });
      setNewTechnician("");
      setTechnicianError("");
    } catch (err) {
      setTechnicianError(err.message);
    }
  };

  const validate = () => {
    if (!form.sampleWeight || Number(form.sampleWeight) <= 0)
      return "يرجى إدخال وزن عينة صحيح";
    if (form.decision !== DECISIONS.ACCEPTED && form.defects.length === 0) {
      return "يرجى تحديد العيوب المرتبطة بالقرار (مرفوض / مقبول بشرط)";
    }
    if (form.decision === DECISIONS.REJECTED && !form.decisionReason.trim()) {
      return "يرجى كتابة سبب الرفض بالتفصيل";
    }
    if (
      form.decision === DECISIONS.CONDITIONAL &&
      !form.acceptanceConditions.trim()
    ) {
      return "يرجى كتابة شروط القبول والإجراء المطلوب قبل الإفراج";
    }
    if (form.managerOverride && !form.managerName.trim()) {
      return "يرجى كتابة اسم المدير الذي أصدر توجيه التمرير";
    }
    if (form.managerOverride && !form.managerInstruction.trim()) {
      return "يرجى توثيق توجيه المدير بوضوح قبل تمرير الحالة";
    }
    return "";
  };

  const handleSave = async (andShare = false) => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const saved = await addInspection(form);
      setLastSaved(saved);
      if (andShare) {
        shareInspectionOnWhatsApp(saved, settings.whatsappNumber);
      }
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={onDone}
          className="text-steel-400 hover:text-steel-100 flex items-center gap-1 text-sm"
        >
          <ArrowRight className="w-4 h-4" /> رجوع للوحة التحكم
        </button>
      </div>

      <div className="card p-5 space-y-5">
        <h2 className="text-xl font-black text-steel-50">
          تسجيل فحص جودة جديد
        </h2>

        {error && (
          <div className="bg-danger-500/15 border border-danger-500/40 text-danger-300 rounded-xl px-4 py-2 text-sm font-semibold">
            {error}
          </div>
        )}
        {lastSaved && !error && (
          <div className="bg-success-500/15 border border-success-500/40 text-success-400 rounded-xl px-4 py-2 text-sm font-semibold">
            تم حفظ الفحص بنجاح رقم {lastSaved.id.slice(-6)} ✅
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">التاريخ</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">الوقت</label>
            <input
              type="time"
              className="input-field"
              value={form.time}
              onChange={(e) => update({ time: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">الوردية</label>
            <select
              className="input-field"
              value={form.shift}
              onChange={(e) => update({ shift: e.target.value })}
            >
              {SHIFT_LIST.map((shift) => (
                <option key={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">رقم الماكينة</label>
            <select
              className="input-field"
              value={form.machineNumber}
              onChange={(e) =>
                update({ machineNumber: Number(e.target.value) })
              }
            >
              {MACHINES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">نوع الخامة</label>
            <select
              className="input-field"
              value={form.materialType}
              onChange={(e) => update({ materialType: e.target.value })}
            >
              {MATERIAL_TYPES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label-field">اسم المنتج / العبوة</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                list="products-list"
                className="input-field"
                value={form.productName}
                onChange={(e) => update({ productName: e.target.value })}
                placeholder="اختر أو اكتب اسم المنتج"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                className="input-field"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="اسم منتج جديد لإضافته للقائمة"
              />
              <button
                type="button"
                onClick={handleAddProduct}
                className="btn-secondary whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> إضافة منتج جديد
              </button>
            </div>
            {productError && (
              <p className="text-danger-300 text-xs font-semibold mt-1">
                {productError}
              </p>
            )}
            <datalist id="products-list">
              {(products.length ? products : PRODUCTS).map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="label-field">وزن العينة (جرام)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={form.sampleWeight}
              onChange={(e) => update({ sampleWeight: e.target.value })}
              placeholder="مثال: 24.5"
            />
          </div>

          <div>
            <label className="label-field">اسم المفتش</label>
            <input
              className="input-field"
              value={INSPECTOR_NAME}
              readOnly
              aria-label="اسم المفتش الثابت"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label-field">اسم الفني المشغل للماكينة</label>
            <select
              className="input-field"
              value={form.operatorName}
              onChange={(e) => update({ operatorName: e.target.value })}
            >
              <option value="">اختر اسم الفني</option>
              {technicians.map((technician) => (
                <option key={technician} value={technician}>
                  {technician}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                className="input-field"
                value={newTechnician}
                onChange={(e) => setNewTechnician(e.target.value)}
                placeholder="إضافة اسم فني جديد"
              />
              <button
                type="button"
                onClick={handleAddTechnician}
                className="btn-secondary whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> إضافة فني
              </button>
            </div>
            {technicianError && (
              <p className="text-danger-300 text-xs font-semibold mt-1">
                {technicianError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="label-field">قرار الجودة</label>
          <div className="grid grid-cols-3 gap-2">
            {DECISION_LIST.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => update({ decision: d })}
                className={`py-2.5 rounded-xl font-bold text-sm border transition-colors ${
                  form.decision === d
                    ? d === DECISIONS.ACCEPTED
                      ? "bg-success-500 text-steel-950 border-success-500"
                      : d === DECISIONS.REJECTED
                        ? "bg-danger-600 text-white border-danger-600"
                        : "bg-warning-500 text-steel-950 border-warning-500"
                    : "bg-steel-800 text-steel-300 border-steel-700 hover:bg-steel-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {form.decision === DECISIONS.REJECTED && (
          <div className="border border-danger-500/40 bg-danger-500/10 rounded-xl p-4">
            <label className="label-field text-danger-300">
              سبب الرفض <span className="text-danger-400">*</span>
            </label>
            <textarea
              className="input-field min-h-[90px]"
              value={form.decisionReason}
              onChange={(e) => update({ decisionReason: e.target.value })}
              placeholder="اذكر السبب القابل للمراجعة: نوع العيب، تأثيره، والكمية أو النطاق المتأثر..."
            />
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="label-field text-danger-300">
                  كمية الهالك
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={form.scrapQuantity}
                  onChange={(e) => update({ scrapQuantity: e.target.value })}
                  placeholder="الكمية"
                />
              </div>
              <div>
                <label className="label-field text-danger-300">
                  سبب الهالك
                </label>
                <input
                  className="input-field"
                  value={form.scrapReason}
                  onChange={(e) => update({ scrapReason: e.target.value })}
                  placeholder="لماذا تم إهلاك الكمية؟"
                />
              </div>
            </div>
          </div>
        )}

        {form.decision === DECISIONS.CONDITIONAL && (
          <div className="border border-warning-500/50 bg-warning-500/10 rounded-xl p-4">
            <label className="label-field text-warning-300">
              سبب القبول المشروط وشروط الإفراج{" "}
              <span className="text-warning-400">*</span>
            </label>
            <textarea
              className="input-field min-h-[90px]"
              value={form.acceptanceConditions}
              onChange={(e) => update({ acceptanceConditions: e.target.value })}
              placeholder="اذكر لماذا تم القبول بشروط وما المطلوب: فرز الكمية، إعادة التشغيل، موافقة المسؤول، أو إعادة الفحص..."
            />
            <p className="text-xs text-warning-200/80 mt-2">
              لا يُعتبر القبول المشروط إفراجًا نهائيًا إلا بعد تنفيذ الشرط
              وتوثيق المتابعة.
            </p>
          </div>
        )}

        {form.decision !== DECISIONS.ACCEPTED && (
          <div className="border border-danger-500/50 bg-danger-500/10 rounded-xl p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-danger-500"
                checked={form.managerOverride}
                onChange={(e) => update({ managerOverride: e.target.checked })}
              />
              <span>
                <span className="block text-sm font-bold text-danger-200">
                  تمرير الحالة بتوجيه مدير
                </span>
                <span className="block text-xs text-danger-300/80 mt-1">
                  هذا الاستثناء لا يلغي قرار الجودة أو العيوب المسجلة، بل يوثق
                  المسؤولية الإدارية عن التمرير.
                </span>
              </span>
            </label>

            {form.managerOverride && (
              <div className="grid sm:grid-cols-2 gap-3 border-t border-danger-500/30 pt-3">
                <div>
                  <label className="label-field text-danger-200">
                    اسم المدير صاحب التوجيه{" "}
                    <span className="text-danger-400">*</span>
                  </label>
                  <input
                    className="input-field"
                    value={form.managerName}
                    onChange={(e) => update({ managerName: e.target.value })}
                    placeholder="اسم المدير"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field text-danger-200">
                    نص توجيه المدير <span className="text-danger-400">*</span>
                  </label>
                  <textarea
                    className="input-field min-h-[80px]"
                    value={form.managerInstruction}
                    onChange={(e) =>
                      update({ managerInstruction: e.target.value })
                    }
                    placeholder="اكتب التوجيه كما صدر: تمرير الكمية، السبب، والنطاق المسموح..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {form.decision !== DECISIONS.ACCEPTED && (
          <div>
            <label className="label-field">العيوب ودرجة الخطورة</label>
            <DefectSelector
              defects={form.defects}
              onChange={(defects) => update({ defects })}
            />
          </div>
        )}

        <div>
          <label className="label-field">صورة العيب (اختياري)</label>
          <ImageUpload
            value={form.imageBase64}
            onChange={(imageBase64) => update({ imageBase64 })}
          />
        </div>

        <div>
          <label className="label-field">ملاحظات المفتش</label>
          <textarea
            className="input-field min-h-[100px]"
            value={form.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="اكتب ملاحظاتك هنا أو استخدم الإملاء الصوتي..."
          />
          <div className="mt-2">
            <VoiceNoteButton
              onTranscript={(text) =>
                update({
                  notes: `${form.notes ? form.notes + " " : ""}${text}`,
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            disabled={saving}
            onClick={() => handleSave(false)}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> حفظ الفحص
          </button>
          <button
            disabled={saving}
            onClick={() => handleSave(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> حفظ وإرسال عبر واتساب
          </button>
        </div>
      </div>
    </div>
  );
}
