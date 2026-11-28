#!/usr/bin/env node
/**
 * Chuẩn bị fixture cho API 01 trên EShop disposable.
 *
 * Lệnh:
 *   node scripts/prepare-api01-fixtures.mjs setup
 *   node scripts/prepare-api01-fixtures.mjs reset
 *   node scripts/prepare-api01-fixtures.mjs cleanup
 *
 * setup tạo Newman environment tạm ngoài workspace và chỉ in đường dẫn.
 * Gọi reset trước từng test case và từng hàng DDT để phục hồi snapshot.
 * Chạy Newman tuần tự; cleanup xóa đúng hai user fixture và environment.
 */

import crypto from "node:crypto";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import fs from "node:fs/promises";
import net from "node:net";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const DISPOSABLE = path.join(ROOT, ".runtime", "eshop-sut");
const SOURCE_SERVER = path.join(ROOT, "eshop-sut", "backend", "server.js");
const SOURCE_DATABASE_MODULE = path.join(ROOT, "eshop-sut", "backend", "database.js");
const SOURCE_DB = path.join(ROOT, "eshop-sut", "backend", "database.sqlite");
const DISPOSABLE_SERVER = path.join(DISPOSABLE, "server.js");
const DISPOSABLE_DATABASE_MODULE = path.join(DISPOSABLE, "database.js");
const DISPOSABLE_DB = path.join(DISPOSABLE, "database.sqlite");
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STUDENT_ID = "23120274";
const PATH_KEY = crypto.createHash("sha256").update(ROOT).digest("hex").slice(0, 12);
const STATE_FILE = path.join(os.tmpdir(), `hw06-api01-${PATH_KEY}.state.json`);
const ENV_FILE = path.join(os.tmpdir(), `hw06-api01-${PATH_KEY}.postman_environment.json`);
const REQUEST_TIMEOUT_MS = 10_000;

const fail = (message) => {
  throw new Error(message);
};

function inside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function samePath(left, right) {
  return path.relative(left, right) === "";
}

function passwordStorageMode(serverSource) {
  const registerStart = serverSource.indexOf('app.post("/api/register"');
  const loginStart = serverSource.indexOf('app.post("/api/login"');
  const nextRoute = serverSource.indexOf('app.post("/api/forgot-password"', loginStart);
  if (registerStart < 0 || loginStart < 0 || nextRoute < 0) return "unrecognized";
  const registerCode = serverSource.slice(registerStart, loginStart);
  const loginCode = serverSource.slice(loginStart, nextRoute);
  if (/\b(?:bcrypt|argon2|scrypt|pbkdf2)\b/i.test(registerCode)) return "hashed-or-derived";
  if (/INSERT\s+INTO\s+users\s*\(name,\s*email,\s*password\)/i.test(registerCode) && /\[name,\s*email,\s*password\]/.test(registerCode) && /user\.password\s*===\s*password/.test(loginCode)) {
    return "plaintext-source-behavior";
  }
  return "other-or-unrecognized";
}

