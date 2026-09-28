import assert from "node:assert/strict";
import { test } from "node:test";

class MemoryStorage {
  values = new Map();
  failWriteAt = null;
  writes = 0;

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.writes += 1;
    if (this.writes === this.failWriteAt) {
      throw new Error("QuotaExceededError");
    }
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
const db = await import("./dataAdapter.js");

test("saveInspection preserves the caller-provided inspector name", async () => {
  storage.values.clear();
  storage.writes = 0;
  storage.failWriteAt = null;

  const record = await db.saveInspection({
    date: "2026-09-26",
    productName: "Test",
    inspectorName: "مفتش اختبار",
  });

  assert.equal(record.inspectorName, "مفتش اختبار");
});

test("saveInspection rejects when local storage is full", async () => {
  storage.failWriteAt = storage.writes + 1;

  await assert.rejects(
    db.saveInspection({ date: "2026-09-26", productName: "Test" }),
    /تعذر حفظ البيانات/,
  );
});

test("backup import rolls back earlier writes after a later write fails", async () => {
  const oldInspections = JSON.stringify([{ id: "existing" }]);
  storage.values.set("p2p_qms_inspections_v1", oldInspections);
  storage.values.set("p2p_qms_shift_issues_v1", JSON.stringify([]));
  storage.writes = 0;
  storage.failWriteAt = 2;

  await assert.rejects(
    db.importBackupObject({
      inspections: [{ id: "imported" }],
      shiftIssues: [{ id: "issue" }],
    }),
    /تعذر استرجاع النسخة الاحتياطية/,
  );
  assert.equal(storage.getItem("p2p_qms_inspections_v1"), oldInspections);
  assert.deepEqual(JSON.parse(storage.getItem("p2p_qms_shift_issues_v1")), []);
});
