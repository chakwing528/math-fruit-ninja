const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 遊戲狀態變數
let score = 0;
let lives = 3;
let fruits = [];
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

// 水果類別
class Fruit {
    constructor(x, y, vx, vy, number, isCorrect) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 40;
        this.number = number;
        this.isCorrect = isCorrect;
        // 正確答案和錯誤答案給予不同的顏色稍微區分 (可自行改為圖片)
        this.color = `hsl(${Math.random() * 360}, 80%, 50%)`; 
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // 重力加速度
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // 畫數字
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.number, this.x, this.y);
    }
}

// 產生新的數學題目
function generateQuestion() {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let operator = Math.random() > 0.5 ? '+' : '-';
    
    // 確保減法不會產生負數
    if (operator === '-' && num1 < num2) {
        let temp = num1;
        num1 = num2;
        num2 = temp;
    }

    questionEl.innerText = `${num1} ${operator} ${num2}`;
    currentAnswer = operator === '+' ? num1 + num2 : num1 - num2;
}

// 產生一波水果
function spawnFruits() {
    if (!gameActive) return;
    
    let numberOfFruits = 3; // 每次丟 3 個水果
    let correctPushed = false;

    for (let i = 0; i < numberOfFruits; i++) {
        let startX = Math.random() * (canvas.width - 200) + 100;
        let startY = canvas.height + 50;
        let vx = (Math.random() - 0.5) * 6; // 水平隨機亂飄
        let vy = -(Math.random() * 4 + 10); // 往上拋的力度
        
        let number;
        let isCorrect = false;

        // 確保至少有一個是正確答案
        if (!correctPushed && (i === numberOfFruits - 1 || Math.random() > 0.5)) {
            number = currentAnswer;
            isCorrect = true;
            correctPushed = true;
        } else {
            // 產生錯誤答案
            number = currentAnswer + Math.floor(Math.random() * 10) - 5;
            if (number === currentAnswer) number += 1; // 避免剛好等於正確答案
        }

        fruits.push(new Fruit(startX, startY, vx, vy, number, isCorrect));
    }
}

// 滑鼠/觸控事件處理 (刀光)
function handleInputStart(e) {
    isDrawing = true;
    bladeTrail = [];
}

function handleInputMove(e) {
    if (!isDrawing || !gameActive) return;
    
    let x = e.clientX || e.touches[0].clientX;
    let y = e.clientY || e.touches[0].clientY;
    bladeTrail.push({x, y});

    // 保持刀光長度
    if (bladeTrail.length > 10) {
        bladeTrail.shift();
    }

    checkCollision(x, y);
}

function handleInputEnd() {
    isDrawing = false;
    bladeTrail = [];
}

window.addEventListener('mousedown', handleInputStart);
window.addEventListener('mousemove', handleInputMove);
window.addEventListener('mouseup', handleInputEnd);
window.addEventListener('touchstart', handleInputStart);
window.addEventListener('touchmove', handleInputMove);
window.addEventListener('touchend', handleInputEnd);

// 碰撞偵測 (判斷刀光是否切到水果)
function checkCollision(mx, my) {
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        let dx = mx - f.x;
        let dy = my - f.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < f.radius) {
            // 切中水果！
            if (f.number === currentAnswer) {
                score += 10;
                scoreEl.innerText = score;
                generateQuestion(); // 答對了，換下一題
            } else {
                lives--;
                updateLives();
            }
            // 從陣列移除被切掉的水果
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// 遊戲主迴圈
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        // 更新並繪製所有水果
        for (let i = fruits.length - 1; i >= 0; i--) {
            fruits[i].update();
            fruits[i].draw();

            // 如果水果掉出螢幕底部則移除
            if (fruits[i].y > canvas.height + 100) {
                fruits.splice(i, 1);
            }
        }

        drawBlade();
    }

    requestAnimationFrame(gameLoop);
}

// 視窗大小改變時重新設定畫布
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 啟動遊戲
generateQuestion();
setInterval(spawnFruits, 2000); // 每 2 秒丟一波水果
gameLoop();
