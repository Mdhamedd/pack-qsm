import React, { useState } from "react";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import {
  CAPA_STATUS_LIST,
  CAPA_STATUS_COLORS,
  CAPA_STATUS,
} from "../../data/constants";
import { useApp } from "../../context/AppContext.jsx";

export default function CapaTable({ cases, readOnly = false }) {
  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <CapaRow key={c.id} inspection={c} readOnly={readOnly} />
      ))}
    </div>
  );
}

function CapaRow({ inspection, readOnly }) {
  const { editInspection } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(
    inspection.capaStatus || CAPA_STATUS.OPEN,
  );
  const [technician, setTechnician] = useState(inspection.capaTechnician || "");
  const [action, setAction] = useState(inspection.capaAction || "");
  const [technicianResponse, setTechnicianResponse] = useState(
    inspection.capaTechnicianResponse || "",
  );
  const [moldLimitation, setMoldLimitation] = useState(
    Boolean(inspection.capaMoldLimitation),
  );
  const [escalation, setEscalation] = useState(inspection.capaEscalation || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isClosed = status && status.startsWith("مغلق");

  const save = async () => {
    if (isClosed && !technician.trim()) {
      setError("لا يمكن إغلاق الحالة بدون تسجيل اسم المسؤول عن الإصلاح");
      return;
    }
    if (isClosed && !action.trim()) {
      setError("لا يمكن إغلاق الحالة بدون توثيق الإجراء المتخذ");
      return;
    }
    if (!technicianResponse.trim()) {
      setError("يرجى تسجيل رد الفني على الحالة");
      return;
    }
    if (moldLimitation && !escalation.trim()) {
      setError("يرجى توثيق إجراء التصعيد أو المطلوب من مسؤول الأسطمبة");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await editInspection(inspection.id, {
        capaStatus: status,
        capaTechnician: technician,
        capaAction: action,
        capaTechnicianResponse: technicianResponse,
        capaMoldLimitation: moldLimitation,
        capaEscalation: escalation,
        capaClosedDate: isClosed ? new Date().toISOString().slice(0, 10) : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4">
      <button
        className="w-full flex items-center justify-between text-right"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-steel-100">
            ماكينة #{inspection.machineNumber}
          </span>
          <span className="text-steel-400 text-sm">
            {inspection.productName}
          </span>
          <span className="text-steel-500 text-xs">{inspection.date}</span>
          <span
            className="badge"
            style={{
              backgroundColor: `${CAPA_STATUS_COLORS[status]}22`,
              color: CAPA_STATUS_COLORS[status],
            }}
          >
            {status}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-steel-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-steel-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-steel-800 pt-4">
          <div>
            <p className="text-xs text-steel-400 mb-1 font-semibold">
              العيوب المسجلة:
            </p>
            <div className="flex flex-wrap gap-2">
              {(inspection.defects || []).map((d) => (
                <span
                  key={d.id}
                  className="text-xs bg-steel-800 text-steel-200 px-2 py-1 rounded-lg"
                >
                  {d.type} ({d.severity})
                </span>
              ))}
            </div>
          </div>

          {inspection.decisionReason && (
            <div className="border-r-2 border-danger-500 pr-3">
              <p className="text-xs text-steel-400 mb-1 font-semibold">
                سبب الرفض:
              </p>
              <p className="text-sm text-danger-200 whitespace-pre-wrap">
                {inspection.decisionReason}
              </p>
            </div>
          )}

          {inspection.acceptanceConditions && (
            <div className="border-r-2 border-warning-500 pr-3">
              <p className="text-xs text-steel-400 mb-1 font-semibold">
                سبب القبول المشروط وشروط الإفراج:
              </p>
              <p className="text-sm text-warning-200 whitespace-pre-wrap">
                {inspection.acceptanceConditions}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">حالة المتابعة</label>
              <select
                className="input-field"
                value={status}
                disabled={readOnly}
                onChange={(e) => setStatus(e.target.value)}
              >
                {CAPA_STATUS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">
                اسم الفني المسؤول عن الإصلاح
              </label>
              <input
                className="input-field"
                value={technician}
                disabled={readOnly}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="اسم الفني"
              />
            </div>
          </div>

          <div>
            <label className="label-field">الإجراء المتخذ</label>
            <textarea
              className="input-field min-h-[80px]"
              value={action}
              disabled={readOnly}
              onChange={(e) => setAction(e.target.value)}
              placeholder="مثال: تم تعديل حرارة الماكينة من 210 إلى 195 درجة، وإعادة ضبط الأسطمبة..."
            />
          </div>

          <div>
            <label className="label-field">
              رد الفني على الحالة <span className="text-danger-400">*</span>
            </label>
            <textarea
              className="input-field min-h-[80px]"
              value={technicianResponse}
              disabled={readOnly}
              onChange={(e) => setTechnicianResponse(e.target.value)}
              placeholder="مثال: العيب ناتج عن الأسطمبة ولا يمكن ضبطه من الماكينة..."
            />
          </div>

          <div className="border border-warning-500/40 bg-warning-500/10 rounded-xl p-3 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-warning-500"
                checked={moldLimitation}
                disabled={readOnly}
                onChange={(e) => setMoldLimitation(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-bold text-warning-200">
                  الفني أفاد أن السبب في الأسطمبة ولا يمكن إصلاحه من الماكينة
                </span>
                <span className="block text-xs text-warning-200/80 mt-1">
                  سيتم حفظها كقيد فني وتصعيدها بدل اعتبارها تقاعسًا أو إغلاقها
                  بدون إجراء.
                </span>
              </span>
            </label>
            {moldLimitation && (
              <div>
                <label className="label-field text-warning-200">
                  إجراء التصعيد أو المطلوب من مسؤول الأسطمبة{" "}
                  <span className="text-danger-400">*</span>
                </label>
                <textarea
                  className="input-field min-h-[70px]"
                  value={escalation}
                  disabled={readOnly}
                  onChange={(e) => setEscalation(e.target.value)}
                  placeholder="مثال: تم رفع الحالة لمسؤول الأسطمبة لفحص التجويف وتحديد إمكانية التعديل..."
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-semibold text-danger-300">{error}</p>
          )}

          {!readOnly && (
            <button
              disabled={saving}
              onClick={save}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" /> حفظ التحديث
            </button>
          )}
        </div>
      )}
    </div>
  );
}
