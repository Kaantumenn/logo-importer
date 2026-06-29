import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/as_cimento_logo_white.png");
const iconsDir = path.join(root, "public/icons");

fs.mkdirSync(iconsDir, { recursive: true });

const background = { r: 11, g: 18, b: 32, alpha: 1 };

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background,
    })
    .png()
    .toFile(path.join(iconsDir, name));

  console.log(`Oluşturuldu: public/icons/${name}`);
}
