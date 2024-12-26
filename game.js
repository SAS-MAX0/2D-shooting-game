"use strict"; // to make things clean and error free to avoid the browser from blocking it learnt it off gpt.

const gameCanvas = document.getElementById('playArea'); // the part that makes the game display on the screen
const context = gameCanvas.getContext('2d');

gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;

const themes = { // used this to define the theme based on what the user selected from the homepage
    default: {
        player: 'assets/default/def_player.png',
        enemy: 'assets/default/def_enemy.png',
        background: 'assets/default/background.png',
        bulletColor: 'red'
    },
    halloween: {
        player: 'assets/halloween/pumpkin.png',
        enemy: 'assets/halloween/spider.png',
        background: 'assets/halloween/halloween-background.png',
        bulletColor: '#ff9900'
    },
    winter: {
        player: 'assets/winter/santa.png',
        enemy: 'assets/winter/grinch.png',
        background: 'assets/winter/winter-background.png',
        bulletColor: '#00ffff'
    },
    space: {
        player: 'assets/space/3.png',
        enemy: 'assets/space/alien.png',
        background: 'assets/space/space-background.png',
        bulletColor: '#00ff00'
    }
};

const themeAudio = { // i couldn't get the audio to play so i just defined it seperately from others.
    default:'assets/default/dmusic.mp3',
    halloween:'assets/halloween/hmusic.mp3',
    winter:'assets/winter/wmusic.mp3',
    space:'assets/space/smusic.mp3'
}

let backgroundMusic;
function initAudio(){
    backgroundMusic = new Audio();
    backgroundMusic.src = themeAudio[gameTheme];
    backgroundMusic.loop = true;
}
function startAudio(){ // to make the music play when hte game starts
    if(backgroundMusic){
        backgroundMusic.play();
    }
}

window.addEventListener('load', () => { // starts the music when the page loads finish
    initAudio();
    startAudio();
}, {once: true});


const gameTheme = localStorage.getItem('gameTheme') || 'default';
const theme = themes[gameTheme] || themes.default;

const mainCharacterImg = new Image();
mainCharacterImg.src = theme.player;

const backgroundImg = new Image();
backgroundImg.src = theme.background;

// Variables for the gameplay
let score = 0;
let lives = 5;
let gameOver = false;
let X = 50;
let Y = gameCanvas.height - 150;

const charVelocity = 5; //speed of the player

let rivalbullets = [];
let gameTime = 0;
let difficultyLevel = 1;

// turn the character circle - learnt this off gpt 
function drawCircularSprite(image, x, y, size) {
    context.save();
    context.beginPath();
    context.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    context.clip();
    context.drawImage(image, x, y, size, size);
    context.restore();
}

function renderCharacter() {
    drawCircularSprite(mainCharacterImg, X, Y, 100);
}


function processCharacterMovement(){ // this is to make the user move based on the keyboard input, TODO - make phone screen control later maybe as an update
    if (activeKeys['ArrowUp'] || activeKeys['w']){
        if (Y > 0){
            Y -= charVelocity;
        }
    }
    if (activeKeys['ArrowDown'] || activeKeys['s']){
        if (Y + 100 < gameCanvas.height){
            Y += charVelocity;
        }
    }
    if (activeKeys['ArrowLeft'] || activeKeys['a']){
        if (X > 0){
            X -= charVelocity;
        }
    }
    if (activeKeys['ArrowRight'] || activeKeys['d']){
        if (X + 100 < gameCanvas.width){
            X += charVelocity;
        }
    }
}

function showGameOver() { // this shows game over when user lose the game
    context.fillStyle = 'rgba(62, 62, 62, 0.75)';
    context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    context.fillStyle = 'red';
    context.font = '45px Arial';
    context.textAlign = 'center';
    context.fillText('Press R to restart or H to return to homepage', gameCanvas.width/2 - 150, gameCanvas.height/2 + 50);
}

window.addEventListener('keydown', (e) => { // this is to make the game restart when r is pressed or H to make it go back to the homepage
    if (gameOver && e.key.toLowerCase() === 'r') {
        score = 0;
        lives = 5;
        gameOver = false;
        rivals = [];
        bullets = [];
        rivalbullets = [];
        explosions = [];
        gameTime = 0;
        difficultyLevel = 1;
        X = 50;
        Y = gameCanvas.height - 150;
        gameLoop();
    } else if (e.key === 'h') {
        window.location.href ='index.html';
    }
});

const activeKeys ={}; // to know the keys that were or being pressed

window.addEventListener('keydown', (e) =>{
    activeKeys[e.key] = true;
});

window.addEventListener('keyup', (e) =>{
    activeKeys[e.key] = false;
});

mainCharacterImg.onload = () =>{
    startGame();
};

let rivals = []; // creating the enemies

function spawnrival(){ // making them come out randomly from right hand side
    const rivalEntity ={
        x: gameCanvas.width,
        y: Math.random() * (gameCanvas.height - 100),
        width: 50,
        height: 50,
        velocity: 2,
        sprite: new Image()
    };

    rivalEntity.sprite.src = theme.enemy;

    rivalEntity.sprite.onload = () =>{
        rivals.push(rivalEntity);
    };
}

setInterval(spawnrival, 1500); // make enemies come out after 1.5 secs

function renderrivals() {
    for (let i = 0; i < rivals.length; i++) {
        const rival = rivals[i];
        drawCircularSprite(rival.sprite, rival.x, rival.y, rival.width);
    }
}

function moverivals(){
    for (let i = 0; i < rivals.length; i++){
        const rival = rivals[i];
        rival.x -= rival.velocity;

        if (rival.x + rival.width < 0){
            rival.x = gameCanvas.width;
            rival.y = Math.random() * (gameCanvas.height - 100);
        }
    }
}

