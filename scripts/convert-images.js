const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./images";
const outputDir = "./images-webp";

// 🔥 PRESETS (podés cambiar según necesidad)
const presets = {
  ui: { quality: 82, maxWidth: 1000, effort: 6 },
  web: { quality: 75, maxWidth: 1200, effort: 6 },
  high: { quality: 90, maxWidth: null, effort: 6 },
};

// 👉 Elegí el preset acá
const config = presets.ui;

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
      return;
    }

    if (!file.match(/\.(png|jpg|jpeg)$/i)) return;

    const relativePath = path.relative(inputDir, fullPath);
    const outputPath = path.join(
      outputDir,
      relativePath.replace(/\.(png|jpg|jpeg)$/i, ".webp")
    );

    const outputFolder = path.dirname(outputPath);

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    let pipeline = sharp(fullPath);

    // 🔹 Resize solo si maxWidth está definido
    if (config.maxWidth) {
      pipeline = pipeline.resize({
        width: config.maxWidth,
        withoutEnlargement: true,
      });
    }

    pipeline
      .webp({
        quality: config.quality,
        effort: config.effort,
      })
      .toFile(outputPath)
      .then(() => console.log("✅ Converted:", relativePath))
      .catch(err => console.error("❌ Error:", err));
  });
}

processDirectory(inputDir);