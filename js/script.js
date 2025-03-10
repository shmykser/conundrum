// Элементы для отображения времени
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

// Элементы для загадок
const riddleContainer = document.getElementById("riddle-container");
const riddleText = document.getElementById("riddle-text");
const riddleInput = document.getElementById("riddle-input");
const submitButton = document.getElementById("submit-answer");

let riddles = []; // Массив для хранения загадок
let currentRiddleIndex = 0; // Индекс текущей загадки

// Загрузить загадки с сервера
fetch('/riddles')
    .then(response => response.json())
    .then(data => {
        riddles = data;

        // Восстанавливаем прогресс из localStorage
        const savedProgress = localStorage.getItem("currentRiddleIndex");
        const allRiddlesSolved = localStorage.getItem("allRiddlesSolved");

        if (allRiddlesSolved === "true") {
            // Если все загадки решены, показываем только таймер
            riddleContainer.classList.add("hidden");
            startCountdown();
        } else if (savedProgress) {
            // Если есть сохранённый прогресс, продолжаем с него
            currentRiddleIndex = parseInt(savedProgress, 10);
            showRiddle();
        } else {
            // Иначе начинаем с первой загадки
            showRiddle();
        }
    })
    .catch(error => {
        console.error("Ошибка загрузки загадок:", error);
    });

// Показать текущую загадку
function showRiddle() {
    riddleContainer.classList.remove("hidden");
    riddleText.textContent = riddles[currentRiddleIndex].question;
    submitButton.style.color = "#e0e0e0"; // Сброс цвета замка
}

// Проверить ответ
submitButton.addEventListener("click", () => {
    const userAnswer = riddleInput.value.trim().toLowerCase();

    // Отправить ответ на сервер для проверки
    fetch('/check-answer', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            riddleId: riddles[currentRiddleIndex].id,
            userAnswer
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.isCorrect) {
            // Правильный ответ: замок зелёный
            submitButton.style.color = "#00ff00"; // Зелёный цвет
            setTimeout(() => {
                currentRiddleIndex++; // Переходим к следующей загадке

                // Сохраняем прогресс в localStorage
                localStorage.setItem("currentRiddleIndex", currentRiddleIndex);

                if (currentRiddleIndex < riddles.length) {
                    showRiddle(); // Показываем следующую загадку
                } else {
                    // Все загадки решены, запускаем таймер
                    riddleContainer.classList.add("hidden");
                    localStorage.setItem("allRiddlesSolved", "true");
                    startCountdown();
                }
            }, 500); // Задержка для визуального эффекта
        } else {
            // Неправильный ответ: замок красный
            submitButton.style.color = "#ff0000"; // Красный цвет
        }
        riddleInput.value = ""; // Очищаем поле ввода
    })
    .catch(error => {
        console.error("Ошибка проверки ответа:", error);
    });
});

// Запуск таймера
function startCountdown() {
    const targetDate = new Date(2025, 2, 15, 0, 0, 0); // 15 марта 2025 года

    function updateCountdown() {
        const now = new Date();
        const timeDifference = targetDate - now;

        // Рассчитываем дни, часы, минуты и секунды
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        // Обновляем текст на странице
        daysElement.textContent = String(days).padStart(2, "0");
        hoursElement.textContent = String(hours).padStart(2, "0");
        minutesElement.textContent = String(minutes).padStart(2, "0");
        secondsElement.textContent = String(seconds).padStart(2, "0");

        // Если время вышло
        if (timeDifference <= 0) {
            clearInterval(countdownInterval);
            daysElement.textContent = "00";
            hoursElement.textContent = "00";
            minutesElement.textContent = "00";
            secondsElement.textContent = "00";
        }
    }

    // Запускаем отсчёт
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// Очистка localStorage (для тестирования)
// localStorage.removeItem("currentRiddleIndex");
// localStorage.removeItem("allRiddlesSolved");