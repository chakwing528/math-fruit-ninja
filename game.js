const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 遊戲狀態變數
let score = 0;
let lives = 3;
let fruits = [];
let particles = []; // 新增：用來裝載爆炸粒子的陣列
let bladeTrail = [];
let isDrawing = false;
let currentAnswer = 0;
let gameActive = true;

// DOM 元素
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

// --- 新增：載入真實水果圖片 ---
// 請在你的專案資料夾內放入這些圖片，或者替換成你喜歡的網址
const fruitImages = [];
const imageSrcs = [
    'https://cdn.pixabay.com/photo/2014/12/21/23/58/apple-576628_1280.png', // 蘋果 (去背PNG)
    'https://cdn.pixabay.com/photo/2016/04/01/10/05/orange-1299738_1280.png', // 橘子 (去背PNG)
    'https://cdn.pixabay.com/photo/2016/03/10/16/32/watermelon-1248737_1280.png' // 西瓜 (去背PNG)
];

imageSrcs.forEach(src => {
    let img = new Image();
    img.src = src;
    fruitImages.push(img);
});

// --- 新增：粒子爆炸特效類別 ---
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        // 隨機向四面八方噴射
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = (Math.random() - 0.5) * 15;
        this.life = 1.0; // 粒子的壽命 (透明度)
        this.size = Math.random() * 8 + 3; // 隨機大小
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // 粒子本身的果汁重力下墜
        this.life -= 0.02; // 逐漸消失
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // 恢復透明度
    }
}

// 水果類別更新
class Fruit {
    constructor(x, y, vx, vy, number, isCorrect) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 45; // 稍微加大判定範圍
        this.number = number;
        this.isCorrect = isCorrect;
        
        // 隨機挑選一張載入好的水果圖片
        this.image = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        
        // 給予果汁特效一個對應的隨機顏色 (紅、橘、綠)
        const colors = ['#e74c3c', '#e67e22', '#2ecc71', '#f1c40f'];
        this.juiceColor = colors[Math.floor(Math.random() * colors.length)];
        
        this.rotation = Math.random() * Math.PI * 2; // 初始旋轉角度
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // 旋轉速度
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        // 修改：大幅降低重力加速度 (從 0.15 降到 0.04)，讓水果在空中停留更久
        this.vy += 0.04; 
        this.rotation += this.rotationSpeed; // 讓水果在空中自轉
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 如果圖片載入成功就畫圖片，否則畫原本的圓形當作備用
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.juiceColor;
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // 畫數字 (固定在畫布正向，不隨水果旋轉)
        ctx.fillStyle = 'white';
        // 加上黑色粗邊框讓數字在真實圖片上清晰可見
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(this.number, this.x, this.y);
        ctx.fillText(this.number, this.x, this.y);
    }
}

// 產生新的數學題目 (不變)
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
    
    let numberOfFruits = 3;
    let correctPushed = false;

    for (let i = 0; i < numberOfFruits; i++) {
        let startX = Math.random() * (canvas.width - 200) + 100;
        let startY = canvas.height + 50;
        let vx = (Math.random() - 0.5) * 4; 
        // 修改：降低初始向上拋的力道，配合較小的重力，形成完美的慢速拋物線
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

// --- 切開水果產生果汁粒子 ---
function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 滑鼠/觸控事件處理 (刀光) (不變)
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

// 碰撞偵測 (加入觸發爆炸特效)
function checkCollision(mx, my) {
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        let dx = mx - f.x;
        let dy = my - f.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < f.radius) {
            // 新增：觸發粒子爆炸
            createExplosion(f.x, f.y, f.juiceColor);

            if (f.number === currentAnswer) {
                score += 10;
                scoreEl.innerText = score;
                generateQuestion();
            } else {
                lives--;
                updateLives();
            }
            fruits.splice(i, 1);
        }
    }
}

function updateLives() {
    let hearts = "";
    for(let i=0; i<lives; i++) hearts += "❤️";
    livesEl.innerText = hearts;

    if (lives <= 0) {
        gameActive = false;
        gameOverEl.style.display = 'block';
        finalScoreEl.innerText = score;
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
    // 讓刀光稍微透點藍光，更像遊戲裡的刀刃
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0; // 重置陰影
}

// 遊戲主迴圈
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        // 更新並繪製水果
        for (let i = fruits.length - 1; i >= 0; i--) {
            fruits[i].update();
            fruits[i].draw();
            if (fruits[i].y > canvas.height + 100) {
                fruits.splice(i, 1);
            }
        }

        // 新增：更新並繪製粒子
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

// 啟動遊戲
generateQuestion();
// 修改：因為下降變慢了，產出頻率也稍微調慢為 3.5 秒一波，避免畫面上一次塞滿太多水果
setInterval(spawnFruits, 3500); 
gameLoop();
