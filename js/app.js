/**
 * Лабораторная работа №5
 * Студент: Малащенко
 * Клиентская логика веб-приложения «FitPulse: Дневник силовых тренировок»
 */

// Состояние приложения
const appState = {
    currentScreen: 'screen-auth',
    athleteName: 'Малащенко Вадим',
    totalTonnage: 4820,
    completedSetsCount: 7,
    totalPlannedSets: 10,
    timer: {
        totalSeconds: 90,
        remainingSeconds: 90,
        intervalId: null,
        isRunning: false
    }
};

// --------------------------------------------------------------------------
// 1. ИНИЦИАЛИЗАЦИЯ И УПРАВЛЕНИЕ ЭКРАНАМИ
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Установка начального режима отображения на десктопе (по умолчанию симуляция смартфона, как на скриншоте)
    setAppViewMode('mobile');
    updateTonnageUI();
});

/**
 * Переключение между 3 логическими экранами приложения
 * @param {string} screenId - ID целевого экрана ('screen-auth' | 'screen-workout' | 'screen-stats')
 */
function switchScreen(screenId) {
    appState.currentScreen = screenId;

    // Скрыть все экраны
    document.querySelectorAll('.screen-view').forEach(screen => {
        screen.classList.remove('active');
    });

    // Активировать целевой экран
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Обновить статус навигационных вкладок
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-screen') === screenId) {
            tab.classList.add('active');
        }
    });

    // Плавная прокрутка наверх при переключении экранов
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 2. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ (ЭКРАН 1)
// --------------------------------------------------------------------------

/**
 * Переключение между формой входа и регистрацией
 * @param {'login' | 'register'} mode
 */
function setAuthMode(mode) {
    const btnLogin = document.getElementById('btnTabLogin');
    const btnReg = document.getElementById('btnTabRegister');
    const formLogin = document.getElementById('loginForm');
    const formReg = document.getElementById('registerForm');

    if (mode === 'login') {
        btnLogin.classList.add('active');
        btnReg.classList.remove('active');
        formLogin.classList.remove('hidden');
        formReg.classList.add('hidden');
    } else {
        btnReg.classList.add('active');
        btnLogin.classList.remove('active');
        formReg.classList.remove('hidden');
        formLogin.classList.add('hidden');
    }
}

/**
 * Обработка отправки формы входа
 */
function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    
    notifyUser(`Вход выполнен успешно! Добро пожаловать, ${appState.athleteName}.`);
    
    // Переход к экрану тренировочного дневника
    setTimeout(() => {
        switchScreen('screen-workout');
    }, 400);
}

/**
 * Обработка отправки формы регистрации
 */
function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    if (name) {
        appState.athleteName = name;
        document.getElementById('headerUserBadge').textContent = name;
    }
    
    notifyUser(`Профиль атлета ${appState.athleteName} создан! Переход к тренировкам.`);
    
    setTimeout(() => {
        switchScreen('screen-workout');
    }, 400);
}

/**
 * Показ / скрытие пароля
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Имитация входа через соцсети
 */
function socialAuth(provider) {
    notifyUser(`Авторизация через ${provider} выполнена.`);
    setTimeout(() => {
        switchScreen('screen-workout');
    }, 400);
}

// --------------------------------------------------------------------------
// 3. ДНЕВНИК ТРЕНИРОВКИ И ФИКСАЦИЯ ПОДХОДОВ (ЭКРАН 2)
// --------------------------------------------------------------------------

/**
 * Отметка о выполнении подхода
 * @param {HTMLElement} btn - Кнопка чекбокса
 * @param {number} weight - Вес отягощения
 * @param {number} reps - Повторения
 */
function toggleSetCheck(btn, weight, reps) {
    const row = btn.closest('.set-row');
    const isChecked = btn.classList.contains('checked');
    const setVolume = Math.round(weight * reps);

    if (isChecked) {
        // Снимаем отметку
        btn.classList.remove('checked');
        btn.textContent = '○';
        row.classList.remove('completed');
        appState.totalTonnage -= setVolume;
        appState.completedSetsCount = Math.max(0, appState.completedSetsCount - 1);
        notifyUser(`Подход отменен (-${setVolume} кг)`);
    } else {
        // Отмечаем как выполненный
        btn.classList.add('checked');
        btn.textContent = '✓';
        row.classList.add('completed');
        appState.totalTonnage += setVolume;
        appState.completedSetsCount += 1;
        notifyUser(`Подход засчитан: +${setVolume} кг тоннажа! Отдых начался.`);
        
        // Автоматический перезапуск таймера отдыха на 90 секунд
        resetRestTimer(90);
        startRestTimer();
    }

    updateTonnageUI();
}

/**
 * Обновление UI метрик тоннажа и прогресс-бара
 */
function updateTonnageUI() {
    const statVolumeEl = document.getElementById('statVolume');
    const statSetsEl = document.getElementById('statSetsCount');
    const progressBar = document.getElementById('workoutProgressBar');
    const progressText = document.getElementById('workoutProgressText');

    if (statVolumeEl) {
        statVolumeEl.textContent = appState.totalTonnage.toLocaleString('ru-RU');
    }

    if (statSetsEl) {
        statSetsEl.textContent = appState.completedSetsCount;
    }

    // Расчет процента выполнения
    const percent = Math.min(100, Math.round((appState.completedSetsCount / appState.totalPlannedSets) * 100));
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
        progressText.textContent = `Прогресс объема: ${percent}% (${appState.completedSetsCount} из ${appState.totalPlannedSets} подходов)`;
    }
}

/**
 * Быстрое изменение числовых значений в полях фиксации подхода
 */
