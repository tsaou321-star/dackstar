/* ==========================================================================
   怪力亂神鳥嘴醫生 - 核心邏輯控制 (app.js)
   版本：單機傳接遊玩 (Pass & Play) + 單人 AI 對戰版
   ========================================================================== */

// ==========================================================================
// 1. 遊戲設定與常數定義
// ==========================================================================

const BOARD_SIZE = 10;

const SHIPS_INFO = {
    thor: {
        name: '雷神',
        id: 'thor',
        color: 'var(--color-thor)',
        shape: {
            horizontal: [
                {r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2},
                {r: 1, c: 0}, {r: 1, c: 1}, {r: 1, c: 2}
            ], // 2x3
            vertical: [
                {r: 0, c: 0}, {r: 0, c: 1},
                {r: 1, c: 0}, {r: 1, c: 1},
                {r: 2, c: 0}, {r: 2, c: 1}
            ] // 3x2
        },
        svg: (width, height) => `
            <svg width="${width}" height="${height}" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,40 L30,20 L25,35 L45,15 L35,45 L50,40" stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.6"/>
                <path d="M110,40 L90,60 L95,45 L75,65 L85,35 L70,40" stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.6"/>
                <rect x="40" y="20" width="40" height="25" rx="4" fill="#12162b" stroke="#00f3ff" stroke-width="3" filter="drop-shadow(0 0 5px #00f3ff)"/>
                <path d="M40,25 L80,25 M40,40 L80,40" stroke="#00f3ff" stroke-width="1" opacity="0.5"/>
                <rect x="57" y="45" width="6" height="25" fill="#553311" stroke="#00f3ff" stroke-width="2"/>
                <circle cx="60" cy="72" r="3" fill="#00f3ff"/>
            </svg>
        `
    },
    plague: {
        name: '鳥嘴醫生',
        id: 'plague',
        color: 'var(--color-plague)',
        shape: {
            horizontal: [
                {r: 0, c: 0}, {r: 0, c: 1},
                {r: 1, c: 0}, {r: 1, c: 1}
            ], // 2x2
            vertical: [
                {r: 0, c: 0}, {r: 0, c: 1},
                {r: 1, c: 0}, {r: 1, c: 1}
            ] // 2x2
        },
        svg: (width, height) => `
            <svg width="${width}" height="${height}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M25,15 C35,10 55,15 55,25 C55,30 45,35 45,45 C45,55 20,68 15,68 C12,68 18,50 20,40 C18,30 18,20 25,15 Z" fill="#0e0a1a" stroke="#bd00ff" stroke-width="3" filter="drop-shadow(0 0 5px #bd00ff)"/>
                <circle cx="38" cy="28" r="5" fill="#ff0055" filter="drop-shadow(0 0 4px #ff0055)"/>
                <path d="M18,18 C25,5 50,5 62,15 C64,17 55,25 45,22 Z" fill="#05030a" stroke="#bd00ff" stroke-width="2"/>
            </svg>
        `
    },
    cactus: {
        name: '仙人掌',
        id: 'cactus',
        color: 'var(--color-cactus)',
        shape: {
            horizontal: [{r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2}], // 1x3
            vertical: [{r: 0, c: 0}, {r: 1, c: 0}, {r: 2, c: 0}] // 3x1
        },
        svg: (width, height, orientation) => {
            const isVert = orientation === 'vertical';
            return `
                <svg width="${width}" height="${height}" viewBox="0 0 ${isVert ? '40 120' : '120 40'}" xmlns="http://www.w3.org/2000/svg">
                    ${isVert ? `
                        <rect x="15" y="10" width="10" height="100" rx="5" fill="#0a1f0f" stroke="#39ff14" stroke-width="3" filter="drop-shadow(0 0 5px #39ff14)"/>
                        <path d="M15,40 L8,40 C5,40 5,30 5,30 L5,20" fill="none" stroke="#39ff14" stroke-width="3"/>
                        <path d="M25,60 L32,60 C35,60 35,50 35,50 L35,40" fill="none" stroke="#39ff14" stroke-width="3"/>
                        <path d="M10,25 L15,25 M25,35 L30,35 M8,50 L15,50 M25,75 L32,75 M12,90 L15,90" stroke="#39ff14" stroke-width="2"/>
                        <circle cx="20" cy="8" r="4" fill="#ff0055"/>
                    ` : `
                        <rect x="10" y="15" width="100" height="10" rx="5" fill="#0a1f0f" stroke="#39ff14" stroke-width="3" filter="drop-shadow(0 0 5px #39ff14)"/>
                        <path d="M40,15 L40,8 C40,5 30,5 30,5 L20,5" fill="none" stroke="#39ff14" stroke-width="3"/>
                        <path d="M60,25 L60,32 C60,35 50,35 50,35 L40,35" fill="none" stroke="#39ff14" stroke-width="3"/>
                        <path d="M25,10 L25,15 M35,25 L35,30 M50,8 L50,15 M75,25 L75,32 M90,12 L90,15" stroke="#39ff14" stroke-width="2"/>
                        <circle cx="112" cy="20" r="4" fill="#ff0055"/>
                    `}
                </svg>
            `;
        }
    },
    banknote: {
        name: '馬圖案鈔票',
        id: 'banknote',
        color: 'var(--color-banknote)',
        shape: {
            horizontal: [{r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2}], // 1x3
            vertical: [{r: 0, c: 0}, {r: 1, c: 0}, {r: 2, c: 0}] // 3x1
        },
        svg: (width, height, orientation) => {
            const isVert = orientation === 'vertical';
            return `
                <svg width="${width}" height="${height}" viewBox="0 0 ${isVert ? '40 120' : '120 40'}" xmlns="http://www.w3.org/2000/svg">
                    ${isVert ? `
                        <rect x="5" y="5" width="30" height="110" rx="3" fill="#1f1c0a" stroke="#ffe600" stroke-width="2" filter="drop-shadow(0 0 4px #ffe600)"/>
                        <rect x="9" y="9" width="22" height="102" fill="none" stroke="#ffe600" stroke-width="1" stroke-dasharray="3,2"/>
                        <text x="20" y="25" font-family="monospace" font-size="12" fill="#ffe600" font-weight="bold" text-anchor="middle">$</text>
                        <path d="M15,50 C18,45 22,45 25,50 C25,52 28,58 25,62 C22,60 18,60 15,50 Z" fill="#ffe600"/>
                        <text x="20" y="105" font-family="monospace" font-size="12" fill="#ffe600" font-weight="bold" text-anchor="middle">$</text>
                    ` : `
                        <rect x="5" y="5" width="110" height="30" rx="3" fill="#1f1c0a" stroke="#ffe600" stroke-width="2" filter="drop-shadow(0 0 4px #ffe600)"/>
                        <rect x="9" y="9" width="102" height="22" fill="none" stroke="#ffe600" stroke-width="1" stroke-dasharray="3,2"/>
                        <path d="M40,22 C45,18 50,18 55,20 C57,18 60,12 63,14 C65,16 64,18 62,20 C65,21 70,22 75,18 C72,23 68,24 64,24 L55,24 C50,24 45,25 40,22 Z" fill="#ffe600"/>
                        <path d="M45,24 L42,28 M52,24 L50,28 M60,24 L62,28 M68,24 L72,28" stroke="#ffe600" stroke-width="2"/>
                        <text x="15" y="26" font-family="monospace" font-size="16" fill="#ffe600" font-weight="bold">$</text>
                        <text x="95" y="26" font-family="monospace" font-size="16" fill="#ffe600" font-weight="bold">$</text>
                    `}
                </svg>
            `;
        }
    }
};