async function verifyFilesAndDependencies({ requireNewman = false } = {}) {
  const expectedDisposable = path.resolve(ROOT, ".runtime", "eshop-sut");
  if (path.resolve(DISPOSABLE) !== expectedDisposable || !inside(path.resolve(ROOT, ".runtime"), path.resolve(DISPOSABLE))) {
    fail("Đường dẫn SUT không phải bản disposable dự kiến.");
  }
  if (path.resolve(DISPOSABLE) === path.resolve(ROOT, "eshop-sut") || !inside(path.resolve(ROOT, ".runtime"), path.resolve(DISPOSABLE_DB))) {
    fail("Từ chối thao tác vì đường dẫn có thể trỏ tới source/database gốc.");
  }

  for (const file of [DISPOSABLE_SERVER, DISPOSABLE_DATABASE_MODULE, DISPOSABLE_DB, path.join(DISPOSABLE, "package.json")]) {
    await fs.access(file);
  }

  const [rootRealPath, runtimeRealPath, disposableRealPath, sourceRealPath, sourceServerRealPath, disposableServerRealPath, sourceDatabaseModuleRealPath, disposableDatabaseModuleRealPath, sourceDatabaseRealPath, disposableDatabaseRealPath, sourceDatabaseStat, disposableDatabaseStat] = await Promise.all([
    fs.realpath(ROOT),
    fs.realpath(path.join(ROOT, ".runtime")),
    fs.realpath(DISPOSABLE),
    fs.realpath(path.join(ROOT, "eshop-sut")),
    fs.realpath(SOURCE_SERVER),
    fs.realpath(DISPOSABLE_SERVER),
    fs.realpath(SOURCE_DATABASE_MODULE),
    fs.realpath(DISPOSABLE_DATABASE_MODULE),
    fs.realpath(SOURCE_DB),
    fs.realpath(DISPOSABLE_DB),
    fs.stat(SOURCE_DB, { bigint: true }),
    fs.stat(DISPOSABLE_DB, { bigint: true }),
  ]);
  if (!samePath(runtimeRealPath, path.join(rootRealPath, ".runtime")) ||
      !samePath(disposableRealPath, path.join(runtimeRealPath, "eshop-sut")) ||
      !inside(runtimeRealPath, disposableRealPath) || samePath(disposableRealPath, sourceRealPath)) {
    fail("realpath của backend disposable trỏ ra ngoài .runtime hoặc trùng source SUT.");
  }
  if (!samePath(disposableServerRealPath, path.join(disposableRealPath, "server.js")) || samePath(disposableServerRealPath, sourceServerRealPath)) {
    fail("server.js disposable đi qua symlink/junction không an toàn.");
  }
  if (!samePath(disposableDatabaseModuleRealPath, path.join(disposableRealPath, "database.js")) || samePath(disposableDatabaseModuleRealPath, sourceDatabaseModuleRealPath)) {
    fail("database.js disposable đi qua symlink/junction không an toàn.");
  }
  if (!samePath(disposableDatabaseRealPath, path.join(disposableRealPath, "database.sqlite")) || samePath(disposableDatabaseRealPath, sourceDatabaseRealPath)) {
    fail("database disposable đi qua symlink/junction hoặc trỏ tới database gốc.");
  }
  const databaseFileIdentity = `${disposableDatabaseStat.dev}:${disposableDatabaseStat.ino}`;
  if (sourceDatabaseStat.dev === disposableDatabaseStat.dev && sourceDatabaseStat.ino === disposableDatabaseStat.ino) {
    fail("Database disposable và database gốc cùng file identity; từ chối ghi.");
  }

  const [sourceBytes, disposableBytes, sourceDbBytes, disposableDbBytes] = await Promise.all([
    fs.readFile(SOURCE_SERVER),
    fs.readFile(DISPOSABLE_SERVER),
    fs.readFile(SOURCE_DATABASE_MODULE),
    fs.readFile(DISPOSABLE_DATABASE_MODULE),
  ]);
  const sourceHash = crypto.createHash("sha256").update(sourceBytes).digest("hex");
  const disposableHash = crypto.createHash("sha256").update(disposableBytes).digest("hex");
  const sourceDbHash = crypto.createHash("sha256").update(sourceDbBytes).digest("hex");
  const disposableDbHash = crypto.createHash("sha256").update(disposableDbBytes).digest("hex");
  if (sourceHash !== disposableHash || sourceDbHash !== disposableDbHash) {
    fail("Backend/database module disposable không khớp source SUT; dừng để tránh kiểm thử nhầm phiên bản.");
  }
  if (!/\bconst\s+PORT\s*=\s*3000\s*;/.test(disposableBytes.toString("utf8"))) {
    fail("Backend disposable không khai báo port 3000 như dự kiến.");
  }

  const runtimeRequire = createRequire(path.join(DISPOSABLE, "package.json"));
  let newmanVersion = "not checked";
  if (requireNewman) {
    const newmanManifest = JSON.parse(await fs.readFile(path.join(ROOT, "node_modules", "newman", "package.json"), "utf8"));
    const newmanBin = path.join(ROOT, "node_modules", ".bin", process.platform === "win32" ? "newman.cmd" : "newman");
    await fs.access(newmanBin);
    newmanVersion = newmanManifest.version;
  }
  const runtimePackage = JSON.parse(await fs.readFile(path.join(DISPOSABLE, "package.json"), "utf8"));
  for (const dependency of ["sqlite3", "jsonwebtoken"]) {
    if (!runtimePackage.dependencies?.[dependency]) fail(`Disposable SUT thiếu dependency ${dependency}.`);
    runtimeRequire.resolve(dependency);
  }

  return {
    newmanVersion,
    sourceHash,
    databaseModuleHash: sourceDbHash,
    rootRealPath,
    disposableRealPath,
    serverRealPath: disposableServerRealPath,
    databaseModuleRealPath: disposableDatabaseModuleRealPath,
    databaseRealPath: disposableDatabaseRealPath,
    databaseFileIdentity,
    passwordStorageMode: passwordStorageMode(disposableBytes.toString("utf8")),
  };
}

