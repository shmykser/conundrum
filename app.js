// Импортируем модуль math.js
const math = require('./math');

// Импортируем встроенный модуль http для создания сервера
const http = require('http');

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
    // Устанавливаем заголовок ответа
    res.writeHead(200, {'Content-Type': 'text/plain'});

    // Используем функцию sum из модуля math.js
    const result = math.sum(10, 5);

    // Отправляем результат клиенту
    res.end(`Сумма 15 и 5 равна: ${result}`);
});

// Сервер слушает порт 3000
server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000/');
});