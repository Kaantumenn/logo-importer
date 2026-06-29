import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error("Standalone build bulunamadı. Önce `npm run build` çalıştırın.");
  process.exit(1);
}

fs.cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), {
  recursive: true,
});

console.log("Standalone paket hazır:", standaloneDir);