function listenPidOnPort() {
  if (process.platform === "win32") {
    const output = execFileSync("netstat.exe", ["-ano", "-p", "tcp"], { encoding: "utf8", windowsHide: true });
    const pids = new Set();
    for (const line of output.split(/\r?\n/)) {
      const fields = line.trim().split(/\s+/);
      if (fields.length >= 5 && fields[0].toUpperCase() === "TCP" && fields[3].toUpperCase() === "LISTENING" && /:3000$/.test(fields[1])) {
        const pid = Number(fields[4]);
        if (Number.isInteger(pid) && pid > 0) pids.add(pid);
      }
    }
    return [...pids];
  }

  try {
    const output = execFileSync("lsof", ["-nP", "-t", "-iTCP:3000", "-sTCP:LISTEN"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return [...new Set(output.split(/\r?\n/).map(Number).filter((pid) => Number.isInteger(pid) && pid > 0))];
  } catch (error) {
    if (error.status === 1) return [];
    if (error.code !== "ENOENT") fail("Không xác định được tiến trình đang giữ port 3000 trên nền tảng này.");
  }
  try {
    const output = execFileSync("ss", ["-ltnp"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const pids = new Set();
    for (const line of output.split(/\r?\n/)) {
      if (/\bLISTEN\b/.test(line) && /:3000\b/.test(line)) {
        for (const match of line.matchAll(/\bpid=(\d+)/g)) pids.add(Number(match[1]));
      }
    }
    return [...pids];
  } catch {
    fail("Không xác định được tiến trình đang giữ port 3000 trên nền tảng này.");
  }
}

function processInfoForPid(pid) {
  try {
    if (process.platform === "win32") {
      const command = `$p = Get-CimInstance Win32_Process -Filter 'ProcessId = ${Number(pid)}'; if ($p) { [PSCustomObject]@{ commandLine = $p.CommandLine; startedAt = $p.CreationDate.ToUniversalTime().ToString('o') } | ConvertTo-Json -Compress }`;
      const output = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], { encoding: "utf8", windowsHide: true }).trim();
      return output ? JSON.parse(output) : null;
    }
    const commandLine = execFileSync("ps", ["-p", String(pid), "-o", "args="], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (!commandLine) return null;
    if (process.platform === "linux") {
      const stat = fs.readFile(`/proc/${pid}/stat`, "utf8");
      return stat.then((contents) => {
        const tail = contents.slice(contents.lastIndexOf(")") + 2).trim().split(/\s+/);
        return { commandLine, startedAt: tail[19] || "" };
      });
    }
    const startedAt = execFileSync("ps", ["-p", String(pid), "-o", "lstart="], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return { commandLine, startedAt };
  } catch {
    return null;
  }
}

function isDisposableBackend(pid, expectedStartedAt) {
  const infoPromise = processInfoForPid(pid);
  if (infoPromise && typeof infoPromise.then === "function") {
    return infoPromise.then((info) => Boolean(
      info && typeof info.commandLine === "string" && typeof info.startedAt === "string" &&
      info.commandLine.toLowerCase().includes(path.resolve(DISPOSABLE_SERVER).toLowerCase()) &&
      (!expectedStartedAt || info.startedAt === expectedStartedAt),
    ));
  }
  return Boolean(
    infoPromise && typeof infoPromise.commandLine === "string" && typeof infoPromise.startedAt === "string" &&
    infoPromise.commandLine.toLowerCase().includes(path.resolve(DISPOSABLE_SERVER).toLowerCase()) &&
    (!expectedStartedAt || infoPromise.startedAt === expectedStartedAt),
  );
}

function assertSamePaths(state, verified) {
  for (const key of ["sourceHash", "databaseModuleHash", "rootRealPath", "disposableRealPath", "serverRealPath", "databaseModuleRealPath", "databaseRealPath", "databaseFileIdentity"]) {
    if (state[key] !== verified[key]) fail("Workspace, disposable backend hoặc database đã đổi kể từ setup; state cũ không được dùng.");
  }
}

async function assertBackendLifecycle(state) {
  const listeners = listenPidOnPort();
  if (listeners.length !== 1 || listeners[0] !== state.backend.pid) {
    fail("Backend đã dừng/khởi động lại hoặc port 3000 đổi chủ; reset dừng an toàn. Không tự khởi động lại vì database.js gọi initDatabase() khi backend nạp module, có thể xóa và tạo lại bảng. Dùng cleanup để xóa fixture state cũ.");
  }
  if (!(await isDisposableBackend(state.backend.pid, state.backend.startedAt))) {
    fail("Không xác minh được đúng PID, command line và thời điểm tạo backend disposable; reset dừng an toàn.");
  }
}

async function verifyEnvironmentMatchesState(state) {
  let environment;
  try { environment = JSON.parse(await fs.readFile(ENV_FILE, "utf8")); }
  catch { fail("Newman environment không đọc được; state không được dùng."); }
  const values = new Map((environment.values || []).filter((item) => item?.enabled !== false).map((item) => [item.key, item.value]));
  const expected = [
    ["baseUrl", BASE_URL], ["studentId", STUDENT_ID],
    ["token_U1", state.U1.token], ["token_U2", state.U2.token],
    ["user_id_U1", String(state.U1.id)], ["user_id_U2", String(state.U2.id)],
    ["email_U1", state.U1.email], ["email_U2", state.U2.email],
    ["password_U1", state.U1.loginPassword], ["password_U2", state.U2.loginPassword],
    ["invalid_signature_token_U1", state.invalidSignatureTokenU1],
    ["expired_token_U1", state.expiredTokenU1],
  ];
  if (expected.some(([key, value]) => values.get(key) !== value)) {
    fail("Newman environment không khớp state fixture; dừng để tránh dùng token hoặc dữ liệu cũ.");
  }
  for (const label of ["U1", "U2"]) {
    let snapshot;
    try { snapshot = JSON.parse(values.get(`snapshot_${label}`)); }
    catch { fail("Snapshot trong Newman environment không hợp lệ."); }
    assertFields(snapshot, state[label].snapshot, ["id", "email", "role", "name", "shipping_address", "phone"], `Environment ${label}`);
  }
}

async function stopBackendStartedByThisScript(backend) {
  if (!backend?.startedByScript || !backend.startedAt || !(await isDisposableBackend(backend.pid, backend.startedAt))) return false;
  process.kill(backend.pid);
  return true;
}

async function portIsFree() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    server.listen(PORT, "127.0.0.1", () => server.close((error) => error ? reject(error) : resolve(true)));
  });
}

async function ensureDisposableBackend() {
  const listeners = listenPidOnPort();
  if (listeners.length > 0) {
    if (listeners.length !== 1 || !(await isDisposableBackend(listeners[0]))) {
      fail("Port 3000 đang do tiến trình khác hoặc không xác minh được backend disposable; không gửi request.");
    }
    const info = await processInfoForPid(listeners[0]);
    return { pid: listeners[0], startedAt: info.startedAt, startedByScript: false };
  }
  if (!(await portIsFree())) fail("Port 3000 đang bận nhưng không xác định được tiến trình sở hữu.");

  const child = spawn(process.execPath, [DISPOSABLE_SERVER], {
    cwd: DISPOSABLE,
    stdio: "ignore",
    windowsHide: true,
    detached: true,
  });
  child.unref();
  let childStartedAt;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    await delay(250);
    const current = listenPidOnPort();
    if (current.includes(child.pid)) {
      if (!(await isDisposableBackend(child.pid))) fail("Tiến trình mở port 3000 không khớp backend disposable.");
      const info = await processInfoForPid(child.pid);
      return { pid: child.pid, startedAt: info.startedAt, startedByScript: true };
    }
    const info = await processInfoForPid(child.pid);
    if (info && info.commandLine.toLowerCase().includes(path.resolve(DISPOSABLE_SERVER).toLowerCase())) childStartedAt = info.startedAt;
    if (child.exitCode !== null) fail("Backend disposable thoát trước khi mở port 3000.");
  }
  await stopBackendStartedByThisScript({ pid: child.pid, startedAt: childStartedAt, startedByScript: true });
  fail("Backend disposable không mở port 3000 trong thời gian chờ.");
}

