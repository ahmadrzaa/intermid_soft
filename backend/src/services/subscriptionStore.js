// backend/src/services/subscriptionStore.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureUsersFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");
}

export function readUsersSafe() {
  ensureUsersFile();
  try {
    const txt = fs.readFileSync(USERS_FILE, "utf8").trim();
    if (!txt) return [];
    return JSON.parse(txt);
  } catch {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
    return [];
  }
}

export function writeUsersSafe(arr) {
  ensureUsersFile();
  const tmp = USERS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2), "utf8");
  fs.renameSync(tmp, USERS_FILE);
}

export function findUserById(userId) {
  const users = readUsersSafe();
  return users.find((u) => String(u.id) === String(userId)) || null;
}

export function updateUserById(userId, patcherFn) {
  const users = readUsersSafe();
  const idx = users.findIndex((u) => String(u.id) === String(userId));
  if (idx < 0) return null;

  const current = users[idx];
  const updated = patcherFn({ ...current }) || current;

  users[idx] = updated;
  writeUsersSafe(users);
  return updated;
}

export function upsertSubscription(userId, subPatch) {
  return updateUserById(userId, (u) => {
    const prev = (u.subscription && typeof u.subscription === "object") ? u.subscription : {};
    u.subscription = { ...prev, ...subPatch };
    return u;
  });
}
