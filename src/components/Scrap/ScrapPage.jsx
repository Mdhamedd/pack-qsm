import React, { useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { MACHINES, SHIFT_LIST } from "../../data/constants";

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  shift: SHIFT_LIST[0],
  machineNumber: MACHINES[0].value,
  productName: "",
  quantity: "",
  reason: "",
  inspectionId: "",
  notes: "",
});

export default function ScrapPage({ readOnly = false }) {
  const { inspections, scrapRecords, addScrapRecord, removeScrapRecord } =
    useApp();
  const [form, setForm] = useState(emptyForm());
  const [filterDate, setFilterDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredRecords = useMemo(
    () =>
      scrapRecords.filter(
        (record) => !filterDate || record.date === filterDate,
      ),
    [scrapRecords, filterDate],
  );
  const total = filteredRecords.reduce(
    (sum, record) => sum + Number(record.quantity || 0),
    0,
  );

  const update = (patch) => setForm((previous) => ({ ...previous, ...patch }));

  const save = async (event) => {
    event.preventDefault();
    if (
      !form.productName.trim() ||
      Number(form.quantity) <= 0 ||
      !form.reason.trim()
    ) {
      setError("اكتب المنتج والكمية وسبب الهالك بشكل صحيح");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await addScrapRecord({
        ...form,
        quantity: Number(form.quantity),
        machineNumber: Number(form.machineNumber),
      });
      setForm(emptyForm());
    } catch (saveError) {
      setError(saveError.message || "تعذر حفظ سجل الهالك. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-steel-50">تسجيل الهالك</h2>
        <p className="text-steel-400 text-sm">
          سجل الهالك مستقلًا واربطه بالفحص عند الحاجة ليظهر في التحليل
          والتقارير.
        </p>
      </div>

      {!readOnly && (
        <form onSubmit={save} className="card p-5 space-y-4">
          {error && (
            <p className="text-danger-300 text-sm font-semibold">{error}</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="التاريخ">
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
              />
            </Field>
            <Field label="الوردية">
              <select
                className="input-field"
                value={form.shift}
                onChange={(e) => update({ shift: e.target.value })}
              >
                {SHIFT_LIST.map((shift) => (
                  <option key={shift}>{shift}</option>
                ))}
              </select>
            </Field>
            <Field label="رقم الماكينة">
              <select
                className="input-field"
                value={form.machineNumber}
                onChange={(e) => update({ machineNumber: e.target.value })}
              >
                {MACHINES.map((machine) => (
                  <option key={machine.value} value={machine.value}>
                    {machine.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المنتج">
              <input
                className="input-field"
                value={form.productName}
                onChange={(e) => update({ productName: e.target.value })}
                placeholder="اسم المنتج"
              />
            </Field>
            <Field label="كمية الهالك">
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.quantity}
                onChange={(e) => update({ quantity: e.target.value })}
                placeholder="الكمية"
              />
            </Field>
            <Field label="ربط بالفحص">
              <select
                className="input-field"
                value={form.inspectionId}
                onChange={(e) => update({ inspectionId: e.target.value })}
              >
                <option value="">بدون ربط</option>
                {inspections
                  .filter((inspection) => inspection.date === form.date)
                  .map((inspection) => (
                    <option key={inspection.id} value={inspection.id}>
                      {inspection.productName} - {inspection.id.slice(-6)}
                    </option>
                  ))}
              </select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="سبب الهالك">
                <input
                  className="input-field"
                  value={form.reason}
                  onChange={(e) => update({ reason: e.target.value })}
                  placeholder="العيب أو سبب الإهلاك"
                />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="ملاحظات">
                <textarea
                  className="input-field"
                  value={form.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              </Field>
            </div>
          </div>
          <button
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ..." : "حفظ سجل الهالك"}
          </button>
        </form>
      )}

      <section className="card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-black text-steel-50">سجل الهالك</h3>
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="input-field w-auto"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <span className="badge bg-danger-500/20 text-danger-300">
              الإجمالي: {total}
            </span>
          </div>
        </div>
        {filteredRecords.length === 0 ? (
          <p className="text-steel-500 text-center py-6">لا توجد سجلات هالك.</p>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border-b border-steel-800 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <strong className="text-steel-100">
                    {record.productName}
                  </strong>
                  <p className="text-xs text-steel-400">
                    {record.date} | {record.shift} | ماكينة{" "}
                    {record.machineNumber} | {record.reason}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-danger-300">
                    {record.quantity}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      title="حذف سجل الهالك"
                      onClick={() => removeScrapRecord(record.id)}
                      className="text-danger-400 hover:text-danger-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {children}
    </div>
  );
}
