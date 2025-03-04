// 遊戲元素
const player = document.getElementById('player');
const computer = document.getElementById('computer');
const ball = document.getElementById('ball');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const message = document.getElementById('message');
const court = document.querySelector('.court');

// 按鈕
const moveLeftBtn = document.getElementById('move-left');
const moveRightBtn = document.getElementById('move-right');
const hitBtn = document.getElementById('hit');
const dashBtn = document.getElementById('dash');
const restartBtn = document.getElementById('restart');

// 遊戲狀態
let playerScore = 0;
let computerScore = 0;
let gameActive = false;
let ballSpeedX = 0;
let ballSpeedY = 0;
let ballInPlay = false;
let playerPos = 300; // 玩家水平位置
let computerPos = 300; // 電腦水平位置
let playerDashing = false;
let lastHitBy = null;
const courtWidth = 600;
const playerWidth = 30;
const ballSize = 20;

// 移動速度
const playerSpeed = 10;
const dashSpeed = 30;
const computerSpeed = 5;
const ballInitialSpeed = 5;

// 初始化遊戲
function initGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
    
    // 重置位置
    playerPos = courtWidth / 2;
    computerPos = courtWidth / 2;
    updatePlayerPosition();
    updateComputerPosition();
    
    resetBall();
    gameActive = true;
    ballInPlay = false;
    message.textContent = "按擊球開始遊戲!";
}

// 更新玩家位置
function updatePlayerPosition() {
    player.style.left = `${playerPos}px`;
}

// 更新電腦位置
function updateComputerPosition() {
    computer.style.left = `${computerPos}px`;
}

// 重置球的位置
function resetBall() {
    ball.style.left = `${courtWidth / 2}px`;
    ball.style.top = '200px';
    ballSpeedX = 0;
    ballSpeedY = 0;
}

// 發球
function serveBall() {
    if (!ballInPlay) {
        ballInPlay = true;
        ballSpeedX = Math.random() * 4 - 2; // -2 到 2 的隨機數
        ballSpeedY = -ballInitialSpeed; // 往電腦方向移動
        lastHitBy = 'player';
        gameLoop();
    }
}

// 遊戲主循環
function gameLoop() {
    if (!gameActive) return;
    
    // 移動球
    const ballRect = ball.getBoundingClientRect();
    const courtRect = court.getBoundingClientRect();
    
    // 計算相對於court的位置
    const ballLeft = ballRect.left - courtRect.left;
    const ballTop = ballRect.top - courtRect.top;
    
    // 更新球的位置
    ball.style.left = `${ballLeft + ballSpeedX}px`;
    ball.style.top = `${ballTop + ballSpeedY}px`;
    
    // 檢測與牆壁的碰撞
    if (ballLeft <= 0 || ballLeft >= courtWidth - ballSize) {
        ballSpeedX = -ballSpeedX;
    }
    
    // 檢測與玩家的碰撞
    const playerRect = player.getBoundingClientRect();
    if (
        lastHitBy !== 'player' &&
        ballRect.bottom >= playerRect.top &&
        ballRect.right >= playerRect.left &&
        ballRect.left <= playerRect.right &&
        ballSpeedY > 0 // 球正在向下移動
    ) {
        // 根據擊球位置調整反彈角度
        const hitPosition = (ballRect.left + ballRect.right) / 2 - playerRect.left;
        const normalizedHitPosition = hitPosition / playerRect.width;
        ballSpeedX = (normalizedHitPosition - 0.5) * 10;
        
        // 反彈
        ballSpeedY = -ballSpeedY * 1.05; // 增加一點速度
        lastHitBy = 'player';
    }
    
    // 檢測與電腦的碰撞
    const computerRect = computer.getBoundingClientRect();
    if (
        lastHitBy !== 'computer' &&
        ballRect.top <= computerRect.bottom &&
        ballRect.right >= computerRect.left &&
        ballRect.left <= computerRect.right &&
        ballSpeedY < 0 // 球正在向上移動
    ) {
        // 根據擊球位置調整反彈角度
        const hitPosition = (ballRect.left + ballRect.right) / 2 - computerRect.left;
        const normalizedHitPosition = hitPosition / computerRect.width;
        ballSpeedX = (normalizedHitPosition - 0.5) * 10;
        
        // 反彈
        ballSpeedY = -ballSpeedY * 1.05; // 增加一點速度
        lastHitBy = 'computer';
    }
    
    // 檢測得分
    if (ballTop <= 0) {
        // 玩家得分
        playerScore++;
        playerScoreElement.textContent = playerScore;
        message.textContent = "玩家得分!";
        ballInPlay = false;
        resetBall();
        return;
    } else if (ballTop >= courtRect.height - ballSize) {
        // 電腦得分
        computerScore++;
        computerScoreElement.textContent = computerScore;
        message.textContent = "電腦得分!";
        ballInPlay = false;
        resetBall();
        return;
    }
    
    // 簡單的電腦AI
    const ballCenterX = ballLeft + ballSize / 2;
    if (ballSpeedY < 0 && ballTop < courtRect.height / 2) {
        // 球向電腦移動時，電腦會嘗試移動到球的位置
        if (computerPos + playerWidth / 2 < ballCenterX - 10) {
            computerPos += computerSpeed;
        } else if (computerPos + playerWidth / 2 > ballCenterX + 10) {
            computerPos -= computerSpeed;
        }
        updateComputerPosition();
    }
    
    // 繼續遊戲循環
    requestAnimationFrame(gameLoop);
}

