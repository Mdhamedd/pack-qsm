import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SCRAP_RATE_ALERT_THRESHOLD } from '../../data/constants';

export default function AlertBar({ kpis }) {
  if (!kpis.isAlert) {
    return (
      <div className="rounded-2xl bg-success-500/10 border border-success-500/30 text-success-400 px-4 py-3 flex items-center gap-3 font-semibold">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span>الأداء ضمن الحدود المقبولة — معدل الرفض ونسبة الحالات الحرجة تحت السيطرة.</span>
      </div>
    );
  }

  const reasons = [];
  if (kpis.scrapRate > SCRAP_RATE_ALERT_THRESHOLD) {
    reasons.push(`معدل الرفض ${kpis.scrapRate.toFixed(1)}% تجاوز الحد المسموح (${SCRAP_RATE_ALERT_THRESHOLD}%)`);
  }
  if (kpis.criticalOpenCasesCount > 0) {
    reasons.push(`يوجد ${kpis.criticalOpenCasesCount} حالة حرجة مفتوحة تحتاج متابعة فورية`);
  }

  return (
    <div className="rounded-2xl bg-danger-500/15 border border-danger-500/40 text-danger-400 px-4 py-3 flex items-start gap-3 font-semibold animate-pulse">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="text-danger-300">تنبيه جودة عاجل!</p>
        <ul className="list-disc list-inside text-sm font-medium text-danger-400/90 mt-1 space-y-0.5">
          {reasons.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
