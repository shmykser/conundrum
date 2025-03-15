const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const db = new Database(':memory:'); // Используем базу данных в памяти

// Middleware для обработки JSON и CORS
app.use(bodyParser.json());
app.use(cors());

// Раздача статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));

// Инициализация базы данных
db.exec(`
    CREATE TABLE IF NOT EXISTS riddles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        answer TEXT
    )
`);

// Добавляем загадки
db.exec(`
    INSERT INTO riddles (question, answer) VALUES
    ('Enter the password to start the timer', 'пароль')
`);

// Маршрут для проверки ответа
app.post('/check-answer', (req, res) => {
    const { riddleId, userAnswer } = req.body;

    // Проверяем, что riddleId передан и является числом
    if (!riddleId || isNaN(riddleId)) {
        return res.status(400).json({ error: "Некорректный ID загадки" });
    }

    // Ищем загадку в базе данных
    const row = db.prepare("SELECT * FROM riddles WHERE id = ?").get(riddleId);
    if (row) {
        const isCorrect = row.answer.toLowerCase() === userAnswer.toLowerCase();
        res.json({ isCorrect });
    } else {
        res.status(404).json({ error: "Загадка не найдена" });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});