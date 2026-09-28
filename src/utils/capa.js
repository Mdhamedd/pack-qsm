import { CAPA_STATUS, DECISIONS } from "../data/constants.js";

export function isOpenCapaInspection(inspection) {
  const needsFollowUp =
    inspection.decision === DECISIONS.REJECTED ||
    inspection.decision === DECISIONS.CONDITIONAL;
  const isActive =
    !inspection.capaStatus ||
    inspection.capaStatus === CAPA_STATUS.OPEN ||
    inspection.capaStatus === CAPA_STATUS.IN_PROGRESS;

  return needsFollowUp && isActive;
}