// 玩家移動
moveLeftBtn.addEventListener('mousedown', () => {
    if (gameActive) {
        playerPos = Math.max(playerPos - playerSpeed, playerWidth / 2);
        updatePlayerPosition();
    }
});

moveRightBtn.addEventListener('mousedown', () => {
    if (gameActive) {
        playerPos = Math.min(playerPos + playerSpeed, courtWidth - playerWidth / 2);
        updatePlayerPosition();
    }
});

// 擊球按鈕
hitBtn.addEventListener('click', () => {
    if (gameActive) {
        if (!ballInPlay) {
            serveBall();
        } else if (Math.abs(playerPos - parseInt(ball.style.left, 10)) < 50 && parseInt(ball.style.top, 10) > 300) {
            // 如果球靠近玩家並且在下半場，可以擊球
            ballSpeedY = -Math.abs(ballSpeedY) * 1.1; // 向上反彈，增加速度
            lastHitBy = 'player';
        }
    }
});

// 衝刺按鈕
dashBtn.addEventListener('click', () => {
    if (gameActive && !playerDashing) {
        playerDashing = true;
        player.classList.add('dashing');
        
        const dashDirection = ballSpeedX > 0 ? 1 : -1;
        playerPos = Math.max(playerWidth / 2, Math.min(playerPos + dashSpeed * dashDirection, courtWidth - playerWidth / 2));
        updatePlayerPosition();
        
        setTimeout(() => {
            player.classList.remove('dashing');
            playerDashing = false;
        }, 300);
    }
});

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            playerPos = Math.max(playerPos - playerSpeed, playerWidth / 2);
            break;
        case 'ArrowRight':
            playerPos = Math.min(playerPos + playerSpeed, courtWidth - playerWidth / 2);
            break;
        case ' ':
            if (!ballInPlay) {
                serveBall();
            }
            break;
        case 'z':
            // 衝刺
            if (!playerDashing) {
                playerDashing = true;
                player.classList.add('dashing');
                
                const dashDirection = e.key === 'ArrowLeft' ? -1 : 1;
                playerPos = Math.max(playerWidth / 2, Math.min(playerPos + dashSpeed * dashDirection, courtWidth - playerWidth / 2));
                
                setTimeout(() => {
                    player.classList.remove('dashing');
                    playerDashing = false;
                }, 300);
            }
            break;
    }
    updatePlayerPosition();
});

// 重新開始遊戲
restartBtn.addEventListener('click', initGame);

// 初始化遊戲
initGame();
