import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Проверка сервера
app.get("/", (req, res) => {
  res.send("Salim AI server is running ✅");
});

// GPT чат
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Сообщение пустое ❌" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Ты умный и дружелюбный помощник Salim AI. Отвечай понятно.\n\nВопрос: ${userMessage}`
      })
    });

    const data = await response.json();

    const answer = data.output_text || "Нет ответа 😕";

    res.json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Ошибка сервера 😢" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