const TOTAL_HP = 16;

// ==========================================================================
// 2. 遊戲狀態變數
// ==========================================================================

let gameState = 'SETUP_P1'; // 'SETUP_P1' (P1部署), 'SETUP_P2' (P2部署), 'PLAYING', 'GAME_OVER'
let gameMode = 'ai';        // 'ai' (單人), 'pass' (單機傳接對戰)
let soundEnabled = true;
let voiceEnabled = true;
let isShotResolving = false;

const SHIP_IMAGE_SOURCES = {
    thor: 'assets/images/thor.png.jpg',
    plague: 'assets/images/plague.png.png',
    cactus: 'assets/images/仙人掌.png',
    banknote: 'assets/images/banknote.png.jpg'
};

// 當前活動玩家 (1 或 2，僅在 pass 模式下有用)
let activePlayer = 1;

// 玩家 1 的資料
let player1Grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
let player1PlacedShips = {}; // { shipId: { r, c, orientation, cells: [...] } }
let player1Shots = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)); // 記錄 P1 打 P2 的開火點

// 玩家 2 (或 AI) 的資料
let player2Grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
let player2PlacedShips = {};
let player2Shots = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)); // 記錄 P2 打 P1 的開火點

// 擺放階段選取的船隻資訊
let selectedShipId = null;
let selectedOrientation = 'horizontal';

// 電腦 AI 的狀態變數
const AI_STATE = {
    mode: 'HUNT',
    targetHits: [],
    huntParity: 0
};

// 音效上下文
let audioCtx = null;

// ==========================================================================
// 3. 初始化 DOM 元素與事件監聽器
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    // 建立棋盤標籤與網格
    initLabelHeaders();
    initLabelHeaders();
    createGridDOM('playerBoard', 'player');
    createGridDOM('enemyBoard', 'enemy');

    // 船隻選擇事件
    const shipCards = document.querySelectorAll('.ship-select-card');
    shipCards.forEach(card => {
        card.addEventListener('click', () => {
            if (gameState !== 'SETUP_P1' && gameState !== 'SETUP_P2') return;
            selectShip(card.dataset.shipId);
        });

        // 拖曳部署的圖形預覽初始化
        const shipId = card.dataset.shipId;
        const previewEl = card.querySelector('.ship-preview');
        if (previewEl) {
            const imageSrc = SHIP_IMAGE_SOURCES[shipId];
            previewEl.innerHTML = imageSrc
                ? `<img src="${imageSrc}" style="width:100%; height:100%; object-fit:contain;" alt="${SHIPS_INFO[shipId].name}">`
                : SHIPS_INFO[shipId].svg("100%", "100%", "horizontal");
        }
    });

    // 控制面板事件
    document.getElementById('modeSelect').addEventListener('change', (e) => {
        setGameMode(e.target.value);
    });
    
    document.getElementById('btnRotate').addEventListener('click', toggleOrientation);
    document.getElementById('btnRandomize').addEventListener('click', handleRandomizeClick);
    document.getElementById('btnStartGame').addEventListener('click', handleStartGameClick);
    document.getElementById('btnRestart').addEventListener('click', resetGame);
    
    // 音量與語音切換
    const btnSound = document.getElementById('btnSoundToggle');
    btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btnSound.innerText = soundEnabled ? '🔊' : '🔇';
        btnSound.style.borderColor = soundEnabled ? 'var(--neon-cyan)' : '#555';
    });

    const btnVoice = document.getElementById('btnVoiceToggle');
    btnVoice.addEventListener('click', () => {
        voiceEnabled = !voiceEnabled;
        btnVoice.innerText = voiceEnabled ? '🗣️' : '🔇🗣️';
        btnVoice.style.borderColor = voiceEnabled ? 'var(--neon-cyan)' : '#555';
    });

    // 鍵盤旋轉捷徑 [R]
    window.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            if ((gameState === 'SETUP_P1' || gameState === 'SETUP_P2') && selectedShipId) {
                toggleOrientation();
            }
        }
    });

    // 預設選取第一艘船
    selectShip('thor');
});

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {
            // The game still works without install/offline support.
        });
    });
}

// ==========================================================================
// 4. UI 渲染輔助函式
// ==========================================================================

function initLabelHeaders() {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const pColContainer = document.getElementById('playerColLabels');
    const eColContainer = document.getElementById('enemyColLabels');
    const pRowContainer = document.getElementById('playerRowLabels');
    const eRowContainer = document.getElementById('enemyRowLabels');

    pColContainer.innerHTML = '';
    eColContainer.innerHTML = '';
    pRowContainer.innerHTML = '';
    eRowContainer.innerHTML = '';

    for (let i = 0; i < BOARD_SIZE; i++) {
        pColContainer.innerHTML += `<div class="col-label">${cols[i]}</div>`;
        eColContainer.innerHTML += `<div class="col-label">${cols[i]}</div>`;
        pRowContainer.innerHTML += `<div class="row-label">${i + 1}</div>`;
        eRowContainer.innerHTML += `<div class="row-label">${i + 1}</div>`;
    }
}

function createGridDOM(boardId, type) {
    const board = document.getElementById(boardId);
    board.innerHTML = '';
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.dataset.type = type;

            if (type === 'player') {
                cell.addEventListener('mouseenter', handlePlayerCellMouseEnter);
                cell.addEventListener('mouseleave', handlePlayerCellMouseLeave);
                cell.addEventListener('click', handlePlayerCellClick);
            } else {
                cell.addEventListener('click', handleEnemyCellClick);
            }
            
            board.appendChild(cell);
        }
    }
}

function appendLog(message, className = '') {
    const logMessages = document.getElementById('logMessages');
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    entry.innerHTML = `<span style="color: #666688; margin-right: 5px;">[${timeStr}]</span> ${message}`;
    
    logMessages.appendChild(entry);
    logMessages.scrollTop = logMessages.scrollHeight;
}

