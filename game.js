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

// Singleton: one shared game-state object keeps every system using the same values.
const GameState = {
  ball: {
    x: 0,
    y: 0,
    width: 12,
    height: 12,
    vx: 0,
    vy: 0,
    launched: false
  },
  paddle: {
    x: WIDTH / 2 - 45,
    y: HEIGHT - 30,
    width: 90,
    height: 12,
    speed: 6
  },
  bricks: [],
  stage: 1,
  pickups: [],
  launchBall() {
    if (this.ball.launched) {
      return;
    }
    this.ball.vx = BALL_SPEED;
    this.ball.vy = -BALL_SPEED;
    this.ball.launched = true;
  }
};

// Place the ball above the paddle and wait for the next launch.
function resetBall() {
  GameState.ball.x = GameState.paddle.x + GameState.paddle.width / 2 - GameState.ball.width / 2;
  GameState.ball.y = GameState.paddle.y - GameState.ball.height;
  GameState.ball.vx = 0;
  GameState.ball.vy = 0;
  GameState.ball.launched = false;
}


// ------------------------------------------------------------
// THE PICKUPS
// ------------------------------------------------------------
const PICKUP_SIZE = 16;

const stageDisplay = document.getElementById("stage");

function updateStatus() {
  stageDisplay.textContent = GameState.stage;
}

function onBrickDestroyed(brick) {
  GameState.pickups.push({
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
  if (event.code === "Space") {
    GameState.launchBall();
    event.preventDefault();
  }
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

  if (GameState.bricks.length === 0) {
    GameState.stage = GameState.stage + 1;
    GameState.bricks = makeBricks(GameState.stage);
    updateStatus();
  }

  // The ball fell off the bottom: back to the center.
  if (GameState.ball.y > HEIGHT) {
    resetBall();
  }
}

function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
    GameState.paddle.x = GameState.paddle.x - GameState.paddle.speed;
  }
  if (keys["arrowright"] || keys["d"]) {
    GameState.paddle.x = GameState.paddle.x + GameState.paddle.speed;
  }

  // Keep the paddle on the screen.
  if (GameState.paddle.x < 0) {
    GameState.paddle.x = 0;
  }
  if (GameState.paddle.x + GameState.paddle.width > WIDTH) {
    GameState.paddle.x = WIDTH - GameState.paddle.width;
  }
}

function moveBall() {
  if (!GameState.ball.launched) {
    GameState.ball.x = GameState.paddle.x + GameState.paddle.width / 2 - GameState.ball.width / 2;
    GameState.ball.y = GameState.paddle.y - GameState.ball.height;
    return;
  }
  GameState.ball.x = GameState.ball.x + GameState.ball.vx;
  GameState.ball.y = GameState.ball.y + GameState.ball.vy;
}

function updatePickups() {
  for (let i = GameState.pickups.length - 1; i >= 0; i--) {
    GameState.pickups[i].y = GameState.pickups[i].y + 2;
    if (GameState.pickups[i].y > HEIGHT) {
      GameState.pickups.splice(i, 1);
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
  ctx.fillRect(GameState.paddle.x, GameState.paddle.y, GameState.paddle.width, GameState.paddle.height);
  ctx.fillRect(GameState.ball.x, GameState.ball.y, GameState.ball.width, GameState.ball.height);

  drawBricks();  // bricks.js
  for (const pickup of GameState.pickups) {
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
  GameState.bricks = makeBricks(GameState.stage);  // bricks.js
  resetBall();
  updateStatus();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