function adjustValue(inputId, delta) {
    const input = document.getElementById(inputId);
    if (!input) return;
    let val = parseFloat(input.value) || 0;
    val += delta;
    if (delta % 1 !== 0) {
        val = Math.max(0, parseFloat(val.toFixed(1)));
    } else {
        val = Math.max(1, Math.round(val));
    }
    input.value = val;
}

/**
 * Обновление слайдера RPE
 */
function updateRpeDisplay(val) {
    const label = document.getElementById('rpeValueLabel');
    if (label) {
        label.textContent = `${val} / 10`;
    }
}

/**
 * Добавление нового подхода через форму быстрой фиксации
 */
function handleQuickLogSet(event) {
    event.preventDefault();
    const exChoice = document.getElementById('quickExerciseSelect').value;
    const weight = parseFloat(document.getElementById('logWeightInput').value) || 0;
    const reps = parseInt(document.getElementById('logRepsInput').value, 10) || 1;
    const rpe = document.getElementById('logRpeInput').value;

    const tbodyId = `setsBodyEx${exChoice}`;
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const newIndex = tbody.children.length + 1;
    const volume = Math.round(weight * reps);

    const tr = document.createElement('tr');
    tr.className = 'set-row completed';
    tr.innerHTML = `
        <td><span class="set-index">${newIndex}</span></td>
        <td><span class="set-weight">${weight.toFixed(1)}</span></td>
        <td><span class="set-reps">${reps}</span></td>
        <td><span class="set-rpe">${rpe}</span></td>
        <td>
            <button class="set-check-btn checked" onclick="toggleSetCheck(this, ${weight}, ${reps})" title="Отметить подход">✓</button>
        </td>
    `;
    tbody.appendChild(tr);

    // Увеличиваем показатели
    appState.totalTonnage += volume;
    appState.completedSetsCount += 1;
    appState.totalPlannedSets = Math.max(appState.totalPlannedSets, appState.completedSetsCount);
    updateTonnageUI();

    notifyUser(`Сет зафиксирован: ${weight} кг × ${reps} повт (+${volume} кг). Отдыхайте!`);

    // Запуск таймера отдыха
    resetRestTimer(90);
    startRestTimer();
}

/**
 * Завершение текущей тренировки
 */
function finishCurrentWorkout() {
    notifyUser(`🎉 Тренировка успешно завершена! Итоговый объем: ${appState.totalTonnage.toLocaleString('ru-RU')} кг.`);
    setTimeout(() => {
        switchScreen('screen-stats');
    }, 700);
}

// --------------------------------------------------------------------------
// 4. ТАЙМЕР ОТДЫХА МЕЖДУ ПОДХОДАМИ (REST TIMER)
// --------------------------------------------------------------------------

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const display = document.getElementById('restTimerDisplay');
    if (display) {
        display.textContent = formatTime(appState.timer.remainingSeconds);
        if (appState.timer.remainingSeconds <= 10 && appState.timer.remainingSeconds > 0) {
            display.classList.add('pulse');
        } else {
            display.classList.remove('pulse');
        }
    }
}

function startRestTimer() {
    if (appState.timer.isRunning) return;

    appState.timer.isRunning = true;
    const btn = document.getElementById('btnTimerToggle');
    if (btn) btn.textContent = 'Пауза';

    appState.timer.intervalId = setInterval(() => {
        if (appState.timer.remainingSeconds > 0) {
            appState.timer.remainingSeconds--;
            updateTimerDisplay();
        } else {
            // Время отдыха вышло!
            clearInterval(appState.timer.intervalId);
            appState.timer.isRunning = false;
            if (btn) btn.textContent = 'Старт';
            playNotificationSound();
            notifyUser('🔔 Отдых завершен! Время начинать следующий подход.');
        }
    }, 1000);
}

function pauseRestTimer() {
    if (!appState.timer.isRunning) return;
    clearInterval(appState.timer.intervalId);
    appState.timer.isRunning = false;
    const btn = document.getElementById('btnTimerToggle');
    if (btn) btn.textContent = 'Старт';
}

function toggleRestTimer() {
    if (appState.timer.isRunning) {
        pauseRestTimer();
    } else {
        startRestTimer();
    }
}

function addRestTimerTime(seconds) {
    appState.timer.remainingSeconds += seconds;
    updateTimerDisplay();
    notifyUser(`Добавлено +${seconds}с ко времени отдыха.`);
}

function resetRestTimer(seconds = 90) {
    pauseRestTimer();
    appState.timer.remainingSeconds = seconds;
    updateTimerDisplay();
}

/**
 * Простой звуковой сигнал через Web Audio API без внешних аудиофайлов
 */
function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
        // Браузерная блокировка аудиоконтекста
    }
}

// --------------------------------------------------------------------------
// 5. ДЕСКТОПНЫЙ РЕЖИМ СИМУЛЯЦИИ ЭКРАНОВ
// --------------------------------------------------------------------------

/**
 * Переключение симуляции экрана для проверки адаптивности
 * @param {'mobile' | 'tablet' | 'fluid'} mode
 */
function setAppViewMode(mode) {
    const frame = document.getElementById('deviceFrame');
    if (!frame) return;

    frame.classList.remove('view-mobile', 'view-tablet', 'view-fluid');
    frame.classList.add(`view-${mode}`);

    // Обновляем состояние кнопок панели
    document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'mobile') document.getElementById('btnModeMobile')?.classList.add('active');
    if (mode === 'tablet') document.getElementById('btnModeTablet')?.classList.add('active');
    if (mode === 'fluid') document.getElementById('btnModeFluid')?.classList.add('active');
}

// --------------------------------------------------------------------------
// 6. СИСТЕМА УВЕДОМЛЕНИЙ (TOASTS)
// --------------------------------------------------------------------------

function notifyUser(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>💬</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
