const state = {
    isRunning: false,
    progress: 0,
    mode: 'upload',
    antennaFrame: 1,
    lastAntennaUpdate: 0,
    lastFrameTime: 0
};

// DOM Elements
const btnDownload = document.getElementById('btn-download');
const btnUpload = document.getElementById('btn-upload');
const barraContainer = document.getElementById('barra-container');
const progressoFill = document.getElementById('progresso-fill');
const percentText = document.getElementById('percent-text');
const timeText = document.getElementById('time-text');
const labelLeft = document.getElementById('label-left');
const labelRight = document.getElementById('label-right');
const antenna = document.getElementById('au-antena');
const completeMsg = document.getElementById('complete-msg');
const panel = document.querySelector('.au-painel');

const pastaLeftClosed = document.querySelector('.au-pasta-left');
const pastaLeftOpen = document.querySelector('.au-pasta-aberta1-left');
const pastaRightClosed = document.querySelector('.au-pasta-right');
const pastaRightOpen = document.querySelector('.au-pasta-aberta1-right');

const roomNames = ["Comunicações", "Escudo", "Navegação", "O2", "Armaria", "Cafeteria", "Elétrica", "Medbay"];

const estTimes = [
    "Est. Time: 1D 12H 45M 12S",
    "Est. Time: 22H 10M 56S",
    "Est. Time: 18H 33M 12S",
    "Est. Time: 45M 12S",
    "Est. Time: 12M 05S",
];

// Initialization
let currentTaskMode = 'upload'; // Começa testando o upload
btnDownload.style.display = currentTaskMode === 'download' ? 'block' : 'none';
btnUpload.style.display = currentTaskMode === 'upload' ? 'block' : 'none';

btnDownload.addEventListener('click', () => startTask('download'));
btnUpload.addEventListener('click', () => startTask('upload'));

function startTask(mode) {
    if (state.isRunning) return;

    state.isRunning = true;
    state.mode = mode;
    state.progress = 0;
    state.lastFrameTime = performance.now();

    // Reset UI
    completeMsg.style.display = 'none';
    barraContainer.style.display = 'block';
    progressoFill.style.width = '0%';
    percentText.innerText = '0%';

    btnDownload.style.display = 'none';
    btnUpload.style.display = 'none';

    // Set Labels
    if (mode === 'download') {
        const randomRoom = roomNames[Math.floor(Math.random() * roomNames.length)];
        labelLeft.innerText = randomRoom;
        labelRight.innerText = "Meu tablet";
        antenna.style.display = 'none';
    } else {
        labelLeft.innerText = "Meu tablet";
        labelRight.innerText = "Central";
        antenna.style.display = 'block';
    }

    panel.classList.add('shake');
    setTimeout(() => panel.classList.remove('shake'), 500);

    // Initial folder states
    pastaLeftClosed.style.display = 'block';
    pastaLeftOpen.style.display = 'none';
    pastaRightClosed.style.display = 'block';
    pastaRightOpen.style.display = 'none';

    requestAnimationFrame(updateTask);
    startFolderLoop();
}

function updateTask(timestamp) {
    if (!state.isRunning) return;

    const delta = timestamp - state.lastFrameTime;
    state.lastFrameTime = timestamp;

    // Progress takes about 8-9 seconds total -> roughly 11.5 progress per second -> 0.0115 per ms
    state.progress += delta * 0.0115;
    if (state.progress >= 100) {
        state.progress = 100;
        updateProgressUI();
        finishTask();
        return;
    }

    updateProgressUI();

    // Antenna tick
    if (state.mode === 'upload') {
        if (timestamp - state.lastAntennaUpdate > 200) {
            state.antennaFrame = (state.antennaFrame % 3) + 1;
            antenna.src = `img/antena${state.antennaFrame}.png`;
            state.lastAntennaUpdate = timestamp;
        }
    }

    requestAnimationFrame(updateTask);
}

function updateProgressUI() {
    progressoFill.style.width = `${state.progress}%`;
    percentText.innerText = `${Math.floor(state.progress)}%`;
    updateTimeText();
}