async function requestJson(endpoint, body, token, method = body === undefined ? "GET" : "POST") {
  const headers = { "X-Student-Id": STUDENT_ID };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token !== undefined) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await response.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  if (!response.ok || !parsed) fail(`Request fixture thất bại (${response.status}); nội dung response được ẩn.`);
  return parsed;
}

function randomPassword() {
  return `${crypto.randomBytes(24).toString("base64url")}aA1!`;
}

function profileFor(label, salt) {
  const fixtureIndex = label === "U1" ? 1 : label === "U2" ? 2 : 0;
  if (fixtureIndex === 0) fail("Chỉ hỗ trợ profile cho U1 hoặc U2.");
  const phoneBase = 100_000_000 + Number(BigInt(`0x${salt}`) % 899_999_998n);
  return {
    name: `HW06 ${label} ${salt}`,
    shipping_address: `${label} ${salt} Nguyen Trai, Q5, TP.HCM`,
    phone: `0${phoneBase + fixtureIndex}`,
  };
}

function value(key, value) {
  return { key, value: typeof value === "string" ? value : JSON.stringify(value), type: "default", enabled: true };
}

function flipJwtSignature(token) {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[2]) fail("JWT fixture không có đúng ba phần.");
  parts[2] = `${parts[2][0] === "A" ? "B" : "A"}${parts[2].slice(1)}`;
  return parts.join(".");
}

