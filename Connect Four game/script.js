const ROWS = 6;
const COLS = 7;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = 'red';
let gameActive = true;
let soundEnabled = true;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || { red: 0, yellow: 0 };
let aiVsAi = false;
const aiVsAiToggle = document.getElementById('aiVsAiToggle');
const gameEl = document.getElementById('game');
const statusEl = document.getElementById('status');
const leaderboardEl = document.getElementById('leaderboard');
const dropSound = document.getElementById('dropSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');
const themeToggle = document.getElementById('themeToggle');
const soundToggle = document.getElementById('toggleSound');
const settingsBtn = document.getElementById('settingsToggle');
const settingsPanel = document.querySelector('.settings');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const arrowRow = document.getElementById('arrow-row');

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});

console.log("Connect Four Game Loaded");
function playStartupAnimation() {
    const cells = document.querySelectorAll('#game .cell');
    cells.forEach((cell, idx) => {
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);
        const delay = (row + col) * 80;
        cell.classList.add('startup-anim');
        cell.style.animationDelay = `${delay}ms`;
        cell.addEventListener('animationend', function handler() {
            cell.classList.remove('startup-anim');
            cell.style.animationDelay = '';
            cell.style.opacity = '';
            cell.removeEventListener('animationend', handler);
        });
    });
}

startBtn.addEventListener('click', () => {
    startOverlay.classList.add('hide');
    setTimeout(() => {
        startOverlay.style.display = 'none';
        renderBoard();
        playStartupAnimation();
    }, 700);
});

let timeLeft = 210;
const timerDisplay = document.getElementById('timer');
let countdown = null;
let timerStarted = false;

function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `T ${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerDisplay.textContent = "Time's up!";
            gameActive = false;
        }
        timeLeft--;
    }, 1000);
}

aiVsAiToggle.addEventListener('change', (e) => {
    aiVsAi = e.target.checked;
    resetGame();
    if (aiVsAi) {
        statusEl.textContent = "AI vs AI";
        setTimeout(aiVsAiLoop, 700);
    } else {
        statusEl.textContent = "Your Turn";
    }
});

let aiMoveNumber = 1;

function aiVsAiLoop() {
    if (!gameActive || !aiVsAi) return;

    statusEl.innerHTML = `<span style="opacity:0.7">${currentPlayer === 'red' ? '🔴' : '🟡'} AI Move #${aiMoveNumber}...</span>`;

    setTimeout(() => {
        let aiColor = currentPlayer;
        let move;
        if (Math.random() < 0.1) { // 10% chance to play randomly
            const validCols = [];
            for (let c = 0; c < COLS; c++) {
                if (getAvailableRow(c) !== -1) validCols.push(c);
            }
            move = validCols[Math.floor(Math.random() * validCols.length)];
        } else {
            let bestScore = -Infinity;
            move = null;
            for (let c = 0; c < COLS; c++) {
                let r = getAvailableRow(c);
                if (r === -1) continue;
                let tempBoard = board.map(row => row.slice());
                tempBoard[r][c] = aiColor;
                let score = minimax(tempBoard, 0, false, 4);
                if (score > bestScore) {
                    bestScore = score;
                    move = c;
                }
            }
        }
        if (move !== null) {
            for (let r = ROWS - 1; r >= 0; r--) {
                if (!board[r][move]) {
                    board[r][move] = aiColor;
                    if (soundEnabled) dropSound.play();
                    break;
                }
            }
            renderBoard();
            if (checkWinner()) {
                gameActive = false;
                statusEl.innerHTML = `<b>${aiColor === 'red' ? '🔴' : '🟡'} AI Wins in ${aiMoveNumber} moves!</b>`;
                leaderboard[aiColor]++;
                updateLeaderboard();
                if (soundEnabled) winSound.play();
                return;
            } else if (board.flat().every(Boolean)) {
                statusEl.innerHTML = `<b>Draw after ${aiMoveNumber} moves!</b>`;
                if (soundEnabled) drawSound.play();
                return;
            } else {
                currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
                aiMoveNumber++;
                setTimeout(aiVsAiLoop, 300);
            }
        }
    }, 100);
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameActive = true;
    timeLeft = 210;
    timerStarted = false;
    aiMoveNumber = 1;
    clearInterval(countdown);
    timerDisplay.textContent = `T 3:30`;
    if (aiVsAi) {
        statusEl.innerHTML = "AI vs AI";
        renderBoard();
        setTimeout(aiVsAiLoop, 700);
    } else {
        statusEl.textContent = 'Your Turn';
        renderBoard();
    }
}

