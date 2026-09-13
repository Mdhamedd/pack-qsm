import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as db from "../utils/dataAdapter";
import {
  DECISIONS,
  SCRAP_RATE_ALERT_THRESHOLD,
  CAPA_STATUS,
} from "../data/constants";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [inspections, setInspections] = useState([]);
  const [shiftIssues, setShiftIssues] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    whatsappNumber: "",
    qualityManagerName: "",
    productionManagerName: "",
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [list, s, productList] = await Promise.all([
      db.getInspections(),
      db.getSettings(),
      db.getProducts(),
    ]);
    const issueList = await db.getShiftIssues();
    setInspections(list);
    setShiftIssues(issueList);
    setSettings(s);
    setProducts(productList);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [refresh]);

  const addInspection = useCallback(async (data) => {
    const record = await db.saveInspection(data);
    setInspections((prev) => [record, ...prev]);
    return record;
  }, []);

  const editInspection = useCallback(async (id, patch) => {
    const updated = await db.updateInspection(id, patch);
    setInspections((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const removeInspection = useCallback(async (id) => {
    await db.deleteInspection(id);
    setInspections((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addShiftIssue = useCallback(async (data) => {
    const record = await db.saveShiftIssue(data);
    setShiftIssues((prev) => [record, ...prev]);
    return record;
  }, []);

  const editShiftIssue = useCallback(async (id, patch) => {
    const updated = await db.updateShiftIssue(id, patch);
    setShiftIssues((prev) =>
      prev.map((issue) => (issue.id === id ? updated : issue)),
    );
    return updated;
  }, []);

  const removeShiftIssue = useCallback(async (id) => {
    await db.deleteShiftIssue(id);
    setShiftIssues((prev) => prev.filter((issue) => issue.id !== id));
  }, []);

  const updateSettings = useCallback(
    async (patch) => {
      const updated = { ...settings, ...patch };
      await db.saveSettings(updated);
      setSettings(updated);
      return updated;
    },
    [settings],
  );

  const addProduct = useCallback(
    async (productName) => {
      const name = productName.trim();
      if (!name) throw new Error("يرجى كتابة اسم المنتج");
      if (
        products.some((product) => product.toLowerCase() === name.toLowerCase())
      ) {
        throw new Error("هذا المنتج موجود بالفعل");
      }
      const updated = await db.saveProducts([...products, name]);
      setProducts(updated);
      return name;
    },
    [products],
  );

  // -------------------- KPIs المشتقة --------------------
  const kpis = useMemo(() => {
    const total = inspections.length;
    const rejected = inspections.filter(
      (i) => i.decision === DECISIONS.REJECTED,
    ).length;
    const conditional = inspections.filter(
      (i) => i.decision === DECISIONS.CONDITIONAL,
    ).length;
    const accepted = inspections.filter(
      (i) => i.decision === DECISIONS.ACCEPTED,
    ).length;
    const scrapRate = total > 0 ? (rejected / total) * 100 : 0;

    const openCases = inspections.filter(
      (i) =>
        (i.decision === DECISIONS.REJECTED ||
          i.decision === DECISIONS.CONDITIONAL) &&
        (!i.capaStatus ||
          i.capaStatus === CAPA_STATUS.OPEN ||
          i.capaStatus === CAPA_STATUS.IN_PROGRESS),
    );

    const criticalOpenCases = openCases.filter((i) =>
      (i.defects || []).some((d) => d.severity === "حرج"),
    );

    const isAlert =
      scrapRate > SCRAP_RATE_ALERT_THRESHOLD || criticalOpenCases.length > 0;

    // تحليل باريتو للعيوب
    const defectCounts = {};
    inspections.forEach((i) => {
      (i.defects || []).forEach((d) => {
        defectCounts[d.type] = (defectCounts[d.type] || 0) + 1;
      });
    });
    const paretoData = Object.entries(defectCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      rejected,
      conditional,
      accepted,
      scrapRate,
      openCases,
      openCasesCount: openCases.length,
      criticalOpenCasesCount: criticalOpenCases.length,
      isAlert,
      paretoData,
    };
  }, [inspections]);

  const value = {
    inspections,
    shiftIssues,
    products,
    settings,
    loading,
    isOnline,
    kpis,
    refresh,
    addInspection,
    editInspection,
    removeInspection,
    addShiftIssue,
    editShiftIssue,
    removeShiftIssue,
    updateSettings,
    addProduct,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