// 根據當前活動玩家重新渲染兩邊的棋盤 (核心渲染入口)
function drawBoardsForActivePlayer() {
    const playerBoard = document.getElementById('playerBoard');
    const enemyBoard = document.getElementById('enemyBoard');
    const playerTitle = document.getElementById('playerBoardTitle');
    const enemyTitle = document.getElementById('enemyBoardTitle');

    // 清除舊的 SVG 殘骸
    document.querySelectorAll('.ship-segment').forEach(el => el.remove());

    // 重新畫格子
    createGridDOM('playerBoard', 'player');
    createGridDOM('enemyBoard', 'enemy');

    if (gameMode === 'ai') {
        playerTitle.innerText = "您的防禦區 (您的棋盤)";
        enemyTitle.innerText = "雷達掃描區 (敵方棋盤)";

        // 1. 玩家防禦區：顯示玩家的船與 AI 的開火點
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cellEl = playerBoard.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
                const shipCell = player1Grid[r][c];
                const shotState = player2Shots[r][c]; // AI 打 P1 的點

                if (shipCell) {
                    cellEl.classList.add('cell-ship', `ship-${shipCell.shipId}`);
                }
                if (shotState === 1) cellEl.classList.add('cell-miss');
                if (shotState === 2) cellEl.classList.add('cell-hit');
            }
        }
        // 渲染玩家 1 的船隻 SVG
        Object.keys(player1PlacedShips).forEach(shipId => {
            const ship = player1PlacedShips[shipId];
            renderShipSVG('player', shipId, ship.r, ship.c, ship.orientation);
        });

        // 2. 雷達掃描區：顯示玩家打 AI 的開火點與已擊沉的敵艦
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cellEl = enemyBoard.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
                const shotState = player1Shots[r][c]; // P1 打 AI 的點

                if (shotState === 1) cellEl.classList.add('cell-miss');
                if (shotState === 2) cellEl.classList.add('cell-hit');
            }
        }
        // 若 AI 船艦沉沒，顯示給玩家看
        Object.keys(player2PlacedShips).forEach(shipId => {
            const ship = player2PlacedShips[shipId];
            const allSunk = ship.cells.every(cell => player1Shots[cell.r][cell.c] === 2);
            if (allSunk) {
                renderShipSVG('enemy', shipId, ship.r, ship.c, ship.orientation);
            }
        });

    } else {
        // 單機雙人傳接模式
        const pName = activePlayer === 1 ? "玩家 1" : "玩家 2";
        const oppName = activePlayer === 1 ? "玩家 2" : "玩家 1";
        
        playerTitle.innerText = `${pName} 的防禦區 (您的棋盤)`;
        enemyTitle.innerText = `${pName} 的雷達掃描區 (${oppName} 棋盤)`;

        const currentGrid = activePlayer === 1 ? player1Grid : player2Grid;
        const currentPlaced = activePlayer === 1 ? player1PlacedShips : player2PlacedShips;
        const oppGrid = activePlayer === 1 ? player2Grid : player1Grid;
        const oppPlaced = activePlayer === 1 ? player2PlacedShips : player1PlacedShips;

        // 本方射擊本方的記錄 (被對手打)
        const myDefenseShots = activePlayer === 1 ? player2Shots : player1Shots;
        // 本方射擊對方的記錄 (打對手)
        const myRadarShots = activePlayer === 1 ? player1Shots : player2Shots;

        // 1. 本方防禦區：顯示本方的船與對手的開火點
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cellEl = playerBoard.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
                const shipCell = currentGrid[r][c];
                const shotState = myDefenseShots[r][c];

                if (shipCell) {
                    cellEl.classList.add('cell-ship', `ship-${shipCell.shipId}`);
                }
                if (shotState === 1) cellEl.classList.add('cell-miss');
                if (shotState === 2) cellEl.classList.add('cell-hit');
            }
        }
        Object.keys(currentPlaced).forEach(shipId => {
            const ship = currentPlaced[shipId];
            renderShipSVG('player', shipId, ship.r, ship.c, ship.orientation);
        });

        // 2. 雷達掃描區：顯示本方擊打對手的開火點與已擊沉的敵艦
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cellEl = enemyBoard.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
                const shotState = myRadarShots[r][c];

                if (shotState === 1) cellEl.classList.add('cell-miss');
                if (shotState === 2) cellEl.classList.add('cell-hit');
            }
        }
        Object.keys(oppPlaced).forEach(shipId => {
            const ship = oppPlaced[shipId];
            const allSunk = ship.cells.every(cell => myRadarShots[cell.r][cell.c] === 2);
            if (allSunk) {
                renderShipSVG('enemy', shipId, ship.r, ship.c, ship.orientation);
            }
        });
    }
}

// ==========================================================================
// 5. 船隻放置邏輯 (擺放階段)
// ==========================================================================

