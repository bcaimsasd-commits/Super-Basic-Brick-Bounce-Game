// ============================================================
// collisions.js: what happens when the ball touches something
//
// To "bounce", we flip the ball's speed:
//   hit something sideways -> vx = -vx
//   hit something above or below -> vy = -vy
// ============================================================

// Returns true if two rectangles (like the ball and a brick) overlap.
function boxesTouch(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


// The ball bounces off the left, right, and top walls.
// (The bottom is not a wall: falling off the bottom resets the ball.)
function bounceOffWalls() {
  if (GameState.ball.x < 0) {
    GameState.ball.x = 0;
    GameState.ball.vx = -GameState.ball.vx;
  }
  if (GameState.ball.x + GameState.ball.width > WIDTH) {
    GameState.ball.x = WIDTH - GameState.ball.width;
    GameState.ball.vx = -GameState.ball.vx;
  }
  if (GameState.ball.y < 0) {
    GameState.ball.y = 0;
    GameState.ball.vy = -GameState.ball.vy;
  }
}


// The ball bounces off the top of the paddle.
// ball.vy > 0 means "the ball is moving down", so it only bounces
// when it is falling onto the paddle.
function bounceOffPaddle() {
  if (boxesTouch(GameState.ball, GameState.paddle) && GameState.ball.vy > 0) {
    GameState.ball.y = GameState.paddle.y - GameState.ball.height;  // sit on top of the paddle
    GameState.ball.vy = -GameState.ball.vy;
  }
}


// The brick collision system uses each brick's breakable component.
function brickCollisionSystem() {
  for (let i = 0; i < GameState.bricks.length; i++) {
    const brick = GameState.bricks[i];
    if (!boxesTouch(GameState.ball, brick)) {
      continue;
    }

    // How far has the ball pushed into the brick on each side?
    const overlapX = Math.min(GameState.ball.x + GameState.ball.width, brick.x + brick.width) - Math.max(GameState.ball.x, brick.x);
    const overlapY = Math.min(GameState.ball.y + GameState.ball.height, brick.y + brick.height) - Math.max(GameState.ball.y, brick.y);

    if (overlapX < overlapY) {
      // The ball hit the brick's left or right side.
      GameState.ball.vx = -GameState.ball.vx;
      if (GameState.ball.x < brick.x) {
        GameState.ball.x = brick.x - GameState.ball.width;
      } else {
        GameState.ball.x = brick.x + brick.width;
      }
    } else {
      // The ball hit the brick's top or bottom.
      GameState.ball.vy = -GameState.ball.vy;
      if (GameState.ball.y < brick.y) {
        GameState.ball.y = brick.y - GameState.ball.height;
      } else {
        GameState.ball.y = brick.y + brick.height;
      }
    }

    if (brick.breakable) {
      brick.breakable.hitsLeft = brick.breakable.hitsLeft - 1;

      if (brick.breakable.hitsLeft <= 0) {
        GameState.bricks.splice(i, 1);
        onBrickDestroyed(brick);
      }
    } else {
      GameState.bricks.splice(i, 1);
      onBrickDestroyed(brick);
    }

    break;
  }
}


function pickupCollisionSystem() {
  for (let i = GameState.pickups.length - 1; i >= 0; i--) {
    const pickup = GameState.pickups[i];
    if (!boxesTouch(pickup, GameState.paddle)) {
      continue;
    }

    if (pickup.kind === "wide") {
      const center = GameState.paddle.x + GameState.paddle.width / 2;
      GameState.paddle.width = Math.min(GameState.paddle.width + 30, 150);
      GameState.paddle.x = Math.max(0, Math.min(WIDTH - GameState.paddle.width, center - GameState.paddle.width / 2));
    } else {
      const speed = Math.hypot(GameState.ball.vx, GameState.ball.vy);
      const slowerSpeed = Math.max(speed * 0.8, BALL_SPEED * 0.7);
      const scale = slowerSpeed / speed;
      GameState.ball.vx = GameState.ball.vx * scale;
      GameState.ball.vy = GameState.ball.vy * scale;
    }

    GameState.pickups.splice(i, 1);
  }
}
