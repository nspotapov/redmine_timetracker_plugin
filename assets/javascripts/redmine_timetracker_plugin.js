class RedmineTimeTracker {
    constructor() {
        this.currentUser = this._getCurrentUserFromDOM();
        this.currentIssueId = this._getCurrentIssueId();
        this.isActive = false;
        this.isPaused = false;
        this.showSeconds = false;
        this.timerInterval = null;
        this.elapsedSeconds = 0;
    }

    // Получаем информацию о пользователе из DOM
    _getCurrentUserFromDOM() {
        const userLink = document.querySelector('.user.active');
        if (!userLink) return null;

        return {
            id: userLink.href.split('/').pop(),
            name: userLink.textContent.trim()
        };
    }

    // Получаем ID задачи из URL
    _getCurrentIssueId() {
        const data = localStorage.getItem(`timetracker`);
        if (data) {
            const parsed = JSON.parse(data);
            return parsed.issueId;
        }
        else {
            const match = window.location.pathname.match(/\/issues\/(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        }
    }

    // Вставляем HTML нашего плагина
    insertUI() {
        const loggedAs = document.getElementById('loggedas');
        if (!loggedAs || !this.currentUser || !this.currentIssueId) return;

        loggedAs.insertAdjacentHTML('afterend', `
        <div id="timetracker-menu">
          <a class="timetracker-menu__item" id="timetracker-issueid" href="#">#${this.currentIssueId}</a>
          <span class="timetracker-menu__item" id="timetracker-duration" style="display: none;">${this._formatTime(this.elapsedSeconds)}</span>
          <span class="timetracker-menu__control-item" id="timetracker-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
          </span>
          <span class="timetracker-menu__control-item" id="timetracker-resume" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
          </span>
          <span class="timetracker-menu__control-item" id="timetracker-pause" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
            </svg>
          </span>
          <span class="timetracker-menu__control-item" id="timetracker-stop" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
              <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
            </svg>
          </span>
        </div>
      `);

        this._setupEventListeners();
    }

    // Настраиваем обработчики событий
    _setupEventListeners() {
        document.getElementById('timetracker-start')?.addEventListener('click', () => this.start());
        document.getElementById('timetracker-stop')?.addEventListener('click', () => this.stop());
        document.getElementById('timetracker-pause')?.addEventListener('click', () => this.pause());
        document.getElementById('timetracker-resume')?.addEventListener('click', () => this.resume());
        document.getElementById('timetracker-duration')?.addEventListener('click', () => {
            this.showSeconds = !this.showSeconds;
            if (this.isActive) this._saveToStorage();
            this._updateTimer();
        });
    }

    // Форматирование времени
    _formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (this.showSeconds) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        else {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
    }

    // Обновление таймера
    _updateTimer() {
        document.getElementById('timetracker-duration').textContent =
            this._formatTime(this.elapsedSeconds);
    }

    _startInterval() {
        return setInterval(() => {
            this.elapsedSeconds += 1;
            this._updateTimer();
        }, 1000);
    }

    // Управление таймером
    start() {
        if (this.isActive) return;

        this.isActive = true;
        this.isPaused = false;
        this.elapsedSeconds = 0;

        this.timerInterval = this._startInterval();

        this._updateUI();
        this._saveToStorage();
    }

    pause() {
        if (!this.isActive || this.isPaused) return;

        this.isPaused = true;
        clearInterval(this.timerInterval);
        this._updateUI();
        this._saveToStorage();
    }

    resume() {
        if (!this.isActive || !this.isPaused) return;

        this.isPaused = false;
        this.timerInterval = this._startInterval();

        this._updateUI();
        this._saveToStorage();
    }

    stop() {
        if (!this.isActive) return;

        this.isActive = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);

        this._updateUI();
        this._clearStorage();

        this._saveTimeToRedmine();
    }

    // Обновление видимости кнопок
    _updateUI() {
        const show = (id) => document.getElementById(id).style.display = 'block';
        const hide = (id) => document.getElementById(id).style.display = 'none';

        if (this.isActive) {
            show('timetracker-duration');
            hide('timetracker-start');
            show('timetracker-stop');

            if (this.isPaused) {
                hide('timetracker-pause');
                show('timetracker-resume');
            } else {
                show('timetracker-pause');
                hide('timetracker-resume');
            }
        } else {
            show('timetracker-start');
            hide('timetracker-duration');
            hide('timetracker-pause');
            hide('timetracker-stop');
            hide('timetracker-resume');
        }

        if (this.currentIssueId) {
            document.getElementById('timetracker-issueid').href = this._createIssueLink();
        }
    }

    // Сохранение в localStorage
    _saveToStorage() {
        if (!this.currentIssueId) return;

        localStorage.setItem(`timetracker`, JSON.stringify({
            issueId: this.currentIssueId,
            showSeconds: this.showSeconds,
            elapsedSeconds: this.elapsedSeconds,
            isActive: this.isActive,
            isPaused: this.isPaused,
            lastUpdated: Date.now()
        }));
    }

    _loadData() {
        const data = localStorage.getItem(`timetracker`);
        if (!data) return;

        const parsed = JSON.parse(data);
        this.elapsedSeconds = parsed.elapsedSeconds || 0;
        this.isActive = parsed.isActive || false;
        this.isPaused = parsed.isPaused || false;
        this.showSeconds = parsed.showSeconds || false;

        if (this.isActive && !this.isPaused) {
            // Восстанавливаем таймер, если он был активен
            const secondsPassed = Math.floor((Date.now() - parsed.lastUpdated) / 1000);
            this.elapsedSeconds += secondsPassed;
        }

        return parsed;
    }

    // Загрузка из localStorage
    _loadFromStorage() {
        if (!this.currentIssueId) return;

        const parsed = this._loadData();

        if (this.isActive && !this.isPaused) {
            // Восстанавливаем таймер, если он был активен
            this.isPaused = true;
            this.resume();
        } else if (this.isActive && this.isPaused) {
            this._updateTimer();
            this._updateUI();
        }
    }

    // Очистка localStorage
    _clearStorage() {
        if (!this.currentIssueId) return;
        localStorage.removeItem(`timetracker`);
    }

    _createTimeEntryLink() {
        let issueId = this.currentIssueId;
        const hours = (this.elapsedSeconds / 3600).toFixed(2);

        let url = `${window.location.origin}/issues/${issueId}/edit?`;
        url += `tab=time_entries&time_entry[hours]=${encodeURIComponent(hours)}`;

        return url;
    }

    _createIssueLink() {
        if (!this.currentIssueId) return;
        let issueId = this.currentIssueId;
        return `${window.location.origin}/issues/${issueId}`;
    }

    // Сохранение времени в Redmine через форму (альтернатива API)
    _saveTimeToRedmine() {
        if (!this.currentIssueId) return;

        window.location = this._createTimeEntryLink();
    }
}

// Инициализация плагина при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new RedmineTimeTracker();
    tracker._loadData();
    if (tracker.currentUser && tracker.currentIssueId) {
        tracker.insertUI();
        tracker._loadFromStorage();
    }
});
