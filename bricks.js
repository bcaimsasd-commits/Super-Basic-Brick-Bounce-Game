// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts

// Builds the list of bricks. Each brick is an object with an
// x, y, width, and height.
function makeBricks(stage = 1) {
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

      list.push({
        x: left + col * (BRICK_WIDTH + BRICK_GAP),
        y: BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: colors[pattern],
        breakable: new Breakable(1)
      });
    }
  }

  return list;
}

// Draws every brick in the list.
function drawBricks() {
  for (const brick of GameState.bricks) {
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
}
