import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Pack to Pack QMS - خطأ غير متوقع:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ minHeight: '100vh', background: '#0b1119', color: '#f8fafc', padding: 24, fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: 720, margin: '40px auto', background: '#1f2c3a', borderRadius: 16, padding: 24, border: '1px solid #374d63' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#f87171' }}>حدث خطأ أثناء تشغيل التطبيق</h1>
            <p style={{ color: '#c3d2dc', marginBottom: 16 }}>
              انسخ الرسالة التالية وأرسلها لمن يقوم بتطوير/صيانة المشروع لتشخيص المشكلة بدقة:
            </p>
            <pre
              style={{
                background: '#0b1119',
                padding: 16,
                borderRadius: 12,
                overflowX: 'auto',
                fontSize: 13,
                color: '#fca5a5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 16, background: '#f59e0b', color: '#0b1119', fontWeight: 700, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
