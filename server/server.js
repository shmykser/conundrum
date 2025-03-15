const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware для обработки JSON и CORS
app.use(bodyParser.json());
app.use(cors());

// Раздача статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));

// Данные для загадок и пин-кода
const riddles = [
    {
        id: 1,
        question: 'Enter the password to start the timer',
        answer: 'пароль'
    }
];

const correctPin = '221B'; // Правильный пин-код

// Маршрут для проверки ответа на загадку
app.post('/check-answer', (req, res) => {
    const { riddleId, userAnswer } = req.body;

    // Проверяем, что riddleId передан и является числом
    if (!riddleId || isNaN(riddleId)) {
        return res.status(400).json({ error: "Некорректный ID загадки" });
    }

    // Ищем загадку в массиве
    const riddle = riddles.find(r => r.id === riddleId);
    if (riddle) {
        const isCorrect = riddle.answer.toLowerCase() === userAnswer.toLowerCase();
        res.json({ isCorrect });
    } else {
        res.status(404).json({ error: "Загадка не найдена" });
    }
});

// Маршрут для проверки пин-кода
app.post('/check-pin', (req, res) => {
    const { pin } = req.body;

    if (pin === correctPin) {
        res.json({ isCorrect: true });
    } else {
        res.json({ isCorrect: false });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});