function selectShip(shipId) {
    selectedShipId = shipId;
    
    document.querySelectorAll('.ship-select-card').forEach(card => {
        if (card.dataset.shipId === shipId) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    playAudio('click');
}

function toggleOrientation() {
    selectedOrientation = selectedOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    appendLog(`旋轉船隻！當前方向：${selectedOrientation === 'horizontal' ? '水平' : '垂直'}`);
    
    const hoveredCell = document.querySelector('.grid-cell[data-type="player"]:hover');
    if (hoveredCell) {
        handlePlayerCellMouseLeave();
        handlePlayerCellMouseEnter({ target: hoveredCell });
    }
    
    playAudio('click');
}

function getShipOccupiedCells(shipId, startRow, startCol, orientation) {
    const ship = SHIPS_INFO[shipId];
    if (!ship) return [];
    
    const shape = ship.shape[orientation];
    return shape.map(offset => ({
        r: startRow + offset.r,
        c: startCol + offset.c
    }));
}

function isValidPlacement(shipId, startRow, startCol, orientation, currentGrid) {
    const cells = getShipOccupiedCells(shipId, startRow, startCol, orientation);
    
    if (cells.length === 0) return false;
    
    for (let cell of cells) {
        if (cell.r < 0 || cell.r >= BOARD_SIZE || cell.c < 0 || cell.c >= BOARD_SIZE) {
            return false;
        }
        const existing = currentGrid[cell.r][cell.c];
        if (existing && existing.shipId !== shipId) {
            return false;
        }
    }
    return true;
}

function handlePlayerCellMouseEnter(e) {
    if (gameState !== 'SETUP_P1' && gameState !== 'SETUP_P2') return;
    if (!selectedShipId) return;
    
    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);
    
    const currentGrid = gameState === 'SETUP_P1' ? player1Grid : player2Grid;
    const cells = getShipOccupiedCells(selectedShipId, r, c, selectedOrientation);
    const isValid = isValidPlacement(selectedShipId, r, c, selectedOrientation, currentGrid);
    
    cells.forEach(cell => {
        if (cell.r >= 0 && cell.r < BOARD_SIZE && cell.c >= 0 && cell.c < BOARD_SIZE) {
            const cellEl = document.querySelector(`.grid-cell[data-type="player"][data-row="${cell.r}"][data-col="${cell.c}"]`);
            if (cellEl) {
                cellEl.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
            }
        }
    });
}

function handlePlayerCellMouseLeave() {
    document.querySelectorAll('.grid-cell[data-type="player"]').forEach(cell => {
        cell.classList.remove('preview-valid', 'preview-invalid');
    });
}

function handlePlayerCellClick(e) {
    if (gameState !== 'SETUP_P1' && gameState !== 'SETUP_P2') return;
    
    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);
    
    const currentGrid = gameState === 'SETUP_P1' ? player1Grid : player2Grid;
    const currentPlaced = gameState === 'SETUP_P1' ? player1PlacedShips : player2PlacedShips;

    const clickedCellInfo = currentGrid[r][c];

    // 如果點選到已放置的船，進行回收移除，讓玩家可以重新擺放
    if (clickedCellInfo) {
        removePlayerShip(clickedCellInfo.shipId, currentGrid, currentPlaced);
        selectShip(clickedCellInfo.shipId);
        handlePlayerCellMouseEnter(e);
        return;
    }

    if (!selectedShipId) return;

    const isValid = isValidPlacement(selectedShipId, r, c, selectedOrientation, currentGrid);
    if (!isValid) {
        playAudio('miss');
        return;
    }

    placePlayerShip(selectedShipId, r, c, selectedOrientation, currentGrid, currentPlaced);
    handlePlayerCellMouseLeave();
    playAudio('click');
}

function placePlayerShip(shipId, startRow, startCol, orientation, currentGrid, currentPlaced) {
    removePlayerShip(shipId, currentGrid, currentPlaced);
    
    const cells = getShipOccupiedCells(shipId, startRow, startCol, orientation);
    
    cells.forEach((cell, idx) => {
        const offset = SHIPS_INFO[shipId].shape[orientation][idx];
        currentGrid[cell.r][cell.c] = {
            shipId: shipId,
            rOffset: offset.r,
            cOffset: offset.c
        };
        
        const cellEl = document.querySelector(`.grid-cell[data-type="player"][data-row="${cell.r}"][data-col="${cell.c}"]`);
        if (cellEl) {
            cellEl.classList.add('cell-ship', `ship-${shipId}`);
        }
    });

    currentPlaced[shipId] = {
        r: startRow,
        c: startCol,
        orientation: orientation,
        cells: cells
    };

    renderShipSVG('player', shipId, startRow, startCol, orientation);

    const card = document.querySelector(`.ship-select-card[data-ship-id="${shipId}"]`);
    if (card) {
        card.classList.add('placed');
        card.classList.remove('selected');
    }

    selectedShipId = null;
    const remainingCard = document.querySelector('.ship-select-card:not(.placed)');
    if (remainingCard) {
        selectShip(remainingCard.dataset.shipId);
    }

    checkSetupReady();
}

function removePlayerShip(shipId, currentGrid, currentPlaced) {
    const placed = currentPlaced[shipId];
    if (!placed) return;

    placed.cells.forEach(cell => {
        currentGrid[cell.r][cell.c] = null;
        const cellEl = document.querySelector(`.grid-cell[data-type="player"][data-row="${cell.r}"][data-col="${cell.c}"]`);
        if (cellEl) {
            cellEl.className = 'grid-cell';
        }
    });

    const svgEl = document.querySelector(`.ship-segment[data-ship-id="${shipId}"][data-type="player"]`);
    if (svgEl) {
        svgEl.remove();
    }

    delete currentPlaced[shipId];

    const card = document.querySelector(`.ship-select-card[data-ship-id="${shipId}"]`);
    if (card) {
        card.classList.remove('placed');
    }

    checkSetupReady();
}

// 渲染覆蓋在格子上的 SVG（優先讀取 assets 目錄下的自訂圖片，載入失敗時自動降級顯示高科技 SVG）
function renderShipSVG(boardType, shipId, r, c, orientation) {
    const targetCell = document.querySelector(`.grid-cell[data-type="${boardType}"][data-row="${r}"][data-col="${c}"]`);
    if (!targetCell) return;

    const shape = SHIPS_INFO[shipId].shape[orientation];
    let maxR = 0, maxC = 0;
    shape.forEach(offset => {
        if (offset.r > maxR) maxR = offset.r;
        if (offset.c > maxC) maxC = offset.c;
    });
    const rowSpan = maxR + 1;
    const colSpan = maxC + 1;

    const segment = document.createElement('div');
    segment.className = 'ship-segment';
    segment.dataset.shipId = shipId;
    segment.dataset.type = boardType;
    
    segment.style.width = `calc(${colSpan} * var(--grid-cell-size))`;
    segment.style.height = `calc(${rowSpan} * var(--grid-cell-size))`;
    segment.style.position = 'absolute';
    segment.style.left = '0';
    segment.style.top = '0';

    const imageSrc = SHIP_IMAGE_SOURCES[shipId];

    segment.innerHTML = `
        ${imageSrc ? `<img class="ship-custom-img" src="${imageSrc}" style="display:none; width:90%; height:90%; object-fit:contain;" alt="${SHIPS_INFO[shipId].name}">` : ''}
        <div class="ship-svg-container" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
            ${SHIPS_INFO[shipId].svg("100%", "100%", orientation)}
        </div>
    `;

    const img = segment.querySelector('.ship-custom-img');
    const svgContainer = segment.querySelector('.ship-svg-container');

    if (img) {
        img.onload = () => {
            img.style.display = 'block';
            svgContainer.style.display = 'none';
        };

        img.onerror = () => {
            img.style.display = 'none';
            svgContainer.style.display = 'flex';
        };
    }

    targetCell.appendChild(segment);
}

function checkSetupReady() {
    const currentPlaced = gameState === 'SETUP_P1' ? player1PlacedShips : player2PlacedShips;
    const placedCount = Object.keys(currentPlaced).length;
    const btnStart = document.getElementById('btnStartGame');
    if (placedCount === 4) {
        btnStart.removeAttribute('disabled');
    } else {
        btnStart.setAttribute('disabled', 'true');
    }
}

