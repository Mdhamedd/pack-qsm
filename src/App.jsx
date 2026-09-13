import React, { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import Sidebar from "./components/Layout/Sidebar.jsx";
import Header from "./components/Layout/Header.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import InspectionForm from "./components/Inspection/InspectionForm.jsx";
import ShiftIssuesPage from "./components/Shift/ShiftIssuesPage.jsx";
import CapaTracker from "./components/Capa/CapaTracker.jsx";
import ReportsPage from "./components/Reports/ReportsPage.jsx";
import BackupPage from "./components/Backup/BackupPage.jsx";
import { useApp } from "./context/AppContext.jsx";
import { VIEWS } from "./data/views.js";
import {
  isAuthenticated,
  setAuthenticated,
  verifyCredentials,
  getAuthRole,
} from "./utils/auth.js";

function LoginScreen({ onAuthenticated }) {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recorder");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setChecking(true);
    setError("");
    const valid = await verifyCredentials(password, role);
    if (valid) {
      setAuthenticated(true, role);
      onAuthenticated(role);
    } else {
      setPassword("");
      setError("كلمة المرور غير صحيحة");
    }
    setChecking(false);
  };

  return (
    <div
      className="min-h-screen bg-steel-950 flex items-center justify-center p-4"
      dir="rtl"
    >
      <form onSubmit={submit} className="card w-full max-w-md p-6 space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-warning-500 flex items-center justify-center">
            <LockKeyhole className="w-7 h-7 text-steel-950" />
          </div>
          <div>
            <h1 className="text-xl font-black text-steel-50">
              نظام Pack to Pack QMS
            </h1>
            <p className="text-sm text-steel-400 mt-1">
              أدخل كلمة المرور للوصول إلى النظام
            </p>
          </div>
        </div>
        <div>
          <label className="label-field">نوع الدخول</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("recorder")}
              className={`btn-secondary ${role === "recorder" ? "ring-2 ring-warning-500" : ""}`}
            >
              تسجيل البيانات
            </button>
            <button
              type="button"
              onClick={() => setRole("manager")}
              className={`btn-secondary flex items-center justify-center gap-2 ${role === "manager" ? "ring-2 ring-warning-500" : ""}`}
            >
              <ShieldCheck className="w-4 h-4" /> دخول المدير
            </button>
          </div>
        </div>
        <div>
          <label className="label-field" htmlFor="system-password">
            كلمة المرور
          </label>
          <input
            id="system-password"
            autoFocus
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            className="input-field text-center tracking-[0.3em]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {role === "manager" && (
            <p className="text-xs text-steel-400 mt-1">
              وضع المدير للعرض والمتابعة فقط
            </p>
          )}
        </div>
        {error && (
          <p className="text-danger-300 text-sm font-semibold text-center">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={checking || !password}
          className="btn-primary w-full"
        >
          {checking ? "جاري التحقق..." : "دخول آمن"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticatedState] = useState(isAuthenticated);
  const [role, setRole] = useState(getAuthRole);
  const { loading } = useApp();

  const lockSystem = () => {
    setAuthenticated(false);
    setAuthenticatedState(false);
    setRole("recorder");
  };

  const renderView = () => {
    switch (view) {
      case VIEWS.NEW_INSPECTION:
        return role === "manager" ? (
          <Dashboard readOnly />
        ) : (
          <InspectionForm onDone={() => setView(VIEWS.DASHBOARD)} />
        );
      case VIEWS.CAPA:
        return <CapaTracker readOnly={role === "manager"} />;
      case VIEWS.SHIFT_ISSUES:
        return <ShiftIssuesPage readOnly={role === "manager"} />;
      case VIEWS.REPORTS:
        return <ReportsPage />;
      case VIEWS.BACKUP:
        return <BackupPage readOnly={role === "manager"} />;
      case VIEWS.DASHBOARD:
      default:
        return (
          <Dashboard
            readOnly={role === "manager"}
            onNewInspection={() => setView(VIEWS.NEW_INSPECTION)}
          />
        );
    }
  };

  if (!authenticated) {
    return (
      <LoginScreen
        onAuthenticated={(nextRole) => {
          setRole(nextRole);
          setAuthenticatedState(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-steel-950 text-steel-300">
        <div className="animate-pulse text-lg">جاري تحميل النظام...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-steel-950 flex" dir="rtl">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        readOnly={role === "manager"}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onNewInspection={() => setView(VIEWS.NEW_INSPECTION)}
          onLock={lockSystem}
          readOnly={role === "manager"}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
