const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./images";
const outputDir = "./images-webp";

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

    sharp(fullPath)
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => console.log("Converted:", relativePath))
      .catch(err => console.error(err));
  });
}

processDirectory(inputDir);