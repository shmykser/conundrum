const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:'); // Используем базу данных в памяти

// Настройки Telegram
const chatId = "273065571";
const botToken = "819340168:AAEygB5s1K9A5E7tH2XiVCZAP50pOHMMaHw";

// Middleware для обработки JSON
app.use(bodyParser.json());

// Раздача статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));

// Инициализация базы данных
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS riddles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT
        )
    `);

    // Добавляем загадки
    db.run(`
        INSERT INTO riddles (question, answer) VALUES
        ('Enter the password to start the timer', 'password'),
        ('What has keys but cant open locks?', 'keyboard'),
        ('I speak without a mouth and hear without ears. What am I?', 'echo'),
        ('The more you take, the more you leave behind. What am I?', 'footsteps')
    `);
});

// Функция для отправки сообщения в Telegram
async function sendToTelegram(message) {
    const { default: fetch } = await import('node-fetch'); // Динамический импорт
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const data = {
        chat_id: chatId,
        text: message
    };

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log("Сообщение отправлено в Telegram:", result);
    })
    .catch(error => {
        console.error("Ошибка отправки сообщения в Telegram:", error);
    });
}

// Получить все загадки
app.get('/riddles', (req, res) => {
    db.all("SELECT * FROM riddles", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Ошибка загрузки загадок" });
        } else {
            res.json(rows);
        }
    });
});

// Проверить ответ
app.post('/check-answer', (req, res) => {
    const { riddleId, userAnswer } = req.body;

    db.get("SELECT * FROM riddles WHERE id = ?", [riddleId], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Ошибка проверки ответа" });
        } else {
            const isCorrect = row.answer.toLowerCase() === userAnswer.toLowerCase();

            // Отправляем ответ в Telegram
            sendToTelegram(`Введён ответ: ${userAnswer}`);

            res.json({ isCorrect });
        }
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});