import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Save,
  Trash2,
  Wrench,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { MACHINES } from "../../data/constants";

const TIME_SLOTS = [
  "00:00 - 02:00",
  "02:00 - 04:00",
  "04:00 - 06:00",
  "06:00 - 08:00",
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
  "22:00 - 00:00",
];

const SHIFT_LIST = ["صباحية", "مسائية", "ليلية"];
const STATUS_LIST = ["مفتوحة", "جاري التعامل", "مغلقة"];
const SEVERITY_LIST = ["عادية", "مهمة", "حرجة"];

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  shift: "صباحية",
  timeSlot: TIME_SLOTS[Math.floor(new Date().getHours() / 2)],
  machineNumber: MACHINES[0].value,
  issueType: "",
  severity: "عادية",
  description: "",
  immediateAction: "",
  responsible: "",
});

const severityClass = {
  عادية: "bg-steel-700 text-steel-200",
  مهمة: "bg-warning-500/20 text-warning-400",
  حرجة: "bg-danger-500/20 text-danger-300",
};

export default function ShiftIssuesPage({ readOnly = false }) {
  const { shiftIssues, addShiftIssue, editShiftIssue, removeShiftIssue } =
    useApp();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("الكل");

  const update = (patch) => setForm((previous) => ({ ...previous, ...patch }));

  const filteredIssues = useMemo(() => {
    if (filter === "الكل") return shiftIssues;
    return shiftIssues.filter((issue) => issue.status === filter);
  }, [filter, shiftIssues]);

  const counts = useMemo(
    () => ({
      total: shiftIssues.length,
      open: shiftIssues.filter((issue) => issue.status === "مفتوحة").length,
      critical: shiftIssues.filter(
        (issue) => issue.severity === "حرجة" && issue.status !== "مغلقة",
      ).length,
    }),
    [shiftIssues],
  );

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.description.trim()) {
      setError("اكتب وصف المشكلة قبل الحفظ");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await addShiftIssue({
        ...form,
        machineNumber: Number(form.machineNumber),
      });
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-steel-50">
          متابعة مشاكل الوردية
        </h2>
        <p className="text-steel-400 text-sm">
          سجل المشكلة في الفترة الزمنية التي حدثت فيها، وتابع الإجراء حتى
          الإغلاق.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <Clock3 className="w-5 h-5 text-warning-400" />
          <div>
            <p className="text-xs text-steel-400">إجمالي المشاكل</p>
            <strong className="text-xl text-steel-50">{counts.total}</strong>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger-400" />
          <div>
            <p className="text-xs text-steel-400">مفتوحة</p>
            <strong className="text-xl text-danger-300">{counts.open}</strong>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Wrench className="w-5 h-5 text-warning-400" />
          <div>
            <p className="text-xs text-steel-400">حرجة وتحتاج متابعة</p>
            <strong className="text-xl text-warning-400">
              {counts.critical}
            </strong>
          </div>
        </div>
      </div>

      {!readOnly && (
        <form onSubmit={handleSave} className="card p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-steel-50">تسجيل مشكلة جديدة</h3>
            <span className="text-xs text-steel-400">المتابعة كل ساعتين</span>
          </div>
          {error && (
            <div className="bg-danger-500/15 border border-danger-500/40 text-danger-300 rounded-xl px-4 py-2 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="label-field">الفترة الزمنية</label>
              <select
                className="input-field"
                value={form.timeSlot}
                onChange={(e) => update({ timeSlot: e.target.value })}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">رقم الماكينة</label>
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
            </div>
            <div>
              <label className="label-field">نوع المشكلة</label>
              <input
                className="input-field"
                value={form.issueType}
                onChange={(e) => update({ issueType: e.target.value })}
                placeholder="اكتب نوع المشكلة"
              />
            </div>
            <div>
              <label className="label-field">درجة الأهمية</label>
              <select
                className="input-field"
                value={form.severity}
                onChange={(e) => update({ severity: e.target.value })}
              >
                {SEVERITY_LIST.map((severity) => (
                  <option key={severity}>{severity}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="label-field">وصف المشكلة</label>
              <textarea
                className="input-field min-h-24"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="ما الذي حدث؟ وما تأثيره على التشغيل؟"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">الإجراء الفوري</label>
              <textarea
                className="input-field min-h-20"
                value={form.immediateAction}
                onChange={(e) => update({ immediateAction: e.target.value })}
                placeholder="ما الإجراء الذي تم اتخاذه؟"
              />
            </div>
            <div>
              <label className="label-field">المسؤول عن المتابعة</label>
              <input
                className="input-field"
                value={form.responsible}
                onChange={(e) => update({ responsible: e.target.value })}
                placeholder="اسم المسؤول"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ..." : "حفظ مشكلة الوردية"}
          </button>
        </form>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-black text-steel-50">سجل المتابعة</h3>
          <div className="flex gap-2 flex-wrap">
            {["الكل", ...STATUS_LIST].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === status ? "bg-warning-500 text-steel-950" : "bg-steel-800 text-steel-300 hover:bg-steel-700"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        {filteredIssues.length === 0 ? (
          <div className="card p-8 text-center text-steel-500">
            لا توجد مشاكل مسجلة في هذا القسم.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <article key={issue.id} className="card p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-steel-100">
                        {issue.issueType} - ماكينة {issue.machineNumber}
                      </h4>
                      <span
                        className={`badge ${severityClass[issue.severity]}`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-steel-400 mt-1">
                      {issue.date} | وردية {issue.shift} | الفترة{" "}
                      {issue.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-steel-800 border border-steel-700 rounded-lg px-2 py-1.5 text-xs text-steel-100"
                      value={issue.status}
                      disabled={readOnly}
                      onChange={(e) =>
                        editShiftIssue(issue.id, { status: e.target.value })
                      }
                    >
                      {STATUS_LIST.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    {!readOnly && (
                      <button
                        type="button"
                        title="حذف المشكلة"
                        onClick={() => removeShiftIssue(issue.id)}
                        className="text-danger-400 hover:text-danger-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-steel-200 whitespace-pre-wrap">
                  {issue.description}
                </p>
                {issue.immediateAction && (
                  <p className="text-xs text-steel-400">
                    <span className="font-bold text-steel-300">الإجراء:</span>{" "}
                    {issue.immediateAction}
                  </p>
                )}
                {issue.responsible && (
                  <p className="text-xs text-steel-400">
                    <span className="font-bold text-steel-300">المسؤول:</span>{" "}
                    {issue.responsible}
                  </p>
                )}
                {issue.status === "مغلقة" && (
                  <div className="flex items-center gap-1 text-xs text-success-400">
                    <CheckCircle2 className="w-4 h-4" /> تم إغلاق المشكلة
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
