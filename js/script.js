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

    function getProgress() {
        const progress = localStorage.getItem('gameProgress');
        return progress ? JSON.parse(progress) : {
            password_stage: 'not_started',
            pin_stage: 'not_started',
            berlinetta_stage: 'not_started',
            timer_started: false
        };
    }

    function updateProgress(stage, status) {
        const progress = getProgress();
        progress[stage] = status;
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    }

    const progress = getProgress();

    if (progress.password_stage === 'completed') {
        riddleContainer.classList.add('hidden');
        pinContainer.classList.remove('hidden');
    } else {
        riddleContainer.classList.remove('hidden');
        pinContainer.classList.add('hidden');
    }

    if (progress.timer_started) {
        pinContainer.classList.add('hidden');
        timerMessage.classList.remove('hidden');
        startCountdown();
    }

    document.getElementById('submit-answer').addEventListener('click', async () => {
        const answer = riddleInput.value;

        try {
            const response = await fetch('/check-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    riddleId: 1,
                    userAnswer: answer,
                }),
            });

            const result = await response.json();

            if (result.isCorrect) {
                updateProgress('password_stage', 'completed');
                riddleContainer.classList.add('hidden');
                pinContainer.classList.remove('hidden');
            } else {
                riddleInput.classList.add('input-error');
                setTimeout(() => {
                    riddleInput.classList.remove('input-error');
                }, 500);
            }

            riddleInput.value = "";
        } catch (error) {
            console.error("Ошибка проверки ответа:", error);
        }
    });

    document.getElementById('submit-pin').addEventListener('click', () => {
        const pinValue = pinInput.value;

        if (pinValue === "221B") {
            updateProgress('pin_stage', 'completed');
            updateProgress('timer_started', true);
            pinContainer.classList.add('hidden');
            timerMessage.classList.remove('hidden');
            startCountdown();
        } else {
            pinInput.classList.add('input-error');
            setTimeout(() => {
                pinInput.classList.remove('input-error');
            }, 500);
        }

        pinInput.value = "";
    });

    function startCountdown() {
        const targetDate = new Date(2025, 2, 15, 9, 21, 0);

        function updateCountdown() {
            const now = new Date();
            const timeDifference = targetDate - now;

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

            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            daysElement.textContent = String(days).padStart(2, "0");
            hoursElement.textContent = String(hours).padStart(2, "0");
            minutesElement.textContent = String(minutes).padStart(2, "0");
            secondsElement.textContent = String(seconds).padStart(2, "0");
        }

        const now = new Date();
        if (targetDate - now <= 0) {
            daysElement.textContent = "00";
            hoursElement.textContent = "00";
            minutesElement.textContent = "00";
            secondsElement.textContent = "00";
            timerText.textContent = "Время настало!";
            revealCodeButton.classList.remove('hidden');
            return;
        }

        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    revealCodeButton.addEventListener('click', () => {
        window.location.href = 'code609.html';
    });
});