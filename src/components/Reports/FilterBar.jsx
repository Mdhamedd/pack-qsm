import React from 'react';
import { MACHINES, DECISION_LIST } from '../../data/constants';

export default function FilterBar({ filters, onChange }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="card p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div>
        <label className="label-field">من تاريخ</label>
        <input type="date" className="input-field" value={filters.dateFrom} onChange={(e) => update({ dateFrom: e.target.value })} />
      </div>
      <div>
        <label className="label-field">إلى تاريخ</label>
        <input type="date" className="input-field" value={filters.dateTo} onChange={(e) => update({ dateTo: e.target.value })} />
      </div>
      <div>
        <label className="label-field">رقم الماكينة</label>
        <select className="input-field" value={filters.machineNumber} onChange={(e) => update({ machineNumber: e.target.value })}>
          <option value="">الكل</option>
          {MACHINES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-field">القرار</label>
        <select className="input-field" value={filters.decision} onChange={(e) => update({ decision: e.target.value })}>
          <option value="">الكل</option>
          {DECISION_LIST.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-field">بحث بالمنتج / المفتش</label>
        <input className="input-field" value={filters.search} onChange={(e) => update({ search: e.target.value })} placeholder="اكتب للبحث..." />
      </div>
    </div>
  );
}