// 隨機擺放算法 (通用)
function randomizeShips(grid, placedShipsMap, boardType) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            grid[r][c] = null;
        }
    }
    
    // 清除該棋盤的所有 SVG 圖片
    document.querySelectorAll(`.ship-segment[data-type="${boardType}"]`).forEach(el => el.remove());
    
    if (boardType === 'player') {
        document.querySelectorAll('.ship-select-card').forEach(card => card.classList.add('placed'));
    }

    const shipIds = Object.keys(SHIPS_INFO);
    const orientations = ['horizontal', 'vertical'];

    shipIds.forEach(shipId => {
        let placed = false;
        while (!placed) {
            const randomOri = orientations[Math.floor(Math.random() * orientations.length)];
            const randomR = Math.floor(Math.random() * BOARD_SIZE);
            const randomC = Math.floor(Math.random() * BOARD_SIZE);

            if (isValidPlacement(shipId, randomR, randomC, randomOri, grid)) {
                const cells = getShipOccupiedCells(shipId, randomR, randomC, randomOri);
                
                cells.forEach((cell, idx) => {
                    const offset = SHIPS_INFO[shipId].shape[randomOri][idx];
                    grid[cell.r][cell.c] = {
                        shipId: shipId,
                        rOffset: offset.r,
                        cOffset: offset.c
                    };
                });

                placedShipsMap[shipId] = {
                    r: randomR,
                    c: randomC,
                    orientation: randomOri,
                    cells: cells
                };

                if (boardType === 'player') {
                    renderShipSVG('player', shipId, randomR, randomC, randomOri);
                }
                placed = true;
            }
        }
    });
}

function handleRandomizeClick() {
    const currentGrid = gameState === 'SETUP_P1' ? player1Grid : player2Grid;
    const currentPlaced = gameState === 'SETUP_P1' ? player1PlacedShips : player2PlacedShips;

    randomizeShips(currentGrid, currentPlaced, 'player');
    checkSetupReady();
    playAudio('click');
    
    const name = gameState === 'SETUP_P1' ? "玩家 1" : "玩家 2";
    appendLog(`系統：${name} 的編隊已隨機部署完畢！`);
}

// ==========================================================================
// 6. 階段流轉與傳接屏蔽系統 (Cover Screen)
// ==========================================================================

function handleStartGameClick() {
    if (gameState === 'SETUP_P1') {
        if (gameMode === 'ai') {
            // 單人 AI 模式：電腦隨機部署船隻，直接進入戰鬥
            randomizeShips(player2Grid, player2PlacedShips, 'enemy');
            enterBattlePhase();
        } else {
            // 雙人傳接模式：轉為玩家 2 部署
            showPrivacyShield(
                "請將手機傳給 玩家 2",
                "為了避免防守佈置曝光，玩家 1 請迴避，待 玩家 2 準備好後點擊下方按鈕開始部署編隊。",
                "開始 玩家 2 部署",
                () => {
                    gameState = 'SETUP_P2';
                    activePlayer = 2;
                    
                    // 重設部署畫面 UI
                    document.getElementById('setupTitle').innerText = "部署您的神魔編隊 (玩家 2)";
                    document.querySelectorAll('.ship-select-card').forEach(card => card.classList.remove('placed', 'selected'));
                    createGridDOM('playerBoard', 'player');
                    selectShip('thor');
                    checkSetupReady();
                    appendLog("系統：玩家 2 開始部署編隊。");
                }
            );
        }
    } else if (gameState === 'SETUP_P2') {
        // 玩家 2 部署完成，準備進入戰鬥
        showPrivacyShield(
            "雙方部署完成！開始戰鬥！",
            "請將手機傳回給 玩家 1，待 玩家 1 準備好後點擊下方按鈕進入戰鬥回合！",
            "開始戰鬥 (玩家 1 回合)",
            () => {
                enterBattlePhase();
            }
        );
    }
}

function enterBattlePhase() {
    gameState = 'PLAYING';
    isShotResolving = false;
    document.getElementById('setupPanel').classList.add('hidden');
    document.getElementById('modeSelect').setAttribute('disabled', 'true');
    
    appendLog("⚔️ 戰鬥開始！防空警報已拉響！ ⚔️", "sink-msg");
    playAudio('sink');

    if (gameMode === 'pass') {
        activePlayer = 1;
        isMyTurn = true;
        drawBoardsForActivePlayer();
        updateTurnUI();
    } else {
        // AI 模式
        isMyTurn = true;
        drawBoardsForActivePlayer();
        updateTurnUI();
    }
}

function updateTurnUI() {
    const subtitle = document.querySelector('.subtitle');
    const borderRadar = document.getElementById('enemyBoard');
    
    if (gameMode === 'pass') {
        const name = activePlayer === 1 ? "玩家 1" : "玩家 2";
        subtitle.innerText = `—— ${name} 的回合：雷達已鎖定，請開火 ——`;
        subtitle.style.color = "var(--neon-cyan)";
        borderRadar.style.borderColor = "var(--neon-cyan)";
        borderRadar.style.boxShadow = "0 0 25px rgba(0, 243, 255, 0.25)";
    } else {
        if (isMyTurn) {
            subtitle.innerText = "—— 您的回合：雷達已鎖定，請開火 ——";
            subtitle.style.color = "var(--neon-cyan)";
            borderRadar.style.borderColor = "var(--neon-cyan)";
            borderRadar.style.boxShadow = "0 0 25px rgba(0, 243, 255, 0.25)";
        } else {
            subtitle.innerText = "—— 電腦 AI 回合：掃描中... ——";
            subtitle.style.color = "var(--neon-magenta)";
            borderRadar.style.borderColor = "rgba(189, 0, 255, 0.4)";
            borderRadar.style.boxShadow = "none";
        }
    }
}

// 點擊敵方棋盤進行射擊
function handleEnemyCellClick(e) {
    if (gameState !== 'PLAYING') return;
    if (isShotResolving) return;
    if (gameMode === 'ai' && !isMyTurn) return; // AI 模式下只能在玩家回合開火

    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);
    
    // 取得當前射擊者的射擊記錄矩陣
    const currentShots = (gameMode === 'pass' && activePlayer === 2) ? player2Shots : player1Shots;
    
    // 檢查是否開火過
    if (currentShots[r][c] !== 0) return;
    
    isShotResolving = true;

    playAudio('launch');
    
    const activePlayerName = gameMode === 'pass' ? `玩家 ${activePlayer}` : "您";
    appendLog(`${activePlayerName} 對座標 [${String.fromCharCode(65 + c)}${r + 1}] 發射了導彈！`);

    // 處理射擊邏輯
    setTimeout(() => {
        processShotResultLocal(r, c);
    }, 800);
}

