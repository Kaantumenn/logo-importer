import { app, BrowserWindow, shell } from "electron";
import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_PORT = process.env.APP_PORT || "3003";
const ELECTRON_PORT = 38472;
const APP_NAME = "AS Çimento Çek Aktarım";

let mainWindow = null;
let serverProcess = null;

function isDev() {
  return !app.isPackaged;
}

function getProjectRoot() {
  if (isDev()) {
    return path.join(__dirname, "..");
  }
  return path.join(process.resourcesPath, "app");
}

function getStandaloneDir() {
  return path.join(getProjectRoot(), ".next", "standalone");
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadEnvironment() {
  const candidates = [
    path.join(path.dirname(process.execPath), ".env.local"),
    path.join(app.getPath("userData"), ".env.local"),
    path.join(getProjectRoot(), ".env.local"),
  ];

  if (isDev()) {
    candidates.unshift(path.join(getProjectRoot(), ".env.local"));
  }

  for (const filePath of candidates) {
    loadEnvFile(filePath);
  }

  const userEnv = path.join(app.getPath("userData"), ".env.local");
  const bundledExample = path.join(getProjectRoot(), ".env.example");

  if (!fs.existsSync(userEnv) && fs.existsSync(bundledExample)) {
    fs.mkdirSync(path.dirname(userEnv), { recursive: true });
    fs.copyFileSync(bundledExample, userEnv);
    loadEnvFile(userEnv);
  }
}

function waitForServer(url, timeoutMs = 60000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Uygulama sunucusu başlatılamadı."));
          return;
        }
        setTimeout(check, 500);
      });
    };

    check();
  });
}

function startStandaloneServer() {
  const standaloneDir = getStandaloneDir();
  const serverEntry = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Sunucu dosyası bulunamadı: ${serverEntry}`);
  }

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(ELECTRON_PORT),
      HOSTNAME: "127.0.0.1",
    },
    stdio: "inherit",
    windowsHide: true,
  });

  serverProcess.on("error", (error) => {
    console.error("Sunucu başlatma hatası:", error);
  });

  return waitForServer(`http://127.0.0.1:${ELECTRON_PORT}`);
}

async function createWindow() {
  const iconPath = path.join(getProjectRoot(), "public", "as_cimento_logo.png");

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: APP_NAME,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const url = isDev()
    ? `http://127.0.0.1:${DEV_PORT}`
    : `http://127.0.0.1:${ELECTRON_PORT}`;
  await mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
  serverProcess = null;
}

app.whenReady().then(async () => {
  loadEnvironment();

  if (!isDev()) {
    await startStandaloneServer();
  }

  await createWindow();
});

app.on("window-all-closed", () => {
  stopServer();
  app.quit();
});

app.on("before-quit", () => {
  stopServer();
});
