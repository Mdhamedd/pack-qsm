import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompress.js';

export default function ImageUpload({ value, onChange }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1000, quality: 0.7 });
      onChange(compressed);
    } catch (e) {
      console.error('Image compression failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="صورة العيب" className="w-40 h-40 object-cover rounded-xl border border-steel-700" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -left-2 bg-danger-600 text-white rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm">
            <ImagePlus className="w-4 h-4" /> رفع صورة
          </button>
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.setAttribute('capture', 'environment');
              fileInputRef.current?.click();
            }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Camera className="w-4 h-4" /> التقاط بالكاميرا
          </button>
        </div>
      )}
      {loading && <p className="text-xs text-steel-400 mt-2">جاري ضغط الصورة...</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
