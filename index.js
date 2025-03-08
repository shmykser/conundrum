const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Создание таблицы с вопросами и ответами
db.serialize(() => {
    db.run("CREATE TABLE questions (id INTEGER PRIMARY KEY, question TEXT, answer TEXT)");
    db.run("INSERT INTO questions (question, answer) VALUES ('Столица России?', 'Москва')");
    db.run("INSERT INTO questions (question, answer) VALUES ('2 + 2?', '4')");
});

app.post('/check-answer', (req, res) => {
    const userAnswer = req.body.answer;
    const questionId = req.body.questionId;

    db.get("SELECT answer FROM questions WHERE id = ?", [questionId], (err, row) => {
        if (err) {
            res.status(500).send('Ошибка сервера');
        } else {
            if (row.answer.toLowerCase() === userAnswer.toLowerCase()) {
                res.send('Правильно!');
            } else {
                res.send('Неправильно!');
            }
        }
    });
});

app.get('/questions', (req, res) => {
    db.all("SELECT id, question FROM questions", [], (err, rows) => {
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