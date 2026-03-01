const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 遊戲狀態變數
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let fruits = [];
let particles = []; 
let bladeTrail = [];
let isDrawing = false;
let currentAnswer = 0;
// 初始設為 false，等待玩家點擊開始
let gameActive = false; 

// DOM 元素
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const timeEl = document.getElementById('time');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const startMenuEl = document.getElementById('startMenu');
const uiEl = document.getElementById('ui');

// 載入去背(透明)的水果圖片
const fruitImages = [];
const imageSrcs = [
    'https://cdn.pixabay.com/photo/2014/12/21/23/58/apple-576628_1280.png', 
    'https://cdn.pixabay.com/photo/2016/04/01/10/05/orange-1299738_1280.png', 
    'https://cdn.pixabay.com/photo/2016/03/10/16/32/watermelon-1248737_1280.png' 
];

imageSrcs.forEach(src => {
    let img = new Image();
    img.src = src;
    fruitImages.push(img);
});

// 粒子爆炸特效類別
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = (Math.random() - 0.5) * 15;
        this.life = 1.0; 
        this.size = Math.random() * 8 + 3; 
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; 
        this.life -= 0.02; 
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; 
    }
}

// 水果類別更新
class Fruit {
    constructor(x, y, vx, vy, number, isCorrect) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        // 1. 再次放大圖案：半徑從 65 加大到 90
        this.radius = 90; 
        this.number = number;
        this.isCorrect = isCorrect;
        
        this.image = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        const colors = ['#e74c3c', '#e67e22', '#2ecc71', '#f1c40f'];
        this.juiceColor = colors[Math.floor(Math.random() * colors.length)];
        
        this.rotation = Math.random() * Math.PI * 2; 
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; 
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04; // 保持慢速下降
        this.rotation += this.rotationSpeed; 
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.juiceColor;
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        ctx.restore();

        // 放大數字字體，配合變大的水果
        ctx.fillStyle = 'white';
        ctx.font = 'bold 56px Arial'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;
        ctx.strokeText(this.number, this.x, this.y);
        ctx.fillText(this.number, this.x, this.y);
    }
}

// 開始遊戲設定
function startGame() {
    let timeInput = document.getElementById('timeInput').value;
    timeLeft = parseInt(timeInput) || 60;
    
    startMenuEl.style.display = 'none';
    uiEl.style.display = 'flex';
    timeEl.innerText = timeLeft;
    
    gameActive = true;
    score = 0;
    scoreEl.innerText = score;
    fruits = [];
    particles = [];
    
    generateQuestion();
    
    // 開始計時
    timerInterval = setInterval(() => {
        timeLeft--;
        timeEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 結束遊戲
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    gameOverEl.style.display = 'block';
    finalScoreEl.innerText = score;
}

// 產生新的數學題目
function generateQuestion() {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let operator = Math.random() > 0.5 ? '+' : '-';
    
    if (operator === '-' && num1 < num2) {
        let temp = num1; num1 = num2; num2 = temp;
    }

    questionEl.innerText = `${num1} ${operator} ${num2}`;
    currentAnswer = operator === '+' ? num1 + num2 : num1 - num2;
}

// 產生一波水果
function spawnFruits() {
    if (!gameActive) return;
    
    // 2. 確保畫面每次最多有 5 個圖案
    let currentFruitCount = fruits.length;
    if (currentFruitCount >= 5) return; 

    // 計算這次還能產生幾個 (最多 3 個，但不能超過總數 5 個的上限)
    let maxToSpawn = 5 - currentFruitCount;
    let numberOfFruits = Math.min(3, maxToSpawn); 
    
    if (numberOfFruits <= 0) return;

    let correctPushed = false;

    for (let i = 0; i < numberOfFruits; i++) {
        let startX = Math.random() * (canvas.width - 200) + 100;
        let startY = canvas.height + 50;
        let vx = (Math.random() - 0.5) * 4; 
        let vy = -(Math.random() * 3 + 8); 
        
        let number;
        let isCorrect = false;

        if (!correctPushed && (i === numberOfFruits - 1 || Math.random() > 0.5)) {
            number = currentAnswer;
            isCorrect = true;
            correctPushed = true;
        } else {
            number = currentAnswer + Math.floor(Math.random() * 10) - 5;
            if (number === currentAnswer) number += 1;
        }

        fruits.push(new Fruit(startX, startY, vx, vy, number, isCorrect));
    }
}

// 切開產生果汁粒子
function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 滑鼠/觸控事件處理
function handleInputStart(e) { isDrawing = true; bladeTrail = []; }
function handleInputEnd() { isDrawing = false; bladeTrail = []; }
function handleInputMove(e) {
    if (!isDrawing || !gameActive) return;
    let x = e.clientX || e.touches[0].clientX;
    let y = e.clientY || e.touches[0].clientY;
    bladeTrail.push({x, y});
    if (bladeTrail.length > 10) bladeTrail.shift();
    checkCollision(x, y);
}

window.addEventListener('mousedown', handleInputStart);
window.addEventListener('mousemove', handleInputMove);
window.addEventListener('mouseup', handleInputEnd);
window.addEventListener('touchstart', handleInputStart, {passive: false});
window.addEventListener('touchmove', handleInputMove, {passive: false});
window.addEventListener('touchend', handleInputEnd);

// 碰撞偵測 (永久生命，計分制)
function checkCollision(mx, my) {
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        let dx = mx - f.x;
        let dy = my - f.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < f.radius) {
            createExplosion(f.x, f.y, f.juiceColor);

            if (f.number === currentAnswer) {
                // 答對加 10 分
                score += 10;
                generateQuestion();
            } else {
                // 3. 永久生命，答錯改為扣 5 分 (最低 0 分)
                score = Math.max(0, score - 5);
            }
            scoreEl.innerText = score;
            fruits.splice(i, 1);
        }
    }
}

// 繪製刀光特效
function drawBlade() {
    if (bladeTrail.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(bladeTrail[0].x, bladeTrail[0].y);
    for (let i = 1; i < bladeTrail.length; i++) {
        ctx.lineTo(bladeTrail[i].x, bladeTrail[i].y);
    }
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0; 
}

// 遊戲主迴圈
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        for (let i = fruits.length - 1; i >= 0; i--) {
            fruits[i].update();
            fruits[i].draw();
            if (fruits[i].y > canvas.height + 100) {
                fruits.splice(i, 1);
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        drawBlade();
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 固定每 3.5 秒嘗試產出水果 (由 spawnFruits 內部控制數量上限)
setInterval(spawnFruits, 3500); 
gameLoop();
