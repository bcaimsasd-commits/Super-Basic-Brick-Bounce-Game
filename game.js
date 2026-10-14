// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450


// ------------------------------------------------------------
// THE BALL
// x and y are the top-left corner. vx and vy are how many pixels
// the ball moves each update (vx = sideways, vy = up/down).
// A positive vy means the ball is moving DOWN the screen.
// ------------------------------------------------------------
const BALL_SPEED = 4;

const ball = {
  x: 0,
  y: 0,
  width: 12,
  height: 12,
  vx: 0,
  vy: 0
};

// Put the ball in the center and reset its speed and direction.
function resetBall() {
  ball.x = WIDTH / 2 - ball.width / 2;
  ball.y = HEIGHT / 2 - ball.height / 2;
  ball.vx = BALL_SPEED;  // right
  ball.vy = BALL_SPEED;  // down
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 30,
  width: 90,
  height: 12,
  speed: 6
};


// ------------------------------------------------------------
// THE BRICKS (the list is filled in by makeBricks() in bricks.js)
// ------------------------------------------------------------
let bricks = [];
let stage = 1;
let pickups = [];
const PICKUP_SIZE = 16;

const stageDisplay = document.getElementById("stage");

function updateStatus() {
  stageDisplay.textContent = stage;
}

function onBrickDestroyed(brick) {
  pickups.push({
    x: brick.x + brick.width / 2 - PICKUP_SIZE / 2,
    y: brick.y + brick.height / 2 - PICKUP_SIZE / 2,
    width: PICKUP_SIZE,
    height: PICKUP_SIZE,
    kind: Math.random() < 0.5 ? "wide" : "slow"
  });
}


// ------------------------------------------------------------
// KEYBOARD
// keys["arrowleft"] is true while the left arrow is held down.
// ------------------------------------------------------------
const keys = {};

document.addEventListener("keydown", function (event) {
  keys[event.key.toLowerCase()] = true;
  // Stop the arrow keys from scrolling the page.
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


// ------------------------------------------------------------
// UPDATE: runs 60 times every second. Move things, then check
// what they touched.
// ------------------------------------------------------------
function update() {
  movePaddle();
  moveBall();

  bounceOffWalls();   // collisions.js
  bounceOffPaddle();  // collisions.js
  brickCollisionSystem();  // collisions.js
  updatePickups();
  pickupCollisionSystem();  // collisions.js

  if (bricks.length === 0) {
    stage = stage + 1;
    bricks = makeBricks(stage);
    updateStatus();
  }

  // The ball fell off the bottom: back to the center.
  if (ball.y > HEIGHT) {
    resetBall();
  }
}

function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
    paddle.x = paddle.x - paddle.speed;
  }
  if (keys["arrowright"] || keys["d"]) {
    paddle.x = paddle.x + paddle.speed;
  }

  // Keep the paddle on the screen.
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }
}

function moveBall() {
  ball.x = ball.x + ball.vx;
  ball.y = ball.y + ball.vy;
}

function updatePickups() {
  for (let i = pickups.length - 1; i >= 0; i--) {
    pickups[i].y = pickups[i].y + 2;
    if (pickups[i].y > HEIGHT) {
      pickups.splice(i, 1);
    }
  }
}


// ------------------------------------------------------------
// DRAW: paints everything on the canvas. Black background,
// white shapes.
// ------------------------------------------------------------
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

  drawBricks();  // bricks.js
  for (const pickup of pickups) {
    ctx.fillStyle = pickup.kind === "wide" ? "#4ecdc4" : "#ffd166";
    ctx.fillRect(pickup.x, pickup.y, pickup.width, pickup.height);
    ctx.fillStyle = "black";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pickup.kind === "wide" ? "W" : "S", pickup.x + pickup.width / 2, pickup.y + pickup.height / 2);
  }
}


// ------------------------------------------------------------
// THE GAME LOOP
// The browser calls frame() every time it is ready to draw.
// Some screens are faster than others, so we make sure update()
// always runs exactly 60 times per second on every computer.
// ------------------------------------------------------------
const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function frame(now) {
  leftover = leftover + (now - lastTime);
  lastTime = now;

  // If the tab was hidden for a while, don't try to catch up.
  if (leftover > 250) {
    leftover = 250;
  }

  while (leftover >= STEP) {
    update();
    leftover = leftover - STEP;
  }

  draw();
  requestAnimationFrame(frame);
}

function start() {
  bricks = makeBricks(stage);  // bricks.js
  resetBall();
  updateStatus();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
