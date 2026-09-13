const PASSWORD_HASH =
  "b0c9eaff47acfe01165c4a2fc5263ab6729478d21819faf83363f000f4ef94c1";
const MANAGER_PASSWORD_HASH =
  "866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5";
const SESSION_KEY = "p2p_qms_authenticated";
const ROLE_KEY = "p2p_qms_role";

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password) {
  const hash = await hashPassword(password);
  return hash === PASSWORD_HASH;
}

export async function verifyCredentials(password, role) {
  const hash = await hashPassword(password);
  return role === "manager"
    ? hash === MANAGER_PASSWORD_HASH
    : hash === PASSWORD_HASH;
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function setAuthenticated(value, role = "recorder") {
  if (value) {
    sessionStorage.setItem(SESSION_KEY, "true");
    sessionStorage.setItem(ROLE_KEY, role);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ROLE_KEY);
  }
}

export function getAuthRole() {
  return sessionStorage.getItem(ROLE_KEY) || "recorder";
}