// 核心射擊判定與回合流轉
function processShotResultLocal(r, c) {
    const targetBoardGridEl = document.getElementById('enemyBoard');
    const coordStr = `[${String.fromCharCode(65 + c)}${r + 1}]`;

    if (gameMode === 'ai') {
        // ================= AI 模式下射擊判定 =================
        const targetCell = player2Grid[r][c];
        let hit = false;
        let sunkShipId = null;

        if (targetCell) {
            hit = true;
            player1Shots[r][c] = 2; // Hit
            playAudio('hit');
            speakNotAh();
            
            // 繪製打擊動畫
            const cellEl = document.querySelector(`.grid-cell[data-type="enemy"][data-row="${r}"][data-col="${c}"]`);
            cellEl.classList.add('cell-hit');
            showFloatingSubtitle(cellEl);
            targetBoardGridEl.classList.add('shake');
            setTimeout(() => targetBoardGridEl.classList.remove('shake'), 400);

            // 判斷沉沒
            const shipId = targetCell.shipId;
            const allCells = player2PlacedShips[shipId].cells;
            const isSunk = allCells.every(cell => player1Shots[cell.r][cell.c] === 2);
            if (isSunk) {
                sunkShipId = shipId;
                appendLog(`🔥 擊沉！您擊沉了敵方的【${SHIPS_INFO[sunkShipId].name}】！ 🔥`, "sink-msg");
                renderShipSVG('enemy', sunkShipId, player2PlacedShips[sunkShipId].r, player2PlacedShips[sunkShipId].c, player2PlacedShips[sunkShipId].orientation);
            } else {
                appendLog(`擊中！敵方在 ${coordStr} 遭受重創！`, "player-hit");
            }
        } else {
            player1Shots[r][c] = 1; // Miss
            playAudio('miss');
            const cellEl = document.querySelector(`.grid-cell[data-type="enemy"][data-row="${r}"][data-col="${c}"]`);
            cellEl.classList.add('cell-miss');
            appendLog(`落空。導彈擊中 ${coordStr} 海洋水面。`, "player-miss");
        }

        // 判斷勝負
        if (checkAllSunk(player1Shots, player2PlacedShips)) {
            isShotResolving = false;
            endGame('WIN');
            return;
        }

        // 回合流轉
        if (hit) {
            isMyTurn = true;
            appendLog("系統：擊中目標，您獲得額外開火權！");
            updateTurnUI();
            isShotResolving = false;
        } else {
            isMyTurn = false;
            updateTurnUI();
            setTimeout(triggerAIMove, 1000);
        }

    } else {
        // ================= 單機雙人傳接對戰模式 =================
        const shooter = activePlayer;
        const target = activePlayer === 1 ? 2 : 1;
        const currentShots = shooter === 1 ? player1Shots : player2Shots;
        const targetGrid = target === 1 ? player1Grid : player2Grid;
        const targetPlacedShips = target === 1 ? player1PlacedShips : player2PlacedShips;

        const targetCell = targetGrid[r][c];
        let hit = false;
        let sunkShipId = null;

        if (targetCell) {
            hit = true;
            currentShots[r][c] = 2; // Hit
            playAudio('hit');
            speakNotAh();
            
            const cellEl = document.querySelector(`.grid-cell[data-type="enemy"][data-row="${r}"][data-col="${c}"]`);
            cellEl.classList.add('cell-hit');
            showFloatingSubtitle(cellEl);
            targetBoardGridEl.classList.add('shake');
            setTimeout(() => targetBoardGridEl.classList.remove('shake'), 400);

            // 判斷沉沒
            const shipId = targetCell.shipId;
            const allCells = targetPlacedShips[shipId].cells;
            const isSunk = allCells.every(cell => currentShots[cell.r][cell.c] === 2);
            if (isSunk) {
                sunkShipId = shipId;
                appendLog(`🔥 擊沉！玩家 ${shooter} 擊沉了玩家 ${target} 的【${SHIPS_INFO[sunkShipId].name}】！ 🔥`, "sink-msg");
                renderShipSVG('enemy', sunkShipId, targetPlacedShips[sunkShipId].r, targetPlacedShips[sunkShipId].c, targetPlacedShips[sunkShipId].orientation);
            } else {
                appendLog(`擊中！玩家 ${target} 在 ${coordStr} 遭受重創！`, "player-hit");
            }
        } else {
            currentShots[r][c] = 1; // Miss
            playAudio('miss');
            const cellEl = document.querySelector(`.grid-cell[data-type="enemy"][data-row="${r}"][data-col="${c}"]`);
            cellEl.classList.add('cell-miss');
            appendLog(`落空。導彈擊中 ${coordStr} 海洋水面。`, "player-miss");
        }

        // 判斷勝負
        if (checkAllSunk(currentShots, targetPlacedShips)) {
            isShotResolving = false;
            endGame(shooter === 1 ? 'WIN_P1' : 'WIN_P2');
            return;
        }

        // 回合切換與屏蔽遮罩邏輯
        if (hit) {
            appendLog(`系統：玩家 ${shooter} 擊中目標，獲得額外開火權！`);
            // 不切換玩家，直接更新 UI
            updateTurnUI();
            isShotResolving = false;
        } else {
            // 落空，需要交替回合，且為了防窺必須顯示隱私遮罩
            const nextPlayer = target;
            const nextPlayerName = nextPlayer === 1 ? "玩家 1" : "玩家 2";
            
            // 強制延遲 1.5 秒讓玩家看清擊中落空結果，然後彈出全黑防窺遮罩
            setTimeout(() => {
                showPrivacyShield(
                    `請將手機傳給 ${nextPlayerName}`,
                    `當前為交替回合。請玩家 ${shooter} 迴避，待 ${nextPlayerName} 接過手機準備好後，點擊按鈕開啟雷達並開火！`,
                    `查看雷達 (${nextPlayerName} 回合)`,
                    () => {
                        activePlayer = nextPlayer;
                        drawBoardsForActivePlayer();
                        updateTurnUI();
                        isShotResolving = false;
                        appendLog(`系統：輪到 ${nextPlayerName} 的回合。`);
                    }
                );
            }, 1500);
        }
    }
}

// 檢查是否全部擊沉
function checkAllSunk(shotsMatrix, targetPlacedShips) {
    let totalHitCells = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (shotsMatrix[r][c] === 2) {
                totalHitCells++;
            }
        }
    }
    return totalHitCells >= TOTAL_HP;
}

// ==========================================================================
// 7. 電腦 AI 尋敵邏輯 (Hunt-and-Target)
// ==========================================================================

