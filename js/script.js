document.addEventListener('DOMContentLoaded', () => {
    const riddleContainer = document.getElementById('riddle-container');
    const pinContainer = document.getElementById('pin-container');
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const riddleInput = document.getElementById('riddle-input');
    const pinInput = document.getElementById('pin-input');
    const timerMessage = document.getElementById('timer-message');
    const timerText = document.getElementById('timer-text');
    const revealCodeButton = document.getElementById('reveal-code-button');

    // Функция для получения прогресса из localStorage
    function getProgress() {
        const progress = localStorage.getItem('gameProgress');
        return progress ? JSON.parse(progress) : {
            password_stage: 'not_started',
            pin_stage: 'not_started',
            timer_started: false
        };
    }

    // Функция для обновления прогресса в localStorage
    function updateProgress(stage, status) {
        const progress = getProgress();
        progress[stage] = status;
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    }

    // Получаем текущий прогресс
    const progress = getProgress();

    // Показываем соответствующий контейнер в зависимости от прогресса
    if (progress.password_stage === 'completed') {
        riddleContainer.classList.add('hidden');
        pinContainer.classList.remove('hidden');
    } else {
        riddleContainer.classList.remove('hidden');
        pinContainer.classList.add('hidden');
    }

    // Если таймер уже был запущен, показываем сообщение и запускаем таймер
    if (progress.timer_started) {
        pinContainer.classList.add('hidden');
        timerMessage.classList.remove('hidden');
        startCountdown();
    }

    // Обработчик для кнопки отправки ответа на загадку
    document.getElementById('submit-answer').addEventListener('click', async () => {
        const answer = riddleInput.value;

        try {
            const response = await fetch('/check-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    riddleId: 1, // ID загадки
                    userAnswer: answer,
                }),
            });

            const result = await response.json();

            if (result.isCorrect) {
                // Правильный ответ: обновляем прогресс и показываем пин-код
                updateProgress('password_stage', 'completed');
                riddleContainer.classList.add('hidden');
                pinContainer.classList.remove('hidden');
            } else {
                // Неправильный ответ: подсвечиваем поле ввода
                riddleInput.classList.add('input-error');
                setTimeout(() => {
                    riddleInput.classList.remove('input-error');
                }, 500);
            }

            riddleInput.value = ""; // Очищаем поле ввода
        } catch (error) {
            console.error("Ошибка проверки ответа:", error);
        }
    });

    // Обработчик для кнопки отправки пин-кода
    document.getElementById('submit-pin').addEventListener('click', async () => {
        const pinValue = pinInput.value;

        try {
            const response = await fetch('/check-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    pin: pinValue,
                }),
            });

            const result = await response.json();

            if (result.isCorrect) {
                // Правильный пин-код: обновляем прогресс и запускаем таймер
                updateProgress('pin_stage', 'completed');
                updateProgress('timer_started', true);
                pinContainer.classList.add('hidden');
                timerMessage.classList.remove('hidden');
                startCountdown();
            } else {
                // Неправильный пин-код: подсвечиваем поле ввода
                pinInput.classList.add('input-error');
                setTimeout(() => {
                    pinInput.classList.remove('input-error');
                }, 500);
            }

            pinInput.value = ""; // Очищаем поле ввода
        } catch (error) {
            console.error("Ошибка проверки пин-кода:", error);
        }
    });

    // Запуск таймера
    function startCountdown() {
        const targetDate = new Date(2025, 2, 15, 23, 0, 0); // 15 марта 2025 года, 23:00
        //const targetDate = new Date(2025, 2, 15, 9, 41, 0); // 15 марта 2025 года, 23:00

        function updateCountdown() {
            const now = new Date();
            const timeDifference = targetDate - now;

            // Если время вышло
            if (timeDifference <= 0) {
                clearInterval(countdownInterval);
                daysElement.textContent = "00";
                hoursElement.textContent = "00";
                minutesElement.textContent = "00";
                secondsElement.textContent = "00";
                timerText.textContent = "Время настало!";
                revealCodeButton.classList.remove('hidden');
                return;
            }

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
        }

        // Проверяем, не истекло ли время сразу при запуске
        const now = new Date();
        if (targetDate - now <= 0) {
            timerText.textContent = "Время настало!";
            revealCodeButton.classList.remove('hidden');
            return;
        }

        // Запускаем отсчёт
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Обработчик для кнопки "Узнать код"
    revealCodeButton.addEventListener('click', () => {
        window.location.href = 'code609.html';
    });
});