function updateTimeText() {
    if (state.progress < 20) {
        timeText.innerText = estTimes[0];
    } else if (state.progress < 40) {
        timeText.innerText = estTimes[1];
    } else if (state.progress < 60) {
        timeText.innerText = estTimes[2];
    } else if (state.progress < 80) {
        timeText.innerText = estTimes[3];
    } else {
        const secondsLeft = Math.ceil((100 - state.progress) / 11.5);
        timeText.innerText = `Est. Time: ${secondsLeft}s`;
    }
}

async function startFolderLoop() {
    while (state.isRunning && state.progress < 100) {
        // 1. Left folder opens, right stays closed
        pastaLeftOpen.style.display = 'block';
        pastaLeftClosed.style.display = 'none';

        pastaRightOpen.style.display = 'none';
        pastaRightClosed.style.display = 'block';

        await sleep(100);
        if (!state.isRunning) break;

        // 2. Launch paper and avatar
        const docDuration = 2000; // Slower movement
        const { doc, avatar } = spawnDocument(docDuration);

        // 3. After paper leaves left folder (slower now, so wait a bit longer), left folder closes
        setTimeout(() => {
            if (!state.isRunning) return;
            pastaLeftOpen.style.display = 'none';
            pastaLeftClosed.style.display = 'block';
        }, 350);

        // 4. Wait for paper to almost arrive at right folder
        await sleep(docDuration - 100);
        if (!state.isRunning) {
            if (doc) { doc.remove(); avatar.remove(); }
            break;
        }

        // 5. Right folder opens to catch it
        pastaRightOpen.style.display = 'block';
        pastaRightClosed.style.display = 'none';

        // 6. Paper arrives and animation finishes
        await sleep(150);
        if (doc) { doc.remove(); avatar.remove(); }

        // 7. Right folder closes
        await sleep(150);
        if (!state.isRunning) break;
        pastaRightOpen.style.display = 'none';
        pastaRightClosed.style.display = 'block';

        // 8. Delay before next paper starts
        await sleep(300);
    }
}

function spawnDocument(duration) {
    const doc = document.createElement('img');
    doc.src = 'img/documentos.png';
    doc.className = 'flying-doc';
    panel.appendChild(doc);

    const avatar = document.createElement('img');
    avatar.src = 'https://hubbe.biz/avatar/meia-noite?action=wlk&direction=1&head_direction=1&gesture=std&frame=0';
    avatar.className = 'flying-avatar';
    panel.appendChild(avatar);

    const startX = 85;
    const startY = 115; // Desce o papel em 5 pixels
    const endX = 350;
    const endY = 115;

    doc.style.left = `${startX}px`;
    doc.style.top = `${startY}px`;

    // Offset the avatar so it's placed behind the paper, making the paper sit "in front"
    // Sobe o boneco um pouco mais (estava -30, agora -45)
    const avatarStartX = startX - 15;
    const avatarStartY = startY - 45;

    avatar.style.left = `${avatarStartX}px`;
    avatar.style.top = `${avatarStartY}px`;

    // Straight line with slight rotation along the way for the doc
    doc.animate([
        { left: `${startX}px`, top: `${startY}px`, transform: 'rotate(0deg)' },
        { left: `${endX}px`, top: `${endY}px`, transform: 'rotate(90deg)' }
    ], {
        duration: duration,
        easing: 'linear',
        fill: 'forwards'
    });

    // Straight line for the avatar
    avatar.animate([
        { left: `${avatarStartX}px`, top: `${avatarStartY}px` },
        { left: `${endX - 15}px`, top: `${endY - 45}px` }
    ], {
        duration: duration,
        easing: 'linear',
        fill: 'forwards'
    });

    return { doc, avatar };
}

function finishTask() {
    state.isRunning = false;
    barraContainer.style.display = 'none';
    completeMsg.style.display = 'block';

    // Ensure both folders are closed
    pastaLeftClosed.style.display = 'block';
    pastaLeftOpen.style.display = 'none';
    pastaRightClosed.style.display = 'block';
    pastaRightOpen.style.display = 'none';

    setTimeout(() => {
        completeMsg.style.display = 'none';
        antenna.style.display = 'none';
        
        // Alterna entre download e upload para poder testar ambos
        currentTaskMode = currentTaskMode === 'download' ? 'upload' : 'download';
        btnDownload.style.display = currentTaskMode === 'download' ? 'block' : 'none';
        btnUpload.style.display = currentTaskMode === 'upload' ? 'block' : 'none';
    }, 3000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