function triggerAIMove() {
    if (gameState !== 'PLAYING') return;

    let targetR, targetC;

    if (AI_STATE.mode === 'TARGET' && AI_STATE.targetHits.length > 0) {
        const candidates = [];
        
        AI_STATE.targetHits.forEach(hit => {
            const directions = [
                {r: -1, c: 0}, {r: 1, c: 0},
                {r: 0, c: -1}, {r: 0, c: 1}
            ];
            
            directions.forEach(dir => {
                const nr = hit.r + dir.r;
                const nc = hit.c + dir.c;
                
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (player2Shots[nr][nc] === 0) {
                        candidates.push({r: nr, c: nc});
                    }
                }
            });
        });

        if (candidates.length > 0) {
            const selected = candidates[Math.floor(Math.random() * candidates.length)];
            targetR = selected.r;
            targetC = selected.c;
        } else {
            AI_STATE.mode = 'HUNT';
            chooseHuntCoordinates();
        }
    } else {
        chooseHuntCoordinates();
    }

    function chooseHuntCoordinates() {
        let valid = false;
        let attempts = 0;
        
        while (!valid && attempts < 100) {
            attempts++;
            const r = Math.floor(Math.random() * BOARD_SIZE);
            const c = Math.floor(Math.random() * BOARD_SIZE);
            
            if (player2Shots[r][c] === 0) {
                if ((r + c) % 2 === AI_STATE.huntParity || attempts > 50) {
                    targetR = r;
                    targetC = c;
                    valid = true;
                }
            }
        }
        
        if (!valid) {
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (player2Shots[r][c] === 0) {
                        targetR = r;
                        targetC = c;
                        break;
                    }
                }
            }
        }
    }

    playAudio('launch');
    appendLog(`電腦 AI 對您的海域射擊了一枚導彈...`);

    setTimeout(() => {
        processAIMoveResult(targetR, targetC);
    }, 800);
}

// AI 開火結果處理
function processAIMoveResult(r, c) {
    const targetCell = player1Grid[r][c];
    const cellEl = document.querySelector(`.grid-cell[data-type="player"][data-row="${r}"][data-col="${c}"]`);
    const boardGridEl = document.getElementById('playerBoard');
    const coordStr = `[${String.fromCharCode(65 + c)}${r + 1}]`;

    let hit = false;
    let sunkShipId = null;

    if (targetCell) {
        hit = true;
        player2Shots[r][c] = 2; // Hit
        playAudio('hit');
        speakNotAh();
        
        cellEl.classList.add('cell-hit');
        showFloatingSubtitle(cellEl);
        boardGridEl.classList.add('shake');
        setTimeout(() => boardGridEl.classList.remove('shake'), 400);

        // 判斷沉沒
        const shipId = targetCell.shipId;
        const allCells = player1PlacedShips[shipId].cells;
        const isSunk = allCells.every(cell => player2Shots[cell.r][cell.c] === 2);
        if (isSunk) {
            sunkShipId = shipId;
            appendLog(`💥 警報！您的【${SHIPS_INFO[sunkShipId].name}】已被擊沉！ 💥`, "sink-msg");
        } else {
            appendLog(`警告！您的 ${coordStr} 被敵方導彈擊中！`, "enemy-hit");
        }

        // 更新 AI 策略
        updateAILogicAfterHit(r, c, sunkShipId);
    } else {
        player2Shots[r][c] = 1; // Miss
        playAudio('miss');
        cellEl.classList.add('cell-miss');
        appendLog(`安全。敵方射擊 ${coordStr} 落空入海。`, "enemy-miss");
    }

    // 檢查 AI 是否獲勝
    if (checkAllSunk(player2Shots, player1PlacedShips)) {
        isShotResolving = false;
        endGame('LOSE');
        return;
    }

    // 回合輪替
    if (hit) {
        // AI 連擊
        isMyTurn = false;
        setTimeout(triggerAIMove, 1200);
    } else {
        isMyTurn = true;
        isShotResolving = false;
        appendLog("系統：輪到您的回合！點擊右側雷達開火。");
    }
    updateTurnUI();
}

function updateAILogicAfterHit(r, c, sunkShipId) {
    if (sunkShipId) {
        const sunkCells = player1PlacedShips[sunkShipId].cells;
        AI_STATE.targetHits = AI_STATE.targetHits.filter(hit => 
            !sunkCells.some(cell => cell.r === hit.r && cell.c === hit.c)
        );
        
        if (AI_STATE.targetHits.length === 0) {
            AI_STATE.mode = 'HUNT';
            AI_STATE.huntParity = (AI_STATE.huntParity + 1) % 2;
        }
    } else {
        AI_STATE.mode = 'TARGET';
        AI_STATE.targetHits.push({r, c});
    }
}

// ==========================================================================
// 8. 遊戲設定、結算與重置
// ==========================================================================

function setGameMode(mode) {
    gameMode = mode;
    resetGame();
}

function endGame(result) {
    gameState = 'GAME_OVER';

    // AI 模式：結束時把敵方隱藏的船全畫出來
    if (gameMode === 'ai') {
        Object.keys(player2PlacedShips).forEach(shipId => {
            const ship = player2PlacedShips[shipId];
            const oldSvg = document.querySelector(`.ship-segment[data-ship-id="${shipId}"][data-type="enemy"]`);
            if (!oldSvg) {
                renderShipSVG('enemy', shipId, ship.r, ship.c, ship.orientation);
            }
        });
    }

    if (result === 'WIN') {
        playAudio('sink');
        showModal("🎉 戰役大捷！ 🎉", "您已成功擊沉電腦的所有艦隊，獲得了本次海戰的全面勝利！", false, true);
        appendLog("🏆 終局宣告：恭喜您贏得了海戰大捷！ 🏆", "system-msg");
    } else if (result === 'LOSE') {
        playAudio('miss');
        showModal("💀 戰敗撤退 💀", "您的編隊已全軍覆沒，雷達失去訊號...請重新整備部隊！", false, true);
        appendLog("💀 終局宣告：您已全軍覆沒，任務失敗。 💀", "enemy-hit");
    } else if (result === 'WIN_P1') {
        playAudio('sink');
        showModal("🏆 玩家 1 獲勝！ 🏆", "玩家 1 成功擊沉了 玩家 2 的所有神魔編隊，贏得了本次對決！", false, true);
        appendLog("🏆 終局宣告：玩家 1 贏得了本次對局！ 🏆", "system-msg");
    } else if (result === 'WIN_P2') {
        playAudio('sink');
        showModal("🏆 玩家 2 獲勝！ 🏆", "玩家 2 成功擊沉了 玩家 1 的所有神魔編隊，贏得了本次對決！", false, true);
        appendLog("🏆 終局宣告：玩家 2 贏得了本次對局！ 🏆", "system-msg");
    }
}