function renderBoard() {
    gameEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[r][c]) cell.classList.add(board[r][c]);
            cell.dataset.col = c;

            // --- Add hover effect for the whole column ---
            cell.addEventListener('mouseenter', () => {
                document.querySelectorAll(`.cell[data-col="${c}"]`).forEach(colCell => {
                    colCell.classList.add('col-hover');
                });
                renderArrows(c);
            });
            cell.addEventListener('mouseleave', () => {
                document.querySelectorAll(`.cell[data-col="${c}"]`).forEach(colCell => {
                    colCell.classList.remove('col-hover');
                });
                renderArrows();
            });
            // --------------------------------------------

            cell.addEventListener('click', handleClick);
            gameEl.appendChild(cell);
        }
    }
}

function handleClick(e) {
    if (!gameActive || aiVsAi) return;
    startTimer();
    const col = +e.target.dataset.col;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) {
            board[r][col] = currentPlayer;
            if (soundEnabled) dropSound.play();
            break;
        }
    }
    renderBoard();
    if (checkWinner()) {
        gameActive = false;
        statusEl.textContent = `${currentPlayer.toUpperCase()} Wins!`;
        leaderboard[currentPlayer]++;
        updateLeaderboard();
        if (soundEnabled) winSound.play();
        clearInterval(countdown);
        timerStarted = false;
    } else if (board.flat().every(Boolean)) {
        statusEl.textContent = 'Draw!';
        if (soundEnabled) drawSound.play();
        clearInterval(countdown);
        timerStarted = false;
    } else {
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
        statusEl.textContent = currentPlayer === 'red' ? 'Your Turn' : 'AI Thinking...';
        if (currentPlayer === 'yellow') setTimeout(aiMove, 500);
    }
}

function aiMove() {
    if (!gameActive) return;
    let bestScore = -Infinity;
    let move = null;
    for (let c = 0; c < COLS; c++) {
        let r = getAvailableRow(c);
        if (r === -1) continue;
        let tempBoard = board.map(row => row.slice());
        tempBoard[r][c] = 'yellow';
        let score = minimax(tempBoard, 0, false, 4);
        if (score > bestScore) {
            bestScore = score;
            move = c;
        }
    }
    if (move === null) return;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][move]) {
            board[r][move] = 'yellow';
            if (soundEnabled) dropSound.play();
            break;
        }
    }
    renderBoard();
    if (checkWinner()) {
        gameActive = false;
        statusEl.textContent = `YELLOW Wins!`;
        leaderboard['yellow']++;
        updateLeaderboard();
        if (soundEnabled) winSound.play();
        clearInterval(countdown);
        timerStarted = false;
    } else if (board.flat().every(Boolean)) {
        statusEl.textContent = 'Draw!';
        if (soundEnabled) drawSound.play();
        clearInterval(countdown);
        timerStarted = false;
    } else {
        currentPlayer = 'red';
        statusEl.textContent = 'Your Turn';
    }
}

function minimax(boardState, depth, isMaximizing, maxDepth) {
    const winner = checkWinnerSim(boardState);
    if (winner === 'yellow') return 10 - depth;
    if (winner === 'red') return depth - 10;
    if (boardState.flat().every(Boolean) || depth >= maxDepth) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let c = 0; c < COLS; c++) {
            let r = getAvailableRowSim(boardState, c);
            if (r === -1) continue;
            let newBoard = boardState.map(row => row.slice());
            newBoard[r][c] = 'yellow';
            best = Math.max(best, minimax(newBoard, depth + 1, false, maxDepth));
        }
        return best;
    } else {
        let best = Infinity;
        for (let c = 0; c < COLS; c++) {
            let r = getAvailableRowSim(boardState, c);
            if (r === -1) continue;
            let newBoard = boardState.map(row => row.slice());
            newBoard[r][c] = 'red';
            best = Math.min(best, minimax(newBoard, depth + 1, true, maxDepth));
        }
        return best;
    }
}

function getAvailableRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) return r;
    }
    return -1;
}

function getAvailableRowSim(state, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!state[r][col]) return r;
    }
    return -1;
}

function checkWinner() {
    return checkWinnerSim(board);
}

