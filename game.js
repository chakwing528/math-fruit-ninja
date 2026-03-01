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
let gameActive = false; 

// DOM 元素
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const timeEl = document.getElementById('time');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const startMenuEl = document.getElementById('startMenu');
const uiEl = document.getElementById('ui');

// --- 修復：改用 Google 官方高畫質開源圖庫，保證絕對能成功載入 ---
const fruitImages = [];
const imageSrcs = [
    'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f34e.png', // 紅蘋果
    'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f34a.png', // 橘子
    'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f349.png'  // 西瓜
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

// 水果類別
class Fruit {
    constructor(x, y, vx, vy, number, isCorrect) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 90; // 保持 V3 的大圖案設計
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
        this.vy += 0.04; 
        this.rotation += this.rotationSpeed; 
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 如果圖片成功載入就畫出水果，否則畫圓形
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

        // 繪製巨大數字，加上粗黑框確保在哪種水果上都看得清楚
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

// 產生一波水果 (確保畫面最多 5 個)
function spawnFruits() {
    if (!gameActive) return;
    
    let currentFruitCount = fruits.length;
    if (currentFruitCount >= 5) return; 

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
                score += 10;
                generateQuestion();
            } else {
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

// 固定每 3.5 秒嘗試產出水果
setInterval(spawnFruits, 3500); 
gameLoop();
