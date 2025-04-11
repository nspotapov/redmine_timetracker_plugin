function insertPluginHtml() {
    const loggedAs = document.getElementById('loggedas')
    if (!loggedAs) {
        console.error('Элемент #loggedas не найден')
        return
    }
    loggedAs.insertAdjacentHTML('afterend',
        `
    <div id="timetracker-menu">
        <a class="timetracker-menu__item" id="timetracker-issueid" href="#">#24324</a>
        <span class="timetracker-menu__item" id="timetracker-duration">00:00</span>
        <span class="timetracker-menu__control-item" id="timetracker-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
        </span>
        <span class="timetracker-menu__control-item" id="timetracker-resume">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
        </span>
        <span class="timetracker-menu__control-item" id="timetracker-pause">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
            </svg>
        </span>
        <span class="timetracker-menu__control-item" id="timetracker-stop">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
            </svg>
        </span>
    </div>
    `
    )
}

let isActive = false
let isPaused = false

let btnStart = null
let btnStop = null
let btnPause = null
let btnResume = null

function show(elem) {
    elem.style.display = 'block'
}

function hide(elem) {
    elem.style.display = 'none'
}

function applyState() {
    if (isActive) {
        show(btnStop)
        hide(btnStart)
        if (isPaused) {
            show(btnResume)
            hide(btnPause)
        }
        else {
            hide(btnResume)
            show(btnPause)
        }
    }
    else {
        show(btnStart)
        hide(btnPause)
        hide(btnStop)
        hide(btnResume)
    }
}

function start() {
    isActive = true
    applyState()
}

function stop() {
    isActive = false
    applyState()
}

function pause() {
    isPaused = true
    applyState()
}

function resume() {
    isPaused = false
    applyState()
}

/**
 * Получает ID задачи из URL страницы в Redmine
 * @returns {number|null} ID задачи или null, если страница не является страницей задачи
 */
function getCurrentIssueId() {
    // Проверяем несколько возможных форматов URL в Redmine:
    // 1. /issues/123
    // 2. /issues/123?param=value
    // 3. /projects/projectname/issues/123
    // 4. /issues/123/some-additional-path

    const match = window.location.pathname.match(/\/(?:issues|projects\/[^\/]+\/issues)\/(\d+)/)
    return match ? parseInt(match[1], 10) : null
}

class RedminePluginAPI {
    constructor() {
        this.baseUrl = window.location.origin
        this.csrfToken = this._getCSRFToken()
    }

    _getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content ||
            $('meta[name=csrf-token]').attr('content')
    }

    async _request(method, endpoint, data = null) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Redmine-API-Key': this._getApiKey() // Добавляем API ключ, если есть
        }

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
            headers['X-CSRF-Token'] = this.csrfToken
        }

        const config = {
            method: method,
            credentials: 'include', // Важно для передачи cookies
            headers: headers
        }

        if (data) {
            config.body = JSON.stringify(data)
        }

        const response = await fetch(`${this.baseUrl}/${endpoint}.json`, config)

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`HTTP error! status: ${response.status}, details: ${error}`)
        }

        return response.json()
    }

    _getApiKey() {
        // Попробуем получить API ключ из localStorage или кук
        return localStorage.getItem('redmine-api-key') ||
            this._getCookie('_redmine_session')
    }

    _getCookie(name) {
        const value = ` ${document.cookie}`
        const parts = value.split(` ${name}=`)
        if (parts.length === 2) return parts.pop().split('').shift()
    }

    async getCurrentUser() {
        return this._request('GET', 'users/current')
    }
}

const redmineAPI = new RedminePluginAPI()
let currentUser = null
const currentIssueId = getCurrentIssueId()

async function initializePlugin() {
    try {
        currentUser = await redmineAPI.getCurrentUser()
        if (currentUser) {
            pluginLog('Пользователь авторизован')
            console.log(currentUser)
            insertPluginHtml()
            setInterval(updatePluginMenu, 1 * 1000)
        } else {
            pluginLog('Пользователь НЕ авторизован')
        }
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error)
        pluginLog('Ошибка при проверке авторизации')
    }
}

function updatePluginMenu() {
    pluginLog('Меню обновлено')
    // Обновляем ID задачи в интерфейсе
    if (currentIssueId) {
        const issueIdElement = document.getElementById('timetracker-issueid')
        if (issueIdElement) {
            issueIdElement.textContent = `#${currentIssueId}`
        }
    }
}

function pluginLog(message) {
    console.log('TIME_TRACKER: ' + message)
}

document.addEventListener('DOMContentLoaded', function () {
    initializePlugin()
        .then(() => {
            // Эти обработчики добавляем только после инициализации
            btnStart = document.getElementById('timetracker-start')
            btnStop = document.getElementById('timetracker-stop')
            btnPause = document.getElementById('timetracker-pause')
            btnResume = document.getElementById('timetracker-resume')

            if (btnStart) btnStart.addEventListener('click', start)
            if (btnStop) btnStop.addEventListener('click', stop)
            if (btnPause) btnPause.addEventListener('click', pause)
            if (btnResume) btnResume.addEventListener('click', resume)

            applyState()
        })
})