function resetGame() {
    gameState = 'SETUP_P1';
    activePlayer = 1;
    isMyTurn = true;
    
    // 重置所有網格數據
    player1Grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    player2Grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    player1Shots = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    player2Shots = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    player1PlacedShips = {};
    player2PlacedShips = {};
    selectedShipId = null;
    selectedOrientation = 'horizontal';
    isShotResolving = false;

    AI_STATE.mode = 'HUNT';
    AI_STATE.targetHits = [];
    
    // UI 重設
    document.getElementById('setupPanel').classList.remove('hidden');
    document.getElementById('setupTitle').innerText = "部署您的神魔編隊";
    document.getElementById('btnStartGame').setAttribute('disabled', 'true');
    document.getElementById('btnRandomize').removeAttribute('disabled');
    document.getElementById('modeSelect').removeAttribute('disabled');
    document.querySelector('.subtitle').innerText = "—— 經典海戰棋變體版 ——";
    document.querySelector('.subtitle').style.color = "var(--neon-cyan)";
    
    document.querySelectorAll('.ship-select-card').forEach(card => {
        card.className = 'ship-select-card';
    });

    initLabelHeaders();
    createGridDOM('playerBoard', 'player');
    createGridDOM('enemyBoard', 'enemy');

    selectShip('thor');

    const modeName = gameMode === 'ai' ? "單人 AI 挑戰" : "單機雙人對戰 (Pass & Play)";
    appendLog(`系統：遊戲已重置。當前模式：${modeName}。`);
}

// Modal 控制
function showModal(title, message, showLoader = false, showButton = false, actionCallback = null, buttonText = "確定") {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const msgEl = document.getElementById('modalMessage');
    const loader = document.getElementById('modalLoader');
    const actionBtn = document.getElementById('btnModalAction');
    const closeBtn = document.getElementById('btnModalClose');

    titleEl.innerText = title;
    msgEl.innerHTML = message;
    
    if (showLoader) loader.classList.remove('hidden');
    else loader.classList.add('hidden');

    if (showButton || actionCallback) {
        actionBtn.classList.remove('hidden');
        actionBtn.innerText = buttonText;
        actionBtn.onclick = () => {
            hideModal();
            if (actionCallback) actionCallback();
        };
    } else {
        actionBtn.classList.add('hidden');
    }

    if (!showLoader && !showButton && !actionCallback) {
        closeBtn.classList.remove('hidden');
        closeBtn.onclick = hideModal;
    } else {
        closeBtn.classList.add('hidden');
    }

    overlay.classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

// 傳遞手機防偷看遮罩
function showPrivacyShield(title, message, btnText, callback) {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('privacy-shield'); // 全黑樣式
    
    showModal(title, message, false, true, () => {
        overlay.classList.remove('privacy-shield');
        if (callback) callback();
    }, btnText);
}

// ==========================================================================
// 9. 音效與語音合成 (Web Audio / SpeechSynthesis)
// ==========================================================================

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playAudio(type) {
    if (!soundEnabled) return;
    try {
        initAudio();
        const now = audioCtx.currentTime;
        
        switch (type) {
            case 'click':
                {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now);
                    osc.stop(now + 0.05);
                }
                break;
                
            case 'launch':
                {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
                    
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(1000, now);
                    filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    osc.start(now);
                    osc.stop(now + 0.6);
                }
                break;
                
            case 'hit':
                {
                    const bufferSize = audioCtx.sampleRate * 0.8;
                    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    
                    const noise = audioCtx.createBufferSource();
                    noise.buffer = buffer;
                    
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(400, now);
                    filter.frequency.exponentialRampToValueAtTime(10, now + 0.8);
                    
                    const gain = audioCtx.createGain();
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                    
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    noise.start(now);
                    noise.stop(now + 0.8);
                }
                break;
                
            case 'miss':
                {
                    const bufferSize = audioCtx.sampleRate * 0.4;
                    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    
                    const noise = audioCtx.createBufferSource();
                    noise.buffer = buffer;
                    
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(300, now);
                    filter.frequency.exponentialRampToValueAtTime(600, now + 0.4);
                    filter.Q.setValueAtTime(3, now);
                    
                    const gain = audioCtx.createGain();
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    noise.start(now);
                    noise.stop(now + 0.4);
                }
                break;
                
            case 'sink':
                {
                    const playSirenNode = (start, duration, f1, f2) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(f1, start);
                        osc.frequency.setValueAtTime(f2, start + duration / 2);
                        
                        gain.gain.setValueAtTime(0.1, start);
                        gain.gain.linearRampToValueAtTime(0.1, start + duration - 0.05);
                        gain.gain.linearRampToValueAtTime(0.01, start + duration);
                        
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(start);
                        osc.stop(start + duration);
                    };
                    
                    playSirenNode(now, 0.4, 440, 330);
                    playSirenNode(now + 0.4, 0.4, 440, 330);
                }
                break;
        }
    } catch (e) {
        console.warn('Web Audio synthesis failed:', e);
    }
}

// 播放被擊中語音 "阿不是阿"（優先使用實體 MP3 音效，若無則降級為 SpeechSynthesis 語音合成）
function speakNotAh() {
    if (!voiceEnabled) return;

    // 優先播放 assets/sounds/not_ah.mp3 實體音效檔案
    const customAudio = new Audio('assets/sounds/not_ah.mp3');
    customAudio.play()
        .then(() => {
            console.log('成功播放自訂擊中音效「阿不是阿」');
        })
        .catch(err => {
            // 載入失敗（如 404）或被瀏覽器靜音，降級使用 SpeechSynthesis 合成語音
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    
                    const textToSpeak = "啊，不是啊！";
                    const utterance = new SpeechSynthesisUtterance(textToSpeak);
                    utterance.lang = "zh-TW";
                    utterance.rate = 1.25;
                    utterance.pitch = 1.1;
                    
                    const voices = window.speechSynthesis.getVoices();
                    const zhVoice = voices.find(v => v.lang.includes('ZH') || v.lang.includes('zh') || v.lang.includes('TW') || v.lang.includes('tw'));
                    if (zhVoice) {
                        utterance.voice = zhVoice;
                    }
                    
                    window.speechSynthesis.speak(utterance);
                } catch (e) {
                    console.warn('SpeechSynthesis error:', e);
                }
            }
        });
}

function showFloatingSubtitle(cellElement) {
    const rect = cellElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.top + window.scrollY;
    
    const subtitle = document.createElement('div');
    subtitle.className = 'floating-subtitle';
    subtitle.innerText = '啊！不是啊！';
    subtitle.style.left = `${x}px`;
    subtitle.style.top = `${y}px`;
    
    document.getElementById('subtitleOverlay').appendChild(subtitle);
    
    setTimeout(() => {
        subtitle.remove();
    }, 1200);
}