function openDatabase() {
  const runtimeRequire = createRequire(path.join(DISPOSABLE, "package.json"));
  const sqlite3 = runtimeRequire("sqlite3").verbose();
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DISPOSABLE_DB, (error) => error ? reject(error) : resolve(db));
  });
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    if (error) reject(error);
    else resolve({ changes: this.changes, lastID: this.lastID });
  }));
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function assertFields(actual, expected, fields, label) {
  for (const field of fields) {
    if (actual?.[field] !== expected[field]) fail(`${label}: snapshot không khớp field ${field}.`);
  }
}

function dbClose(db) {
  return new Promise((resolve, reject) => db.close((error) => error ? reject(error) : resolve()));
}

async function createFixture(db, label, suffix) {
  const email = `hw06-${suffix}-${label.toLowerCase()}@example.com`;
  const loginPassword = randomPassword();
  const profile = profileFor(label, suffix);
  const registered = await requestJson("/api/register", { ...profile, email, password: loginPassword });
  if (!Number.isInteger(registered.id)) fail("Không nhận được ID fixture từ endpoint đăng ký.");
  const login = await requestJson("/api/login", { email, password: loginPassword });
  if (typeof login.token !== "string" || login.token.split(".").length !== 3) fail("Đăng nhập fixture không trả JWT hợp lệ.");
  await requestJson("/api/users/me", profile, login.token, "PUT");
  const observed = await requestJson("/api/users/me", undefined, login.token);
  const stored = await dbGet(
    db,
    "SELECT id, email, password, role, name, shipping_address, phone FROM users WHERE id = ? AND email = ?",
    [registered.id, email],
  );
  if (!stored) fail("Không tìm thấy fixture đúng ID/email trong database disposable.");
  const snapshot = {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    shipping_address: stored.shipping_address,
    phone: stored.phone,
    role: stored.role,
  };
  assertFields(observed, snapshot, ["id", "email", "name", "shipping_address", "phone", "role"], "Snapshot API");
  assertFields(stored, snapshot, ["id", "email", "name", "shipping_address", "phone", "role"], "Snapshot database");
  assertFields(snapshot, profile, ["name", "shipping_address", "phone"], "Dữ liệu hồ sơ fixture");
  if (snapshot.role !== "user" || !snapshot.name || !snapshot.shipping_address || !snapshot.phone) {
    fail("Snapshot fixture thiếu field hoặc role không phải user; dừng thay vì tự giả định.");
  }
  if (typeof stored.password !== "string" || stored.password.length === 0) fail("Không đọc được giá trị password đã lưu của fixture.");
  return { ...snapshot, snapshot, loginPassword, storedPassword: stored.password, token: login.token };
}

async function readState() {
  let state;
  try { state = JSON.parse(await fs.readFile(STATE_FILE, "utf8")); }
  catch { fail("Không tìm thấy state fixture tạm; chạy setup trước."); }
  if (state.version !== 2 || state.root !== ROOT || state.disposable !== DISPOSABLE || state.database !== DISPOSABLE_DB) {
    fail("State fixture không khớp workspace/disposable hiện tại.");
  }
  return state;
}

