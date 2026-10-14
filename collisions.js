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
  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = -ball.vx;
  }
  if (ball.x + ball.width > WIDTH) {
    ball.x = WIDTH - ball.width;
    ball.vx = -ball.vx;
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = -ball.vy;
  }
}


// The ball bounces off the top of the paddle.
// ball.vy > 0 means "the ball is moving down", so it only bounces
// when it is falling onto the paddle.
function bounceOffPaddle() {
  if (boxesTouch(ball, paddle) && ball.vy > 0) {
    ball.y = paddle.y - ball.height;  // sit on top of the paddle
    ball.vy = -ball.vy;
  }
}


// The brick collision system uses each brick's breakable component.
function brickCollisionSystem() {
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (!boxesTouch(ball, brick)) {
      continue;
    }

    // How far has the ball pushed into the brick on each side?
    const overlapX = Math.min(ball.x + ball.width, brick.x + brick.width) - Math.max(ball.x, brick.x);
    const overlapY = Math.min(ball.y + ball.height, brick.y + brick.height) - Math.max(ball.y, brick.y);

    if (overlapX < overlapY) {
      // The ball hit the brick's left or right side.
      ball.vx = -ball.vx;
      if (ball.x < brick.x) {
        ball.x = brick.x - ball.width;
      } else {
        ball.x = brick.x + brick.width;
      }
    } else {
      // The ball hit the brick's top or bottom.
      ball.vy = -ball.vy;
      if (ball.y < brick.y) {
        ball.y = brick.y - ball.height;
      } else {
        ball.y = brick.y + brick.height;
      }
    }

    if (brick.breakable) {
      brick.breakable.hitsLeft = brick.breakable.hitsLeft - 1;

      if (brick.breakable.hitsLeft <= 0) {
        bricks.splice(i, 1);
        onBrickDestroyed(brick);
      }
    } else {
      bricks.splice(i, 1);
      onBrickDestroyed(brick);
    }

    break;
  }
}


function pickupCollisionSystem() {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pickup = pickups[i];
    if (!boxesTouch(pickup, paddle)) {
      continue;
    }

    if (pickup.kind === "wide") {
      const center = paddle.x + paddle.width / 2;
      paddle.width = Math.min(paddle.width + 30, 150);
      paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, center - paddle.width / 2));
    } else {
      const speed = Math.hypot(ball.vx, ball.vy);
      const slowerSpeed = Math.max(speed * 0.8, BALL_SPEED * 0.7);
      const scale = slowerSpeed / speed;
      ball.vx = ball.vx * scale;
      ball.vy = ball.vy * scale;
    }

    pickups.splice(i, 1);
  }
}
