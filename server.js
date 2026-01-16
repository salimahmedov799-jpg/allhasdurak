import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// =======================
// 🧠 ПАМЯТЬ (простая)
// =======================
let MEMORY = [];
const MAX_MEMORY = 6;

// =======================
// ✅ ПРОВЕРКА СЕРВЕРА
// =======================
app.get("/", (req, res) => {
  res.send("Salim AI server is running ✅");
});

// =======================
// 💬 ЧАТ (ТЕКСТ + ФОТО)
// =======================
app.post("/api/chat", upload.single("image"), async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    if (!userMessage && !req.file) {
      return res.json({ reply: "Сообщение отсутствует ❌" });
    }

    let content = [];

    // ===== SYSTEM PROMPT =====
    content.push({
      type: "text",
      text:
        "Ты Salim AI — умный, спокойный и полезный ИИ.\n" +
        "Отвечай на русском языке.\n" +
        "Если просят код — давай код.\n" +
        "Объясняй кратко и по делу.\n"
    });

    // ===== MEMORY =====
    MEMORY.forEach(m => {
      content.push({
        type: "text",
        text: m
      });
    });

    // ===== USER MESSAGE =====
    if (userMessage) {
      content.push({
        type: "text",
        text: userMessage
      });
      MEMORY.push(userMessage);
      MEMORY = MEMORY.slice(-MAX_MEMORY);
    }

    // ===== IMAGE =====
    if (req.file) {
      const imageBase64 = fs.readFileSync(req.file.path, "base64");
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        }
      });
      fs.unlinkSync(req.file.path);
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content
          }
        ]
      })
    });

    const data = await response.json();

    const answer =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "AI не дал ответа 😕";

    MEMORY.push(answer);
    MEMORY = MEMORY.slice(-MAX_MEMORY);

    res.json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Ошибка сервера ❌" });
  }
});

// =======================
// 🖼️ ГЕНЕРАЦИЯ КАРТИНОК (НЕ ТРОГАЕМ)
// =======================
app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Нет описания картинки" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024"
        })
      }
    );

    const data = await response.json();

    if (!data.data || !data.data[0]?.url) {
      return res.status(500).json({ error: "Ошибка генерации изображения" });
    }

    res.json({ image: data.data[0].url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера при генерации изображения" });
  }
});

// =======================
app.listen(PORT, () => {
  console.log("🚀 Salim AI server running on port " + PORT);
});
