import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DEFECT_TYPES, SEVERITY_LIST, SEVERITY_COLORS } from '../../data/constants';

export default function DefectSelector({ defects, onChange }) {
  const [type, setType] = useState(DEFECT_TYPES[0]);
  const [severity, setSeverity] = useState(SEVERITY_LIST[1]);

  const addDefect = () => {
    onChange([...defects, { id: `${Date.now()}`, type, severity }]);
  };

  const removeDefect = (id) => {
    onChange(defects.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field sm:col-span-1">
          {DEFECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="input-field sm:col-span-1">
          {SEVERITY_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="button" onClick={addDefect} className="btn-secondary flex items-center justify-center gap-2 sm:col-span-1">
          <Plus className="w-4 h-4" /> إضافة عيب
        </button>
      </div>

      {defects.length > 0 && (
        <ul className="space-y-2">
          {defects.map((d) => (
            <li key={d.id} className="flex items-center justify-between bg-steel-800 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[d.severity] }} />
                <span className="text-steel-100 text-sm font-semibold">{d.type}</span>
                <span className="text-steel-400 text-xs">({d.severity})</span>
              </div>
              <button type="button" onClick={() => removeDefect(d.id)} className="text-danger-400 hover:text-danger-300">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
