const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('quiz.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Создание таблиц
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            user_answer TEXT,
            is_correct BOOLEAN
        )
    `);

    // Добавляем тестовые вопросы, если их нет
    db.run("INSERT OR IGNORE INTO questions (question, answer) VALUES ('Столица России?', 'Москва')");
    db.run("INSERT OR IGNORE INTO questions (question, answer) VALUES ('2 + 2?', '4')");
});

// Маршрут для проверки ответа
app.post('/check-answer', (req, res) => {
    const userAnswer = req.body.answer;
    const questionId = req.body.questionId;

    db.get("SELECT answer FROM questions WHERE id = ?", [questionId], (err, row) => {
        if (err) {
            res.status(500).send('Ошибка сервера');
        } else {
            const isCorrect = row.answer.toLowerCase() === userAnswer.toLowerCase();

            // Сохраняем ответ пользователя
            db.run(
                "INSERT INTO user_answers (question_id, user_answer, is_correct) VALUES (?, ?, ?)",
                [questionId, userAnswer, isCorrect],
                (err) => {
                    if (err) {
                        res.status(500).send('Ошибка при сохранении ответа');
                    } else {
                        res.send(isCorrect ? 'Правильно!' : 'Неправильно!');
                    }
                }
            );
        }
    });
});

// Маршрут для получения всех вопросов
app.get('/questions', (req, res) => {
    db.all("SELECT id, question FROM questions", [], (err, rows) => {
        if (err) {
            res.status(500).send('Ошибка сервера');
        } else {
            res.json(rows);
        }
    });
});

// Маршрут для получения всех ответов пользователей
app.get('/user-answers', (req, res) => {
    db.all("SELECT * FROM user_answers", [], (err, rows) => {
        if (err) {
            res.status(500).send('Ошибка сервера');
        } else {
            res.json(rows);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});