function verifyCollision(){ // this is to check if the player has collided with the enemy
    if(!gameOver){
        for (let i = 0; i < rivals.length; i++){
            const rival = rivals[i];
            if(X < rival.x + rival.width &&
                X + 100 > rival.x &&
                Y < rival.y +rival.height &&
                Y + 100 > rival.y){
                lives--;
                if(lives <= 0){
                    gameOver = true;
                } else {
                    X = 50;
                    Y = gameCanvas.height - 150;
                }
            }
        }
    }
} 

function displayStats(){ // this is to show the score and lives 
    context.fillStyle = 'green';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    context.fillText(`Lives: ${lives}`,10,60);
}

let bullets = [];

function launchbullet(){ // this is to make bullets shoot when the space bar is pressed
    const bullet ={
        x: X + 100,
        y: Y + 50,
        width: 20,
        height: 10,
        velocity: 7
    };
    console.log("bullet launched:", bullet);
    bullets.push(bullet);
}

function movebullets(){ // adding movements to the bullets
    for (let i = 0; i < bullets.length; i++){
        const bullet = bullets[i];
        bullet.x += bullet.velocity;
        if (bullet.x + gameCanvas.width < 0){
            bullets.splice(i, 1);
            i--;
        }
    }
}

function renderbullets() {
    context.fillStyle = theme.bulletColor;
    bullets.forEach(bullet => {
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    });
}

function verifybulletHits() { // check if the bullet hits the enemy to add score by 10
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        for (let j = 0; j < rivals.length; j++) {
            const rival = rivals[j];
            if (bullet.x < rival.x + rival.width &&
                bullet.x + bullet.width > rival.x &&
                bullet.y < rival.y + rival.height &&
                bullet.y + bullet.height > rival.y) {
                score += 10;
                createExplosion(rival.x + rival.width/2, rival.y + rival.height/2);
                rivals.splice(j, 1);
                bullets.splice(i, 1);
                i--;
                break;
            }
        }
    }
}

window.addEventListener('keydown', (e) =>{ // the spacebar part to make the bullets shoot
    if (e.key === ' ' || e.key === 'Enter'){
        launchbullet();
    }
});

let explosions = []; // this is to just add special effects when the bullet touch the enemy learnt it from gpt
function createExplosion(x, y){
    explosions.push({
        x: x,
        y: y,
        timer: 20
    });
}

function renderExplosions(){
    for(let i = explosions.length - 1; i >= 0; i--){
        const exp = explosions[i];
        context.beginPath();
        context.arc(exp.x, exp.y, 20, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 0, 0, ${exp.timer / 20})`;
        context.fill();
        exp.timer--;
        if(exp.timer <= 0){
            explosions.splice(i, 1);
        }     
    }
}

function createrivalbullet(rival) { // this is for the enemy smart bullets also that follow the user learnt it from gpt
    const angle = Math.atan2(
        Y - rival.y,
        X - rival.x
    );
    
    return {
        x: rival.x,
        y: rival.y,
        width: 10,
        height: 10,
        velocity: {
            x: Math.cos(angle) * (2 + difficultyLevel),
            y: Math.sin(angle) * (2 + difficultyLevel)
        }
    };
}

function updaterivalShooting() {
    gameTime++;
    
    difficultyLevel = 1 + Math.floor(gameTime / 2000);
    
    rivals.forEach(rival => {
        if (Math.random() < 0.01 * difficultyLevel) {
            rivalbullets.push(createrivalbullet(rival));
        }
    });
}

function moverivalbullets() {
    for (let i = rivalbullets.length - 1; i >= 0; i--) {
        const proj = rivalbullets[i];
        proj.x += proj.velocity.x;
        proj.y += proj.velocity.y;
        
        if (proj.x < 0 || proj.x > gameCanvas.width || 
            proj.y < 0 || proj.y > gameCanvas.height) {
            rivalbullets.splice(i, 1);
        }
    }
}

const bulletColors = { // this is to just add themes of the bullets the enemies shoot also
    default: 'black', 
    halloween: 'black',
    winter: 'black',   
    space: 'red'  
};


function renderRivalbullets() {
    context.fillStyle = bulletColors[gameTheme];
    rivalbullets.forEach(bullet => {
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        context.fill();
    });
}

function checkrivalbulletCollision() {
    for (let i = rivalbullets.length - 1; i >= 0; i--) {
        const proj = rivalbullets[i];
        if (X < proj.x + proj.width &&
            X + 100 > proj.x &&
            Y < proj.y + proj.height &&
            Y + 100 > proj.y) {
            rivalbullets.splice(i, 1);
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
        }
    }
}

function renderBackground() {
    if (backgroundImg.complete) {
        context.drawImage(backgroundImg, 0, 0, gameCanvas.width, gameCanvas.height);
    }
}

function gameLoop() { // this is to call all the functions needed to make the game work alright

    processCharacterMovement();
    moverivals();
    movebullets();
    moverivalbullets();
    updaterivalShooting();
    verifybulletHits();
    checkrivalbulletCollision();
    context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    renderBackground();
    renderCharacter();
    renderrivals();
    renderbullets();
    renderRivalbullets();
    renderExplosions();
    displayStats();
    
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver();
    }
}

backgroundImg.onload = () => {
    gameLoop();
};

backgroundImg.onerror = () => {
    console.error('Background image failed to load:', theme.background);
};


// special thanks to my teacher for teaching me most of what i know although i needed to add some extra things from gpt, youtube and freecodecamp.