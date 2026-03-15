# 🖼️ Image to WebP Converter
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Sharp-000000?style=for-the-badge&logo=sharp&logoColor=white" />
</p>

A small CLI tool built with Node.js to convert **PNG** and **JPG** images into **WebP** using the Sharp image processing library.

The script scans folders, converts images in batch, and preserves the original directory structure.

---

## 📦 Installation

Install dependencies:

```bash
npm install
```
---

## 📁 Project Structure

```bash
project
│
├── images
├── images-webp
├── scripts
│   └── convert-images.js
└── package.json
```
- `images/` → original PNG/JPG files  
- `images-webp/` → generated WebP files  

---

## 🚀 Usage

Run the converter:
```bash
npm run convert:images
```
Or directly:
```bash
node scripts/convert-images.js
```

---

## 🔄 What the Script Does

- 🔍 Scans the `images` directory  
- 📂 Traverses subfolders  
- 🖼️ Converts `.png`, `.jpg`, `.jpeg` to **WebP**  
- 💾 Saves results in `images-webp`  
- 🧭 Preserves the folder structure  

---

## 👩‍💻 Author

**Cintia Losada (CinloDev)**  
🌐 https://www.cinlodev.com