async function verifyFixtureRestored(db, fixture) {
  const stored = await dbGet(
    db,
    "SELECT id, email, password, role, name, shipping_address, phone FROM users WHERE id = ? AND email = ?",
    [fixture.id, fixture.email],
  );
  if (!stored) fail("Fixture không còn đúng ID/email sau reset.");
  assertFields(stored, fixture.snapshot, ["id", "email", "role", "name", "shipping_address", "phone"], "Xác minh database sau reset");
  if (stored.password !== fixture.storedPassword) fail("Giá trị password lưu trong database chưa được khôi phục đúng snapshot.");

  const observed = await requestJson("/api/users/me", undefined, fixture.token);
  assertFields(observed, fixture.snapshot, ["id", "email", "role", "name", "shipping_address", "phone"], "Xác minh API sau reset");
}

function environmentDocument(state) {
  const entries = [
    value("baseUrl", BASE_URL), value("studentId", STUDENT_ID),
    value("token_U1", state.U1.token), value("token_U2", state.U2.token),
    value("user_id_U1", String(state.U1.id)), value("user_id_U2", String(state.U2.id)),
    value("email_U1", state.U1.email), value("email_U2", state.U2.email),
    value("password_U1", state.U1.loginPassword), value("password_U2", state.U2.loginPassword),
    value("snapshot_U1", state.U1.snapshot), value("snapshot_U2", state.U2.snapshot),
    value("invalid_signature_token_U1", state.invalidSignatureTokenU1),
    value("expired_token_U1", state.expiredTokenU1),
  ];
  return {
    id: crypto.randomUUID(),
    name: "HW06 API01 disposable fixtures",
    values: entries,
    _postman_variable_scope: "environment",
    _postman_exported_at: new Date().toISOString(),
    _postman_exported_using: `Newman ${state.newmanVersion}`,
  };
}

async function savePrivateJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  if (process.platform !== "win32") await fs.chmod(file, 0o600);
}

function publishNonSecretOutput(statePath) {
  const outputLine = `newman_environment=${statePath}${os.EOL}`;
  if (process.env.GITHUB_OUTPUT) {
    return fs.appendFile(process.env.GITHUB_OUTPUT, outputLine, { encoding: "utf8" });
  }
  console.log(`Newman environment tạm: ${statePath}`);
}

