import assert from "node:assert/strict";
import { test } from "node:test";
import { CAPA_STATUS, DECISIONS } from "../data/constants.js";
import { isOpenCapaInspection } from "./capa.js";

test("CAPA in progress remains an open follow-up case", () => {
  assert.equal(
    isOpenCapaInspection({
      decision: DECISIONS.REJECTED,
      capaStatus: CAPA_STATUS.IN_PROGRESS,
    }),
    true,
  );
});

test("closed CAPA inspections are not counted as open cases", () => {
  assert.equal(
    isOpenCapaInspection({
      decision: DECISIONS.CONDITIONAL,
      capaStatus: CAPA_STATUS.CLOSED_OTHER,
    }),
    false,
  );
});

test("accepted inspections do not require CAPA follow-up", () => {
  assert.equal(
    isOpenCapaInspection({
      decision: DECISIONS.ACCEPTED,
      capaStatus: CAPA_STATUS.OPEN,
    }),
    false,
  );
});