function checkWinnerSim(state) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (
                state[r][c] &&
                ((c + 3 < COLS &&
                    state[r][c] === state[r][c + 1] &&
                    state[r][c] === state[r][c + 2] &&
                    state[r][c] === state[r][c + 3]) ||
                    (r + 3 < ROWS &&
                        state[r][c] === state[r + 1][c] &&
                        state[r][c] === state[r + 2][c] &&
                        state[r][c] === state[r + 3][c]) ||
                    (r + 3 < ROWS && c + 3 < COLS &&
                        state[r][c] === state[r + 1][c + 1] &&
                        state[r][c] === state[r + 2][c + 2] &&
                        state[r][c] === state[r + 3][c + 3]) ||
                    (r + 3 < ROWS && c - 3 >= 0 &&
                        state[r][c] === state[r + 1][c - 1] &&
                        state[r][c] === state[r + 2][c - 2] &&
                        state[r][c] === state[r + 3][c - 3]))
            ) {
                return state[r][c];
            }
        }
    }
    return null;
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameActive = true;
    timeLeft = 210;
    timerStarted = false;
    aiMoveNumber = 1;
    clearInterval(countdown);
    timerDisplay.textContent = `T 3:30`;
    if (aiVsAi) {
        statusEl.innerHTML = "AI vs AI";
        renderBoard();
        setTimeout(aiVsAiLoop, 700);
    } else {
        statusEl.textContent = 'Your Turn';
        renderBoard();
    }
}

function updateLeaderboard() {
    leaderboardEl.textContent = `You: ${leaderboard.red} | AI: ${leaderboard.yellow}`;
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function copyScoreboard() {
    const scoreText = leaderboardEl.textContent;
    navigator.clipboard.writeText(scoreText).then(() => {
        alert('Scoreboard copied to clipboard!');
    });
}

soundToggle.addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
});

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
});

aiVsAiToggle.addEventListener('change', (e) => {
    aiVsAi = e.target.checked;
    resetGame();
    if (aiVsAi) {
        statusEl.textContent = "AI vs AI";
        setTimeout(aiVsAiLoop, 700);
    } else {
        statusEl.textContent = "Your Turn";
    }
});

function aiVsAiLoop() {
    if (!gameActive || !aiVsAi) return;

    statusEl.innerHTML = `<span style="opacity:0.7">${currentPlayer === 'red' ? '🔴' : '🟡'} AI Move #${aiMoveNumber}...</span>`;

    setTimeout(() => {
        let aiColor = currentPlayer;
        let move;
        if (Math.random() < 0.1) {
            const validCols = [];
            for (let c = 0; c < COLS; c++) {
                if (getAvailableRow(c) !== -1) validCols.push(c);
            }
            move = validCols[Math.floor(Math.random() * validCols.length)];
        } else {
            let bestScore = -Infinity;
            move = null;
            for (let c = 0; c < COLS; c++) {
                let r = getAvailableRow(c);
                if (r === -1) continue;
                let tempBoard = board.map(row => row.slice());
                tempBoard[r][c] = aiColor;
                let score = minimax(tempBoard, 0, false, 4);
                if (score > bestScore) {
                    bestScore = score;
                    move = c;
                }
            }
        }
        if (move !== null) {
            for (let r = ROWS - 1; r >= 0; r--) {
                if (!board[r][move]) {
                    board[r][move] = aiColor;
                    if (soundEnabled) dropSound.play();
                    break;
                }
            }
            renderBoard();
            if (checkWinner()) {
                gameActive = false;
                statusEl.innerHTML = `<b>${aiColor === 'red' ? '🔴' : '🟡'} AI Wins in ${aiMoveNumber} moves!</b>`;
                leaderboard[aiColor]++;
                updateLeaderboard();
                if (soundEnabled) winSound.play();
                return;
            } else if (board.flat().every(Boolean)) {
                statusEl.innerHTML = `<b>Draw after ${aiMoveNumber} moves!</b>`;
                if (soundEnabled) drawSound.play();
                return;
            } else {
                currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
                aiMoveNumber++;
                setTimeout(aiVsAiLoop, 500);
            }
        }
    }, 500);
}
renderBoard();
function checkWinnerSim(state) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = state[r][c];
            if (!cell) continue;

            if (c + 3 < COLS &&
                cell === state[r][c + 1] &&
                cell === state[r][c + 2] &&
                cell === state[r][c + 3]) return cell;

            if (r + 3 < ROWS &&
                cell === state[r + 1][c] &&
                cell === state[r + 2][c] &&
                cell === state[r + 3][c]) return cell;

            if (r + 3 < ROWS && c + 3 < COLS &&
                cell === state[r + 1][c + 1] &&
                cell === state[r + 2][c + 2] &&
                cell === state[r + 3][c + 3]) return cell;


            if (r - 3 >= 0 && c + 3 < COLS &&
                cell === state[r - 1][c + 1] &&
                cell === state[r - 2][c + 2] &&
                cell === state[r - 3][c + 3]) return cell;
        }
    }
    return null;
}

function renderArrows(activeCol = null) {
    arrowRow.innerHTML = '';
    for (let c = 0; c < COLS; c++) {
        const arrow = document.createElement('div');
        arrow.className = 'arrow' + (activeCol === c ? ' active' : '');
        arrow.innerHTML = '<div class="triangle-down"></div>';
        arrowRow.appendChild(arrow);
    }
}
renderArrows();