async function setup() {
  if (await fs.stat(STATE_FILE).then(() => true, () => false) || await fs.stat(ENV_FILE).then(() => true, () => false)) {
    fail("Đã có fixture tạm từ lần trước; cleanup trước khi setup lại.");
  }
  const verified = await verifyFilesAndDependencies({ requireNewman: true });
  const { newmanVersion, sourceHash } = verified;
  const backend = await ensureDisposableBackend();
  const suffix = crypto.randomBytes(8).toString("hex");
  const createdEmails = ["u1", "u2"].map((label) => `hw06-${suffix}-${label}@example.com`);
  let db;
  let state;
  try {
    db = await openDatabase();
    const U1 = await createFixture(db, "U1", suffix);
    state = { version: 2, root: ROOT, disposable: DISPOSABLE, database: DISPOSABLE_DB, ...verified, newmanVersion, backend, U1 };
    const U2 = await createFixture(db, "U2", suffix);
    if (U1.id === U2.id || U1.email === U2.email || U1.name === U2.name || U1.shipping_address === U2.shipping_address || U1.phone === U2.phone) {
      fail("U1/U2 không có ID, email và snapshot độc lập.");
    }
    state.U2 = U2;
    const serverText = await fs.readFile(DISPOSABLE_SERVER, "utf8");
    const secretMatch = serverText.match(/\bconst\s+SECRET_KEY\s*=\s*(["'])(.*?)\1\s*;/);
    if (!secretMatch?.[2]) fail("Không đọc được signing key trong source disposable; không tạo token hết hạn.");
    const jwt = createRequire(path.join(DISPOSABLE, "package.json"))("jsonwebtoken");
    state.invalidSignatureTokenU1 = flipJwtSignature(U1.token);
    state.expiredTokenU1 = jwt.sign(
      { id: U1.id, role: U1.role, exp: Math.floor(Date.now() / 1000) - 60 },
      secretMatch[2],
      { noTimestamp: true },
    );
    await assertBackendLifecycle(state);
    await savePrivateJson(STATE_FILE, state);
    await savePrivateJson(ENV_FILE, environmentDocument(state));
    await publishNonSecretOutput(ENV_FILE);
    console.log(`Fixture U1/U2 sẵn sàng trên backend disposable; Newman ${newmanVersion}; chưa chạy test case.`);
  } catch (error) {
    if (db) await dbRun(db, "DELETE FROM users WHERE email IN (?, ?)", createdEmails).catch(() => undefined);
    await Promise.all([fs.rm(STATE_FILE, { force: true }), fs.rm(ENV_FILE, { force: true })]);
    await stopBackendStartedByThisScript(backend);
    throw error;
  } finally {
    if (db) await dbClose(db);
  }
}

async function reset() {
  const state = await readState();
  const verified = await verifyFilesAndDependencies();
  assertSamePaths(state, verified);
  await verifyEnvironmentMatchesState(state);
  await assertBackendLifecycle(state);
  const db = await openDatabase();
  try {
    await dbRun(db, "BEGIN IMMEDIATE");
    for (const fixture of [state.U1, state.U2]) {
      const result = await dbRun(
        db,
        "UPDATE users SET name = ?, email = ?, password = ?, role = ?, login_attempts = 0, locked_until = NULL, reset_token = NULL, shipping_address = ?, phone = ? WHERE id = ? AND email = ?",
        [fixture.snapshot.name, fixture.snapshot.email, fixture.storedPassword, fixture.snapshot.role, fixture.snapshot.shipping_address, fixture.snapshot.phone, fixture.snapshot.id, fixture.snapshot.email],
      );
      if (result.changes !== 1) fail("Không tìm thấy đúng user fixture để reset.");
    }
    await dbRun(db, "COMMIT");
    await verifyFixtureRestored(db, state.U1);
    await verifyFixtureRestored(db, state.U2);
    await assertBackendLifecycle(state);
  } catch (error) {
    await dbRun(db, "ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await dbClose(db);
  }
  console.log("Đã reset fixture U1/U2 về snapshot; không gọi test case.");
}

async function cleanup() {
  const state = await readState();
  const verified = await verifyFilesAndDependencies();
  assertSamePaths(state, verified);
  const db = await openDatabase();
  let deletedFixtures = 0;
  let absentFixtures = 0;
  try {
    await dbRun(db, "BEGIN IMMEDIATE");
    for (const fixture of [state.U1, state.U2]) {
      const existing = await dbGet(db, "SELECT id, email FROM users WHERE id = ?", [fixture.snapshot.id]);
      if (!existing) {
        absentFixtures += 1;
        continue;
      }
      if (existing.id !== fixture.snapshot.id || existing.email !== fixture.snapshot.email) {
        fail("Cleanup không tìm thấy đúng ID/email fixture; không xóa hàng khác.");
      }
      const deleted = await dbRun(db, "DELETE FROM users WHERE id = ? AND email = ?", [fixture.snapshot.id, fixture.snapshot.email]);
      if (deleted.changes !== 1) fail("Cleanup không xóa đúng một user fixture.");
      deletedFixtures += 1;
    }
    await dbRun(db, "COMMIT");
  } catch (error) {
    await dbRun(db, "ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await dbClose(db);
  }
  const backendStopped = await stopBackendStartedByThisScript(state.backend);
  await Promise.all([fs.rm(STATE_FILE, { force: true }), fs.rm(ENV_FILE, { force: true })]);
  console.log(`Đã dọn ${deletedFixtures} fixture; ${absentFixtures} fixture đã không còn trong database. Đã xóa state/environment tạm.${backendStopped ? " Đã dừng backend do script khởi chạy." : " Không dừng backend vì không xác minh được ownership."}`);
}

async function main() {
  const command = process.argv[2];
  if (!["setup", "reset", "cleanup"].includes(command)) {
    fail("Dùng: node scripts/prepare-api01-fixtures.mjs <setup|reset|cleanup>");
  }
  if (command === "setup") await setup();
  if (command === "reset") await reset();
  if (command === "cleanup") await cleanup();
}

main().catch((error) => {
  console.error(`Không hoàn tất chuẩn bị fixture: ${error.message}`);
  process.exitCode = 1;
});
