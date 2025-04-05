document.getElementById('loggedas').insertAdjacentHTML('afterend',
    `
<div id="timetracker-menu">
    <a class="timetracker-menu__item" id="timetracker-issueid" href="#">#24324</a>
    <span class="timetracker-menu__item" id="timetracker-duration">00:00</span>
    <span class="timetracker-menu__control-item" id="timetracker-start">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
        </svg>
    </span>
    <span class="timetracker-menu__control-item" id="timetracker-stop">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
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
</div>
`
);

const btnStart = document.getElementById('timetracker-start')
const btnStop = document.getElementById('timetracker-stop')
const btnPause = document.getElementById('timetracker-pause')
const btnResume = document.getElementById('timetracker-resume')

let isActive = false;
let isPaused = false;

function show(elem) {
    elem.style.display = 'block';
}

function hide(elem) {
    elem.style.display = 'none';
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

btnStart.addEventListener('click', e => {
    start()
})

btnStop.addEventListener('click', e => {
    stop()
})

btnPause.addEventListener('click', e => {
    pause()
})

btnResume.addEventListener('click', e => {
    resume()
})

document.addEventListener('DOMContentLoaded', e => {
    applyState()
})
