import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;


const uploadDir = path.join(__dirname, "upload");
import fs from "fs";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Разрешены только PDF-файлы"), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
});

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(`Успешно`);
  if (!req.file) {
    return res.status(400).json({ error: "Нет файла для загрузки" });
  }

  console.log("Файл сохранен:", {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
  });

  res.json({
    success: true,
    message: "Файл успешно загружен и сохранен",
    fileInfo: {
      originalName: req.file.originalname,
      savedName: req.file.filename,
      size: req.file.size,
      path: req.file.path,
    },
  });
});

app.get("/download/:filename", (req, res) => {
  const file = path.join(uploadDir, req.params.filename);
  res.download(file);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Файлы сохраняются в: ${uploadDir}`);
});
