// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts
const SLIDING_ROW = 1;
const BRICK_ROW_SPEED = 1;
let slidingRowDirection = 1;

function stayStill() {}

function slideWithRow(brick) {
  brick.x += slidingRowDirection * BRICK_ROW_SPEED;
}

// Builds the list of bricks. Each brick is an object with an
// x, y, width, and height.
function makeBrick(type, x, y, color, row, updateBehavior = stayStill) {
  const isStrong = type === "strong";
  return {
    x,
    y,
    row,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    color: isStrong ? "#ff9f1c" : color,
    type,
    update: updateBehavior,
    breakable: new Breakable(isStrong ? 2 : 1)
  };
}

function makeBricks(stage = 1, rowBehavior = stayStill) {
  const list = [];
  const pattern = (stage - 1) % 3;
  const colors = ["#ff6b6b", "#4ecdc4", "#ffd166"];

  // Center the whole block of bricks on the screen.
  const totalWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
  const left = (WIDTH - totalWidth) / 2;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLUMNS; col++) {
      if (pattern === 1 && (row + col) % 2 === 0) {
        continue;
      }
      if (pattern === 2 && Math.abs(col - 3.5) + Math.abs(row - 1.5) > 3.5) {
        continue;
      }

      const type = stage >= 2 && row === 0 ? "strong" : "normal";
      list.push(makeBrick(
        type,
        left + col * (BRICK_WIDTH + BRICK_GAP),
        BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        colors[pattern],
        row,
        row === SLIDING_ROW ? rowBehavior : stayStill
      ));
    }
  }

  return list;
}

function updateBricks() {
  const slidingBricks = GameState.bricks.filter((brick) => brick.update === slideWithRow);
  if (slidingBricks.length === 0) {
    for (const brick of GameState.bricks) {
      brick.update(brick);
    }
    return;
  }

  const leftEdge = Math.min(...slidingBricks.map((brick) => brick.x));
  const rightEdge = Math.max(...slidingBricks.map((brick) => brick.x + brick.width));
  if (leftEdge + slidingRowDirection * BRICK_ROW_SPEED < 0 ||
      rightEdge + slidingRowDirection * BRICK_ROW_SPEED > WIDTH) {
    slidingRowDirection = -slidingRowDirection;
  }

  for (const brick of GameState.bricks) {
    brick.update(brick);
  }
}

// Draws every brick in the list.
function drawBricks() {
  for (const brick of GameState.bricks) {
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#fff";
    for (let x = brick.x + 6; x < brick.x + brick.width - 3; x += 12) {
      for (let y = brick.y + 5; y < brick.y + brick.height - 2; y += 8) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.restore();

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(brick.x, brick.y, brick.width, 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(brick.x, brick.y + brick.height - 2, brick.width, 2);
  }
}
